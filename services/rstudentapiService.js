module.exports = {
    app: null,
    bdManagement: null,
    init: function(app, bdManagement){
        this.app= app;
        this.bdManagement= bdManagement;
    },
    storeNotifications: function(notifications, callback){
        this.bdManagement.addNotifications(notifications, callback);
    },
    getTodaySlots: function(callback){
        const msStartTime= this.app.get('currentTime')().minutes(0).hours(0).valueOf();
        const msEndTime= this.app.get('currentTime')().minutes(59).hours(23).seconds(59).valueOf();
        const criteriaSlots= {
            $or: [{$and: [{startTime: {$lte: msStartTime}}, {endTime: {$gt: msStartTime}}]},
                {$and: [{startTime: {$gte: msStartTime}}, {startTime: {$lt: msEndTime}}]}]
        };
        this.bdManagement.getSlot(criteriaSlots, function(slots){
            callback(slots);
        });
    }
};
