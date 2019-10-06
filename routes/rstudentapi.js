module.exports = function (app, rStudentApiService, logger) {
    app.post("/api/notification", function (req, res) {
        /*
        * cod. 1135 -> Extension uninstalled
        * cod. 1136 -> Extension disabled
        * cod. 1137 -> Extension installed
        * cod. 1138 -> Extension enabled
        * cod. 1139 -> Visit disallowed page
        * cod. 1140 -> Own extension uninstalled
        * cod. 1141 -> Own extension disabled
        * cod. 1142 -> Pivot extension disabled
        * cod. 1143 -> Pivot extension uninstalled
        */
        var username= res.user;
        var ipRequest= req.ip;
        var internalIps= res.ips;
        var jsonAction= req.body.action_;
        if (jsonAction != null && typeof jsonAction !== "undefined"){
            try{
                var arrayToStoreOnBBDD= [];
                for (var i= 0; i < jsonAction.length; ++i) {
                    var internalIpsNot = jsonAction[i].intIp;
                    var idUser = jsonAction[i].idUser;
                    var timeOfAction = jsonAction[i].actTime;
                    var actionCode = jsonAction[i].actCode;
                    var moreInfo = jsonAction[i].moreInfo;
                    var tofCache = jsonAction[i].cacheTof;
                    var currentHour = Date.now();
                    var infoCorrect = true;

                    if (username !== "NoTokenProvided" && tofCache !== true && !internalIpsNot.every((value, index, array) => {
                        return internalIps.includes(value) && array.length === internalIps.length
                    })) {
                        infoCorrect = false;
                        logger.info("Action notified about user " + res.user + " with incorrect ips. Action: " + actionCode + ". More Info: " + moreInfo + " - IP: " + req.ip);
                    } else if (username !== "NoTokenProvided" && username !== idUser && tofCache !== true) {
                        infoCorrect = false;
                        logger.info("Action notified about user " + idUser + " with user token " +
                            res.user + ". Action: " + actionCode + ". More Info: " + moreInfo + " - IP: " + req.ip);
                    } else if (username === "NoTokenProvided") {
                        logger.info("Action notified without token. Action: " + actionCode + ". More Info: " + moreInfo + " - IP: " + req.ip);
                    } else {
                        logger.info("Action notified about user " +
                            res.user + ". Action: " + actionCode + ". More Info: " + moreInfo + " - IP: " + req.ip);
                    }

                    var toStoreOnBBDD = {
                        requestUsername: username,
                        requestExtIp: ipRequest,
                        requestIntIps: internalIps,
                        intIps: internalIpsNot,
                        idUser: idUser,
                        actionTime: timeOfAction,
                        actionCode: actionCode,
                        moreInfo: moreInfo,
                        uploadTime: currentHour,
                        tofCache: tofCache,
                        infoCorrect: infoCorrect
                    };
                    arrayToStoreOnBBDD.push(toStoreOnBBDD);
                }
                rStudentApiService.storeNotifications(arrayToStoreOnBBDD, (result) => {
                    if (result != null) {
                        res.status(200);
                        res.json({
                            access: true,
                            message: 'Notifications successfully'
                        });
                    } else{
                        res.status(500);
                        res.json({access: true, message: "A problem occurred while trying to store the data"});
                    }
                });
            }catch(error){
                res.status(400);
                res.json({access: true, message: "The client need to provide a correct param"});
            }
        } else{
            res.status(400);
            res.json({access: true, message: "The client need to provide actions to be stored"});
        }
    });
};
