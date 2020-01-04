module.exports = {
    app: null,
    bdManagement: null,
    init: function(app, bdManagement){
        this.app= app;
        this.bdManagement= bdManagement;
    },
    checkUserExists: function(username, role, callback){
        const userCheck = {
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
    }
};
