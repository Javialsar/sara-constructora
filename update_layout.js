const fs = require('fs');

let f = fs.readFileSync('src/app/admin/layout.tsx', 'utf8');

// Add states for user data
f = f.replace(/const \[logo, setLogo\] = useState\("\/images\/logo-sara\.png"\)/, 
const [logo, setLogo] = useState("/images/logo-sara.png")
  const [userName, setUserName] = useState("Administrador")
  const [userInitials, setUserInitials] = useState("A"));

// Update the fetchLogo useEffect to also fetch the user
f = f.replace(/const fetchLogo = async \(\) => \{/, 
const fetchData = async () => {
      const supabase = createClient()
      
      // Get User Name
      const { data: { user } } = await supabase.auth.getUser()
      if (user && user.user_metadata?.full_name) {
        const name = user.user_metadata.full_name
        setUserName(name)
        const parts = name.split(' ')
        if (parts.length > 1) {
          setUserInitials(parts[0][0] + parts[1][0])
        } else {
          setUserInitials(name.substring(0, 2).toUpperCase())
        }
      }
      
      // Get Logo);

// Update the function call inside useEffect
f = f.replace(/fetchLogo\(\)/, etchData());

// Update HTML to use state
f = f.replace(/Hola, Administrador/, Hola, {userName});
f = f.replace(/>\s*A\s*<\/div>/, >
                {userInitials}
              </div>);

fs.writeFileSync('src/app/admin/layout.tsx', f);
console.log('Layout updated with dynamic user name');
