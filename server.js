const express = require('express');
const cors = require('cors');
const fs = require('fs');
const path = require('path');
const puppeteer = require('puppeteer-extra');
const StealthPlugin = require('puppeteer-extra-plugin-stealth');
const chromium = require('chrome-aws-lambda');

puppeteer.use(StealthPlugin());

const app = express();
app.use(cors({ origin: '*' }));

const PORT = process.env.PORT || 3001;

app.get('/clone', async (req, res) => {
  const url = req.query.url;
  if (!url) {
    return res.status(400).send('URL não fornecida.');
  }

  try {
    const executablePath = await chromium.executablePath || '/usr/bin/chromium-browser';

    const browser = await puppeteer.launch({
      args: chromium.args,
      defaultViewport: chromium.defaultViewport,
      executablePath,
      headless: chromium.headless,
    });

    const page = await browser.newPage();
    await page.setUserAgent(
      'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 ' +
      '(KHTML, like Gecko) Chrome/114.0.0.0 Safari/537.36'
    );

    await page.goto(url, {
      waitUntil: 'networkidle2',
      timeout: 60000,
    });

    const html = await page.content();
    const fileName = `pagina_clonada_${Date.now()}.html`;
    const filePath = path.join(__dirname, 'utils', fileName);
    fs.writeFileSync(filePath, html);

    await browser.close();
    return res.download(filePath);
  } catch (error) {
    console.error('Erro ao clonar página:', error);
    return res.status(500).send('Erro ao clonar página. Veja o console para mais detalhes.');
  }
});

app.listen(PORT, () => {
  console.log(`Servidor rodando em http://localhost:${PORT}`);
});
