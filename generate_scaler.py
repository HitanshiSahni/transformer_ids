import joblib
from sklearn.preprocessing import MinMaxScaler
import pandas as pd
import glob
import os
import numpy as np

path='data/'
csv_files = glob.glob(os.path.join(path, '*.csv'))
scaler = MinMaxScaler()
max_float = np.finfo(np.float64).max

print("Starting scaler generation...")
for f in csv_files:
    print(f"Processing {f}...")
    for chunk in pd.read_csv(f, chunksize=100000):
        chunk.columns = chunk.columns.str.strip()
        chunk = chunk.dropna()
        if chunk.empty:
            continue
        X = chunk.drop('Label', axis=1, errors='ignore')
        
        # ensure all numeric
        for c in X.select_dtypes(include=['float64']).columns:
            X[c] = X[c].astype('float32')
        for c in X.select_dtypes(include=['int64']).columns:
            X[c] = X[c].astype('int32')
            
        X = X.select_dtypes(include=[np.number])
        X = X.where(X <= max_float, max_float)
        
        scaler.partial_fit(X)

os.makedirs('data/preprocessed', exist_ok=True)
joblib.dump(scaler, 'data/preprocessed/scaler.save')
print('Scaler regenerated properly.')
