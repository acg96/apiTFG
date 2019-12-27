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
        const mongo = this.getMongoClientObject();
        mongo.connect(function(err) {
            if (err) {
                callbackFunction(null);
            } else {
                const collection = mongo.db(this.app.get('dbName')).collection('users');
                collection.find(criteria).toArray(function (err, users) {
                    if (err) {
                        callbackFunction(null);
                    } else {
                        callbackFunction(users);
                    }
                    mongo.close();
                }.bind(this));
            }
        }.bind(this));
    }, resetMongo: function (callbackFunction) {
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
    }, addUser: function (user, callbackFunction) {
        const mongo = this.getMongoClientObject();
        mongo.connect(function(err) {
            if (err) {
                callbackFunction(null);
            } else {
                const collection = mongo.db(this.app.get('dbName')).collection('users');
                collection.insertOne(user, function (err, result) {
                    if (err) {
                        callbackFunction(null);
                    } else {
                        callbackFunction(result.ops[0]._id);
                    }
                    mongo.close();
                }.bind(this));
            }
        }.bind(this));
    }, addSomeUsers: function (users, callbackFunction) {
        const mongo = this.getMongoClientObject();
        mongo.connect(function(err) {
            if (err) {
                callbackFunction(null);
            } else {
                const collection = mongo.db(this.app.get('dbName')).collection('users');
                collection.insertMany(users, function (err, result) {
                    if (err) {
                        callbackFunction(null);
                    } else {
                        callbackFunction(result.insertedCount);
                    }
                    mongo.close();
                }.bind(this));
            }
        }.bind(this));
    }, addSlot: function (slot, callbackFunction) {
        const mongo = this.getMongoClientObject();
        mongo.connect(function(err) {
            if (err) {
                callbackFunction(null);
            } else {
                const collection = mongo.db(this.app.get('dbName')).collection('slots');
                collection.insertOne(slot, function (err, result) {
                    if (err) {
                        callbackFunction(null);
                    } else {
                        callbackFunction(result.ops[0]._id);
                    }
                    mongo.close();
                }.bind(this));
            }
        }.bind(this));
    }, deleteSlot: function (slotCriteria, callbackFunction) {
        const mongo = this.getMongoClientObject();
        mongo.connect(function(err) {
            if (err) {
                callbackFunction(null);
            } else {
                const collection = mongo.db(this.app.get('dbName')).collection('slots');
                collection.deleteOne(slotCriteria, function (err, result) {
                    if (err) {
                        callbackFunction(null);
                    } else {
                        this.deleteNotifications({slotId: slotCriteria._id.toString()}, () => {
                            callbackFunction(result.result.n);
                        });
                    }
                    mongo.close();
                }.bind(this));
            }
        }.bind(this));
    }, deleteNotifications: function (notificationCriteria, callbackFunction) {
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
    }, getSlot: function (criteria, callbackFunction) {
        const mongo = this.getMongoClientObject();
        mongo.connect(function(err) {
            if (err) {
                callbackFunction(null);
            } else {
                const collection = mongo.db(this.app.get('dbName')).collection('slots');
                collection.find(criteria).toArray(function (err, slots) {
                    if (err) {
                        callbackFunction(null);
                    } else {
                        callbackFunction(slots);
                    }
                    mongo.close();
                }.bind(this));
            }
        }.bind(this));
    }, addModule: function (module, callbackFunction) {
        const mongo = this.getMongoClientObject();
        mongo.connect(function(err) {
            if (err) {
                callbackFunction(null);
            } else {
                const collection = mongo.db(this.app.get('dbName')).collection('modules');
                collection.insertOne(module, function (err, result) {
                    if (err) {
                        callbackFunction(null);
                    } else {
                        callbackFunction(result.ops[0]._id);
                    }
                    mongo.close();
                }.bind(this));
            }
        }.bind(this));
    }, addSomeModules: function (modules, callbackFunction) {
        const mongo = this.getMongoClientObject();
        mongo.connect(function(err) {
            if (err) {
                callbackFunction(null);
            } else {
                const collection = mongo.db(this.app.get('dbName')).collection('modules');
                collection.insertMany(modules, function (err, result) {
                    if (err) {
                        callbackFunction(null);
                    } else {
                        callbackFunction(result.insertedCount);
                    }
                    mongo.close();
                }.bind(this));
            }
        }.bind(this));
    }, getModule: function (criteria, callbackFunction) {
        const mongo = this.getMongoClientObject();
        mongo.connect(function(err) {
            if (err) {
                callbackFunction(null);
            } else {
                const collection = mongo.db(this.app.get('dbName')).collection('modules');
                collection.find(criteria).toArray(function (err, modules) {
                    if (err) {
                        callbackFunction(null);
                    } else {
                        callbackFunction(modules);
                    }
                    mongo.close();
                }.bind(this));
            }
        }.bind(this));
    }, addClassGroup: function (group, callbackFunction) {
        const mongo = this.getMongoClientObject();
        mongo.connect(function(err) {
            if (err) {
                callbackFunction(null);
            } else {
                const collection = mongo.db(this.app.get('dbName')).collection('groups');
                collection.insertOne(group, function (err, result) {
                    if (err) {
                        callbackFunction(null);
                    } else {
                        callbackFunction(result.ops[0]._id);
                    }
                    mongo.close();
                }.bind(this));
            }
        }.bind(this));
    }, addSomeClassGroups: function (groups, callbackFunction) {
        const mongo = this.getMongoClientObject();
        mongo.connect(function(err) {
            if (err) {
                callbackFunction(null);
            } else {
                const collection = mongo.db(this.app.get('dbName')).collection('groups');
                collection.insertMany(groups, function (err, result) {
                    if (err) {
                        callbackFunction(null);
                    } else {
                        callbackFunction(result.insertedCount);
                    }
                    mongo.close();
                }.bind(this));
            }
        }.bind(this));
    }, getClassGroup: function (criteria, callbackFunction) {
        const mongo = this.getMongoClientObject();
        mongo.connect(function(err) {
            if (err) {
                callbackFunction(null);
            } else {
                const collection = mongo.db(this.app.get('dbName')).collection('groups');
                collection.find(criteria).toArray(function (err, groups) {
                    if (err) {
                        callbackFunction(null);
                    } else {
                        callbackFunction(groups);
                    }
                    mongo.close();
                }.bind(this));
            }
        }.bind(this));
    }, addNotifications: function (notifications, callbackFunction) {
        const mongo = this.getMongoClientObject();
        mongo.connect(function(err) {
            if (err) {
                callbackFunction(null);
            } else {
                const collection = mongo.db(this.app.get('dbName')).collection('notifications');
                collection.insertMany(notifications, function (err, result) {
                    if (err) {
                        callbackFunction(null);
                    } else {
                        callbackFunction(result.insertedIds);
                    }
                    mongo.close();
                }.bind(this));
            }
        }.bind(this));
    }, getNotifications: function (criteria, callbackFunction) {
        const mongo = this.getMongoClientObject();
        mongo.connect(function(err) {
            if (err) {
                callbackFunction(null);
            } else {
                const collection = mongo.db(this.app.get('dbName')).collection('notifications');
                collection.find(criteria).toArray(function (err, notifications) {
                    if (err) {
                        callbackFunction(null);
                    } else {
                        callbackFunction(notifications);
                    }
                    mongo.close();
                }.bind(this));
            }
        }.bind(this));
    }
};
