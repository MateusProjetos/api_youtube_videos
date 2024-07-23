const express = require('express');
const puppeteer = require('puppeteer');
const app = express();
const port = 3000;
const cors = require('cors');


app.use(cors());

app.use(express.json());

let browser, page;

const initializePuppeteer = async () => {
    browser = await puppeteer.launch({ headless: true });
    page = await browser.newPage();
};

initializePuppeteer().then(() => {
    console.log('Puppeteer initialized');
    const videoRoutes = require('./routes/videoRoutes')(page);
    app.use('/api/videos', videoRoutes);

    app.listen(port, () => {
        console.log(`Server is running on http://localhost:${port}`);
    });
}).catch(error => {
    console.error('Failed to initialize Puppeteer:', error);
});

process.on('exit', () => {
    if (browser) {
        browser.close();
    }
});
