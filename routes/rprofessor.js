module.exports = function (app, logger, swig, professorService) {
    app.get('/prf/slot/add', function (req, res) {
        const date= new Date();
        const dateObject= {
            month: (date.getMonth() + 1).toString().length === 2 ? (date.getMonth() + 1).toString() : "0" + (date.getMonth() + 1).toString(),
            day: date.getDate().toString().length === 2 ? date.getDate().toString() : "0" + date.getDate().toString(),
            year: date.getFullYear().toString(),
            hour: date.getHours().toString().length === 2 ? date.getHours().toString() : "0" + date.getHours().toString(),
            minutes: date.getMinutes().toString().length === 2 ? date.getMinutes().toString() : "0" + date.getMinutes().toString()
        };
        professorService.getSlotGroups(req.session.username, (adaptedGroups) => {
            const response = swig.renderFile('views/slot/add.html', {username: req.session.username, date: dateObject, groups: adaptedGroups});
            res.send(response);
        });
    });

    app.post("/prf/slot/add", function (req, res) {
        const postInfo= req.body;
        if (postInfo.groupSelect == null){ //Used when no group was selected
            postInfo["groupSelect"]= "";
        }

        professorService.validateSlot(req.session.username, postInfo, (adaptedGroups, errors, collisions, messages) => {
            if (adaptedGroups == null && errors == null){
                logger.info("Slot created by user " + req.session.username + " - IP: " + req.ip);
                //res.redirect("/prf/slot/list"); TODO with a message with collisions or successful action
                res.redirect("/"); //TODO meanwhile
            } else {
                const date= new Date();
                const dateObject= {
                    month: (date.getMonth() + 1).toString().length === 2 ? (date.getMonth() + 1).toString() : "0" + (date.getMonth() + 1).toString(),
                    day: date.getDate().toString().length === 2 ? date.getDate().toString() : "0" + date.getDate().toString(),
                    year: date.getFullYear().toString(),
                    hour: date.getHours().toString().length === 2 ? date.getHours().toString() : "0" + date.getHours().toString(),
                    minutes: date.getMinutes().toString().length === 2 ? date.getMinutes().toString() : "0" + date.getMinutes().toString()
                };
                logger.info("Error when trying to create a slot. User: " + req.session.username + " - IP: " + req.ip);
                const response = swig.renderFile('views/slot/add.html', {username: req.session.username, date: dateObject, groups: adaptedGroups, errors: errors});
                res.send(response);
            }
        });
    });
};
