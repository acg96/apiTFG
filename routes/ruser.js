module.exports = function (app, logger, userService, swig) {
    app.get('/login', function (req, res) {
        const response = swig.render('views/main/login.html', {username: req.session.username, error: 0});
        res.send(response);
    });

    app.get('/logout', function (req, res) {
        logger.info("The user " + req.session.username + " has logged out - IP address: " + req.ip);
        req.session.username = null;
        req.session.role = null;
        res.redirect("/login");
    });

    app.post("/login", function (req, res) {
        const hashPass = app.get("crypto").createHmac('sha256', app.get('passKey'))
            .update(req.body.password.trim()).digest('hex');
        const user = {
            username: req.body.username.trim(),
            password: hashPass,
            role: "professor"
        };
        userService.userLogin(user, function (userBBDD) {
            if (userBBDD == null) {
                logger.info("Incorrect login. Username: " + user.username + " - IP address: " + req.ip);
                req.session.username = null;
                req.session.role = null;
                const response = swig.render('views/main/login.html', {username: req.session.username, error: 1});
                res.send(response);
            } else {
                logger.info("The user " + userBBDD.username + " has logged in on the administration web - IP address: " + req.ip);
                req.session.username = userBBDD.username;
                req.session.role = userBBDD.role;
                res.redirect("/");
            }
        });
    });
};
