const { verify } = require('../helpers/jwt-helper.js');

exports.checkAuthentication = (req, res, next) => {
    try {
        let token = req.body.token || req.params.token || req.headers.token;
        
        let queryToken = req.query.token;     
        console.log(queryToken);
        // if (!token) {
        //     return next(new Error('AUTHENTICATION_FAILED'));
        // }
        // if (!queryToken) {
        //     const [ prefixToken, accessToken ] = token.split(' ');
        //     if (prefixToken !== 'Bearer') {
        //         return next(new Error('JWT_INVALID_FORMAT'));
        //     }
        //     token = accessToken;
        // } else {
        //     token = queryToken;
        // }
        const verifiedData = verify(queryToken);
        console.log('123132132');
        req.user = verifiedData;
        console.log(req.user);
        return next();
    } catch (e) {
        return next(e);
    }
};