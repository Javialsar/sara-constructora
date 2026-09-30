const puppeteer = require('puppeteer');

(async () => {
  const browser = await puppeteer.launch({ headless: "new" });
  const page = await browser.newPage();
  
  // Intercept all console messages and evaluate errors
  page.on('console', msg => {
    if (msg.type() === 'error') {
      console.log('BROWSER ERROR:', msg.text());
    }
  });

  page.on('pageerror', err => {
    console.log('UNCAUGHT EXCEPTION:', err.toString());
  });

  try {
    await page.goto('http://localhost:3000/admin/login', { waitUntil: 'networkidle2' });
    await page.type('input[type="email"]', 'admin@sara.com');
    await page.type('input[type="password"]', 'admin123');
    await Promise.all([
      page.click('button[type="submit"]'),
      page.waitForNavigation({ waitUntil: 'networkidle0' })
    ]);
    
    await Promise.all([
      page.goto('http://localhost:3000/admin/inmobiliaria', { waitUntil: 'networkidle0' })
    ]);
    
    // Check if error boundary is there
    const html = await page.content();
    if (html.includes('¡Algo salió mal!')) {
      console.log('Error boundary is visible.');
      
      // Try to get the React error from the overlay if in dev mode
      const reactError = await page.evaluate(() => {
        const overlay = document.querySelector('nextjs-portal');
        return overlay ? overlay.innerHTML : 'No Next.js error overlay found';
      });
      console.log('React Error Overlay:', reactError.substring(0, 500));
    } else {
      console.log('Page loaded without error boundary.');
    }
    
  } catch (err) {
    console.error('SCRIPT ERROR:', err);
  }
  
  await browser.close();
  process.exit(0);
})();
