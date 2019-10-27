module.exports = {
    app: null,
    bdManagement: null,
    init: function(app, bdManagement){
        this.app= app;
        this.bdManagement= bdManagement;
    },
    userLogin: function(user, callback){
        this.bdManagement.getUser(user, function (users) {
            if (users == null || users.length === 0) {
                callback(null);
            } else {
                callback(users[0]);
            }
        });
    }
};
