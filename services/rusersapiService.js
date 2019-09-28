module.exports = {
    app: null,
    bdManagement: null,
    logger: null,
    init: function(app, bdManagement, logger){
        this.app= app;
        this.bdManagement= bdManagement;
        this.logger= logger;
    },
    getUrls: function(username, callback){
        var criteriaGroups= {
            students: username
        };
        bdManagement.getClassGroup(criteriaGroups, function(groups){
            var urls= [];
            if (groups != null && groups.length !== 0){
                var groupsIds= [];
                for (var i= 0; i < groups.length; ++i){
                    groupsIds.push(groups[i]._id);
                }
                var msStartTime= Date.now();
                var msEndTime= msStartTime + app.get('tokenTime');
                var criteriaSlots= {
                    groupId: {$in: groupsIds},
                    $and: [{startTime: {$gte: msStartTime}}, {startTime: {$lte: msEndTime}}]
                };
                bdManagement.getSlot(criteriaSlots, function(slots){
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
                });
            } else{
                callback(urls);
            }
        });
    },
    getUserToken: function(username, password, callback){
        var secure = app.get("crypto").createHmac('sha256', app.get('key'))
            .update(password.trim()).digest('hex');
        var user = {
            username: username,
            password: secure
        };
        bdManagement.getUser(user, function (users) {
            if (users == null || users.length === 0 || users[0].role !== "student") {
                callback(null);
            } else {
                var token = app.get('jwt').sign({
                    user: user.username,
                    time: Date.now() / 1000,
                    role: users[0].role
                }, app.get('key'));
                callback(token);
            }
        });
    }
}
