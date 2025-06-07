const express = require('express');
const cors = require('cors');
const puppeteer = require('puppeteer-core');
const chromium = require('chrome-aws-lambda');

const app = express();
app.use(cors());

const PORT = process.env.PORT || 10000;

app.get('/clone', async (req, res) => {
  const url = req.query.url;

  if (!url) return res.status(400).send('URL é obrigatória');

  let browser = null;

  try {
    browser = await puppeteer.launch({
      args: chromium.args,
      executablePath: await chromium.executablePath,
      headless: chromium.headless
    });

    const page = await browser.newPage();
    await page.goto(url, { waitUntil: 'networkidle2', timeout: 60000 });

    const content = await page.content();
    const filename = 'pagina-clonada.html';

    res.setHeader('Content-disposition', `attachment; filename=${filename}`);
    res.setHeader('Content-Type', 'text/html');
    res.send(content);
  } catch (error) {
    console.error('Erro detalhado:', error);
    res.status(500).send('Erro ao clonar página. Veja o console para mais detalhes.');
  } finally {
    if (browser) await browser.close();
  }
});

app.listen(PORT, () => {
  console.log(`Servidor rodando na porta ${PORT}`);
});
