module.exports = function (app, logger, userApiService) {
    app.post("/api/login", function (req, res) {
        if (req.body.password && req.body.username && req.body.ips) {
            userApiService.getUserToken(req.body.username, req.body.password, req.body.ips, token => {
                if (token == null){
                    logger.info("Incorrect login. Username: " + req.body.username + " - IP: " + res.ipReal);
                    res.status(401);
                    res.json({access: false, message: 'Incorrect login'});
                } else{
                    userApiService.getUrls(req.body.username, slots => {
                        logger.info("The user " + req.body.username + " has logged in - IP: " + res.ipReal);
                        res.status(200);
                        res.json({
                            access: true,
                            token: token,
                            slots: slots,
                            currentTime: app.get('currentTimeWithSeconds')().valueOf(),
                            timeExpires: app.get('currentTime')().valueOf() + app.get('tokenTime'),
                            message: "Correct login"
                        });
                    });
                }
            });
        } else {
            logger.info("The client need to provide data to login - IP: " + res.ipReal);
            res.status(401);
            res.json({access: false, message: "The client need to provide data to login"});
        }
    });
};
