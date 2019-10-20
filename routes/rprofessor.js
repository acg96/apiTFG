module.exports = function (app, logger, swig, professorService) {
    app.get('/prf/slot/add', function (req, res) {
        professorService.getSlotGroups(req.session.username, (dateObject, adaptedGroups) => {
            const response = swig.renderFile('views/slot/add.html', {username: req.session.username, date: dateObject, groups: adaptedGroups});
            res.send(response);
        });
    });

    app.post("/prf/slot/add", function (req, res) {
        const postInfo= req.body;
        if (postInfo.groupSelect == null){ //Used when no group was selected
            postInfo["groupSelect"]= "";
        }
        professorService.validateSlot(req.session.username, postInfo, (dateObject, adaptedGroups, errors, messages) => {
            if (dateObject == null && adaptedGroups == null && errors == null){
                logger.info("Slot created by user " + req.session.username + " - IP: " + req.ip);
                //res.redirect("/prf/slot/list"); TODO with a message with collisions or successful action
                res.redirect("/"); //TODO meanwhile
            } else {
                logger.info("Error when trying to create a slot. User: " + req.session.username + " - IP: " + req.ip);
                const response = swig.renderFile('views/slot/add.html', {username: req.session.username, date: dateObject, groups: adaptedGroups, errors: errors});
                res.send(response);
            }
        });
    });
};
