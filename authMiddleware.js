const authMiddleware = (req, res, next) => {
    const apiKey = req.headers['authorization'];

    if (apiKey === process.env.API_KEY) {
        next();
    } else {
        res.status(401).json({ error: 'Unauthorized' });
    }
};

module.exports = authMiddleware;
