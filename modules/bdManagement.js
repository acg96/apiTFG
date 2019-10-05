module.exports = {
    mongo: null,
    app: null,
    init: function (app, mongo) {
        this.mongo = mongo;
        this.app = app;
    }, getUser: function (criteria, callbackFunction) {
        this.mongo.MongoClient.connect(this.app.get('db'), function (err, db) {
            if (err) {
                callbackFunction(null);
            } else {
                var collection = db.collection('users');
                collection.find(criteria).toArray(function (err, users) {
                    if (err) {
                        callbackFunction(null);
                    } else {
                        callbackFunction(users);
                    }
                    db.close();
                });
            }
        });
    }, resetMongo: function (callbackFunction) { //TODO
        this.mongo.MongoClient.connect(this.app.get('db'), function(err, db) {
            if (err) {
                callbackFunction(null);
            } else {
                var collectionUsers = db.collection('users');
                collectionUsers.drop().then(res => {
                }, err => {});
                var collectionSlots = db.collection('slots');
                collectionSlots.drop().then(res => {
                }, err => {});
                var collectionGroups = db.collection('groups');
                collectionGroups.drop().then(res => {
                }, err => {});

                callbackFunction(1);
            }
            db.close();
        });
    }, addUser: function (user, callbackFunction) {
        this.mongo.MongoClient.connect(this.app.get('db'), function (err, db) {
            if (err) {
                callbackFunction(null);
            } else {
                var collection = db.collection('users');
                collection.insertOne(user, function (err, result) {
                    if (err) {
                        callbackFunction(null);
                    } else {
                        callbackFunction(result.ops[0]._id);
                    }
                    db.close();
                });
            }
        });
    }, addSlot: function (slot, callbackFunction) {
        this.mongo.MongoClient.connect(this.app.get('db'), function (err, db) {
            if (err) {
                callbackFunction(null);
            } else {
                var collection = db.collection('slots');
                collection.insertOne(slot, function (err, result) {
                    if (err) {
                        callbackFunction(null);
                    } else {
                        callbackFunction(result.ops[0]._id);
                    }
                    db.close();
                });
            }
        });
    }, getSlot: function (criteria, callbackFunction) {
        this.mongo.MongoClient.connect(this.app.get('db'), function (err, db) {
            if (err) {
                callbackFunction(null);
            } else {
                var collection = db.collection('slots');
                collection.find(criteria).toArray(function (err, slots) {
                    if (err) {
                        callbackFunction(null);
                    } else {
                        callbackFunction(slots);
                    }
                    db.close();
                });
            }
        });
    }, addClassGroup: function (group, callbackFunction) {
        this.mongo.MongoClient.connect(this.app.get('db'), function (err, db) {
            if (err) {
                callbackFunction(null);
            } else {
                var collection = db.collection('groups');
                collection.insertOne(group, function (err, result) {
                    if (err) {
                        callbackFunction(null);
                    } else {
                        callbackFunction(result.ops[0]._id);
                    }
                    db.close();
                });
            }
        });
    }, getClassGroup: function (criteria, callbackFunction) {
        this.mongo.MongoClient.connect(this.app.get('db'), function (err, db) {
            if (err) {
                callbackFunction(null);
            } else {
                var collection = db.collection('groups');
                collection.find(criteria).toArray(function (err, groups) {
                    if (err) {
                        callbackFunction(null);
                    } else {
                        callbackFunction(groups);
                    }
                    db.close();
                });
            }
        });
    }, addNotifications: function (notifications, callbackFunction) {
        this.mongo.MongoClient.connect(this.app.get('db'), function (err, db) {
            if (err) {
                callbackFunction(null);
            } else {
                var collection = db.collection('notifications');
                collection.insertMany(notifications, function (err, result) {
                    if (err) {
                        callbackFunction(null);
                    } else {
                        callbackFunction(result.insertedIds);
                    }
                    db.close();
                });
            }
        });
    }
};
