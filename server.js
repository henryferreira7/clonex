// server.js
const express       = require('express');
const cors          = require('cors');
const fs            = require('fs');
const path          = require('path');
const chromium      = require('chrome-aws-lambda');
const puppeteer     = require('puppeteer-core');
const StealthPlugin = require('puppeteer-extra-plugin-stealth');

puppeteer.use(StealthPlugin());

const app = express();
app.use(cors());

const PORT = process.env.PORT || 3001;

app.get('/clone', async (req, res) => {
  const url = req.query.url;
  if (!url) return res.status(400).send('URL não fornecida.');

  let browser = null;
  try {
    browser = await puppeteer.launch({
      args: chromium.args,
      defaultViewport: chromium.defaultViewport,
      executablePath: await chromium.executablePath,
      headless: chromium.headless,
    });

    const page = await browser.newPage();
    await page.goto(url, { waitUntil: 'networkidle2', timeout: 60000 });

    const html     = await page.content();
    const fileName = `pagina_clonada_${Date.now()}.html`;
    const filePath = path.join(__dirname, 'utils', fileName);
    fs.writeFileSync(filePath, html);

    await browser.close();
    return res.download(filePath);

  } catch (error) {
    if (browser) await browser.close();
    console.error('Erro ao clonar página:', error);
    return res.status(500).send('Erro ao clonar página. Veja o console.');
  }
});

app.listen(PORT, () => {
  console.log(`Servidor rodando em http://localhost:${PORT}`);
});
