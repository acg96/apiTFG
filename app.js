// Modules and globals
var express = require('express');
var app = express();
var loggerLib = require('log4js');
var logger = loggerLib.getLogger("apiTFG");
logger.level = 'all';
var bodyParser = require('body-parser');
var crypto = require('crypto');
var mongo = require('mongodb');
var moment = require('moment');
var jwt = require('jsonwebtoken');
app.set('jwt', jwt);
app.set('moment', moment);
var bdManagement = require("./modules/bdManagement.js");
var initBD = require("./modules/initBD.js");
bdManagement.init(app, mongo);
initBD.init(app, bdManagement, logger);
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({extended: true}));
app.set('db', 'mongodb://admin:sdi@tiendamusica-shard-00-00-s0nh9.mongodb.net:27017,tiendamusica-shard-00-01-s0nh9.mongodb.net:27017,tiendamusica-shard-00-02-s0nh9.mongodb.net:27017/tfg?ssl=true&replicaSet=tiendamusica-shard-0&authSource=admin&retryWrites=true');
app.set('port', 7991);
app.set('key', 'lfr.;LS24$-pO23(1Smn,#');
app.set('crypto', crypto);
app.set('tokenTime', 2700000);

//Services
var userApiService= require("./services/rusersapiService.js");
userApiService.init(app, bdManagement);
var rAppService= require("./services/rappService.js");
rAppService.init(app, bdManagement, initBD);
var rStudentApiService= require("./services/rstudentapiService.js");
rStudentApiService(app, bdManagement);

// router actions
var routerActions = express.Router();
routerActions.use(function(req, res, next) {
    var urlRequested = req.originalUrl;
    var info = "Access requested to " + urlRequested;
    logger.info(info);
    next();
});
app.use("/*", routerActions);

// routerUserToken
var routerUserToken = express.Router();
routerUserToken.use(function (req, res, next) { // get the token
    var token = req.get('uInfo') || req.body.uInfo || req.query.uInfo;
    if (token != null) {// verify token
        jwt.verify(token, app.get("key"), function (err, infoToken) {
            if (err || (Date.now() / 1000 - infoToken.time) > app.get('tokenTime')/1000) { //45min token expiration time
                logger.info("Token provided invalid or expired - IP address: " + req.ip);
                res.status(403); // Forbidden
                res.json({access: false, error: 'Invalid or expired token'});
            } else {
                //check role is valid
                if (infoToken.role !== "student") {
                    logger.info("Token role provided invalid - IP address: " + req.ip);
                    res.status(403); // Forbidden
                    res.json({access: false, message: 'Token role invalid'});
                }

                //check user exists
                rAppService.checkUserExists(infoToken.user, infoToken.role, result => {
                    if (result){
                        res.user = infoToken.user;
                        res.role = infoToken.role;
                        res.ips = infoToken.ips;
                        logger.info("User " + infoToken.user + " logged in with token - IP address: " + req.ip);
                        next();
                    } else{
                        logger.info("Token provided manipulated - IP address: " + req.ip);
                        res.status(403); // Forbidden
                        res.json({access: false, message: 'Token manipulated'});
                    }
                });
            }
        });
    } else {
        logger.info("Token provided invalid - IP address: " + req.ip);
        res.status(403); // Forbidden
        res.json({access: false, message: 'Token invalid'});
    }
});
app.use('/api/std/*', routerUserToken);

// routerNotificationToken
var routerNotificationToken = express.Router();
routerNotificationToken.use(function (req, res, next) { // get the token
    var token = req.get('uInfo') || req.body.uInfo || req.query.uInfo;
    if (token != null) {// verify token
        jwt.verify(token, app.get("key"), function (err, infoToken) {
            if (err) {
                logger.info("Token provided invalid or expired - IP address: " + req.ip);
                res.user = "NoTokenProvided";
                res.ips = [];
                next();
            } else {
                //check role is valid
                if (infoToken.role !== "student") {
                    logger.info("Token role provided invalid - IP address: " + req.ip);
                    res.user = "NoTokenProvided";
                    res.ips = [];
                    next();
                }

                //check user exists
                rAppService.checkUserExists(infoToken.user, infoToken.role, result => {
                    if (result){
                        res.user = infoToken.user;
                        res.role = infoToken.role;
                        res.ips = infoToken.ips;
                        logger.info("User " + infoToken.user + " logged in with token - IP address: " + req.ip);
                        next();
                    } else{
                        logger.info("Token provided manipulated - IP address: " + req.ip);
                        res.user = "NoTokenProvided";
                        res.ips = [];
                        next();
                    }
                });
            }
        });
    } else {
        res.user = "NoTokenProvided";
        res.ips = [];
        next();
    }
});
app.use('/api/notification', routerNotificationToken);

//Router which depends on roles allowing just the corresponding urls for professors
var routerRoleUserProfessor = express.Router();
routerRoleUserProfessor.use(function(req, res, next) {
    var role = res.role;
    if (role === "professor") {
        next();
    } else {
        logger.info("The user " + res.user + " has requested access to a restricted area - IP address: " + req.ip);
        res.status(403); // Forbidden
        res.json({access: false, message: 'Access forbidden'});
    }
});
app.use('/prf/*', routerRoleUserProfessor);

//Routes
require("./routes/rusersapi.js")(app, logger, userApiService);
require("./routes/rstudentapi.js")(app, rStudentApiService, logger);
require("./routes/rapp")(app, logger, bdManagement, initBD);

// When a url not exists
app.use(function(req, res) {
    logger.info("URL not found - IP: " + req.ip);
    res.status(404);
    res.json({message: 'url not found'});
});


// Error management
app.use(function (err, req, res, next) {
    logger.info("Error " + err + " - IP: " + req.ip);
    res.status(500);
    res.json({message: 'unexpected error'});
});


// Run server
app.listen(app.get('port'), function () {
    rAppService.resetBBDD(); //TODO
    logger.info("Server active on port " + app.get('port'));
});
