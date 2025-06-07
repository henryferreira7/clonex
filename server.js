const express = require('express');
const cors = require('cors');
const puppeteer = require('puppeteer');

const app = express();
app.use(cors());

const PORT = process.env.PORT || 10000;

app.get('/clone', async (req, res) => {
  const { url } = req.query;
  if (!url) return res.status(400).send('URL é obrigatória.');

  try {
    const browser = await puppeteer.launch({
      headless: 'new',
      args: ['--no-sandbox', '--disable-setuid-sandbox']
    });

    const page = await browser.newPage();
    await page.goto(url, { waitUntil: 'networkidle2', timeout: 60000 });
    const html = await page.content();

    await browser.close();

    res.setHeader('Content-Disposition', 'attachment; filename="pagina.html"');
    res.setHeader('Content-Type', 'text/html');
    res.send(html);
  } catch (error) {
    console.error('Erro ao clonar página:', error.message);
    res.status(500).send('Erro ao clonar página.');
  }
});

app.listen(PORT, () => {
  console.log(`Servidor rodando na porta ${PORT}`);
});
