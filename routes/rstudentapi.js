module.exports = function (app, bdManagement, logger) {
    app.get("/api/std/checkAccess", function (req, res) {
        var username= res.user;
        var urlEncoded= req.query.url_;
        var urlDecoded= decodeURIComponent(urlEncoded);
        var response= {result: false};
		var arrayValid= ["UO111111", "MARGA", "BELEN", "ALEX"];
        if (arrayValid.includes(username)) {
            response.result= true;
        }
        if (response.result) {
            logger.info("Access granted to user " + res.user + ". URL: " + urlDecoded + " - IP: " + req.ip);
            res.status(200);
            res.json({access: true, message: 'Access granted', privileges: true});
        } else {
            logger.info("Access denied to user " + res.user + ". URL: " + urlDecoded + " - IP: " + req.ip);
            res.status(403);
            res.json({access: true, message: 'Access denied', privileges: false});
        }
    });
};
