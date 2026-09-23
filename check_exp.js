const fs = require('fs');
let c = fs.readFileSync('C:\\Users\\elkin\\.gemini\\antigravity\\brain\\a7a20663-065d-4d04-b6b1-b4aedece9049\\scratch\\prev_page.tsx', 'utf16le');
let idx = c.indexOf("activeTab === 'explosion'");
console.log(c.substring(idx, idx+2500));
