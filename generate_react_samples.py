import json
import pandas as pd
import numpy as np

print("Loading test samples directly...")
chunk_size = 50000

attack_samples = []
benign_samples = []

for chunk in pd.read_csv('data/preprocessed/data.csv.gz', compression='gzip', chunksize=chunk_size):
    attack_df = chunk[chunk['Attack'] == 1]
    benign_df = chunk[chunk['BENIGN'] == 1]
    
    if len(attack_samples) < 10 and len(attack_df) > 0:
        samples = attack_df.drop(['Label', 'Attack', 'BENIGN'], axis=1).values.tolist()
        for features in samples:
            attack_samples.append(features)
            if len(attack_samples) >= 10:
                break
                
    if len(benign_samples) < 10 and len(benign_df) > 0:
        samples = benign_df.drop(['Label', 'Attack', 'BENIGN'], axis=1).values.tolist()
        for features in samples:
            benign_samples.append(features)
            if len(benign_samples) >= 10:
                break
                
    if len(attack_samples) >= 10 and len(benign_samples) >= 10:
        break

with open("frontend_samples.json", "w") as f:
    json.dump({
        "attack": attack_samples,
        "benign": benign_samples
    }, f)
        
print("Successfully extracted 10 actual Attack and 10 actual Benign samples without backend API queries.")
