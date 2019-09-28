module.exports = function (app, bdManagement, logger, userApiService) {
    app.post("/api/login", function (req, res) {
        if (req.body.password && req.body.username) {
            userApiService.getUserToken(req.body.username, req.body.password, token => {
                if (token == null){
                    logger.info("Incorrect login. Username: " + req.body.username + " - IP: " + req.ip);
                    res.status(401);
                    res.json({access: false, message: 'Incorrect login'});
                } else{
                    userApiService.getUrls(req.body.username, slots => {
                        logger.info("The user " + req.body.username + " has logged in - IP: " + req.ip);
                        res.status(200);
                        res.json({
                            access: true,
                            token: token,
                            slots: slots,
                            message: "Correct login"
                        });
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
