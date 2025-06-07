// server.js
import express from 'express';
import cors from 'cors';
import fs from 'fs';
import path from 'path';
import chromium from 'chrome-aws-lambda';
import puppeteer from 'puppeteer-core';
import StealthPlugin from 'puppeteer-extra-plugin-stealth';
import pptrExtra from 'puppeteer-extra';

pptrExtra.use(StealthPlugin());

const app = express();
app.use(cors({ origin: '*' }));

const PORT = process.env.PORT || 3001;

app.get('/clone', async (req, res) => {
  const url = req.query.url;
  if (!url) return res.status(400).send('URL não fornecida.');

  let browser = null;
  try {
    browser = await pptrExtra.launch({
      args: chromium.args,
      defaultViewport: chromium.defaultViewport,
      executablePath: await chromium.executablePath,
      headless: chromium.headless,
    });

    const page = await browser.newPage();
    await page.setUserAgent(
      'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 ' +
      '(KHTML, like Gecko) Chrome/114.0.0.0 Safari/537.36'
    );

    await page.goto(url, { waitUntil: 'networkidle2', timeout: 60000 });
    const html = await page.content();

    const fileName = `pagina_clonada_${Date.now()}.html`;
    const filePath = path.join(process.cwd(), 'utils', fileName);
    fs.writeFileSync(filePath, html);

    res.download(filePath, fileName, err => {
      if (err) console.error('Erro no download:', err);
      // opcional: fs.unlinkSync(filePath);
    });

  } catch (err) {
    console.error('Erro ao clonar página:', err);
    res.status(500).send('Erro ao clonar página. Veja o log do servidor.');
  } finally {
    if (browser) await browser.close();
  }
});

app.listen(PORT, () => {
  console.log(`Servidor rodando em http://localhost:${PORT}`);
});
