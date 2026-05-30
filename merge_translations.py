import json

def load_appends(filename):
    with open(filename, 'r') as f:
        content = f.read()
    lines = content.strip().split('\n')
    data = {}
    for line in lines:
        line = line.strip()
        if not line or line.startswith('//'): continue
        if line.endswith(','): line = line[:-1]
        try:
            k, v = line.split(':', 1)
            k = k.strip().strip('"')
            v = v.strip().strip('"')
            data[k] = v
        except:
            pass
    return data

with open('translations.js', 'r') as f:
    lines = f.readlines()

json_lines = []
for line in lines:
    json_lines.append(line)
    if line.strip() == '};' and len(json_lines) > 10:
        break

json_str = ''.join(json_lines).split('const translations = ', 1)[1]
if json_str.strip().endswith(';'): json_str = json_str.strip()[:-1]
trans = json.loads(json_str)

nl_app = load_appends('translations_append.js')
fr_app = load_appends('translations_append_fr.js')
en_app = load_appends('translations_append_en.js')

trans['nl'].update(nl_app)
trans['fr'].update(fr_app)
trans['en'].update(en_app)

# ES and DE should at least have keys, even if untranslated (use NL as fallback for new keys)
for k, v in nl_app.items():
    if k not in trans['es']: trans['es'][k] = v
    if k not in trans['de']: trans['de'][k] = v

suffix = ''.join(lines[len(json_lines):])
with open('translations.js', 'w') as f:
    f.write('const translations = ' + json.dumps(trans, indent=2, ensure_ascii=False) + ';\n' + suffix)
