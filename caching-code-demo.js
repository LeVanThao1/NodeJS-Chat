const express = require('express');
const axios = require('axios');
const redis = require('redis');

const app = express();
const client = redis.createClient();

client.on('error', (err) => {
    console.log("Error " + err)
});

// get photos list
app.get('/users', async (req, res) => {
    try {
        const key = 'users';
        client.get(key, async function(e, data) {
            if (e) {
                return res.json(e.message);
            }
            if (data) {
                return res.json({
                    source: 'redis',
                    data: JSON.parse(data)
                });
            }

            const photos = await axios.get('https://jsonplaceholder.typicode.com/users');
            client.setex(key, 10, JSON.stringify(photos.data));
            return res.json({ source: 'api', data: photos.data });
        });
    } catch(e) {
        console.log(e);
        return res.json(e.message);
    }
});

// start express server at 3000 port
app.listen(3001, () => {
    console.log('Server listening on port: ', 3001)
});