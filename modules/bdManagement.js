module.exports = {
    app: null,
    mongoPure: null,
    init: function (app, mongo) {
        this.app = app;
        this.mongoPure = mongo;
    },
    getMongoClientObject: function(){
        return new this.mongoPure.MongoClient(this.app.get('db'), { useNewUrlParser: true, useUnifiedTopology: true });
    }
    , getUser: function (criteria, callbackFunction) {
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
    }, resetMongo: function (callbackFunction) { //TODO
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
                callbackFunction(1);
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
