path = 'src/app/globals.css'
with open(path, 'a', encoding='utf-8') as f:
    f.write('''
/* Force spin buttons */
input[type="number"].admin-spin::-webkit-inner-spin-button,
input[type="number"].admin-spin::-webkit-outer-spin-button {
  -webkit-appearance: inner-spin-button !important;
  opacity: 1 !important;
  display: block !important;
  height: auto;
}
input[type="number"].admin-spin {
  -moz-appearance: number-input;
}
''')
print("Added CSS")
