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
            if (err || (Date.now() / 1000 - infoToken.time) > 2700) { //45min token expiration time
                logger.info("Token provided invalid or expired - IP address: " + req.ip);
                res.status(403); // Forbidden
                res.json({access: false, error: 'Invalid or expired token'});
            } else {
                res.user = infoToken.user;
                res.role = infoToken.role;
                logger.info("User " + infoToken.user + " logged in with token - IP address: " + req.ip);
                //check user exists TODO
                //check role is valid
                if (infoToken.role !== "student" && infoToken.role !== "professor") {
                    logger.info("Token role provided invalid - IP address: " + req.ip);
                    res.status(403); // Forbidden
                    res.json({access: false, message: 'Token role invalid'});
                } else {
                    next();
                }
            }
        });
    } else {
        logger.info("Token provided invalid - IP address: " + req.ip);
        res.status(403); // Forbidden
        res.json({access: false, message: 'Token invalid'});
    }
});
app.use('/api/*', routerUserToken);

//Router which depends on roles allowing just the corresponding urls for students
var routerRoleUserStudent = express.Router();
routerRoleUserStudent.use(function(req, res, next) {
    var role = res.role;
    if (role === "student") {
        next();
    } else {
        logger.info("The user " + res.user + " has requested access to a restricted area - IP address: " + req.ip);
        res.status(403); // Forbidden
        res.json({access: false, message: 'Access forbidden'});
    }
});
app.use('/api/std/*', routerRoleUserStudent);

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
app.use('/api/prf/*', routerRoleUserProfessor);

//Routes
require("./routes/rusers.js")(app, bdManagement, logger);
require("./routes/rstudentapi.js")(app, bdManagement, logger);
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
    bdManagement.resetMongo(function (result){ //Temporal TODO
        if (result != null) {
            initBD.generateData();
        }
    });
    logger.info("Server active on port " + app.get('port'));
});
