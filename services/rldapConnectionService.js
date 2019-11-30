module.exports = {
    app: null,
    fs: null,
    init: function(app, fs){
        this.app= app;
        this.fs= fs;
    },
    requestStudentConnection: function(user, callback){
        const serverConfiguration = {
            url: 'ldaps://directorio.uniovi.es:636',
            bindDN: 'uid=' + user.username + ',ou=Alumnos,dc=uniovi,dc=es',
            bindCredentials: user.password,
            searchBase: 'ou=Alumnos,dc=uniovi,dc=es',
            searchFilter: '(uid={{username}})',
            tlsOptions: {
                ca: [
                    this.fs.readFileSync('./ldapCertificate/certificateCA.cer')
                ]
            },
            reconnect: true
        };
        const LdapAuth = this.app.get('ldapAuth');
        const ldap = new LdapAuth(serverConfiguration);
        ldap.authenticate(user.username, user.password, function(err, user) {
            if (err) {
                callback(false, null);
            } else{
                callback(true, user);
            }
            ldap.close(() => {});
        });
    },
    requestPASConnection: function(user, callback){
        const serverConfiguration = {
            url: 'ldaps://directorio.uniovi.es:636',
            bindDN: 'uid=' + user.username + ',ou=personal,dc=uniovi,dc=es',
            bindCredentials: user.password,
            searchBase: 'ou=personal,dc=uniovi,dc=es',
            searchFilter: '(uid={{username}})',
            tlsOptions: {
                ca: [
                    this.fs.readFileSync('./ldapCertificate/certificateCA.cer')
                ]
            },
            reconnect: true
        };
        const LdapAuth = this.app.get('ldapAuth');
        const ldap = new LdapAuth(serverConfiguration);
        ldap.authenticate(user.username, user.password, function(err, user) {
            if (err) {
                callback(false, null);
            } else{
                callback(true, user);
            }
            ldap.close(() => {});
        });
    }
};
