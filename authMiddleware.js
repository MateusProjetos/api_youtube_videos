const authMiddleware = (req, res, next) => {
    const apiKey = req.headers['authorization'];

    if (apiKey === 'apikeydcode2024#5') {
        next();
    } else {
        res.status(401).json({ error: 'Unauthorized' });
    }
};

module.exports = authMiddleware;
