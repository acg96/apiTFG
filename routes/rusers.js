module.exports = function (app, bdManagement, logger) {
    app.post("/login", function (req, res) {
        if (req.body.password && req.body.username) {
            var secure = app.get("crypto").createHmac('sha256', app.get('key'))
                .update(req.body.password.trim()).digest('hex');
            var user = {
                username: req.body.username,
                password: secure
            };
            bdManagement.getUser(user, function (users) {
                if (users == null || users.length === 0 || users[0].role !== "student") {
                    logger.info("Incorrect login. Username: " + user.username + " - IP: " + req.ip);
                    res.status(401);
                    res.json({access: false, message: 'Incorrect login'});
                } else {
                    logger.info("The user " + user.username + " has logged in - IP: " + req.ip);
                    var token = app.get('jwt').sign({
                        user: user.username,
                        time: Date.now() / 1000,
                        role: users[0].role
                    }, app.get('key'));
                    res.status(200);
                    res.json({
                        access: true,
                        token: token,
                        message: "Correct login"
                    });
                }
            });
        } else {
            logger.info("The client need to provide data to login - IP: " + req.ip);
            res.status(401);
            res.json({access: false, message: "The client need to provide data to login"});
        }
    });
};
