const express = require('express');
const cors = require('cors');
const puppeteer = require('puppeteer');
const StealthPlugin = require('puppeteer-extra-plugin-stealth');
const puppeteerExtra = require('puppeteer-extra');

puppeteerExtra.use(StealthPlugin());

const app = express();
app.use(cors());

app.get('/clone', async (req, res) => {
  const url = req.query.url;
  if (!url) return res.status(400).send('URL é obrigatória.');

  try {
    const browser = await puppeteerExtra.launch({
      headless: 'new',
      args: ['--no-sandbox', '--disable-setuid-sandbox']
    });
    const page = await browser.newPage();
    await page.goto(url, { waitUntil: 'load', timeout: 0 });
    const html = await page.content();
    await browser.close();

    res.setHeader('Content-disposition', 'attachment; filename=pagina-clonada.html');
    res.setHeader('Content-Type', 'text/html');
    res.send(html);
  } catch (err) {
    console.error('Erro ao clonar página:', err);
    res.status(500).send('Erro ao clonar página.');
  }
});

app.listen(10000, () => {
  console.log('Servidor rodando na porta 10000');
});
