/**
 * A Chrome for the player: Puppeteer's (downloaded by `npm install`), or yours with CHROME_PATH=/path/to/chrome.
 * The harness talks to it through a raw DevTools session (`client`), so a click is a real press-and-release at a point,
 * exactly as a person's would be — never a DOM `.click()` on an element the model could not have seen.
 */
import puppeteer from 'puppeteer';

export async function openBrowser({ url, width, height, visible }) {
  const browser = await puppeteer.launch({
    headless: !visible,
    executablePath: process.env.CHROME_PATH || undefined,
    defaultViewport: { width, height },
    args: ['--hide-scrollbars', '--no-first-run', '--no-default-browser-check']
  });
  const page = await browser.newPage();
  const consoleErrors = [];
  page.on('pageerror', (e) => consoleErrors.push(String(e.message).slice(0, 300)));
  page.on('console', (m) => m.type() === 'error' && consoleErrors.push(m.text().slice(0, 300)));
  const client = await page.createCDPSession();
  await page.goto(url, { waitUntil: 'networkidle2', timeout: 60000 });
  return {
    client,
    consoleErrors,
    /** Evaluate an expression string in the page and return its value. */
    evaluate: (expression) => page.evaluate(expression),
    async screenshotJpeg() {
      const { data } = await client.send('Page.captureScreenshot', { format: 'jpeg', quality: 70 });
      return data;
    },
    close: () => browser.close()
  };
}
