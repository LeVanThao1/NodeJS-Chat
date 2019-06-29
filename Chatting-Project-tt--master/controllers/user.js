const bcrypt = require('bcrypt-nodejs')
const { userRepository, groupRepository, messageRepository } = require('../reponsitories');
const lodash = require('lodash');
const { sign } = require('../helpers/jwt-helper');
const sendMail = require('../helpers/mail-helper');
const randomstring = require('randomstring');
const axios = require('axios');
const { ResponseSuccess, ResponseError } = require('../helpers/response-helper');
const deleteUser = async (req, res, next) => {
    try {
        const { id } = req.params;
        const userDelete = await userRepository.getOne({ where: { _id: id }, select: '_id' });
        if (!userDelete) {
            return next(new Error('USER_NOT_FOUND'));
        }
        await userRepository.updateOne({ where: { _id: id }, data: {$set: { deleteAt: new Date() }} });
        await groupRepository.updateMany({ where: { members: userDelete._id }, data : { $pull: {members: userDelete._id}} });
        // return res.status(200).json({
        //     message : 'delete user successful',
        // });
        return ResponseSuccess('delete user successful', null, res);
    } catch (e) {
        return next(e);
    }
};

const login = async (req, res, next) => {
    try {
        const data = req.body;
        const salt  = bcrypt.genSaltSync('10');
        const hashPassword = bcrypt.hashSync(data.password, salt);
        // const password = hashPassword;
        const user = await userRepository.getOne({ where: { username: data.username } });
        if (!user) {
            // return next(new Error('USERNAME_NOT_EXISTED'));
            return ResponseError('USERNAME_NOT_EXISTED', res);
        }
        const isValidatePassword = bcrypt.compareSync(data.password, user.password);
        if (!isValidatePassword) {
            return next(new Error('PASSWORD_IS_INCORRECT'));
        }
        const token = sign({ _id: user._id });
        // return res.status(201).json({
        //     message: "login successfully",
        //     access_token: token
        // });
        return ResponseSuccess('login successfully', { access_token: token, userId: user._id, username: user.username }, res);
    } catch (e) {
        return next(e);
    }
};
const loginFB = async (req, res, next) => {
    try {
        const { accessToken } = req.body;
        let token;
        const responseFB = await axios.get(`https://graph.facebook.com/me?access_token=${accessToken}&fields=email,name`);
        console.log(responseFB.data);
        const { id, email, name } = responseFB.data;
        const existedUser = await userRepository.getOne({ where: { facebook: { id } }});
        if (!existedUser) {
            const newUser = await userRepository.create({ facebook:{ id }, email, username: name});
            const token = sign({ _id: newUser._id });
        } else {
            const update = await userRepository.updateOne({ where: { facebook: { id } }, data: { email, username: name }});
            const token = sign({ _id: update._id });
        }
        
        // return res.status(201).json({
        //     message: "login successfully",
        //     access_token: token
        // });
        return ResponseSuccess('login successfully', { accessToken: token }, res);
    } catch (e) {
        return next(e);
    }
};
const createUser = async (req, res, next) => {
    try {
        const data = req.body;
        const salt = bcrypt.genSaltSync(2);
        console.log(data);
        const hashPassword = bcrypt.hashSync(data.password, salt);
        data.password = hashPassword;
        const creatUser = await userRepository.create(data);
        // return res.status(200).json({
        //     message: "create user  successfully",
        //     creatUser
        // });
        return ResponseSuccess('create user  successfully', creatUser, res);
    } catch (e) {
        return next(e);
    };
}
const getListUser = async (req, res, next) => {
    try {
        let page = parseInt(req.query.page);
        let limit = parseInt(req.query.limit); 
        const users = await userRepository.getAll({ select: '-password', limit, page });
        // return res.status(200).json({
        //     message: 'List users',
        //     data: users
        // });
        return ResponseSuccess('List users', users, res);
    } catch (e) {
        return next(e);
    }
};

const getUser = async (req, res, next) => {
    try {
        const { id } = req.params;
        const user = await userRepository.getOne({ where: { _id: id }, select: '-password'});
        // const user = await User.findOne({ _id: id, deleteAt: undefined }).select('-password').lean();        
        if (!user) {
            return next(new Error('USER_NOT_FOUND'));
        }
        // return res.status(200).json({
        //     message: 'User',
        //     data: user
        // });
        return ResponseSuccess('User', user, res);
    } catch (e) {
        return next(e);
    }
};


const updateUser = async (req, res, next) => {
    try {
        const { id } = req.params;
        const data = req.body;
        const salt = bcrypt.genSaltSync(2);
        const hashPassword = bcrypt.hashSync(data.password, salt);
        data.password = hashPassword;
        lodash.omitBy(data, lodash.isNull);
        const existedUser = await userRepository.getOne({where: { _id: id }, select: '_id'});
        if (!existedUser) {
            return next(new Error('USER_NOT_FOUND'));
        }
        const updateInfo = { $set: data };
        const userUpdate = await userRepository.updateOne({ where: { _id: id }, data: updateInfo })
        // const userUpdate = await User.findOneAndUpdate({_id: id, deleteAt: undefined }, updateInfo, {
        //     new: true
        // }).lean();
        
        // return res.status(200).json({
        //     message : 'update successful',
        //     data: userUpdate,
        //     data_update: newValues
        // });
        return ResponseSuccess('update successful', { old_data: userUpdate, data_update: updateInfo }, res);
    } catch (e) {
        return next(e);
    }
};

const forgetPassword = async (req, res, next) => {
    try {
        const { email } = req.body;
        const existedEmail = await userRepository.getOne({ where: { email } });
        if (!existedEmail) {
            return next(new Error('EMAIL_OF_USER_NOT_FOUND'));
        }
        const code = randomstring.generate({
            length: 6,
            charset: 'alphanumeric',
            capitalization: 'uppercase'
        });
        await sendMail(email, code);
        await userRepository.updateOne({ where : { email }, data: { verifyCode: code, verifyCodeExpiredAt: new Date() }});
        await User.updateOne({ email }, { verifyCode: code, verifyCodeExpiredAt: new Date() });
        // return res.status(200).json({
        //     message: 'We sent you a mail'
        // });
        return ResponseSuccess('We sent you a mail', null, res);
    } catch (e) {
        return next(new Error(e));
    }
};

const resetPassword = async (req, res, next) => {
    try {
        const { email, code, newPassword } = req.body;
        const user = await userRepository.getOne({ where: { email }, select: 'verifyCode verifyCodeExpiredAt' });
        if (!user) {
            return next(new Error('EMAIL_NOT_INVALID'));
        }
        if (user.verifyCode === null) {
            return next(new Error('YOU_HAVE_NOT_REQUESTED_FORGET_PASSWORD')); 
        }
        if (code !== user.verifyCode) {
            return next(new Error('CODE_NOT_INVALID'));
        }
        if (new Date() - user.verifyCodeExpiredAt > 1000*60*5) {
            return next(new Error('CODE_EXPIRED'));       
        }
        const salt = bcrypt.genSaltSync(2);
        const hashPassword = bcrypt.hashSync(newPassword, salt);
        await userRepository.updateOne({ where: { email }, data: { password: hashPassword, verifyCode: undefined }});
        // return res.status(200).json({
        //     message : 'change password successful',
        // });
        return ResponseSuccess('change password successful', null, res);
    } catch (error) {
        return next(error);
    } 
};
module.exports = {
    deleteUser,
    createUser,
    login,
    getListUser,
    getUser,
    updateUser,
    forgetPassword,
    resetPassword,
    loginFB
};