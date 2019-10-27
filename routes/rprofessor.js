module.exports = function (app, logger, swig, professorService) {
    app.get('/prf/slot/list', function (req, res) {
        const date= app.get('currentTimeWithSeconds')(); //Use seconds because the startTime has a delay of 10 seconds
        const moment = app.get("moment");
        professorService.getSlots(req.session.username, slots => {
            const adaptedSlots= [];
            for (let i= 0; i < slots.length; ++i){
                const stringSlot = {
                    groupName: slots[i].groupName,
                    description: slots[i].description,
                    startTime: moment(slots[i].startTime).format("DD MMM YYYY HH:mm"),
                    endTime: moment(slots[i].endTime).format("DD MMM YYYY HH:mm"),
                    listMode: slots[i].listMode === "whitelist" ? "Lista blanca" : "Lista negra",
                    author: slots[i].author,
                    urls: slots[i].urls,
                    studentsExcluded: slots[i].studentsExcluded,
                    studentsIncluded: slots[i].studentsIncluded
                };
                const tempSlot = {
                    groupName: slots[i].groupName,
                    description: slots[i].description,
                    startTime: moment(slots[i].startTime).format("DD MMM YYYY HH:mm"),
                    endTime: moment(slots[i].endTime).format("DD MMM YYYY HH:mm"),
                    listMode: slots[i].listMode === "whitelist" ? "Lista blanca" : "Lista negra",
                    author: slots[i].author,
                    _id: slots[i]._id.toString(),
                    startTimeMS: slots[i].startTime,
                    future: date.valueOf() < slots[i].endTime,
                    stringSlot: JSON.stringify(stringSlot)
                };
                adaptedSlots.push(tempSlot);
            }
            adaptedSlots.sort((a, b) => {
                if (a.startTimeMS > b.startTimeMS){
                    return -1;
                } else if (a.startTimeMS < b.startTimeMS){
                    return 1;
                } else{
                    return 0;
                }
            });
            let newSlot = 0;
            const stringCollisionsArray= [];
            const collisions= req.session.collisions;
            const noAdded= req.session.noAdded;
            const slotDeletions= req.session.slotDeletions;
            if (collisions != null && collisions.length > 0){
                for (let i= 0; i < collisions.length; ++i) {
                    const tempString = "La/El alumn@ " + collisions[i].student + " tiene ya una restricción en ese horario marcada por " + collisions[i].author + " para el grupo " + collisions[i].groupName;
                    stringCollisionsArray.push(tempString);
                }
            }
            if (req.session.collisions != null){
                newSlot = 1;
            }
            if (noAdded === true){
                newSlot = -1;
            }
            if (slotDeletions != null){
                newSlot = -2;
            }
            req.session.collisions = null;
            req.session.noAdded = null;
            req.session.slotDeletions = null;
            const response = swig.renderFile('views/slot/list.html', {username: req.session.username, slotList: adaptedSlots, newSlot: newSlot, collisions: stringCollisionsArray, slotDeletions: slotDeletions});
            res.send(response);
        });
    });

    app.get('/prf/report/list', function (req, res) {
        const moment = app.get("moment");
        professorService.getSlots(req.session.username, slots => {
            const adaptedGroups= [];
            for (let i= 0; i < slots.length; ++i){
                const tempSlot = {
                    groupName: slots[i].groupName,
                    groupId: slots[i].groupId.toString(),
                    _id: slots[i]._id.toString(),
                    slotDescription: slots[i].description,
                    studentsIncluded: JSON.stringify(slots[i].studentsIncluded)
                };
                adaptedGroups.push(tempSlot);
            }
            const slotsIds = [];
            for (let i= 0; i < adaptedGroups.length; ++i){
                if (!slotsIds.includes(adaptedGroups[i]._id)){
                    slotsIds.push(adaptedGroups[i]._id);
                }
            }
            adaptedGroups.sort((a, b) => {
                if (a < b){
                    return -1;
                } else if (a > b){
                    return 1;
                } else{
                    return 0;
                }
            });
            professorService.getNotificationsBySlotIds(slotsIds, notifications => {
                const notificationsHashMap = [];
                const usernameArray = [];
                for (let i= 0; i < notifications.length; ++i){
                    let intIps= "";
                    for (let e= 0; e < notifications[i].intIps.length; ++e){
                        if (e === 0){
                            intIps+= notifications[i].intIps[e];
                        } else{
                            intIps+= ", " + notifications[i].intIps[e];
                        }
                    }
                    let slotDescription= "";
                    for (let e= 0; e < adaptedGroups.length; ++e){
                        if (adaptedGroups[e]._id === notifications[i].slotId){
                            slotDescription = adaptedGroups[e].slotDescription;
                            break;
                        }
                    }
                    const adaptedNotification = {
                        intIps: intIps,
                        slotDescription: slotDescription,
                        actionTime: moment(notifications[i].actionTime).format("DD MMM YYYY HH:mm:ss"),
                        actionName: app.get('actionCodeTranslation')[notifications[i].actionCode],
                        moreInfo: notifications[i].moreInfo,
                        somethingWrong: notifications[i].somethingWrong,
                        tofCache: notifications[i].tofCache ? "Activado" : "Desactivado",
                        extIp: notifications[i].extIp === "::1" ? "localhost" : notifications[i].extIp
                    };
                    if (usernameArray.includes(notifications[i].idUser)){
                        notificationsHashMap[notifications[i].idUser].push(adaptedNotification);
                    } else{
                        usernameArray.push(notifications[i].idUser);
                        notificationsHashMap[notifications[i].idUser]= [];
                        notificationsHashMap[notifications[i].idUser].push(adaptedNotification);
                    }
                }
                const response = swig.renderFile('views/report/list.html', {username: req.session.username, groupList: adaptedGroups, notificationsHashMap: notificationsHashMap});
                res.send(response);
            });
        });
    });

    app.get('/prf/slot/add', function (req, res) {
        const date= app.get('currentTime')();
        const dateObject= {
            month: (date.month() + 1).toString().length === 2 ? (date.month() + 1).toString() : "0" + (date.month() + 1).toString(),
            day: date.date().toString().length === 2 ? date.date().toString() : "0" + date.date().toString(),
            year: date.year().toString(),
            hour: date.hour().toString().length === 2 ? date.hour().toString() : "0" + date.hour().toString(),
            minutes: date.minute().toString().length === 2 ? date.minute().toString() : "0" + date.minute().toString()
        };
        professorService.getSlotGroups(req.session.username, (adaptedGroups) => {
            const response = swig.renderFile('views/slot/add.html', {username: req.session.username, date: dateObject, groups: adaptedGroups});
            res.send(response);
        });
    });

    app.get("/prf/slot/del/:id", function (req, res) {
        const id= req.params.id;
        if (id != null){
            professorService.deleteSlot(req.session.username, id, result => {
                req.session.slotDeletions= result;
                res.redirect("/prf/slot/list");
            });
        } else{
            res.redirect("/prf/slot/list");
        }
    });

    app.post("/prf/slot/add", function (req, res) {
        const postInfo= req.body;
        if (postInfo.groupSelect == null){ //Used when no group was selected
            postInfo["groupSelect"]= "";
        }

        professorService.validateSlot(req.session.username, postInfo, (adaptedGroups, errors, collisions, noAdded) => {
            if (adaptedGroups == null && errors == null){
                if (!noAdded) {
                    logger.info("Slot created by user " + req.session.username + " - IP: " + req.ip);
                } else{
                    logger.info("Error when trying to create a slot. User: " + req.session.username + " - IP: " + req.ip);
                }
                req.session.collisions = collisions;
                req.session.noAdded = noAdded;
                res.redirect("/prf/slot/list");
            } else {
                const date= app.get('currentTime')();
                const dateObject= {
                    month: (date.month() + 1).toString().length === 2 ? (date.month() + 1).toString() : "0" + (date.month() + 1).toString(),
                    day: date.date().toString().length === 2 ? date.date().toString() : "0" + date.date().toString(),
                    year: date.year().toString(),
                    hour: date.hour().toString().length === 2 ? date.hour().toString() : "0" + date.hour().toString(),
                    minutes: date.minute().toString().length === 2 ? date.minute().toString() : "0" + date.minute().toString()
                };
                logger.info("Error when trying to create a slot. User: " + req.session.username + " - IP: " + req.ip);
                const response = swig.renderFile('views/slot/add.html', {username: req.session.username, date: dateObject, groups: adaptedGroups, errors: errors});
                res.send(response);
            }
        });
    });
};
