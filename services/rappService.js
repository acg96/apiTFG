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
            const daysDbCleansing= propertiesFile.get('daysDbCleansing');
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
                   propertiesFile.set('daysDbCleansing', this.app.get('defaultDaysDbCleansing'));
                   propertiesFile.save(this.app.get('propertiesFilePath'), (err, data) => {
                       if (!err) {
                           const daysDbCleansing= propertiesFile.get('daysDbCleansing');
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
    runDbCleansingAliveSignals: function(callback){
        if (this.app.get('daysDbCleansing') > 0) {
            const dbCleansingAliveSignalsProgrammedFunction = setInterval(() => {
                //Remove all alive signals leaving at least the more recent one received for each machine
                this.getMaxDateAliveSignalIds(maxSignalIds => {
                    if (maxSignalIds.length > 0) {
                        this.bdManagement.deleteNotifications({slotId: "-2", _id: {$nin: maxSignalIds}}, (res)=>{callback(res)});
                    } else{
                        callback(0);
                    }
                });
            }, this.app.get('daysDbCleansing') * 24 * 60 * 60 * 1000);
            this.app.set('removeProgrammedDbCleansing', () => { //Set a function to call when it's needed to stop the interval
                clearInterval(dbCleansingAliveSignalsProgrammedFunction);
            });
        } else{
            callback(0);
        }
    },
    getMaxDateAliveSignalIds: function(callback){
        this.bdManagement.getNotifications({slotId: "-2"}, signalsList => {
            if (signalsList != null){
                const signalsArray = [];
                const signalsObjArray = [];
                for (let i = 0; i < signalsList.length; ++i){
                    let intIps= "";
                    signalsList[i].intIps.sort((a, b) => a - b);
                    for (let j= 0; j < signalsList[i].intIps.length; ++j){
                        if (j === 0){
                            intIps+= signalsList[i].intIps[j];
                        } else{
                            intIps+= ", " + signalsList[i].intIps[j];
                        }
                    }
                    const notificationObj = {
                        actionTimeMS: signalsList[i].actionTime,
                        idAliveSignal: signalsList[i]._id.toString()
                    };
                    const currentExtIp = signalsList[i].requestExtIp === "::1" ? "localhost" : signalsList[i].requestExtIp === null ? "localhost" : signalsList[i].requestExtIp.replace("::ffff:", "");
                    const currentName = currentExtIp.replace(/\./g, "") + "-" + intIps.replace(/ /g, "").replace(/\./g, "").replace(/,/g, "");
                    if (!signalsArray.includes(currentName)){
                        signalsArray.push(currentName);
                        const signalObj = {
                            signalName: currentName,
                            msMajorDate: notificationObj.actionTimeMS,
                            idMajorDate: notificationObj.idAliveSignal
                        };
                        signalsObjArray.push(signalObj);
                    } else{
                        const resultArray = signalsObjArray.filter(currentSignal => currentSignal.signalName === currentName);
                        const msCurrentMajorDateAux = resultArray[0].msMajorDate;
                        const currentIdMajorDateAux = resultArray[0].idMajorDate;
                        resultArray[0].msMajorDate = msCurrentMajorDateAux < notificationObj.actionTimeMS ? notificationObj.actionTimeMS : msCurrentMajorDateAux;
                        resultArray[0].idMajorDate = msCurrentMajorDateAux < notificationObj.actionTimeMS ? notificationObj.idAliveSignal : currentIdMajorDateAux;
                    }
                }
                const aliveSignalIds = [];
                for (let i= 0; i < signalsObjArray.length; ++i){
                    aliveSignalIds.push(this.bdManagement.mongoPure.ObjectID(signalsObjArray[i].idMajorDate));
                }
                callback(aliveSignalIds);
            } else{
                callback([]);
            }
        });
    }
};
