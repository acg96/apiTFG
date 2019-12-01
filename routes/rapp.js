module.exports = function (app, logger, bdManagement, initBD) {
    app.get('/', function (req, res) {
        res.render('main/index.html', {username: req.session.username, role: req.session.role});
    });
    app.get("/reset", function (req, res) { //TODO
        logger.info("BBDD reset - IP: " + res.ipReal);
        bdManagement.resetMongo(function (result) {
            if (result != null) {
                initBD.generateData();
                res.status(200);
                res.json({message: 'bbdd reset'});
            } else {
                res.status(500);
                res.json({message: 'error when trying to reset the bbdd'});
            }
        });
    });
};
