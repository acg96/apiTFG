module.exports = function (app, rStudentApiService, logger) {
    app.get("/api/slotsToday", function (req, res){
        rStudentApiService.getTodaySlots(slots => {
            const response = {
                respTime: app.get('currentTimeWithSeconds')().valueOf(),
                slotsToday: false
            };
            if (slots != null && slots.length > 0){
                response.slotsToday = true;
            }
            res.status(200);
            res.json(response);
        });
    });

    app.post("/api/notification", function (req, res){
        /*
        * cod. 1132 -> The extension is alive
        * cod. 1133 -> The slot starts
        * cod. 1134 -> The user logged in
        * cod. 1135 -> Extension uninstalled
        * cod. 1136 -> Extension disabled
        * cod. 1137 -> Extension installed
        * cod. 1138 -> Extension enabled
        * cod. 1139 -> Visit disallowed page
        */
        const username= res.user;
        const ipRequest= res.ipReal;
        const internalIps= res.ips;
        const jsonAction= req.body.action_;
        if (jsonAction != null && typeof jsonAction !== "undefined"){
            try{
                const arrayToStoreOnBBDD= [];
                for (let i= 0; i < jsonAction.length; ++i) {
                    const internalIpsNot = jsonAction[i].intIp;
                    const idUser = jsonAction[i].idUser == null ? "NoUserProvided" : jsonAction[i].idUser;
                    const timeOfAction = jsonAction[i].actTime;
                    const actionCode = jsonAction[i].actCode;
                    const moreInfo = jsonAction[i].moreInfo;
                    const tofCache = jsonAction[i].cacheTof;
                    const slotId = jsonAction[i].slotId == null ? "-1" : jsonAction[i].slotId; //-2 if it's an alive signal
                    const currentHour = app.get('currentTimeWithSeconds')().valueOf();
                    const correctTime = jsonAction[i].correctTime;
                    let infoCorrect = true;
                    let whyInfoNoCorrect = ""; //Used to store why the info is no correct

                    if (username !== "NoTokenProvided" && tofCache !== true && !internalIpsNot.every((value, index, array) => {
                        return internalIps.includes(value) && array.length === internalIps.length
                    })) {
                        infoCorrect = false;
                        let intIpsNotifyString = "";
                        for (let i= 0; i < internalIps.length; ++i){
                            if (i === 0) {
                                intIpsNotifyString += internalIps[i];
                            } else{
                                intIpsNotifyString += " - " + internalIps[i];
                            }
                        }
                        whyInfoNoCorrect += "\n" + "IPs internas de la acción no coinciden con las que notifican. " + intIpsNotifyString;
                    }

                    if (tofCache !== true && (currentHour - timeOfAction) > 120000 && username === idUser){ //If it's notified more than 2 minutes later since the action occurred
                        infoCorrect = false;
                        whyInfoNoCorrect += "\n" + "Posible hora de pc cambiada.";
                    }

                    if (username !== "NoTokenProvided" && username !== idUser && tofCache !== true) {
                        infoCorrect = false;
                        whyInfoNoCorrect += "\n" + "El usuario que notifica es diferente al que hace la acción. Notifica " + res.user;
                    }
                    if (!correctTime){
                        infoCorrect = false;
                        whyInfoNoCorrect += "\n" + "Se utiliza la hora del pc destino porque la información de tiempo almacenada allí no era correcta. Si el usuario ha cambiado la hora del pc puede que los datos de tiempo no sean ciertos.";
                    }
                    if (username === "NoTokenProvided") {
                        logger.info("Action notified without token. Action: " + actionCode + ". More Info: " + moreInfo + " - IP: " + res.ipReal);
                    } else {
                        logger.info("Action notified about user " +
                            res.user + ". Action: " + actionCode + ". More Info: " + moreInfo + " - IP: " + res.ipReal);
                    }

                    const toStoreOnBBDD = {
                        requestUsername: username,
                        requestExtIp: ipRequest,
                        requestIntIps: internalIps,
                        intIps: internalIpsNot,
                        slotId: slotId,
                        idUser: idUser,
                        actionTime: timeOfAction,
                        actionCode: actionCode,
                        moreInfo: moreInfo,
                        uploadTime: currentHour,
                        tofCache: tofCache,
                        infoCorrect: infoCorrect,
                        whyInfoNoCorrect: whyInfoNoCorrect.trim()
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
