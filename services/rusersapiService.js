module.exports = {
    app: null,
    bdManagement: null,
    init: function(app, bdManagement){
        this.app= app;
        this.bdManagement= bdManagement;
    },
    getUrls: function(username, callback){
        const criteriaGroups= {
            students: username
        };
        this.bdManagement.getClassGroup(criteriaGroups, function(groups){
            const urls= [];
            if (groups != null && groups.length !== 0){
                const groupsIds= [];
                for (let i= 0; i < groups.length; ++i){
                    groupsIds.push(this.bdManagement.mongoPure.ObjectID(groups[i]._id));
                }

                const msStartTime= this.app.get('currentTime')().valueOf();
                const msEndTime= msStartTime + this.app.get('tokenTime');
                const criteriaSlots= {
                    groupId: {$in: groupsIds},
                    $or: [{$and: [{startTime: {$lte: msStartTime}}, {endTime: {$gt: msStartTime}}]},
                        {$and: [{startTime: {$gte: msStartTime}}, {startTime: {$lt: msEndTime}}]}],
                    studentsExcluded: {$nin: [username]}
                };
                this.bdManagement.getSlot(criteriaSlots, function(slots){
                    if (slots != null && slots.length !== 0){
                        for (let i= 0; i < slots.length; ++i){
                            const arraySlotUrls= {
                                description: slots[i].description,
                                startTime: slots[i].startTime,
                                endTime: slots[i].endTime,
                                listMode: slots[i].listMode,
                                urls: slots[i].urls,
                                groupName: slots[i].groupName,
                                slotId: slots[i]._id.toString()
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
        const secure = this.app.get("crypto").createHmac('sha256', this.app.get('passKey'))
            .update(password.trim()).digest('hex');
        const user = {
            username: username,
            password: secure,
            role: "student"
        };
        this.bdManagement.getUser(user, function (users) {
            if (users == null || users.length === 0 || users[0].role !== "student") {
                callback(null);
            } else {
                const token = this.app.get('jwt').sign({
                    user: user.username,
                    time: this.app.get('currentTime')().valueOf() / 1000,
                    role: users[0].role,
                    ips: ips
                }, this.app.get('tokenKey')());
                callback(token);
            }
        }.bind(this));
    }
};
