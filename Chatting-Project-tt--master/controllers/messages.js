const { messageRepository, groupRepository  } = require('../reponsitories');
const { ResponseSuccess, ResponseError } = require('../helpers/response-helper');

const sendMessage = async (req, res, next = function(err) {
    return Promise.reject(err);
}) => {
    try {
        const data = req.body;
        console.log(data);
        const loginAuthor = req.user._id;
        const existGroup = await groupRepository.getOne({where: {_id: data.group, members: loginAuthor}});
        if (!existGroup) {
            return next(new Error('NOT_EXISTED_GROUP')); 
        }
        data.author = loginAuthor;
        const sendMessage = await messageRepository.create(data);
        await groupRepository.updateOne( { where: { _id: data.group }, data: { lastMessage: sendMessage._id }});
        // return res.status(200).json({
        //     message: 'Send Message successfully',
        //     sendMessage
        // });
        return ResponseSuccess('Send Message successfully', sendMessage, res);
    } catch (e) {
        return next(e);
    }
}
const getMessage = async (req, res, next = function(err) {
    return Promise.reject(err);
}) => {
    try {
        const { id } = req.params;
        const message = await messageRepository.getOne({where: { _id: id }, populate: { path: 'author', select: 'username'}});
        if (!message) {
            return next(new Error('NOT_EXISTED_MESSAGE'));
        }
        // return res.status(200).json({
        //     message: 'message ',
        //     message
        // });
        return ResponseSuccess('Message', message, res);
    } catch (e) {
        return next(e);
    }
}
const getListMessage = async (req, res, next = function(err) {
    return Promise.reject(err);
}) => {
    try {
        let page= parseInt(req.query.page);
        let limit = parseInt(req.query.limit);
        const messages = await messageRepository.getAll({ populate: { path: 'author', select: 'username'}, limit, page });
        // return res.status(200).json({
        //     message: 'List Message ',
        //     messages
        // });  
        return ResponseSuccess('List Message', messages, res); 
    } catch (e) {
        return next(e);
    }
}
const getListMessageOfGroup = async (req, res, next = function(err) {
    return Promise.reject(err);
}) => {
    try {
        const author = req.user._id;
        const groupId = req.params;
        const lastGroupId = req.query.lastGroupId;
        let page= parseInt(req.query.page);
        let limit = parseInt(req.query.limit);
        const existGroup = groupRepository.getOne({where: { _id: groupId.id, members: author, _id: { $lt: lastGroupId } }, select: '_id'});
        if (!existGroup) {
            return next(new Error('NOT_EXISTED_GROUP'));
        }
        const messages = await messageRepository.getAll({ where : { group : groupId.id }, select: 'content author createdAt', populate: {
            path: 'author',
            select: 'username'
        }, sort: {'createdAt': 1}}, page, limit);
        // return res.status(200).json({
        //     message: 'List Message ',
        //     messages
        // });   
        return ResponseSuccess('List Message', messages, res);
    } catch (e) {
        return next(e);
    }
}
const deleteMessage = async (req, res, next = function(err) {
    return Promise.reject(err);
}) => {
    try {
        const { id } = req.params;
        await messageRepository.deleteOne({ where: { _id: id, author: req.user._id }, data: {$set: { deleteAt: new Date() }} });
        // return res.status(200).json({
        //     message: 'Delete Group successfully'
        // });
        return ResponseSuccess('Delete Group successfully', null, res);
    } catch (e) {
        return next(e);
    }
}
const updateMessage = async (req, res, next = function(err) {
    return Promise.reject(err);
}) => {
    try {
        const { id } = req.params;
        const { content } = req.body;
        await messageRepository.updateOne({ where: { _id: id, }, data: { content } });
        // return res.status(200).json({
        //     message: 'Update successfully'
        // });
        return ResponseSuccess('Update successfully', null, res);
    } catch (e) {
        return next(e);
    }
}
module.exports = {
    sendMessage,
    getListMessage,
    getMessage,
    deleteMessage,
    getListMessageOfGroup,
    updateMessage
}