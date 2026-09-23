import codecs
c = codecs.open(r'C:\Users\elkin\.gemini\antigravity\brain\a7a20663-065d-4d04-b6b1-b4aedece9049\scratch\prev_page.tsx', 'r', 'utf-16le').read()
idx = c.find("generateExplosion = ")
print(c[idx:idx+2500])
