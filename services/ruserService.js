module.exports = {
    app: null,
    bdManagement: null,
    rLdapConnectionService: null,
    init: function(app, bdManagement, rLdapConnectionService){
        this.app= app;
        this.bdManagement= bdManagement;
        this.rLdapConnectionService= rLdapConnectionService;
    },
    userLogin: function(username, password, callback){
        if (this.app.get('useLDAP')){ //If it's in use the ldap (production mode)
            const user = {
                username: username,
                role: {$in: ["professor", "administrator"]}
            };
            this.rLdapConnectionService.requestPASConnection({username: username, password: password}, response => {
                if (response) {
                    this.bdManagement.getUser(user, function (users) {
                        if (users == null || users.length === 0) {
                            callback(null);
                        } else {
                            callback(users[0]);
                        }
                    });
                } else{
                    callback(null);
                }
            });
        } else { //If it's not in use the ldap
            const hashPass = this.app.get("crypto").createHmac('sha256', this.app.get('passKey'))
                .update(password).digest('hex');
            const user = {
                username: username,
                password: hashPass,
                role: {$in: ["professor", "administrator"]}
            };
            this.bdManagement.getUser(user, function (users) {
                if (users == null || users.length === 0) {
                    callback(null);
                } else {
                    callback(users[0]);
                }
            });
        }
    }
};
