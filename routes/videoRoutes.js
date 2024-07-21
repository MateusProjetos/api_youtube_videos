const express = require('express');

module.exports = (page) => {
    const router = express.Router();
    const { scrapeVideos } = require('../controllers/videoController')(page);

    router.post('/', scrapeVideos);

    return router;
};
