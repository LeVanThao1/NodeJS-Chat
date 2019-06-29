const messageController = require('../controllers/messages');
const groupController = require('../controllers/groups');

exports.initEvent = (socket, userId) => {
    socket.on('messages', async function(data, callback) {
        try {
            if (!data) { 
                return callback(new Error('INVALID_DATA'));
            }
            switch (data.action) {
                case 'SEND': {
                    return await createMessage(socket, userId, data, callback);
                }
                case 'SEND_TYPING': {
                    socket.broadcast.emit('messages', {
                        action: 'RECEIVE_TYPING',
                        group: data.groupId
                    });
                    return callback(null, data);
                }
                case 'SEND_DONE_TYPING': {
                    socket.broadcast.emit('messages', {
                        action: 'RECEIVE_DONE_TYPING',
                        group: data.groupId
                    });
                    return callback(null, data);
                }
            }          
        } catch (error) {
            return callback(error, null);
        }
    });
};

const createMessage = async (socket, userId, data, callback) => {
    // hard code room
    console.log(data.groupId);
    const group = data.groupId;
    const messageRequest = messageController.sendMessage({
        body: {
            // room: data.room,
            group,
            content: data.message
        },
        user: socket.user
    });
    const groupRequest = groupController.getGroup({
        params: {
            id: group
        },
        user: socket.user
    })
    const [messageResponseData, groupResponseData] = await Promise.all([messageRequest, groupRequest]);
    console.log(groupResponseData.data);
    groupResponseData.data.members.map(member => {
        socket.broadcast.to(member._id.toString()).emit('messages', {
            action: 'RECEIVE',
            message: messageResponseData.data,
            userId: userId
        });
    });
    // socket.broadcast.emit('messages', {
    //     action: 'RECEIVE',
    //     message: responseData.data
    // });
    return callback(null,messageResponseData.data);
}
// const getListMessageOfGroup = async (socket, data, callback) => {
//     const group = data.groupId;
//     const responseData = await messageController.getListMessageOfGroup({
//         body: {
//             group
//         },
//         user: socket.user
//     });
//     socket.emit('messages', {action: 'GETMS', messages: responseData.data, user: socket.user });
//     return callback(null, responseData.data);
// }