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
                callbackFunction(1);
            }
            db.close();
        });
    }, addUser: function (user, callbackFunction) { //TODO
        this.mongo.MongoClient.connect(this.app.get('db'), function (err, db) {
            if (err) {
                callbackFunction(null);
            } else {
                var collection = db.collection('users');
                collection.insert(user, function (err, result) {
                    if (err) {
                        callbackFunction(null);
                    } else {
                        callbackFunction(result.ops[0]._id);
                    }
                    db.close();
                });
            }
        });
    }
};
