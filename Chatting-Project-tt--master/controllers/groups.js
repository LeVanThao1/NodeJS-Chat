const lodash = require('lodash');
const redis = require('redis');
const client = redis.createClient({ host: '127.0.0.1', port: '6379'});
const { groupRepository, userRepository } = require('../reponsitories');
const { ResponseSuccess, ResponseError } = require('../helpers/response-helper');
const createGroup = async (req, res, next = function(err) {
    return Promise.reject(err);
}) => {
    try {
        const data = req.body;
        data.author = req.user._id;
        const setMembers = Array.from(new Set(data.members));
        const countUser = await userRepository.count({ where: { _id : setMembers } });
        if (countUser !== setMembers.length) {
            throw new Error('HAVE_A_MEMBER_INVALID');
        }
        if (!setMembers.includes(data.author)) {
            setMembers.push(data.author);
        }
        data.members = setMembers;
        const newGroup = await groupRepository.create(data);
        // return res.status(200).json({
        //     message: 'Create new group successfully',
        //     data: newGroup
        // });
        return ResponseSuccess('Create new group successfully', newGroup, res);
    } catch (e) {
        return next(e);
    }
}

const inviteGroup = async (req, res, next = function(err) {
    return Promise.reject(err);
}) => {
    try {
        const { id } = req.params;
        const invitingGroup = await groupRepository.updateOne({ where: {_id: id, members: req.user._id}, data: { $addToSet : { members: req.body.members }}});
        if (invitingGroup.nModified === 0) {
            return next(new Error('MEMBERS_CAN_ARE EXISTED_OR_INVALID'));
        }   
        // return res.status(200).json({
        //     message: 'Invite successfully'
        // });
        return ResponseSuccess('Invite successfully', null, res);
    } catch (e) {
        return next(e);
    }
} 
const leaveGroup = async (req, res, next = function(err) {
    return Promise.reject(err);
}) => {
    try {
        const { id } = req.params;
        const existGroup = await groupRepository.getOne({ where: { _id: id, members: req.user._id} });
        if (!existGroup) {
            return next(new Error('GROUP_NOT_EXISTED'));
        }
        const leavingGroup = await groupRepository.updateOne({ where: { _id: id }, data: { $pull: { members: req.user._id }}});
        if (leavingGroup.nModified === 0) {
            return next(new Error('GROUP_NOT_EXISTED'));
        }
        // return res.status(200).json({
        //     message: 'Leave group sucessfully'
        // });    
        return ResponseSuccess('Leave group sucessfully', null, res);
    } catch (error) {
        return next(e)
    }
    
}
const getGroup = async (req, res, next = function(err) {
    return Promise.reject(err);
}) => {
    try {
        const { id } = req.params;
        const group = await groupRepository.getOne({ where: { _id: id, members: req.user._id }, populate: [
            {
                path: 'members author',
                select: 'username'
            },
            {
                path: 'lastMessage',
                select: 'author content',
                populate: {
                    path: 'author',
                    select: 'username'
                }
            }
        ]});
        if (!group) {
            return next(new Error('NOT_FOUND_GROUP'));
        }
        // return res.status(200).json({
        //     message: 'Info Group',
        //     group
        // });
        return ResponseSuccess('Info Group', group, res);
    } catch (e) {
        return next(e);
    }
}
const getListGroup = async (req, res, next = function(err) {
    return Promise.reject(err);
}) => {
    try {
        let page = parseInt(req.query.page);
        let limit = parseInt(req.query.limit);
        const lastGroupId = req.query.lastGroupId;
        // const user = req.user._id;
        // where: { members: user },
        const listGroup = await groupRepository.getAll({  populate: [
            {
                path: 'members author',
                select: 'username isOnline'
            },
            {
                path: 'lastMessage',
                select: 'author content createdAt',
                populate: {
                    path: 'author',
                    select: 'username'
                }
            }     
        ], sort: {'updatedAt': 1}},page, limit);
        // if (!listGroup) {
        //     // return res.status(200).json({
        //     //     message: 'Currently, You have not joined any group',
        //     //     listGroup
        //     // });
        //     return ResponseSuccess('Currently, You have not joined any group', listGroup, res);
        // }
        // return res.status(200).json({
        //     message: 'List Group',
        //     listGroup
        // });
        // console.log(listGroup);
        // client.setex(req.link, 10, JSON.stringify(listGroup));
        //             return res.json({ source: 'api', data: listGroup});
        return ResponseSuccess('List Group', listGroup, res);
    } catch (e) {
        return next(e);
    }
}
const getListGroupOfUser = async (req, res, next = function(err) {
    return Promise.reject(err);
}) => {
    try {
        let page = parseInt(req.query.page);
        let limit = parseInt(req.query.limit);
        const lastGroupId = req.query.lastGroupId;
        const user = req.user._id;
        
        const listGroup = await groupRepository.getAll({ where: { members: user }, populate: [
            {
                path: 'members author',
                select: 'username isOnline'
            },
            {
                path: 'lastMessage',
                select: 'author content createdAt',
                populate: {
                    path: 'author',
                    select: 'username'
                }
            }     
        ], sort: {'updatedAt': 1}},page, limit);
        // if (!listGroup) {
        //     // return res.status(200).json({
        //     //     message: 'Currently, You have not joined any group',
        //     //     listGroup
        //     // });
        //     return ResponseSuccess('Currently, You have not joined any group', listGroup, res);
        // }
        // return res.status(200).json({
        //     message: 'List Group',
        //     listGroup
        // });
        console.log(listGroup);
        client.setex(req.link, 10, JSON.stringify(listGroup));
                    return res.json({ source: 'api', data: listGroup});
        // return ResponseSuccess('List Group', listGroup, res);
    } catch (e) {
        return next(e);
    }
}
const deleteGroup = async (req, res, next = function(err) {
    return Promise.reject(err);
}) => {
    try {
        const { id } = req.params;
        const loginAuthor = req.user._id;
        const existGroup = await groupRepository.getOne({ where: { _id: id, author: loginAuthor }, select: 'author'});
        if (!existGroup) {
            return next(new Error('GROUP_NOT_FOUND'));
        }
        // if (loginAuthor.toString() !== existGroup.author.toString()) {
        //     return next(new Error('CANNOT_DELETE'));
        // }
        await groupRepository.deleteOne({ where: { _id: id }});
        // return res.status(200).json({ 
        //     message: 'Delete group successfully ',
        //     deletedGroup: existGroup
        // });
        return ResponseSuccess('Delete group successfully', { deleteGroup: existGroup }, res);
    } catch (e) {
        return next(e);
    }
}
const updateGroup = async (req, res, next = function(err) {
    return Promise.reject(err);
}) => {
    try {
        const { id } = req.params;
        const data = lodash.pick(req.body, ['author', 'name', 'lastMessage', 'type']); // omit
        const author = req.user._id;
        let existGroup = await groupRepository.getOne({ where: { _id: id }, select: 'author' });
        if (!existGroup) {
            return next(new Error('GROUP_NOT_FOUND'));
        }
        if (JSON.stringify(existGroup.author)!== JSON.stringify(author)) {
            return next(new Error('CANNOT_UPDATE'));
        }
        if (author) {
            const existUser = await groupRepository.getOne({ where: { _id: id, members: author }}).lean();
            if (!existUser) {
                return next(new Error('AUTHOR_CHANGE_NOT_EXIST_IN_GROUP'));
            }
        }
        const newValues = { $set: data };
        await groupRepository.updateOne({ where: { _id: id } , data : newValues } ).lean();
        // return res.status(200).json({
        //     message: 'Update Group successfully'
        // });
        return ResponseSuccess('Update Group successfully', null, res);
    } catch (e) {
        return next(e);
    }
    
}
module.exports = {
    createGroup,
    getGroup,
    getListGroup,
    getListGroupOfUser,
    deleteGroup,
    updateGroup,
    inviteGroup,
    leaveGroup
}