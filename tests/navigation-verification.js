const { chromium } = require('playwright');

(async () => {
    const browser = await chromium.launch();
    const context = await browser.newContext();
    const page = await context.newPage();

    console.log('--- NAVIGATION PERSISTENCE MATRIX ---');

    // 1. URL lang propagation
    console.log('Testing: URL lang propagation...');
    await page.goto('http://localhost:3000/PV.html?lang=fr');
    let lang = await page.evaluate(() => i18n.currentLang);
    console.log('   - PV.html?lang=fr -> currentLang:', lang, lang === 'fr' ? '✅' : '❌');

    // 2. localStorage restoration
    console.log('Testing: localStorage restoration...');
    await page.goto('http://localhost:3000/PV.html');
    lang = await page.evaluate(() => i18n.currentLang);
    console.log('   - PV.html (refresh) -> currentLang:', lang, lang === 'fr' ? '✅' : '❌');

    // 3. Auto-link decoration (i18n.link)
    console.log('Testing: Internal link decoration...');
    const linkFr = await page.evaluate(() => i18n.link('klantenportaalpv.html'));
    console.log('   - i18n.link("klantenportaalpv.html") ->', linkFr, linkFr.includes('lang=fr') ? '✅' : '❌');

    // 4. NL fallback integrity
    console.log('Testing: NL fallback integrity...');
    await page.evaluate(() => localStorage.clear());
    await page.goto('http://localhost:3000/PV.html');
    lang = await page.evaluate(() => i18n.currentLang);
    console.log('   - No locale set -> currentLang:', lang, lang === 'nl' ? '✅' : '❌');

    // 5. Deep-link locale preservation
    console.log('Testing: Deep-link locale preservation...');
    await page.goto('http://localhost:3000/PV_Exclusieve_Service.html?lang=en');
    await page.click('a[href*="PV-vaste-prijzen.html"]');
    await page.waitForLoadState('networkidle');
    const currentUrl = page.url();
    lang = await page.evaluate(() => i18n.currentLang);
    console.log('   - Deep link click (EN) -> currentURL:', currentUrl, currentUrl.includes('lang=en') ? '✅' : '❌');
    console.log('   - Deep link click (EN) -> currentLang:', lang, lang === 'en' ? '✅' : '❌');

    console.log('--- CERTIFICATION STATUS: PENDING ---');
    await browser.close();
})();
