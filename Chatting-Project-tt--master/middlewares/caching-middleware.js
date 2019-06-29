const RedisCache = require('express-redis-cache');
const redis = require('redis');
const axios = require('axios');
const cache = RedisCache({ host: '127.0.0.1', port: '6379'});
const client = redis.createClient({ host: '127.0.0.1', port: '6379'});
const cachingUrlDic = [
    // '/users',
    '/groups',
    '/api/v1/groups'
];
const rediscache = (req, res, next) => {
        try {
            const orinalURL = req.originalUrl;
            if (cachingUrlDic.includes(orinalURL)) {
                client.get(orinalURL, async function(e, data) {
                    if (e) {
                        return res.json(e.message);
                    }
                    if (data) {
                        return res.json({
                            source: 'redis',
                            data: JSON.parse(data)
                        });
                    }
                    req.link = orinalURL;
                    return next();
                    // const photos = await axios.get('https://jsonplaceholder.typicode.com/users');
                    // client.setex(orinalURL, 10, JSON.stringify(photos.data));
                    // return res.json({ source: 'api', data: photos.data });
                });
            } else {
                // return next();
            }
        } catch (e) {
            // return next(e);
        }
    }
module.exports = {
    rediscache
}
