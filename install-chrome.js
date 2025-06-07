const { exec } = require('child_process');

exec('mkdir -p .render/chrome && curl -sSL https://dl.google.com/linux/direct/google-chrome-stable_current_amd64.deb -o .render/chrome/chrome.deb && apt-get update && apt-get install -y ./render/chrome/chrome.deb', (error, stdout, stderr) => {
  if (error) {
    console.error(`Erro ao instalar o Chrome: ${error.message}`);
    return;
  }
  if (stderr) {
    console.error(`Stderr: ${stderr}`);
    return;
  }
  console.log(`Chrome instalado: ${stdout}`);
});
