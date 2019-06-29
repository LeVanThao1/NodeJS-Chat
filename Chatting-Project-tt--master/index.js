const express = require('express');
const app = express();
const server = require('http').Server(app);
const io = require('socket.io')(server);
const bodyParser = require('body-parser');
const port = 3000;
const cors = require('cors')
const userRoute = require('./apis/user.js');
const groupRoute = require('./apis/groups.js');
const messageRoute = require('./apis/messages')
const models = require('./models');
const socketHandler = require('./socket-handle/init-connection');
app.use(bodyParser.urlencoded({extended : false}));
app.use(bodyParser.json());
app.use(express.static(__dirname + '/public'));
 
// Connection URL
// const url = 'mongodb://localhost:27017';
 
// Database Name
 
// Use connect method to connect to the server
models
.connectDB()
.then(console.log('connect db successfully'))
.catch(function (e) {
    console.error(e);
    process.exit(1);
});
const headers = {
    // 'allowedHeaders': ['Content-Type', 'Authorization'],
    'origin': '*',
    // 'methods': 'GET,HEAD,PUT,PATCH,POST,DELETE',
    // 'preflightContinue': true
};
app.use(cors(headers));
app.options('*', cors(headers));

    //load route
userRoute.load(app);
groupRoute.load(app);
messageRoute.load(app);

app.use(function (err, req, res, next) {
    //   console.log(JSON.stringify(err, null, 2));
    if (Array.isArray(err.errors)) {
        const messagese = err.errors.map(function(item) {
            return item.message;
        });
        return res.status(400).json({
            error : messagese
        });
    }
    return res.json({
        message: err.message || 'have error'
    });
});

server.listen(port, () => {
    socketHandler.initConnection(io);
    console.log(`Example app listening on port ${port}!`);
});