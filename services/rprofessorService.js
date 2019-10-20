module.exports = {
    app: null,
    bdManagement: null,
    init: function(app, bdManagement){
        this.app= app;
        this.bdManagement= bdManagement;
    },
    getSlotGroups: function(username, callback){
        const date= new Date();
        const dateObject= {
            month: (date.getMonth() + 1).toString().length === 2 ? (date.getMonth() + 1).toString() : "0" + (date.getMonth() + 1).toString(),
            day: date.getDate().toString().length === 2 ? date.getDate().toString() : "0" + date.getDate().toString(),
            year: date.getFullYear().toString(),
            hour: date.getHours().toString().length === 2 ? date.getHours().toString() : "0" + date.getHours().toString(),
            minutes: date.getMinutes().toString().length === 2 ? date.getMinutes().toString() : "0" + date.getMinutes().toString()
        };
        this.bdManagement.getClassGroup({professors: username}, groups => {
            const adaptedGroups= [];
            if (groups != null && groups.length > 0){
                for (let i= 0; i < groups.length; ++i){
                    let stringStudents= "";
                    for (let e= 0; e < groups[i].students.length; ++e){
                        stringStudents+= groups[i].students[e] + "-;%;&&-%;-";
                    }
                    if (stringStudents !== ""){
                        stringStudents= stringStudents.substr(0, stringStudents.length - 10);
                    }
                    const adGroup= {
                        id: groups[i]._id.toString(),
                        name: groups[i].name,
                        students: stringStudents
                    };
                    adaptedGroups.push(adGroup);
                }
            }
            callback(dateObject, adaptedGroups);
        });
    },
    validateSlot: function(username, postInfo, callback){
        const slotValidator = require("../validators/slotValidator.js");
        slotValidator.validateAddSlot(this.app, postInfo, this.bdManagement, username, function (errors, processedResult) {
            if (errors != null && errors.anyError === 0) {
                //TODO store on bbdd. BEFORE analyze collisions
                callback(null, null, null, "success"); //TODO pass message with collisions or successful action
            } else {
                this.getSlotGroups(username, function (dateObject, adaptedGroups){
                    callback(dateObject, adaptedGroups, errors, "");
                });
            }
        }.bind(this));
    }
};
