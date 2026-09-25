const fs = require('fs');
let content = fs.readFileSync('src/app/admin/apus/rubros/page.tsx', 'utf-8');

// Fix TS error: change useState({ to useState<any>({
content = content.replace(
  "const [newRubroData, setNewRubroData] = useState({",
  "const [newRubroData, setNewRubroData] = useState<any>({"
);

fs.writeFileSync('src/app/admin/apus/rubros/page.tsx', content);
