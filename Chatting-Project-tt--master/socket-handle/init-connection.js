const message = require('../socket-handle/message.js');
const { verify } = require ('../helpers/jwt-helper');
const { userRepository } = require('../reponsitories');

exports.initConnection = function(io) {
    console.log('having 123');
    io.use(function(socket, next) {
        try {
            const token = socket.handshake.query.token;
            console.log(token);
            if (!token) {
                return next(new Error('AUTHENTICATION_FAILED'));
            }
            const verifiedData = verify(token);
            if (!verifiedData) {
                return next(new Error('JWT_INVALID_FORMAT'));
            } 
            socket.user = verifiedData;
            return next();
        } catch(e) {
            return next(e);
        }
    })
    io.on('connection', async function(socket) {
        try {
            console.log('A user is connected.');
            const userId = socket.user._id;
            socket.join(userId);
            const countingDevicesOnline = numberClientInGroup(io,'/', userId);
            if (countingDevicesOnline === 1) {
                await userRepository.updateOne({ where: { _id: userId }, data: { isOnline : true } });
            }
            socket.broadcast.emit('status', {
                action: 'ONLINE',
                data: userId
            });
            //  else {
            //     // query to set true online
            // }
            message.initEvent(socket, userId);
            socket.on('disconnect', async function() {
                try {
                    console.log('A user is disconnect.');
                    const countingDevicesOnline = numberClientInGroup(io,'/', userId);
                    if (countingDevicesOnline === 0) {
                        await userRepository.updateOne({ where: { _id: userId }, data: { isOnline : false } });
                    }
                    socket.broadcast.emit('status', {
                        action: 'OFFLINE',
                        data: userId
                    });
                } catch (error) {
                    console.error(error);  
                }
            });
        } catch (error) {
            console.error(error);
        }
    });
}
function numberClientInGroup(io, namespace, room) {
    const clients = io.nsps[namespace].adapter.rooms[room];
    if (!clients) {
        return 0;
    }
    return clients.length;
}