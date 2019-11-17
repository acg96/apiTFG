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
        const hashPass = app.get("crypto").createHmac('sha256', app.get('passKey'))
            .update(req.body.password.trim()).digest('hex');
        const user = {
            username: req.body.username.trim(),
            password: hashPass,
            role: "professor"
        };
        userService.userLogin(user, function (userBBDD) {
            if (userBBDD == null) {
                logger.info("Incorrect login. Username: " + user.username + " - IP address: " + res.ipReal);
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
