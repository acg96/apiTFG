module.exports = function (app, logger, userService) {
    app.get('/login', function (req, res) {
        res.render('main/login.html', {username: req.session.username, error: 0});
    });

    app.get('/logout', function (req, res) {
        logger.info("The user " + req.session.username + " has logged out - IP address: " + res.ipReal);
        req.session.username = null;
        req.session.role = null;
        res.redirect("/login");
    });

    app.post("/login", function (req, res) {
        userService.userLogin(req.body.username.trim(), req.body.password.trim(), function (userBBDD) {
            if (userBBDD == null) {
                logger.info("Incorrect login. Username: " + req.body.username.trim() + " - IP address: " + res.ipReal);
                req.session.username = null;
                req.session.role = null;
                res.render('main/login.html', {username: req.session.username, error: 1});
            } else {
                logger.info("The user " + userBBDD.username + " has logged in on the administration web - IP address: " + res.ipReal);
                req.session.username = userBBDD.username;
                req.session.role = userBBDD.role;
                res.redirect("/");
            }
        });
    });
};
