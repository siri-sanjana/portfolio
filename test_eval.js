const { chromium } = require('playwright');
(async () => {
    const browser = await chromium.launch();
    const page = await browser.newPage();
    
    page.on('console', msg => console.log('LOG:', msg.text()));
    
    await page.goto('http://localhost:8000');
    await page.waitForTimeout(1000);
    
    const debugInfo = await page.evaluate(() => {
        const c = document.getElementById('fluid');
        if (!c) return "No canvas";
        const w = c.clientWidth;
        const h = c.clientHeight;
        const cw = c.width;
        const ch = c.height;
        const gl = c.getContext('webgl2') || c.getContext('webgl');
        return `Canvas size: CSS ${w}x${h}, Internal ${cw}x${ch}, GL context: ${!!gl}`;
    });
    
    console.log(debugInfo);
    
    await browser.close();
})();
