module.exports = function (app, logger, bdManagement, swig) {
    app.get('/login', function (req, res) {
        var response = swig.renderFile('views/login.html', {username: req.session.username, error: 0});
        res.send(response);
    });

    app.get('/logout', function (req, res) {
        logger.info("The user " + req.session.username + " has logged out - IP address: " + req.ip);
        req.session.username = null;
        req.session.role = null;
        res.redirect("/login");
    });
};
