module.exports = {
    app: null,
    bdManagement: null,
    init: function(app, bdManagement){
        this.app= app;
        this.bdManagement= bdManagement;
    },
    storeNotifications: function(notifications, callback){
        this.bdManagement.addNotifications(notifications, callback);
    }
}