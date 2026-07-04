import csv
import json

csv_path = 'public/shereno.csv'
json_path = 'lib/data/shereno.json'

data = []
with open(csv_path, 'r', encoding='utf-8') as f:
    reader = csv.DictReader(f)
    for i, row in enumerate(reader):
        data.append({
            'id': i + 1,
            'poem': row.get('Poem', '').strip(),
            'poet': row.get('Poet', '').strip(),
            'title': row.get('Title', '').strip(),
            'book': row.get('Book', '').strip()
        })

with open(json_path, 'w', encoding='utf-8') as f:
    json.dump(data, f, ensure_ascii=False)

print(f"Converted {len(data)} Sher-e-No poems.")
