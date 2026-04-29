import torch
from torch import nn
from torch.nn import functional as F
from torchsummary import summary
import numpy as np
import time
import os
from sklearn.metrics import classification_report, confusion_matrix, precision_score, recall_score, f1_score
from util.data import load_and_preprocess_data, get_data_loader
from transformer import RTIDS_Transformer, IDS_Encoder_Only

def eval_model(model, loader, threshold=0.5):
    model.to("cpu")
    model.eval()
    losses = []
    all_preds = []
    all_targets = []
    
    with torch.no_grad():
        for data, target in loader:
            data, target = data.to("cpu"), target.to("cpu")
            output = model(data)
            
            loss = F.cross_entropy(output, target)
            losses.append(loss.item())
            
            probs = torch.softmax(output, dim=1)
            attack_prob = probs[:, 0]
            # If attack probability is below threshold, classify as 1 (Benign), else 0 (Attack)
            preds = (attack_prob < threshold).long().cpu().numpy()
            
            targets = target.cpu().numpy()
            
            all_preds.extend(preds)
            all_targets.extend(targets)
            
    eval_loss = float(np.mean(losses))
    
    # Calculate Sklearn Metrics
    # Attention: In our encoding, 0 = Attack, 1 = BENIGN.
    # So "Positive" class for Intrusion Detection is usually Attack (0).
    cm = confusion_matrix(all_targets, all_preds)
    precision = precision_score(all_targets, all_preds, pos_label=0, zero_division=0)
    recall = recall_score(all_targets, all_preds, pos_label=0, zero_division=0)
    f1 = f1_score(all_targets, all_preds, pos_label=0, zero_division=0)
    cr = classification_report(all_targets, all_preds, target_names=["Attack", "Benign"], zero_division=0)
    
    print("\n" + "="*50)
    print(f"VALIDATION METRICS (Threshold: {threshold})")
    print("="*50)
    print("Confusion Matrix:\n", cm)
    print("\nClassification Report:\n", cr)
    print(f"Validation Loss: {eval_loss:.4f}")
    print(f"Attack Detection Precision: {precision:.4f}")
    print(f"Attack Detection Recall (Critical): {recall:.4f}")
    print(f"Attack Detection F1-Score: {f1:.4f}")
    
    return eval_loss, recall

def train_model(model, opt, epochs, train_loader, val_loader, save_path, print_every=100):
    os.makedirs(os.path.dirname(save_path), exist_ok=True)
    
    best_val_loss = float('inf')
    best_recall = 0.0
    patience = 5
    counter = 0

    start = time.time()
    temp = start
    
    for epoch in range(epochs):
        model.train()
        total_loss = 0
        
        for i, (src, trg) in enumerate(train_loader):
            src, trg = src.to("cpu"), trg.to("cpu")
            
            opt.zero_grad()
            preds = model(src)
            
            # Using class weights to heavily penalize missing attacks
            class_weights = torch.tensor([1.0, 0.5]).to(trg.device)
            loss = F.cross_entropy(preds, trg, weight=class_weights)
            
            loss.backward()
            opt.step()
            
            total_loss += loss.item()
            
            if (i + 1) % print_every == 0:
                loss_avg = total_loss / print_every
                print(f"time = {(time.time() - start) // 60:.0f}m, epoch {epoch + 1}, iter = {i + 1}, loss = {loss_avg:.4f}, time/iter = {time.time() - temp:.1f}s per {print_every} iters")
                total_loss = 0
                temp = time.time()
                
        # End of epoch evaluation
        val_loss, val_recall = eval_model(model, val_loader)
        
        # Early Stopping Logic (Monitor Validation Loss)
        if val_loss < best_val_loss:
            best_val_loss = val_loss
            best_recall = val_recall
            counter = 0
            # Save the ONLY model explicitly as requested
            print(f"*** Validation Loss improved -> Saving strictly best model to {save_path}")
            torch.save(model.state_dict(), save_path)
        else:
            counter += 1
            print(f"*** Validation Loss did not improve. Patience: {counter}/{patience}")
            
            if counter >= patience:
                print(f"\n[!] EARLY STOPPING TRIGGERED AT EPOCH {epoch + 1}")
                break

def evaluate_thresholds(model, val_loader, thresholds=[0.5, 0.6, 0.7, 0.8]):
    print("\n" + "*"*60)
    print("THRESHOLD COMPARISON EVALUATION")
    print("*"*60)
    for t in thresholds:
        eval_model(model, val_loader, threshold=t)
    print("\nRecommendation: Choose the threshold that significantly improves Precision while retaining Recall at an acceptable level. Typically, 0.7 or 0.8 is ideal.")

def main():
    learning_rate = 5e-4
    batch_size = 256
    epochs = 3
    dropout_rate = 0.5
    d_model = 32
    heads = 8
    N = 2
    trg_vocab = 2
    
    # Set debug=False to evaluate on the full dataset
    _, X_test, _, y_test, scaler = load_and_preprocess_data(debug=True)
    
    val_loader = get_data_loader(X_test, y_test, batch_size)

    model = IDS_Encoder_Only(trg_vocab, d_model, N, heads, dropout_rate)
    load_path = "models/best_model.pt"

    print(f"\nLoading model from {load_path} for Evaluation...")
    try:
        model.load_state_dict(torch.load(load_path, weights_only=False, map_location="cpu"))
        print("Model loaded successfully.")
    except Exception as e:
        print(f"Failed to load model: {e}")
        return
        
    print("\nEvaluating model on the test set...")
    evaluate_thresholds(model, val_loader)

if __name__ == "__main__":
    main()