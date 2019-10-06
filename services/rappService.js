module.exports = {
    app: null,
    bdManagement: null,
    initBD: null, //TODO
    init: function(app, bdManagement, initBD){
        this.app= app;
        this.bdManagement= bdManagement;
        this.initBD= initBD; //TODO
    },
    checkUserExists: function(username, role, callback){
        var userCheck = {
            username: username,
            role: role
        };
        this.bdManagement.getUser(userCheck, function (users) {
            if (users == null || users.length === 0 || users[0].role !== "student") {
                callback(false);
            } else{
                callback(true);
            }
        });
    },
    resetBBDD: function(){ //TODO
        this.bdManagement.resetMongo(function (result){
            if (result != null) {
                this.initBD.generateData();
            }
        }.bind(this));
    }
}
