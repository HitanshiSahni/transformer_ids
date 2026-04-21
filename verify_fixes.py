import torch
import numpy as np
from main import train_model, eval_model
from util.data import load_data, get_data_loader
from transformer import IDS_Encoder_Only

d_model = 32
heads = 8
N = 2
trg_vocab = 2
dropout_rate = 0.5
learning_rate = 5e-4
batch_size = 256

print("Loading dataset...")
train_data, val_data = load_data()

# Sample 5% of the sequence to simulate Model A
train_data = train_data[:len(train_data)//20]
val_data = val_data[:len(val_data)//20]

train_loader = get_data_loader(train_data, batch_size)
val_loader = get_data_loader(val_data, batch_size)

model = IDS_Encoder_Only(trg_vocab, d_model, N, heads, dropout_rate)
for p in model.parameters():
    if p.dim() > 1:
        torch.nn.init.xavier_uniform_(p)

optim = torch.optim.Adam(model.parameters(), lr=learning_rate)

print("\n--- Training 1 Quick Epoch (5% Data) with Class Weights ---")
train_model(model, optim, 1, train_loader, val_loader, "verify_model.pt", print_every=50)
