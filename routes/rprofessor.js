module.exports = function (app, logger, swig, professorService) {
    app.get('/prf/slot/add', function (req, res) {
        const date= app.get('currentTime')();
        const dateObject= {
            month: (date.month() + 1).toString().length === 2 ? (date.month() + 1).toString() : "0" + (date.month() + 1).toString(),
            day: date.date().toString().length === 2 ? date.date().toString() : "0" + date.date().toString(),
            year: date.year().toString(),
            hour: date.hour().toString().length === 2 ? date.hour().toString() : "0" + date.hour().toString(),
            minutes: date.minute().toString().length === 2 ? date.minute().toString() : "0" + date.minute().toString()
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
                const date= app.get('currentTime')();
                const dateObject= {
                    month: (date.month() + 1).toString().length === 2 ? (date.month() + 1).toString() : "0" + (date.month() + 1).toString(),
                    day: date.date().toString().length === 2 ? date.date().toString() : "0" + date.date().toString(),
                    year: date.year().toString(),
                    hour: date.hour().toString().length === 2 ? date.hour().toString() : "0" + date.hour().toString(),
                    minutes: date.minute().toString().length === 2 ? date.minute().toString() : "0" + date.minute().toString()
                };
                logger.info("Error when trying to create a slot. User: " + req.session.username + " - IP: " + req.ip);
                const response = swig.renderFile('views/slot/add.html', {username: req.session.username, date: dateObject, groups: adaptedGroups, errors: errors});
                res.send(response);
            }
        });
    });
};
