module.exports = {
    app: null,
    mongoPure: null,
    init: function (app, mongo) {
        this.app = app;
        this.mongoPure = mongo;
    },
    getMongoClientObject: function(){
        return new this.mongoPure.MongoClient(this.app.get('db'), { useNewUrlParser: true, useUnifiedTopology: true });
    },
    loadAdministrators: function () {
        const admin1 = {
            username: "movilidad.eii@uniovi.es",
            password: this.app.get("crypto").createHmac('sha256', this.app.get('passKey'))
                .update("123456").digest('hex'),
            role: "administrator"
        };

        this.addUser(admin1, () => {});
    },
    renameCollection: function(collectionsInfo, timeMilliseconds, index, mongo, errTime, anyErr, callback){
        const oldName= collectionsInfo[index];
        const newName = oldName + timeMilliseconds;
        const collection= mongo.db(this.app.get('dbName')).collection(oldName);
        collection.rename(newName, err => {
            if (err){
                if (errTime < 8){
                    this.renameCollection(collectionsInfo, timeMilliseconds, index, mongo, ++errTime, anyErr, callback);
                } else{
                    if (index === collectionsInfo.length - 1){
                        callback(false);
                    } else {
                        this.renameCollection(collectionsInfo, timeMilliseconds, ++index, mongo, 0, 1, callback);
                    }
                }
            } else{
                if (index === collectionsInfo.length - 1){
                    callback(anyErr === 0);
                } else {
                    this.renameCollection(collectionsInfo, timeMilliseconds, ++index, mongo, 0, anyErr, callback);
                }
            }
        });
    },
    duplicateCollection: function(collectionsInfo, timeMilliseconds, index, mongo, errTime, anyErr, resultRenaming, callback){
        const oldName= collectionsInfo[index];
        const newName = oldName + timeMilliseconds;
        this.getValuesFromCollection({}, oldName, collectionValues => {
            if (collectionValues != null){
                this.addSomeValuesToCollection(collectionValues, newName, countOfAdditions => {
                    if (countOfAdditions == null){
                        if (errTime < 8) {
                            this.duplicateCollection(collectionsInfo, timeMilliseconds, index, mongo, ++errTime, anyErr, resultRenaming, callback);
                        } else{
                            if (index === collectionsInfo.length - 1){
                                callback(false);
                            } else {
                                this.duplicateCollection(collectionsInfo, timeMilliseconds, ++index, mongo, 0, 1, resultRenaming, callback);
                            }
                        }
                    } else{
                        if (index === collectionsInfo.length - 1){
                            callback(anyErr === 0 && resultRenaming);
                        } else{
                            this.duplicateCollection(collectionsInfo, timeMilliseconds, ++index, mongo, 0, anyErr, resultRenaming, callback);
                        }
                    }
                });
            } else{
                if (errTime < 8) {
                    this.duplicateCollection(collectionsInfo, timeMilliseconds, index, mongo, ++errTime, anyErr, resultRenaming, callback);
                } else{
                    if (index === collectionsInfo.length - 1){
                        callback(false);
                    } else {
                        this.duplicateCollection(collectionsInfo, timeMilliseconds, ++index, mongo, 0, 1, resultRenaming, callback);
                    }
                }
            }
        });
    },
    renameAllCollections: function(callback){
        const collectionNames= ["users", "groups", "notifications", "modules", "slots"];
        this.renameCertainCollections(collectionNames, resultRemaining => {
            callback(resultRemaining);
        });
    },
    getValuesFromCollection: function (criteria, collectionName, callbackFunction) {
        const mongo = this.getMongoClientObject();
        mongo.connect(function(err) {
            if (err) {
                callbackFunction(null);
            } else {
                const collection = mongo.db(this.app.get('dbName')).collection(collectionName);
                collection.find(criteria).toArray(function (err, collectionValues) {
                    if (err) {
                        callbackFunction(null);
                    } else {
                        callbackFunction(collectionValues);
                    }
                    mongo.close();
                }.bind(this));
            }
        }.bind(this));
    },
    addSomeValuesToCollection: function (collectionValues, collectionName, callbackFunction) {
        const mongo = this.getMongoClientObject();
        mongo.connect(function(err) {
            if (err) {
                callbackFunction(null);
            } else {
                const collection = mongo.db(this.app.get('dbName')).collection(collectionName);
                collection.insertMany(collectionValues, function (err, result) {
                    if (err) {
                        callbackFunction(null);
                    } else {
                        callbackFunction(result.insertedCount);
                    }
                    mongo.close();
                }.bind(this));
            }
        }.bind(this));
    },
    deleteValueFromCollection: function (criteria, collectionName, cascadeDeleteCallbackFunction, callbackFunction) {
        const mongo = this.getMongoClientObject();
        mongo.connect(function(err) {
            if (err) {
                callbackFunction(null);
            } else {
                const collection = mongo.db(this.app.get('dbName')).collection(collectionName);
                collection.deleteOne(criteria, function (err, result) {
                    if (err) {
                        callbackFunction(null);
                    } else {
                        cascadeDeleteCallbackFunction(callbackFunction, result);
                    }
                    mongo.close();
                }.bind(this));
            }
        }.bind(this));
    },
    addValueToCollection: function (collectionValue, collectionName, callbackFunction) {
        const mongo = this.getMongoClientObject();
        mongo.connect(function(err) {
            if (err) {
                callbackFunction(null);
            } else {
                const collection = mongo.db(this.app.get('dbName')).collection(collectionName);
                collection.insertOne(collectionValue, function (err, result) {
                    if (err) {
                        callbackFunction(null);
                    } else {
                        callbackFunction(result.ops[0]._id);
                    }
                    mongo.close();
                }.bind(this));
            }
        }.bind(this));
    },
    renameCertainCollections: function(collectionNames, callback){
        let mongo = this.getMongoClientObject();
        const allCollections= ["users", "groups", "notifications", "modules", "slots"];
        mongo.connect(function(err) {
            if (err){
                callback(false);
            } else{
                mongo.db(this.app.get('dbName')).listCollections().toArray((err, collectionsInfo) => {
                    if (err){
                        callback(false);
                    } else{
                        const timeMilliseconds= this.app.get('currentTimeWithSeconds')().valueOf().toString();
                        const collectionsToChange= [];
                        const collectionsToDuplicate= []; //Used to copy the collections that not change to allow backup recovery
                        for (let i= 0; i < collectionsInfo.length; ++i){
                            if (collectionNames.includes(collectionsInfo[i].name) && !collectionsToChange.includes(collectionsInfo[i].name)){
                                collectionsToChange.push(collectionsInfo[i].name);
                            } else if (!collectionNames.includes(collectionsInfo[i].name) && allCollections.includes(collectionsInfo[i].name) && !collectionsToDuplicate.includes(collectionsInfo[i].name)) {
                                collectionsToDuplicate.push(collectionsInfo[i].name);
                            }
                        }
                        if (collectionsToChange.length > 0) {
                            this.renameCollection(collectionsToChange, timeMilliseconds, 0, mongo, 0, 0, resultRenaming => {
                                if (collectionsToDuplicate.length > 0) {
                                    this.duplicateCollection(collectionsToDuplicate, timeMilliseconds, 0, mongo, 0, 0, resultRenaming, resultDuplicateProcess => {
                                        callback(resultDuplicateProcess);
                                        mongo.close();
                                    });
                                } else{
                                    callback(resultRenaming);
                                    mongo.close();
                                }
                            });
                        } else{
                            callback(true);
                        }
                    }
                });
            }
        }.bind(this));
    },
    getUser: function (criteria, callbackFunction) {
        this.getValuesFromCollection(criteria, 'users', callbackFunction);
    },
    resetMongo: function (callbackFunction) {
        const mongo = this.getMongoClientObject();
        mongo.connect(function(err) {
            if (err) {
                callbackFunction(null);
            } else {
                const collectionUsers = mongo.db(this.app.get('dbName')).collection('users');
                collectionUsers.drop().then(() => {
                }, () => {});
                const collectionSlots = mongo.db(this.app.get('dbName')).collection('slots');
                collectionSlots.drop().then(() => {
                }, () => {});
                const collectionGroups = mongo.db(this.app.get('dbName')).collection('groups');
                collectionGroups.drop().then(() => {
                }, () => {});
                const collectionModules = mongo.db(this.app.get('dbName')).collection('modules');
                collectionModules.drop().then(() => {
                }, () => {});
                const collectionNotifications = mongo.db(this.app.get('dbName')).collection('notifications');
                collectionNotifications.drop().then(() => {
                }, () => {});
                callbackFunction(true);
                mongo.close();
            }
        }.bind(this));
    },
    addUser: function (user, callbackFunction) {
        this.addValueToCollection(user, 'users', callbackFunction);
    },
    addSomeUsers: function (users, callbackFunction) {
        this.addSomeValuesToCollection(users, 'users', callbackFunction);
    },
    addSlot: function (slot, callbackFunction) {
        this.addValueToCollection(slot, 'slots', callbackFunction);
    },
    deleteSlot: function (slotCriteria, callbackFunction) {
        this.deleteValueFromCollection(slotCriteria, 'slots', (cbFunction, result) => {
            this.deleteNotifications({slotId: slotCriteria._id.toString()}, () => {
                cbFunction(result.result.n);
            });
        }, callbackFunction);
    },
    deleteNotifications: function (notificationCriteria, callbackFunction) {
        const mongo = this.getMongoClientObject();
        mongo.connect(function(err) {
            if (err) {
                callbackFunction(null);
            } else {
                const collection = mongo.db(this.app.get('dbName')).collection('notifications');
                collection.deleteMany(notificationCriteria, function (err, result) {
                    if (err) {
                        callbackFunction(null);
                    } else {
                        callbackFunction(result.result.n);
                    }
                    mongo.close();
                }.bind(this));
            }
        }.bind(this));
    },
    getSlot: function (criteria, callbackFunction) {
        this.getValuesFromCollection(criteria, 'slots', callbackFunction);
    },
    addSomeModules: function (modules, callbackFunction) {
        this.addSomeValuesToCollection(modules, 'modules', callbackFunction);
    },
    getModule: function (criteria, callbackFunction) {
        this.getValuesFromCollection(criteria, 'modules', callbackFunction);
    },
    addSomeClassGroups: function (groups, callbackFunction) {
        this.addSomeValuesToCollection(groups, 'groups', callbackFunction);
    },
    getClassGroup: function (criteria, callbackFunction) {
        this.getValuesFromCollection(criteria, 'groups', callbackFunction);
    },
    addNotifications: function (notifications, callbackFunction) {
        this.addSomeValuesToCollection(notifications, 'notifications', callbackFunction);
    },
    getNotifications: function (criteria, callbackFunction) {
        this.getValuesFromCollection(criteria, 'notifications', callbackFunction);
    }
};
