const express = require('express');
const app = express();
const http = require('http').Server(app);
const port = 3001;

app.use(express.static(__dirname + '/public'));

http.listen(port, () => {
    console.log(`Example app listening on port ${port}!`);
});
