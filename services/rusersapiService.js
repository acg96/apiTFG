module.exports = {
    app: null,
    bdManagement: null,
    init: function(app, bdManagement){
        this.app= app;
        this.bdManagement= bdManagement;
    },
    getUrls: function(username, callback){
        var criteriaGroups= {
            students: username
        };
        this.bdManagement.getClassGroup(criteriaGroups, function(groups){
            var urls= [];
            if (groups != null && groups.length !== 0){
                var groupsIds= [];
                for (var i= 0; i < groups.length; ++i){
                    groupsIds.push(this.bdManagement.mongo.ObjectID(groups[i]._id));
                }
                var msStartTime= Date.now();
                var msEndTime= msStartTime + this.app.get('tokenTime');
                var criteriaSlots= {
                    groupId: {$in: groupsIds},
                    $or: [{$and: [{startTime: {$lte: msStartTime}}, {endTime: {$gt: msStartTime}}]},
                        {$and: [{startTime: {$gte: msStartTime}}, {startTime: {$lt: msEndTime}}]}]
                };
                this.bdManagement.getSlot(criteriaSlots, function(slots){
                    if (slots != null && slots.length !== 0){
                        for (var i= 0; i < slots.length; ++i){
                            var arraySlotUrls= {
                                description: slots[i].description,
                                startTime: slots[i].startTime,
                                endTime: slots[i].endTime,
                                listMode: slots[i].listMode,
                                urls: slots[i].urls,
                                groupName: slots[i].groupName
                            };
                            urls.push(arraySlotUrls);
                        }
                        callback(urls);
                    } else{
                        callback(urls);
                    }
                }.bind(this));
            } else{
                callback(urls);
            }
        }.bind(this));
    },
    getUserToken: function(username, password, ips, callback){
        var secure = this.app.get("crypto").createHmac('sha256', this.app.get('key'))
            .update(password.trim()).digest('hex');
        var user = {
            username: username,
            password: secure
        };
        this.bdManagement.getUser(user, function (users) {
            if (users == null || users.length === 0 || users[0].role !== "student") {
                callback(null);
            } else {
                var token = this.app.get('jwt').sign({
                    user: user.username,
                    time: Date.now() / 1000,
                    role: users[0].role,
                    ips: ips
                }, this.app.get('key'));
                callback(token);
            }
        }.bind(this));
    }
}
