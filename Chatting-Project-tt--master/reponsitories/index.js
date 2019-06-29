const GroupRepository = require('./group-repository');
const BaseRepository = require('./base-repository');
// const UserRepository = require('./user-repository');
const Message = require('../models/messages');
const User = require('../models/user');
console.log(GroupRepository);
// console.log(UserRepository);
module.exports = {
    groupRepository: new GroupRepository(),
    messageRepository: new BaseRepository('Message'),
    userRepository: new BaseRepository('User'),
}