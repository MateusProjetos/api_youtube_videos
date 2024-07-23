require('dotenv').config();
const express = require('express');
const puppeteer = require('puppeteer');
const cors = require('cors');
const rateLimit = require('express-rate-limit');
const compression = require('compression');
const helmet = require('helmet');
const winston = require('winston');

const app = express();
const port = process.env.PORT || 3000;

// Configuração do logger
const logger = winston.createLogger({
  level: 'info',
  format: winston.format.json(),
  defaultMeta: { service: 'video-api' },
  transports: [
    new winston.transports.File({ filename: 'error.log', level: 'error' }),
    new winston.transports.File({ filename: 'combined.log' }),
  ],
});

if (process.env.NODE_ENV !== 'production') {
  logger.add(new winston.transports.Console({
    format: winston.format.simple(),
  }));
}

// Middlewares
app.use(cors());
app.use(express.json());
app.use(compression());
app.use(helmet());

// Rate limiting
const apiLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutos
  max: 100 // limite cada IP a 100 requisições por janela
});
app.use('/api/', apiLimiter);

let browser, page;

const initializePuppeteer = async () => {
    browser = await puppeteer.launch({ 
      headless: true,
      args: (process.env.PUPPETEER_ARGS || '').split(',').filter(arg => arg)
    });
    page = await browser.newPage();
};

initializePuppeteer().then(() => {
    logger.info('Puppeteer initialized');
    const videoRoutes = require('./routes/videoRoutes')(page);
    app.use('/api/videos', videoRoutes);

    app.listen(port, () => {
        logger.info(`Server is running on http://localhost:${port}`);
    });
}).catch(error => {
    logger.error('Failed to initialize Puppeteer:', error);
});

// Middleware de tratamento de erros
app.use((err, req, res, next) => {
  logger.error(err.stack);
  res.status(500).json({ error: 'Internal Server Error' });
});

process.on('exit', () => {
    if (browser) {
        browser.close();
    }
});

// Tratamento de exceções não capturadas
process.on('uncaughtException', (error) => {
  logger.error('Uncaught Exception:', error);
  process.exit(1);
});

process.on('unhandledRejection', (reason, promise) => {
  logger.error('Unhandled Rejection at:', promise, 'reason:', reason);
  process.exit(1);
});

// Adicione a documentação Swagger (opcional)
const swagger = require('./swagger');
swagger(app);
