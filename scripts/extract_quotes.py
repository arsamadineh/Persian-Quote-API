import json
import re
import os

transcript_path = '/home/arsam/.gemini/antigravity-cli/brain/372f397f-e247-4870-8c5c-2eb23dbbc777/.system_generated/logs/transcript_full.jsonl'
output_path = '/home/arsam/Documents/work/Website/Webdev/Persian-Quote-API/lib/data/non-poetry-quotes.json'

os.makedirs(os.path.dirname(output_path), exist_ok=True)

user_message = ""
with open(transcript_path, 'r', encoding='utf-8') as f:
    for line in f:
        try:
            data = json.loads(line)
            if data.get('type') == 'USER_INPUT' and 'add these fully to a great structured blazing fast way' in data.get('content', ''):
                user_message = data.get('content', '')
        except:
            pass

# The message format is:
# add these fully to a great structured blazing fast way, non poetry quotes: id, body, author
# 1, quote body..., author
# 2, quote body..., author

quotes = []
# split by newline
lines = user_message.split('\n')
for line in lines:
    line = line.strip()
    if not line or line.startswith('add these') or line.startswith('The following is a <SYSTEM_MESSAGE>') or line.startswith('<SYSTEM_MESSAGE>') or line.startswith('[Message]') or line.startswith('</SYSTEM_MESSAGE>'):
        continue
    
    # regex to match id, body, author
    # format is: id, body, author
    # wait, the body can contain commas. So it's better to split by first comma and last comma.
    # example: 1, چالش ها برای سرگرم کننده کردن زندگی هستند و غلبه بر آن باعث معنا دار شدن زندگی., جاشوه جی مارین
    
    parts = line.split(',')
    if len(parts) >= 3:
        # id is parts[0]
        id_str = parts[0].strip()
        if not id_str.isdigit():
            continue
            
        # author is parts[-1]
        author = parts[-1].strip()
        
        # body is everything in between
        body = ','.join(parts[1:-1]).strip()
        
        # remove surrounding quotes if any
        if body.startswith('"') and body.endswith('"'):
            body = body[1:-1]
            
        quotes.append({
            'id': int(id_str),
            'body': body,
            'author': author
        })

with open(output_path, 'w', encoding='utf-8') as f:
    json.dump(quotes, f, ensure_ascii=False, indent=2)

print(f"Extracted {len(quotes)} quotes to {output_path}")
