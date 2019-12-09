module.exports = function (app) {
    app.get('/', function (req, res) {
        res.render('main/index.html', {username: req.session.username, role: req.session.role});
    });
};
