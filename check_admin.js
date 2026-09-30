const puppeteer = require('puppeteer');

(async () => {
  const browser = await puppeteer.launch({ headless: "new" });
  const page = await browser.newPage();
  
  // Catch page errors
  page.on('pageerror', err => {
    console.error('PAGE ERROR:', err.toString());
  });
  page.on('console', msg => {
    if (msg.type() === 'error') {
      console.error('CONSOLE ERROR:', msg.text());
    }
  });

  try {
    await page.goto('http://localhost:3000/admin/login', { waitUntil: 'networkidle2' });
    
    // Fill login
    await page.type('input[type="email"]', 'admin@sara.com');
    await page.type('input[type="password"]', 'admin123');
    await page.click('button[type="submit"]');
    
    await page.waitForNavigation({ waitUntil: 'networkidle2' });
    
    await page.goto('http://localhost:3000/admin/inmobiliaria', { waitUntil: 'networkidle2' });
    
    // Wait a bit to see if error boundary renders
    await new Promise(r => setTimeout(r, 2000));
    
    const bodyHTML = await page.evaluate(() => document.body.innerHTML);
    if (bodyHTML.includes('¡Algo salió mal!')) {
      console.error('ERROR BOUNDARY TRIGGERED!');
    } else {
      console.log('Page loaded correctly');
    }
    
  } catch (err) {
    console.error('NAVIGATION ERROR:', err);
  }
  
  await browser.close();
  process.exit(0);
})();
