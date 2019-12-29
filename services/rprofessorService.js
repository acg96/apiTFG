module.exports = {
    app: null,
    bdManagement: null,
    init: function (app, bdManagement) {
        this.app = app;
        this.bdManagement = bdManagement;
    },
    deleteSlot: function (username, slotId, callback) {
        //Check if the slot exists
        try {
            this.bdManagement.getSlot({_id: this.bdManagement.mongoPure.ObjectID(slotId)}, function (slots) {
                if (slots != null && slots.length === 1) {
                    const slot = slots[0];
                    //Check if the slot it's a future one
                    if (slot.endTime > this.app.get("currentTimeWithSeconds")().valueOf()) {
                        //Check if the slot belongs to one of the professor of the module
                        this.bdManagement.getModule({groupsIds: {$in: slot.groupIds}}, function (modules) {
                            if (modules != null && modules.length === 1) {
                                const groupsIdsObjectId = [];
                                for (let i = 0; i < modules[0].groupsIds.length; ++i) {
                                    groupsIdsObjectId.push(this.bdManagement.mongoPure.ObjectID(modules[0].groupsIds[i]));
                                }
                                this.bdManagement.getClassGroup({
                                    _id: {$in: groupsIdsObjectId},
                                    professors: username
                                }, function (groups) {
                                    if (groups != null && groups.length > 0) {
                                        //The slotId is valid
                                        this.bdManagement.deleteSlot({_id: this.bdManagement.mongoPure.ObjectID(slotId)}, numberOfDeletions => {
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
        } catch (e) {
            callback("No existe ningún slot con ese id");
        }
    },
    getSlots: function (username, callback) {
        this.getModuleGroupsByProfessor(username, function(groupsModule, modules){
            if (groupsModule != null && groupsModule.length > 0 && modules != null && modules.length > 0) {
                const groupsIds = [];
                for (let i= 0; i < modules.length; ++i){
                    groupsIds.push(...modules[i].groupsIds);
                }
                this.bdManagement.getSlot({groupIds: {$in: groupsIds}}, function (slots) {
                    if (slots != null) {
                        for (let i = 0; i < slots.length; ++i) {
                            const groupsObj = [];
                            const moduleObj = {
                                name: "",
                                id: ""
                            };
                            for (let e = 0; e < groupsModule.length; ++e) {
                                if (slots[i].groupIds.includes(groupsModule[e]._id.toString())) {
                                    const groupObj = {
                                        name: groupsModule[e].name,
                                        id: groupsModule[e]._id.toString(),
                                        studentsIncluded: []
                                    };
                                    for (let f = 0; f < groupsModule[e].students.length; ++f) {
                                        if (!slots[i].studentsExcluded.includes(groupsModule[e].students[f])) {
                                            groupObj.studentsIncluded.push(groupsModule[e].students[f]);
                                        }
                                    }
                                    groupsObj.push(groupObj);
                                    if (moduleObj.name === "") {
                                        for (let f = 0; f < modules.length; ++f) {
                                            if (modules[f].groupsIds.includes(groupsModule[e]._id.toString())) {
                                                moduleObj.name = modules[f].name;
                                                moduleObj.id = modules[f]._id.toString();
                                                break;
                                            }
                                        }
                                    }
                                }
                            }
                            slots[i]["groupsObj"] = groupsObj;
                            slots[i]["moduleObj"] = moduleObj;
                        }
                        callback(slots);
                    } else {
                        callback([]);
                    }
                }.bind(this));
            } else {
                callback([]);
            }
        }.bind(this));
    },
    getNotificationsBySlotIds: function (slotIds, callback) {
        this.bdManagement.getNotifications({slotId: {$in: slotIds}}, notifications => {
            const adaptedNotifications = [];
            for (let i = 0; i < notifications.length; ++i) {
                const adaptedNotification = {
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
    getModuleGroupsByProfessor: function(username, callback){
        this.bdManagement.getClassGroup({professors: username}, function(groups) {
            if (groups != null && groups.length > 0) {
                const groupsIdsBeingProfessor= [];
                for (let i= 0; i < groups.length; ++i){
                    groupsIdsBeingProfessor.push(groups[i]._id.toString());
                }
                this.bdManagement.getModule({groupsIds: {$in: groupsIdsBeingProfessor}}, function (modules){
                    if (modules != null && modules.length > 0) {
                        const groupsIdsObjectId = [];
                        for (let i = 0; i < modules.length; ++i) {
                            for (let e = 0; e < modules[i].groupsIds.length; ++e) {
                                groupsIdsObjectId.push(this.bdManagement.mongoPure.ObjectID(modules[i].groupsIds[e]));
                            }
                        }
                        this.bdManagement.getClassGroup({_id: {$in: groupsIdsObjectId}}, function(groupsModule){
                            if (groupsModule != null && groupsModule.length > 0) {
                                callback(groupsModule, modules);
                            } else{
                                callback([], []);
                            }
                        }.bind(this));
                    } else{
                        callback([], []);
                    }
                }.bind(this));
            } else{
                callback([], []);
            }
        }.bind(this));
    },
    getSlotModulesAndGroups: function(username, callback){
        this.getModuleGroupsByProfessor(username, function(groups, modules){
            if (groups != null && groups.length > 0) {
                if (modules != null && modules.length > 0) {
                    const adaptedModulesGroups= [];
                    for (let i= 0; i < modules.length; ++i){
                        const adaptedModuleGroup= {
                            moduleName: modules[i].name,
                            moduleId: modules[i]._id.toString(),
                            groups: []
                        };
                        for (let e= 0; e < groups.length; ++e){
                            if (modules[i].groupsIds.includes(groups[e]._id.toString())){
                                const adaptedGroup= {
                                    id: groups[e]._id.toString(),
                                    name: groups[e].name,
                                    students: groups[e].students
                                };
                                adaptedModuleGroup.groups.push(adaptedGroup);
                            }
                        }
                        adaptedModuleGroup.groups = JSON.stringify(adaptedModuleGroup.groups);
                        adaptedModulesGroups.push(adaptedModuleGroup);
                    }
                    adaptedModulesGroups.sort((a, b) => {
                        if (a.moduleName < b.moduleName){
                            return -1;
                        } else if (a.moduleName > b.moduleName){
                            return 1;
                        } else{
                            return 0;
                        }
                    });
                    callback(adaptedModulesGroups);
                } else {
                    callback([]);
                }
            } else{
                callback([]);
            }
        }.bind(this));
    },
    validateSlot: function(username, postInfo, callback){
        const slotValidator = require("../validators/slotValidator.js");
        slotValidator.validateAddSlot(this.app, postInfo, this.bdManagement, username, function (errors, processedResult) {
            if (errors != null && errors.anyError === 0) {
                const groupIdsObj = [];
                for (let i= 0; i < processedResult.groupIds.length; ++i){
                    groupIdsObj.push(this.bdManagement.mongoPure.ObjectID(processedResult.groupIds[i]));
                }
                //Analyze student collisions
                this.bdManagement.getClassGroup({_id: {$in: groupIdsObj}}, function (groups){
                    if (groups == null || groups.length === 0){
                        this.getSlotModulesAndGroups(username, adaptedGroups => {
                            errors.anyError = 1;
                            callback(adaptedGroups, errors, null, true);
                        });
                    } else {
                        const allStudentsArray = [];
                        for (let i= 0; i < groups.length; ++i){
                            allStudentsArray.push(...groups[i].students);
                        }
                        const collisions = [];
                        const studentsToAnalyze = [];
                        for (let i= 0; i < allStudentsArray.length; ++i){
                            if (!processedResult.studentsExcluded.includes(allStudentsArray[i])){
                                studentsToAnalyze.push(allStudentsArray[i]);
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
                                if (processedResult.studentsExcluded.length >= allStudentsArray.length){ //If all the students have a collision
                                    callback(null, null, studentCollisions, true);
                                } else {
                                    this.bdManagement.addSlot(processedResult, function (result) {
                                        if (result != null) {
                                            callback(null, null, studentCollisions, false);
                                        } else {
                                            this.getSlotModulesAndGroups(username, adaptedGroups => {
                                                errors.anyError = 1;
                                                callback(adaptedGroups, errors, null, true);
                                            });
                                        }
                                    }.bind(this));
                                }
                            } else {
                                this.getSlotModulesAndGroups(username, adaptedGroups => {
                                    errors.anyError = 1;
                                    callback(adaptedGroups, errors, null, true);
                                });
                            }
                        }.bind(this));
                    }
                }.bind(this));
            } else {
                this.getSlotModulesAndGroups(username, adaptedGroups => {
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
                    groupsIds.push(groups[i]._id.toString());
                }
                const criteriaSlots= {
                    groupIds: {$in: groupsIds},
                    $or: [{$and: [{startTime: {$lte: startTime}}, {endTime: {$gte: endTime}}]},
                        {$and: [{startTime: {$gte: startTime}}, {startTime: {$lt: endTime}}]},
                        {$and: [{startTime: {$lte: startTime}}, {endTime: {$lt: endTime}}, {endTime: {$gt: startTime}}]}],
                    studentsExcluded: {$nin: [students[index]]}
                };
                this.bdManagement.getSlot(criteriaSlots, function(slots){
                    if (slots != null && slots.length !== 0){
                        const slotGroupIdsArray = [];
                        for (let i = 0; i < slots.length; ++i){
                            for (let e= 0; e < slots[i].groupIds.length; ++e){
                                if (!slotGroupIdsArray.includes(slots[i].groupIds[e])){
                                    slotGroupIdsArray.push(slots[i].groupIds[e]);
                                }
                            }
                        }
                        this.bdManagement.getModule({groupsIds: {$in: slotGroupIdsArray}}, function (modules){
                            if (modules != null){
                                for (let i= 0; i < slots.length; ++i){
                                    for (let e= 0; e < modules.length; ++e){
                                        if (modules[e].groupsIds.some(element => slots[i].groupIds.includes(element))){
                                            const jsonCollision = {
                                                student: students[index],
                                                description: slots[i].description,
                                                moduleName: modules[e].name,
                                                author: slots[i].author
                                            };
                                            collisions.push(jsonCollision);
                                            break;
                                        }
                                    }
                                }
                                if (students.length - 1 === index) {
                                    callback(collisions);
                                } else {
                                    this.getCollisions(students, ++index, 0, collisions, startTime, endTime, callback);
                                }
                            } else{
                                if (errorTime === 3){
                                    callback(null);
                                } else {
                                    this.getCollisions(students, index, ++errorTime, collisions, startTime, endTime, callback);
                                }
                            }
                        }.bind(this));
                    } else {
                        if (slots != null) {
                            if (students.length - 1 === index) {
                                callback(collisions);
                            } else {
                                this.getCollisions(students, ++index, 0, collisions, startTime, endTime, callback);
                            }
                        } else{
                            if (errorTime === 3){
                                callback(null);
                            } else {
                                this.getCollisions(students, index, ++errorTime, collisions, startTime, endTime, callback);
                            }
                        }
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
            const adaptedSlots= [];
            const slotsIds = []; //Used to get the notifications
            for (let i= 0; i < slots.length; ++i){
                const tempSlot = {
                    groupsObj: slots[i].groupsObj,
                    moduleObj: slots[i].moduleObj,
                    _id: slots[i]._id.toString(),
                    slotDescription: slots[i].description
                };
                adaptedSlots.push(tempSlot);
                if (!slotsIds.includes(slots[i]._id.toString())){
                    slotsIds.push(slots[i]._id.toString());
                }
            }

            this.getNotificationsBySlotIds(slotsIds, function(notifications){
                const adaptedNotifications= [];
                for (let i = 0; i < adaptedSlots.length; ++i) {
                    for (let e = 0; e < notifications.length; ++e) {
                        if (notifications[e].slotId === adaptedSlots[i]._id){
                            for (let f= 0; f < adaptedSlots[i].groupsObj.length; ++f){
                                if (adaptedSlots[i].groupsObj[f].studentsIncluded.includes(notifications[e].idUser)){
                                    let intIps= "";
                                    for (let j= 0; j < notifications[e].intIps.length; ++j){
                                        if (j === 0){
                                            intIps+= notifications[e].intIps[j];
                                        } else{
                                            intIps+= ", " + notifications[e].intIps[j];
                                        }
                                    }
                                    const adaptedNotification= {
                                        intIps: intIps,
                                        slotId: adaptedSlots[i]._id,
                                        slotDescription: adaptedSlots[i].slotDescription.trim(),
                                        moduleName: adaptedSlots[i].moduleObj.name,
                                        groupName: adaptedSlots[i].groupsObj[f].name,
                                        actionTime: moment(notifications[e].actionTime).format("DD MMM YYYY HH:mm:ss"),
                                        actionTimeMS: notifications[e].actionTime,
                                        actionName: this.app.get('actionCodeTranslation')[notifications[e].actionCode],
                                        moreInfo: notifications[e].moreInfo,
                                        somethingWrong: notifications[e].somethingWrong,
                                        tofCache: notifications[e].tofCache ? "Activado" : "Desactivado",
                                        extIp: notifications[e].extIp === "::1" ? "localhost" : notifications[e].extIp === null ? "localhost" : notifications[e].extIp.replace("::ffff:", ""),
                                        idUser: notifications[e].idUser
                                    };
                                    adaptedNotifications.push(adaptedNotification);
                                }
                            }
                        }
                    }
                }
                adaptedSlots.sort((a, b) => {
                    if (a.slotDescription < b.slotDescription){
                        return -1;
                    } else if (a.slotDescription > b.slotDescription){
                        return 1;
                    } else{
                        return 0;
                    }
                });
                callback(adaptedSlots, adaptedNotifications);
            }.bind(this));
        }.bind(this));
    }
};
