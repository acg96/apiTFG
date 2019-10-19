module.exports = function (app, logger, bdManagement, swig) {
    app.get('/prf/slot/add', function (req, res) {
        const date= new Date();
        const dateObject= {
            month: (date.getMonth() + 1).toString().length == 2 ? (date.getMonth() + 1).toString() : "0" + (date.getMonth() + 1).toString(),
            day: date.getDate().toString().length == 2 ? date.getDate().toString() : "0" + date.getDate().toString(),
            year: date.getFullYear().toString(),
            hour: date.getHours().toString().length == 2 ? date.getHours().toString() : "0" + date.getHours().toString(),
            minutes: date.getMinutes().toString().length == 2 ? date.getMinutes().toString() : "0" + date.getMinutes().toString()
        }
        bdManagement.getClassGroup({professors: req.session.username}, groups => {
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
            const response = swig.renderFile('views/slot/add.html', {username: req.session.username, date: dateObject, groups: adaptedGroups});
            res.send(response);
        });
    });

    app.post("/prf/slot/add", function (req, res) {

    });
};
