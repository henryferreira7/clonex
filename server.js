const express = require('express');
const cors = require('cors');
const { exec } = require('child_process');
const puppeteer = require('puppeteer-core');
const path = require('path');

const app = express();
app.use(cors());

app.get('/clone', async (req, res) => {
  const url = req.query.url;

  if (!url) {
    return res.status(400).send('URL inválida');
  }

  try {
    const browser = await puppeteer.launch({
      executablePath: '/usr/bin/google-chrome',
      headless: 'new',
      args: ['--no-sandbox', '--disable-setuid-sandbox']
    });

    const page = await browser.newPage();
    await page.goto(url, { waitUntil: 'networkidle2' });

    const html = await page.content();
    await browser.close();

    res.setHeader('Content-Disposition', 'attachment; filename="pagina-clonada.html"');
    res.setHeader('Content-Type', 'text/html');
    res.send(html);
  } catch (err) {
    console.error('Erro ao clonar página:', err.message);
    res.status(500).send('Erro ao clonar página. Veja o console para mais detalhes.');
  }
});

const PORT = process.env.PORT || 10000;
app.listen(PORT, () => {
  console.log(`Servidor rodando na porta ${PORT}`);
});
