import pandas as pd
import glob
import os
import joblib
import numpy as np
import torch
from torch.utils.data import TensorDataset, DataLoader
from sklearn.model_selection import train_test_split
from sklearn.preprocessing import MinMaxScaler
from imblearn.over_sampling import SMOTE
from imblearn.under_sampling import RandomUnderSampler

def load_and_preprocess_data(path='data/', debug=False):
    train_cache = 'data/preprocessed/train_data.npz'
    val_cache = 'data/preprocessed/val_data.npz'
    scaler_cache = 'data/preprocessed/scaler.save'
    
    if not debug and os.path.exists(train_cache) and os.path.exists(val_cache) and os.path.exists(scaler_cache):
        print("Loading cached properly-split datasets and scaler...")
        t_data = np.load(train_cache)
        v_data = np.load(val_cache)
        scaler = joblib.load(scaler_cache)
        return t_data['X_train'], v_data['X_test'], t_data['y_train'], v_data['y_test'], scaler

    # Raw Data pipeline
    csv_files = glob.glob(os.path.join(path, '*.csv'))
    if not csv_files:
        raise FileNotFoundError(f"No CSV files found in {path}")
        
    dataframes = [pd.read_csv(f) for f in csv_files]
    df = pd.concat(dataframes, ignore_index=True)
    df.columns = df.columns.str.strip()
    
    # Clean invalid rows
    df = df.dropna()
    max_float = np.finfo(np.float64).max
    
    # Extract features (X) and raw labels
    X = df.drop('Label', axis=1)
    X = X.where(X <= max_float, max_float)
    y_raw = df['Label']
    
    if debug:
        print("DEBUG MODE: Reducing dataset drastically.")
        sample_size = min(30000, len(X))
        sample_idx = np.random.choice(len(X), sample_size, replace=False)
        X = X.iloc[sample_idx]
        y_raw = y_raw.iloc[sample_idx]

    # Convert to Binary Indices (Attack = 0, BENIGN = 1) for CrossEntropyLoss
    y = y_raw.apply(lambda val: 1 if val == "BENIGN" else 0).values

    # 1. train_test_split FIRST (stratified to ensure validation represents real-world balance)
    print("Splitting train and test sets...")
    X_train, X_test, y_train, y_test = train_test_split(X, y, test_size=0.2, random_state=42, stratify=y)
    
    # 2. Fit MinMaxScaler on TRAIN only
    print("Fitting Scaler on TRAIN...")
    scaler = MinMaxScaler()
    X_train_scaled = scaler.fit_transform(X_train)
    X_test_scaled = scaler.transform(X_test) # Transform TEST without fitting
    
    # 3. Apply Samplers on TRAIN only
    print("Balancing TRAIN set via UnderSampling and SMOTE...")
    # Safe Memory Limits
    limit_benign = 100000 if not debug else 15000
    limit_attack = 50000 if not debug else 10000
    
    count_benign = np.sum(y_train == 1)
    count_attack = np.sum(y_train == 0)
    
    target_benign_rus = min(limit_benign, count_benign)
    target_attack_rus = count_attack # Unchanged in undersampling
    
    rus = RandomUnderSampler(sampling_strategy={1: target_benign_rus, 0: target_attack_rus}, random_state=42)
    X_train_res, y_train_res = rus.fit_resample(X_train_scaled, y_train)
    
    # After undersampling, we SMOTE the attacks up if needed
    current_attack = np.sum(y_train_res == 0)
    current_benign = np.sum(y_train_res == 1)
    target_attack_smote = max(limit_attack, current_attack) # Boost attacks if below 50k limit
    
    if target_attack_smote > current_attack:
        smote = SMOTE(sampling_strategy={1: current_benign, 0: target_attack_smote}, random_state=42)
        X_train_bal, y_train_bal = smote.fit_resample(X_train_res, y_train_res)
    else:
        X_train_bal, y_train_bal = X_train_res, y_train_res

    # 4. Save Caches (keep untouched data.csv.gz backup implicitly ignored by us)
    if not debug:
        os.makedirs('data/preprocessed', exist_ok=True)
        np.savez_compressed(train_cache, X_train=X_train_bal, y_train=y_train_bal)
        np.savez_compressed(val_cache, X_test=X_test_scaled, y_test=y_test)
        joblib.dump(scaler, scaler_cache)
        print("Saved proper splits successfully.")

    return X_train_bal, X_test_scaled, y_train_bal, y_test, scaler

def get_data_loader(X, y, batch_size, shuffle=True):
    X_tensor = torch.tensor(X, dtype=torch.float32)
    y_tensor = torch.tensor(y, dtype=torch.long)
    dataset = TensorDataset(X_tensor, y_tensor)
    return DataLoader(dataset, batch_size=batch_size, shuffle=shuffle)
