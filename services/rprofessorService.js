module.exports = {
    app: null,
    bdManagement: null,
    init: function(app, bdManagement){
        this.app= app;
        this.bdManagement= bdManagement;
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
                        callback(null, null, null, "error");
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
                                this.bdManagement.addSlot(processedResult, function (result){
                                    if (result != null){
                                        callback(null, null, studentCollisions, "success");
                                    } else {
                                        this.getSlotGroups(username, function (adaptedGroups){
                                            errors.anyError = 1;
                                            callback(adaptedGroups, errors, null, "");
                                        });
                                    }
                                }.bind(this));
                            } else {
                                this.getSlotGroups(username, function (adaptedGroups){
                                    errors.anyError = 1;
                                    callback(adaptedGroups, errors, null, "");
                                });
                            }
                        }.bind(this));
                    }
                }.bind(this));
            } else {
                this.getSlotGroups(username, function (adaptedGroups){
                    callback(adaptedGroups, errors, null, "");
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
                                groupName: slots[i].groupName
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
    }
};
