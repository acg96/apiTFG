module.exports = {
    app: null,
    fs: null,
    moduleLibraries: null,
    ldapClient: null,
    init: function(app, fs){
        this.app= app;
        this.fs= fs;
        this.moduleLibraries= {
            ldap: require('ldapjs')
        };
    },
    initLdapClient: function(){
        this.ldapClient= this.moduleLibraries.ldap.createClient({
            url: 'ldaps://directorio.uniovi.es:636',
            timeout: 40000,
            connectTimeout: 30000,
            tlsOptions: {
                ca: [
                    this.fs.readFileSync('./ldapCertificate/certificateCA.cer')
                ]
            },
            idleTimeout: 40000
        });
    },
    requestStudentConnection: function(user, callback){
        this.initLdapClient();
        this.ldapClient.bind('uid=' + user.username + ',ou=Alumnos,dc=uniovi,dc=es', user.password, err => {
            if (err){
                callback(false);
            } else {
                callback(true);
            }
            this.ldapClient.unbind(function() {});
        });
    },
    requestPASConnection: function(user, callback){
        this.initLdapClient();
        this.ldapClient.bind('uid=' + user.username + ',ou=personal,dc=uniovi,dc=es', user.password, err => {
            if (err){
                callback(false);
            } else {
                callback(true);
            }
            this.ldapClient.unbind(function() {});
        });
    }
};
