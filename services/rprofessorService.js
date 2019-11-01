module.exports = {
    app: null,
    bdManagement: null,
    init: function(app, bdManagement){
        this.app= app;
        this.bdManagement= bdManagement;
    },
    deleteSlot: function(username, slotId, callback){
        //Check if the slot exists
        try {
            this.bdManagement.getSlot({_id: this.bdManagement.mongo.ObjectID(slotId)}, function (slots) {
                if (slots != null && slots.length === 1) {
                    const slot = slots[0];
                    //Check if the slot it's a future one
                    if (slot.endTime > this.app.get("currentTimeWithSeconds")().valueOf()) {
                        //Check if the slot belongs to the professor
                        this.bdManagement.getClassGroup({
                            professors: username,
                            _id: this.bdManagement.mongo.ObjectID(slot.groupId)
                        }, function (groups) {
                            if (groups != null && groups.length === 1) {
                                //The slotId is valid
                                this.bdManagement.deleteSlot({_id: this.bdManagement.mongo.ObjectID(slotId)}, numberOfDeletions => {
                                    if (numberOfDeletions != null && numberOfDeletions > 0) {
                                        callback("Se ha borrado correctamente el slot");
                                    } else {
                                        callback("Ha ocurrido un error cuando se trataba de borrar el slot");
                                    }
                                });
                            } else {
                                callback("No existe ningún slot con ese id");
                            }
                        }.bind(this));
                    } else {
                        callback("Solo se pueden eliminar slots futuros");
                    }

                } else {
                    callback("No existe ningún slot con ese id");
                }
            }.bind(this));
        }catch(e){
            callback("No existe ningún slot con ese id");
        }
    },
    getSlots: function(username, callback){
        this.bdManagement.getClassGroup({professors: username}, function(groups) {
            if (groups != null && groups.length > 0){
                const groupsIds= [];
                for (let i= 0; i < groups.length; ++i){
                    groupsIds.push(this.bdManagement.mongo.ObjectID(groups[i]._id));
                }
                this.bdManagement.getSlot({groupId: {$in: groupsIds}}, slots => {
                    if (slots != null){
                        for (let i= 0; i < slots.length; ++i){
                            for (let e= 0; e < groups.length; ++e){
                                if (groups[e]._id.toString() === slots[i].groupId.toString()){
                                    const studentsIncluded = [];
                                    for (let f= 0; f < groups[e].students.length; ++f){
                                        if (!slots[i].studentsExcluded.includes(groups[e].students[f])){
                                            studentsIncluded.push(groups[e].students[f]);
                                        }
                                    }
                                    slots[i]["studentsIncluded"] = studentsIncluded;
                                    break;
                                }
                            }
                        }
                        callback(slots);
                    } else {
                        callback([]);
                    }
                });
            } else {
                callback([]);
            }
        }.bind(this));
    },
    getNotificationsBySlotIds: function(slotIds, callback){
        this.bdManagement.getNotifications({slotId: {$in: slotIds}}, notifications => {
            const adaptedNotifications= [];
            for (let i= 0; i < notifications.length; ++i){
                const adaptedNotification= {
                    intIps: notifications[i].intIps,
                    slotId: notifications[i].slotId,
                    idUser: notifications[i].idUser,
                    actionTime: notifications[i].actionTime,
                    actionCode: notifications[i].actionCode,
                    moreInfo: notifications[i].moreInfo,
                    somethingWrong: notifications[i].whyInfoNoCorrect,
                    tofCache: notifications[i].tofCache,
                    extIp: notifications[i].requestExtIp
                };
                adaptedNotifications.push(adaptedNotification);
            }
            callback(adaptedNotifications);
        });
    },
    getSlotGroups: function(username, callback){
        this.bdManagement.getClassGroup({professors: username}, groups => {
            const adaptedGroups= [];
            if (groups != null && groups.length > 0){
                for (let i= 0; i < groups.length; ++i){
                    let stringStudents= "";
                    for (let e= 0; e < groups[i].students.length; ++e){
                        stringStudents+= groups[i].students[e] + "-;%;&&-%;-";
                    }
                    if (stringStudents !== ""){
                        stringStudents= stringStudents.substr(0, stringStudents.length - 10);
                    }
                    const adGroup= {
                        id: groups[i]._id.toString(),
                        name: groups[i].name,
                        students: stringStudents
                    };
                    adaptedGroups.push(adGroup);
                }
            }
            callback(adaptedGroups);
        });
    },
    validateSlot: function(username, postInfo, callback){
        const slotValidator = require("../validators/slotValidator.js");
        slotValidator.validateAddSlot(this.app, postInfo, this.bdManagement, username, function (errors, processedResult) {
            if (errors != null && errors.anyError === 0) {
                //Analyze student collisions
                this.bdManagement.getClassGroup({_id: this.bdManagement.mongo.ObjectID(processedResult.groupId)}, function (groups){
                    if (groups == null || groups.length !== 1){
                        this.getSlotGroups(username, function (adaptedGroups){
                            errors.anyError = 1;
                            callback(adaptedGroups, errors, null, true);
                        });
                    } else {
                        const group = groups[0];
                        const studentsToAnalyze = [];
                        const collisions = [];
                        for (let i= 0; i < group.students.length; ++i){
                            if (!processedResult.studentsExcluded.includes(group.students[i])){
                                studentsToAnalyze.push(group.students[i]);
                            }
                        }
                        this.getCollisions(studentsToAnalyze, 0, 0, collisions, processedResult.startTime, processedResult.endTime, function (studentCollisions) {
                            if (studentCollisions != null) {
                                for (let i= 0; i < studentCollisions.length; ++i){
                                    if (!processedResult.studentsExcluded.includes(studentCollisions[i].student)){
                                        processedResult.studentsExcluded.push(studentCollisions[i].student);
                                    }
                                }
                                processedResult.startTime += this.app.get('millisecondsDelayStartSlot'); //To avoid race hazards
                                if (processedResult.studentsExcluded.length >= group.students.length){ //If all the students have a collision
                                    callback(null, null, studentCollisions, true);
                                } else {
                                    this.bdManagement.addSlot(processedResult, function (result) {
                                        if (result != null) {
                                            callback(null, null, studentCollisions, false);
                                        } else {
                                            this.getSlotGroups(username, function (adaptedGroups) {
                                                errors.anyError = 1;
                                                callback(adaptedGroups, errors, null, true);
                                            });
                                        }
                                    }.bind(this));
                                }
                            } else {
                                this.getSlotGroups(username, function (adaptedGroups){
                                    errors.anyError = 1;
                                    callback(adaptedGroups, errors, null, true);
                                });
                            }
                        }.bind(this));
                    }
                }.bind(this));
            } else {
                this.getSlotGroups(username, function (adaptedGroups){
                    callback(adaptedGroups, errors, null, true);
                });
            }
        }.bind(this));
    },
    getCollisions: function(students, index, errorTime, collisions, startTime, endTime, callback){
        const criteriaGroups= {
            students: students[index]
        };
        this.bdManagement.getClassGroup(criteriaGroups, function(groups){
            if (groups != null && groups.length !== 0){
                const groupsIds= [];
                for (let i= 0; i < groups.length; ++i){
                    groupsIds.push(this.bdManagement.mongo.ObjectID(groups[i]._id));
                }
                const criteriaSlots= {
                    groupId: {$in: groupsIds},
                    $or: [{$and: [{startTime: {$lte: startTime}}, {endTime: {$gte: endTime}}]},
                        {$and: [{startTime: {$gte: startTime}}, {startTime: {$lt: endTime}}]},
                        {$and: [{startTime: {$lte: startTime}}, {endTime: {$lt: endTime}}, {endTime: {$gt: startTime}}]}],
                    studentsExcluded: {$nin: [students[index]]}
                };
                this.bdManagement.getSlot(criteriaSlots, function(slots){
                    if (slots != null && slots.length !== 0){
                        for (let i= 0; i < slots.length; ++i){
                            const jsonCollision = {
                                student: students[index],
                                description: slots[i].description,
                                groupName: slots[i].groupName,
                                author: slots[i].author
                            };
                            collisions.push(jsonCollision);
                        }
                    }
                    if (students.length - 1 === index) {
                        callback(collisions);
                    } else {
                        this.getCollisions(students, ++index, 0, collisions, startTime, endTime, callback);
                    }
                }.bind(this));
            } else{
                if (errorTime === 3){
                    callback(null);
                } else {
                    this.getCollisions(students, index, ++errorTime, collisions, startTime, endTime, callback);
                }
            }
        }.bind(this));
    },
    getReportList: function(username, callback){
        const moment = this.app.get("moment");
        this.getSlots(username, function(slots){
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

            const groupsHashMap = []; //Used to classify the slots by groupIds
            const groupIdArray = [];
            const groupsWithName = []; //Used to the html list
            for (let e= 0; e < adaptedGroups.length; ++e){
                if (groupIdArray.includes(adaptedGroups[e].groupId)){
                    groupsHashMap[adaptedGroups[e].groupId].push(adaptedGroups[e]);
                } else{
                    groupsWithName[adaptedGroups[e].groupId]= adaptedGroups[e].groupName;
                    groupIdArray.push(adaptedGroups[e].groupId);
                    groupsHashMap[adaptedGroups[e].groupId]= [];
                    groupsHashMap[adaptedGroups[e].groupId].push(adaptedGroups[e]);
                }
            }

            const slotsIds = []; //Used to get the notifications
            for (let i= 0; i < adaptedGroups.length; ++i){
                if (!slotsIds.includes(adaptedGroups[i]._id)){
                    slotsIds.push(adaptedGroups[i]._id);
                }
            }
            this.getNotificationsBySlotIds(slotsIds, function(notifications){
                const finalHashmap = {}; //HashMap with group ids as keys and some HashMaps inside with the students name as keys which contains the notifications classified
                notifications.sort((a, b) => {
                    if (a.idUser > b.idUser) {
                        return 1;
                    } else if (a.idUser < b.idUser) {
                        return -1;
                    } else {
                        return 0;
                    }
                });
                for (let k= 0; k < groupIdArray.length; ++k){
                    const notificationsHashMap = {};
                    const usernameArray = [];
                    for (let i= 0; i < notifications.length; ++i) {
                        for (let f= 0; f < groupsHashMap[groupIdArray[k]].length; ++f) {
                            if (notifications[i].slotId === groupsHashMap[groupIdArray[k]][f]._id) {
                                const includedStudents = JSON.parse(groupsHashMap[groupIdArray[k]][f].studentsIncluded);
                                for (let e= 0; e < includedStudents.length; ++e) {
                                    if (notifications[i].idUser === includedStudents[e]){
                                        let intIps= "";
                                        for (let e= 0; e < notifications[i].intIps.length; ++e){
                                            if (e === 0){
                                                intIps+= notifications[i].intIps[e];
                                            } else{
                                                intIps+= ", " + notifications[i].intIps[e];
                                            }
                                        }
                                        let slotDescription= groupsHashMap[groupIdArray[k]][f].slotDescription.trim();
                                        const adaptedNotification = {
                                            intIps: intIps,
                                            slotDescription: slotDescription,
                                            actionTime: moment(notifications[i].actionTime).format("DD MMM YYYY HH:mm:ss"),
                                            actionTimeMS: notifications[i].actionTime,
                                            actionName: this.app.get('actionCodeTranslation')[notifications[i].actionCode],
                                            moreInfo: notifications[i].moreInfo,
                                            somethingWrong: notifications[i].somethingWrong,
                                            tofCache: notifications[i].tofCache ? "Activado" : "Desactivado",
                                            extIp: notifications[i].extIp === "::1" ? "localhost" : notifications[i].extIp,
                                            idUser: notifications[i].idUser
                                        };

                                        if (usernameArray.includes(notifications[i].idUser)){
                                            notificationsHashMap[notifications[i].idUser].push(adaptedNotification);
                                        } else{
                                            usernameArray.push(notifications[i].idUser);
                                            notificationsHashMap[notifications[i].idUser]= [];
                                            notificationsHashMap[notifications[i].idUser].push(adaptedNotification);
                                        }
                                        break;
                                    }
                                }
                                break;
                            }
                        }
                    }
                    finalHashmap[groupIdArray[k]]= notificationsHashMap;
                }
                callback(groupsWithName, groupIdArray, finalHashmap);
            }.bind(this));
        }.bind(this));
    }
};
