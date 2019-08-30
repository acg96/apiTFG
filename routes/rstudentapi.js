module.exports = function (app, bdManagement, logger) {
    app.get("/api/std/checkAccess", function (req, res) {
        var username= res.user;
        var urlEncoded= req.query.url_;
        var urlDecoded= decodeURIComponent(urlEncoded);
        //Check username and urlDecoded TODO
        var response= {result: false};
		var arrayValid= ["UO111111", "MARGA", "BELEN", "ALEX"];
        if (arrayValid.includes(username)) {
            if (username === "MARGA"){
                if (urlDecoded.includes("yahoo.com") === false){
                    response.result= true;
                }
            } else {
                response.result= true;
            }
        }
        if (response.result) {
            logger.info("Access granted to user " + res.user + ". URL: " + urlDecoded + " - IP: " + req.ip);
            res.status(200);
            res.json({access: true, message: 'Access granted', privileges: true});
        } else {
            var toStoreOnBBDD= {username: username,
                                actionCode: "1139",
                                urlDecoded: urlDecoded,
                                date: date.getTime(),
                                ip: req.ip
                                };
            //Store on bbdd TODO
            logger.info("Access denied to user " + res.user + ". URL: " + urlDecoded + " - IP: " + req.ip);
            res.status(403);
            res.json({access: true, message: 'Access denied', privileges: false});
        }
    });

    app.get("/api/std/notifyAction", function (req, res) {
        var username= res.user;
        var action= req.query.action_;
        var date= new Date();
        //Check username, action code TODO
        /*
        * cod. 1135 -> Extension uninstalled
        * cod. 1136 -> Extension disabled
        * cod. 1137 -> Extension installed
        * cod. 1138 -> Extension enabled
        * cod. 1139 -> Visit disallowed page
        * */
        var toStoreOnBBDD= {username: username,
                            actionCode: action,
                            date: date.getTime(),
                            ip: req.ip};
        //Store on bbdd TODO
        logger.info("Action notified about user " + res.user + ". Action: " + action + " - IP: " + req.ip);
        res.status(200);
        res.json({access: true, message: 'Notification successfully'});
    });
};
