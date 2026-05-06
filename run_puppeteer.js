const puppeteer = require('puppeteer');

(async () => {
  const browser = await puppeteer.launch();
  const page = await browser.newPage();
  page.on('console', msg => console.log('PAGE LOG:', msg.text()));
  
  await page.goto('http://localhost:8000', {waitUntil: 'networkidle0'});
  await new Promise(r => setTimeout(r, 2000));
  
  const debugInfo = await page.evaluate(() => {
    function getRect(idOrSelector) {
        let el = document.querySelector(idOrSelector);
        if (!el) return null;
        let rect = el.getBoundingClientRect();
        return {
            x: rect.x, y: rect.y, width: rect.width, height: rect.height,
            zIndex: window.getComputedStyle(el).zIndex,
            opacity: window.getComputedStyle(el).opacity,
            visibility: window.getComputedStyle(el).visibility,
            bgColor: window.getComputedStyle(el).backgroundColor
        };
    }
    return {
        body: getRect('body'),
        main: getRect('#main-container'),
        hero: getRect('.hero'),
        ballpit: getRect('#ballpit-canvas'),
        fluid: getRect('#fluid'),
        preloader: getRect('.preloader'),
        isIntersecting: window.__ballpitIntersecting // if we attach it
    };
  });
  
  console.log(JSON.stringify(debugInfo, null, 2));
  await browser.close();
})();
