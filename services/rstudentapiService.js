module.exports = {
    app: null,
    bdManagement: null,
    init: function(app, bdManagement){
        this.app= app;
        this.bdManagement= bdManagement;
    },
    storeNotification: function(info, callback){
        //Store on BBDD TODO
    }
}
