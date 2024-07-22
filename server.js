const express = require('express');
const puppeteer = require('puppeteer');
const ytdl = require('ytdl-core');
const app = express();
const PORT = 3000;

const API_KEY = 'apikeydcode2024#5';

// Middleware de autenticação
app.use((req, res, next) => {
  const apiKey = req.headers['authorization'];
  if (apiKey && apiKey === API_KEY) {
    next();
  } else {
    res.status(403).json({ error: 'Unauthorized' });
  }
});

let browser;

// Iniciar o Puppeteer ao iniciar o servidor
(async () => {
  browser = await puppeteer.launch({
    headless: true,
    args: ['--no-sandbox', '--disable-setuid-sandbox']
  });
  console.log('Puppeteer iniciado');
})();

app.get('/api/videos', async (req, res) => {
  const { channel, limit } = req.query;
  const videoLimit = Math.min(limit ? parseInt(limit, 10) : 10, 50);

  if (!channel) {
    return res.status(400).json({ error: 'Channel name is required' });
  }

  console.log(`Processando canal: ${channel}, Limite de vídeos: ${videoLimit}`);

  try {
    const page = await browser.newPage();
    await page.goto(`https://www.youtube.com/@${channel}/videos`, { waitUntil: 'networkidle2', timeout: 60000 });

    console.log('Página carregada');

    await page.waitForSelector('h3 a#video-title', { timeout: 60000 });

    console.log('Selector encontrado');

    const videoLinks = await page.evaluate(() => {
      const elements = Array.from(document.querySelectorAll('h3 a#video-title'));
      return elements.map(element => ({
        title: element.textContent.trim(),
        url: `https://www.youtube.com${element.getAttribute('href')}`
      }));
    });

    console.log(`Encontrados ${videoLinks.length} vídeos`);

    const videos = await Promise.all(videoLinks.slice(0, videoLimit).map(async video => {
      try {
        const info = await ytdl.getInfo(video.url);
        const publishDate = new Date(info.videoDetails.publishDate);
        return {
          ...video,
          date: publishDate.toLocaleDateString('pt-BR'),
          description: info.videoDetails.description
        };
      } catch (error) {
        console.error(`Erro ao obter informações do vídeo ${video.url}:`, error);
        return null;
      }
    }));

    await page.close();
    res.json(videos.filter(video => video !== null));
  } catch (error) {
    console.error('Erro ao processar a solicitação:', error);
    res.status(500).json({ error: 'Erro ao processar a solicitação' });
  }
});

app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
