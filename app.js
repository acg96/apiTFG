// Modules and globals
const express = require('express');
const app = express();
const loggerLib = require('log4js');
const logger = loggerLib.getLogger("apiTFG");
logger.level = 'all';
const bodyParser = require('body-parser');
app.set('tokenTime', 2700000); //Used to force the session or token expires at 45min after the beginning

//***Start administration web****
const swig = require('swig');
const expressSession = require('express-session');
//when https will be activated set property secure: true TODO
app.use(expressSession({
    secret: 'lp#2S-9)8e.$u(PL#7.-.$O)y23$-.8Nmp9$-,Po#U2;K)Sn.',
    resave: false,
    saveUninitialized: false,
    cookie: {
        httpOnly: false,
        maxAge: app.get('tokenTime'),
        secure: false
    }
}));
app.use(express.static('public'));
//****End administration web****

const crypto = require('crypto');
const mongo = require('mongodb');
const moment = require('moment');
const jwt = require('jsonwebtoken');
app.set('jwt', jwt);
app.set('moment', moment);
const bdManagement = require("./modules/bdManagement.js");
const initBD = require("./modules/initBD.js");
bdManagement.init(app, mongo);
initBD.init(app, bdManagement, logger);
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({extended: true}));
app.set('db', 'mongodb://admin:sdi@tiendamusica-shard-00-00-s0nh9.mongodb.net:27017,tiendamusica-shard-00-01-s0nh9.mongodb.net:27017,tiendamusica-shard-00-02-s0nh9.mongodb.net:27017/tfg?ssl=true&replicaSet=tiendamusica-shard-0&authSource=admin&retryWrites=true');
app.set('port', 7991);

//Beginning of token key
app.set('basedTokenKey', 'lfr.;LS24$-pO23(1Smn,#');
app.set('tokenKey', function(){
    const currentDate= new Date(); //Used to change daily the secret of the token
    currentDate.setHours(2, 0, 0, 0); //To balance the UTC offset is necessary the 2
    return app.get('basedTokenKey') + currentDate.getTime();
});
//End of token key

app.set('passKey', 'lfr.;LS24$-pO23(1Smn,#');
app.set('crypto', crypto);

//Services
const userApiService= require("./services/rusersapiService.js");
userApiService.init(app, bdManagement);
const rAppService= require("./services/rappService.js");
rAppService.init(app, bdManagement, initBD);
const rStudentApiService= require("./services/rstudentapiService.js");
rStudentApiService.init(app, bdManagement);
const rUserService= require("./services/ruserService.js");
rUserService.init(app, bdManagement);

// router actions
const routerActions = express.Router();
routerActions.use(function(req, res, next) {
    const urlRequested = req.originalUrl;
    const info = "Access requested to " + urlRequested;
    logger.info(info);
    next();
});
app.use("/*", routerActions);

// routerUserToken
const routerUserToken = express.Router();
routerUserToken.use(function (req, res, next) { // get the token
    const token = req.get('uInfo') || req.body.uInfo || req.query.uInfo;
    if (token != null) {// verify token
        jwt.verify(token, app.get("tokenKey")(), function (err, infoToken) {
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
const routerNotificationToken = express.Router();
routerNotificationToken.use(function (req, res, next) { // get the token
    const token = req.get('uInfo') || req.body.uInfo || req.query.uInfo;
    if (token != null) {// verify token
        jwt.verify(token, app.get("tokenKey")(), function (err, infoToken) {
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

//Router which depends on roles managing the administration web
const routerRoleUserProfessor = express.Router();
routerRoleUserProfessor.use(function(req, res, next) {
    const user= req.session.username;
    const role= req.session.role;
    if (user == null || role == null || typeof user !== "string" || typeof role !== "string"){
        next();
    } else{
        if (role === "professor" && user.trim() !== "") {
            next();
        } else {
            logger.info("The user " + user + " has requested access with a corrupted session - IP address: " + req.ip);
            req.session.username= null;
            req.session.role= null;
            res.redirect("/");
        }
    }
});
app.use('/*', routerRoleUserProfessor);

//Router which depends on roles managing when the user is not logged in
const routerWebAdminNotLoggedIn = express.Router();
routerWebAdminNotLoggedIn.use(function(req, res, next) {
    const user= req.session.username;
    const role= req.session.role;
    if (user == null || role == null || typeof user !== "string" || typeof role !== "string"){
        next();
    } else{
        logger.info("The user " + user + " being logged in has requested access to login page - IP address: " + req.ip);
        res.redirect("/");
    }
});
app.use('/login', routerWebAdminNotLoggedIn);

//Router controlling the access to restricted areas of the administration web
const routerWebAdminBeingLoggedIn = express.Router();
routerWebAdminBeingLoggedIn.use(function(req, res, next) {
    const user= req.session.username;
    const role= req.session.role;
    if (user == null || role == null || typeof user !== "string" || typeof role !== "string"){
        logger.info("A user not being logged in has requested access to restricted areas - IP address: " + req.ip);
        res.redirect("/login");
    } else{
        next();
    }
});
app.use('/prf/*', routerWebAdminBeingLoggedIn);
app.use('/logout', routerWebAdminBeingLoggedIn);

//Routes
require("./routes/rusersapi.js")(app, logger, userApiService);
require("./routes/rstudentapi.js")(app, rStudentApiService, logger);
require("./routes/rapp.js")(app, logger, bdManagement, initBD, swig);
require("./routes/ruser.js")(app, logger, rUserService, swig);
require("./routes/rprofessor.js")(app, logger, bdManagement, swig);

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
