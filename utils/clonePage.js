const puppeteer = require("puppeteer");

async function clonePage(url) {
  const browser = await puppeteer.launch({
    headless: "new",
    args: ["--no-sandbox", "--disable-setuid-sandbox"]
  });

  const page = await browser.newPage();
  await page.goto(url, { waitUntil: "networkidle2" });

  const html = await page.content();
  await browser.close();

  return html;
}

module.exports = clonePage;