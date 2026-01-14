#!/usr/bin/env python3
"""
Split distilled JSON into batches of 50 tweets each.
"""

import json
import os
from pathlib import Path

SCRIPT_DIR = os.path.dirname(os.path.abspath(__file__))
INPUT_FILE = os.path.join(SCRIPT_DIR, '..', 'data', 'distilled', 'bookmarks_distilled.json')
OUTPUT_DIR = Path(os.path.join(SCRIPT_DIR, '..', 'data', 'distilled', 'batches'))
BATCH_SIZE = 50

def main():
    OUTPUT_DIR.mkdir(parents=True, exist_ok=True)
    
    with open(INPUT_FILE, 'r', encoding='utf-8') as f:
        data = json.load(f)
    
    total = len(data)
    num_batches = (total + BATCH_SIZE - 1) // BATCH_SIZE
    
    print(f'Splitting {total} tweets into batches of {BATCH_SIZE}')
    print(f'Total batches: {num_batches}')
    
    for batch_num in range(num_batches):
        start_idx = batch_num * BATCH_SIZE
        end_idx = min(start_idx + BATCH_SIZE, total)
        batch = data[start_idx:end_idx]
        
        batch_file = OUTPUT_DIR / f'batch_{batch_num + 1:02d}.json'
        with open(batch_file, 'w', encoding='utf-8') as f:
            json.dump(batch, f, indent=2, ensure_ascii=False)
        
        print(f'  Batch {batch_num + 1:02d}: {len(batch)} tweets -> {batch_file}')
    
    print(f'\nDone! Created {num_batches} batch files in {OUTPUT_DIR}')

if __name__ == '__main__':
    main()
