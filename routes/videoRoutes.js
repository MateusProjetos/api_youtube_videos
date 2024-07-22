const express = require('express');
const router = express.Router();
const authMiddleware = require('../authMiddleware');

module.exports = (page, scrapeVideos) => {
    router.post('/videos', authMiddleware, scrapeVideos);
    return router;
};
