module.exports = {
    app: null,
    bdManagement: null,
    propertiesReader: null,
    init: function(app, bdManagement, propertiesReader){
        this.app= app;
        this.bdManagement= bdManagement;
        this.propertiesReader= propertiesReader;
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
    },
    createOrCheckConfigFileExists: function(callback){
        try {
            const propertiesFile = this.propertiesReader(this.app.get('propertiesFilePath'));
            const daysDbCleansing= propertiesFile.get('defaultDaysDbCleansing');
            if (daysDbCleansing == null || !Number.isInteger(daysDbCleansing) || daysDbCleansing < 0 || daysDbCleansing > 24){ //If the file is corrupted
                const fs = require('fs');
                fs.unlinkSync(this.app.get('propertiesFilePath'));
                throw Error("Config file corrupted");
            }
            callback(true, daysDbCleansing);
        }catch(e){ //If file not exists
            const fs = require('fs');
            fs.writeFile(this.app.get('propertiesFilePath'),"", err => {
               if (!err){
                   const propertiesFile = new this.propertiesReader(this.app.get('propertiesFilePath'));
                   propertiesFile.set('defaultDaysDbCleansing', this.app.get('defaultDaysDbCleansing'));
                   propertiesFile.save(this.app.get('propertiesFilePath'), (err, data) => {
                       if (!err) {
                           const daysDbCleansing= propertiesFile.get('defaultDaysDbCleansing');
                           callback(true, daysDbCleansing);
                       } else{
                           callback(false);
                       }
                   });
               } else{
                   callback(false);
               }
            });
        }
    },
    runDbCleansingAliveSignals: function(){
        if (this.app.get('daysDbCleansing') > 0) {
            this.app.set('dbCleansingAliveSignalsProgrammedFunction', setInterval(() => {
                //Remove all alive signals leaving at least the more recent one received for each machine TODO
            }, this.app.get('daysDbCleansing') * 24 * 60 * 60 * 1000));
        }
    }
};
