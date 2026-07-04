import re
import json
import os

txt_path = 'public/hafez.txt'
json_path = 'lib/data/hafez.json'

os.makedirs(os.path.dirname(json_path), exist_ok=True)

with open(txt_path, 'r', encoding='utf-8') as f:
    lines = f.readlines()

ghazals = []
current_ghazal = None
current_verses = []

# Convert Persian digits to English int
persian_to_english = {
    '۰': '0', '۱': '1', '۲': '2', '۳': '3', '۴': '4',
    '۵': '5', '۶': '6', '۷': '7', '۸': '8', '۹': '9'
}

def parse_number(num_str):
    eng_str = ''.join(persian_to_english.get(c, c) for c in num_str)
    try:
        return int(eng_str)
    except ValueError:
        return None

for line in lines:
    line_stripped = line.strip()
    if not line_stripped:
        continue
    
    if line_stripped.startswith('غزل'):
        # Save previous ghazal
        if current_ghazal is not None:
            verses = []
            for i in range(0, len(current_verses), 2):
                if i + 1 < len(current_verses):
                    verses.append([current_verses[i], current_verses[i+1]])
                else:
                    verses.append([current_verses[i], ""])
            current_ghazal['verses'] = verses
            ghazals.append(current_ghazal)
        
        # Parse new ghazal
        match = re.search(r'غزل\s+(\d+|[۰-۹]+)', line_stripped)
        ghazal_id = len(ghazals) + 1
        if match:
            parsed_id = parse_number(match.group(1))
            if parsed_id is not None:
                ghazal_id = parsed_id
        
        current_ghazal = {
            'id': ghazal_id,
            'title': f"غزل {ghazal_id}",
            'poet': 'حافظ شیرازی',
            'verses': []
        }
        current_verses = []
    else:
        if current_ghazal is not None:
            current_verses.append(line_stripped)

# Save the last ghazal
if current_ghazal is not None:
    verses = []
    for i in range(0, len(current_verses), 2):
        if i + 1 < len(current_verses):
            verses.append([current_verses[i], current_verses[i+1]])
        else:
            verses.append([current_verses[i], ""])
    current_ghazal['verses'] = verses
    ghazals.append(current_ghazal)

with open(json_path, 'w', encoding='utf-8') as f:
    json.dump(ghazals, f, ensure_ascii=False, indent=2)

print(f"Successfully parsed {len(ghazals)} ghazals into {json_path}")
