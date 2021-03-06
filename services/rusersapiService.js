module.exports = {
    app: null,
    bdManagement: null,
    rLdapConnectionService: null,
    init: function(app, bdManagement, rLdapConnectionService){
        this.app= app;
        this.bdManagement= bdManagement;
        this.rLdapConnectionService= rLdapConnectionService;
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
                    groupsIds.push(groups[i]._id.toString());
                }

                const msStartTime= this.app.get('currentTime')().valueOf();
                const msEndTime= msStartTime + this.app.get('tokenTime');
                const criteriaSlots= {
                    groupIds: {$in: groupsIds},
                    $or: [{$and: [{startTime: {$lte: msStartTime}}, {endTime: {$gt: msStartTime}}]},
                        {$and: [{startTime: {$gte: msStartTime}}, {startTime: {$lt: msEndTime}}]}],
                    studentsExcluded: {$nin: [username]}
                };
                this.bdManagement.getSlot(criteriaSlots, function(slots){
                    if (slots != null && slots.length !== 0){
                        this.bdManagement.getModule({groupsIds: {$in: groupsIds}}, function (modules){
                            if (modules != null && modules.length > 0){
                                for (let i= 0; i < slots.length; ++i){
                                    for (let e= 0; e < modules.length; ++e){
                                        if (modules[e].groupsIds.some(element => slots[i].groupIds.includes(element))){
                                            const arraySlotUrls= {
                                                description: slots[i].description,
                                                startTime: slots[i].startTime,
                                                endTime: slots[i].endTime,
                                                listMode: slots[i].listMode,
                                                urls: slots[i].urls,
                                                moduleName: modules[e].name,
                                                slotId: slots[i]._id.toString()
                                            };
                                            urls.push(arraySlotUrls);
                                            break;
                                        }
                                    }
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
            } else{
                callback(urls);
            }
        }.bind(this));
    },
    getUserToken: function(username, password, ips, callback){
        let user = null;
        if (this.app.get('useLDAP')){ //If it's in use the ldap (production mode)
            user = {
                username: username.trim(),
                role: "student"
            };
            this.rLdapConnectionService.requestStudentConnection({username: username.trim(), password: password.trim()}, response => {
                if (response) {
                    this.bdManagement.getUser(user, function (users) {
                        if (users == null || users.length === 0 || users[0].role !== "student") {
                            callback(null);
                        } else {
                            const token = this.app.get('jwt').sign({
                                user: user.username.trim(),
                                time: this.app.get('currentTime')().valueOf() / 1000,
                                role: users[0].role,
                                ips: ips
                            }, this.app.get('tokenKey')());
                            callback(token);
                        }
                    }.bind(this));
                } else{
                    callback(null);
                }
            });
        } else { //If it's not in use the ldap
            const secure = this.app.get("crypto").createHmac('sha256', this.app.get('passKey'))
                .update(password.trim()).digest('hex');
            user = {
                username: username.trim(),
                password: secure,
                role: "student"
            };
            this.bdManagement.getUser(user, function (users) {
                if (users == null || users.length === 0 || users[0].role !== "student") {
                    callback(null);
                } else {
                    const token = this.app.get('jwt').sign({
                        user: user.username.trim(),
                        time: this.app.get('currentTime')().valueOf() / 1000,
                        role: users[0].role,
                        ips: ips
                    }, this.app.get('tokenKey')());
                    callback(token);
                }
            }.bind(this));
        }
    }
};
