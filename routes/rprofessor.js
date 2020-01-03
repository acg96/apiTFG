module.exports = function (app, logger, professorService) {
    app.get('/prf/slot/list', function (req, res) {
        const date= app.get('currentTimeWithSeconds')(); //Use seconds because the startTime has a delay of 10 seconds
        const moment = app.get("moment");
        professorService.getSlots(req.session.username, slots => {
            const adaptedSlots= [];
            for (let i= 0; i < slots.length; ++i){
                const studentsIncluded= [];
                let groupNames= "";
                for (let e= 0; e < slots[i].groupsObj.length; ++e){
                    if (groupNames === ""){
                        groupNames += slots[i].groupsObj[e].name;
                    } else{
                        groupNames += ',' + slots[i].groupsObj[e].name;
                    }
                    for (let j= 0; j < slots[i].groupsObj[e].studentsIncluded.length; ++j){
                        if (!studentsIncluded.includes(slots[i].groupsObj[e].studentsIncluded[j])){
                            studentsIncluded.push(slots[i].groupsObj[e].studentsIncluded[j]);
                        }
                    }
                }
                const stringSlot = {
                    groupNames: groupNames,
                    moduleName: slots[i].moduleObj.name,
                    description: slots[i].description,
                    startTime: moment(slots[i].startTime).format("DD MMM YYYY HH:mm"),
                    endTime: moment(slots[i].endTime).format("DD MMM YYYY HH:mm"),
                    listMode: slots[i].listMode === "whitelist" ? "Lista blanca" : "Lista negra",
                    author: slots[i].author,
                    urls: slots[i].urls,
                    studentsExcluded: slots[i].studentsExcluded,
                    studentsIncluded: studentsIncluded
                };
                const tempSlot = {
                    moduleName: slots[i].moduleObj.name,
                    description: slots[i].description,
                    startTime: moment(slots[i].startTime).format("DD MMM YYYY HH:mm"),
                    endTime: moment(slots[i].endTime).format("DD MMM YYYY HH:mm"),
                    listMode: slots[i].listMode === "whitelist" ? "Lista blanca" : "Lista negra",
                    author: slots[i].author,
                    _id: slots[i]._id.toString(),
                    startTimeMS: slots[i].startTime,
                    endTimeMS: slots[i].endTime,
                    future: date.valueOf() < slots[i].endTime,
                    stringSlot: JSON.stringify(stringSlot)
                };
                adaptedSlots.push(tempSlot);
            }
            let newSlot = 0;
            const stringCollisionsArray= [];
            const collisions= req.session.collisions;
            const noAdded= req.session.noAdded;
            const slotDeletions= req.session.slotDeletions;
            if (collisions != null && collisions.length > 0){
                for (let i= 0; i < collisions.length; ++i) {
                    const tempString = "La/El alumn@ " + collisions[i].student + " tiene ya una restricción en ese horario marcada por " + collisions[i].author + " para la asignatura " + collisions[i].moduleName;
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
            const slotModified = req.session.slotModified;
            if (req.session.slotModified != null){
                req.session.slotModified = null;
                newSlot = -3;
            }
            req.session.collisions = null;
            req.session.noAdded = null;
            req.session.slotDeletions = null;
            res.render('slot/list.html', {username: req.session.username, role: req.session.role, slotList: adaptedSlots, newSlot: newSlot, collisions: stringCollisionsArray, slotDeletions: slotDeletions, slotModified: slotModified});
        });
    });

    app.get('/prf/report/list', function (req, res) {
        professorService.getReportList(req.session.username, (slotsList, notificationList) => {
            res.render('report/list.html', {username: req.session.username, role: req.session.role, slotsList: slotsList, notificationsList: JSON.stringify(notificationList)});
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
        professorService.getSlotModulesAndGroups(req.session.username, (adaptedGroups) => {
            res.render('slot/add.html', {username: req.session.username, role: req.session.role, date: dateObject, groups: adaptedGroups});
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

    app.get("/prf/slot/edit/:id", function (req, res) {
        const id= req.params.id;
        if (id != null){
            professorService.getSpecifiedSlot(req.session.username, id, (objResult, strResult) => {
                if (objResult == null){
                    req.session.slotDeletions= strResult;
                    res.redirect("/prf/slot/list");
                } else{
                    const date= app.get('currentTime')();
                    const dateObject= {
                        month: (date.month() + 1).toString().length === 2 ? (date.month() + 1).toString() : "0" + (date.month() + 1).toString(),
                        day: date.date().toString().length === 2 ? date.date().toString() : "0" + date.date().toString(),
                        year: date.year().toString(),
                        hour: date.hour().toString().length === 2 ? date.hour().toString() : "0" + date.hour().toString(),
                        minutes: date.minute().toString().length === 2 ? date.minute().toString() : "0" + date.minute().toString()
                    };
                    if (req.session.modifySlotErrors != null){
                        const errors = req.session.modifySlotErrors;
                        req.session.modifySlotErrors = null;
                        res.render('slot/modify.html', {username: req.session.username, role: req.session.role, date: dateObject, obj: objResult, errors: errors});
                    } else{
                        res.render('slot/modify.html', {username: req.session.username, role: req.session.role, date: dateObject, obj: objResult});
                    }
                }
            });
        } else{
            res.redirect("/prf/slot/list");
        }
    });

    app.post("/prf/slot/edit", function (req, res) {
        const postInfo= req.body;
        if (postInfo.moduleSelect == null){ //Used when no module is sent
            postInfo["moduleSelect"]= "";
        }
        professorService.validateSlotModification(req.session.username, postInfo, (errors, collisions, noAdded) => {
            if (errors == null){
                if (!noAdded) {
                    logger.info("Slot with id " + postInfo.slotId + " modified by user " + req.session.username + " - IP: " + res.ipReal);
                } else{
                    logger.info("Error when trying to modify the slot with id " + postInfo.slotId + ". User: " + req.session.username + " - IP: " + res.ipReal);
                }
                req.session.collisions = collisions;
                req.session.noAdded = noAdded;
                req.session.slotModified = !noAdded ? "El slot se ha modificado correctamente" : "El slot no se ha modificado porque todos los alumnos tienen ya una restricción marcada en ese periodo";
                res.redirect("/prf/slot/list");
            } else {
                req.session.modifySlotErrors = errors;
                logger.info("Error when trying to modify the slot with id " + postInfo.slotId + ". User: " + req.session.username + " - IP: " + res.ipReal);
                res.redirect("/prf/slot/edit/" + postInfo.slotId);
            }
        });
    });

    app.post("/prf/slot/add", function (req, res) {
        const postInfo= req.body;
        if (postInfo.moduleSelect == null){ //Used when no module was selected
            postInfo["moduleSelect"]= "";
        }

        professorService.validateSlot(req.session.username, postInfo, (adaptedGroups, errors, collisions, noAdded) => {
            if (adaptedGroups == null && errors == null){
                if (!noAdded) {
                    logger.info("Slot created by user " + req.session.username + " - IP: " + res.ipReal);
                } else{
                    logger.info("Error when trying to create a slot. User: " + req.session.username + " - IP: " + res.ipReal);
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
                logger.info("Error when trying to create a slot. User: " + req.session.username + " - IP: " + res.ipReal);
                res.render('slot/add.html', {username: req.session.username, role: req.session.role, date: dateObject, groups: adaptedGroups, errors: errors});
            }
        });
    });
};
