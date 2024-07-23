const ytdl = require('ytdl-core');
const { format } = require('date-fns');

module.exports = (page) => {
    const scrapeVideos = async (req, res) => {
        const { nome_do_canal } = req.body;
        const limit = parseInt(req.query.limit) || 10;

        if (!nome_do_canal) {
            return res.status(400).json({ error: 'nome_do_canal is required' });
        }

        if (limit > 50) {
            return res.status(400).json({ error: 'Limit cannot be greater than 50' });
        }

        const url = `https://www.viewstats.com/${nome_do_canal}/videos`;

        try {
            await page.goto(url, { waitUntil: 'networkidle2' });

            const videos = await page.evaluate(() => {
                const videoElements = document.querySelectorAll('.videos-grid a');
                const videoData = [];

                videoElements.forEach(video => {
                    const title = video.querySelector('.title')?.innerText || '';
                    const link = video.href;

                    videoData.push({ title, link });
                });

                return videoData;
            });

            const limitedVideos = videos.slice(0, limit);

            // Adicionar data e descrição usando ytdl-core
            for (const video of limitedVideos) {
                const videoId = video.link.split('/').pop();
                const videoInfo = await ytdl.getInfo(videoId);

                const publishDate = new Date(videoInfo.videoDetails.publishDate);
                video.date = format(publishDate, 'dd/MM/yyyy');
                video.description = videoInfo.videoDetails.description;
            }

            res.status(200).json(limitedVideos);
        } catch (error) {
            console.error(error);
            res.status(500).json({ error: 'An error occurred while scraping the videos' });
        }
    };

    return { scrapeVideos };
};
