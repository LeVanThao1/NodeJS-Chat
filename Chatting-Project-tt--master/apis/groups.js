const controllerGroup = require('../controllers/groups');
const groupValidation = require('../validations/groups');
const validate = require('express-validation');
const { checkAuthentication } = require('../middlewares/authentication.js');
const redis = require('../middlewares/caching-middleware');
const RedisCache = require('express-redis-cache');

const cache = RedisCache({ host: '127.0.0.1', port: '6379'});

exports.load = (app) => {
    app.post('/api/v1/groups', [checkAuthentication, validate(groupValidation.createGroup())], controllerGroup.createGroup);
    app.get('/api/v1/groups/:id', [checkAuthentication, validate(groupValidation.getGroup())], controllerGroup.getGroup);
    app.get('/groups', redis.rediscache, controllerGroup.getListGroup);
    app.get('/api/v1/groups',checkAuthentication, controllerGroup.getListGroupOfUser);
    app.delete('/api/v1/groups/:id', [checkAuthentication, validate(groupValidation.deleteGroup())], controllerGroup.deleteGroup);
    app.put('/api/v1/groups/:id', [checkAuthentication, validate(groupValidation.updateGroup())], controllerGroup.updateGroup);
    app.put('/api/v1/groups/:id/invite', checkAuthentication, controllerGroup.inviteGroup);
    app.put('/api/v1/groups/:id/leave', checkAuthentication, controllerGroup.leaveGroup);
}
