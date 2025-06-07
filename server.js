const express = require('express');
const cors = require('cors');
const chromium = require('chrome-aws-lambda');

const app = express();
app.use(cors());

app.get('/clone', async (req, res) => {
  const url = req.query.url;

  if (!url) return res.status(400).send('URL não fornecida');

  let browser;
  try {
    browser = await chromium.puppeteer.launch({
      args: chromium.args,
      executablePath: await chromium.executablePath,
      headless: chromium.headless,
    });

    const page = await browser.newPage();
    await page.goto(url, { waitUntil: 'networkidle2' });

    const html = await page.content();

    res.set({
      'Content-Disposition': 'attachment; filename="pagina-clonada.html"',
      'Content-Type': 'text/html',
    });

    res.send(html);
  } catch (error) {
    console.error('Erro ao clonar página:', error);
    res.status(500).send('Erro ao clonar página. Veja o console para mais detalhes.');
  } finally {
    if (browser) await browser.close();
  }
});

const PORT = process.env.PORT || 10000;
app.listen(PORT, () => {
  console.log(`Servidor rodando na porta ${PORT}`);
});
