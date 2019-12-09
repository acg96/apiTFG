module.exports = function (app, logger, administratorService, fs) {
    app.get('/adm/file/add', function (req, res) {
        const errors= {
            anyError: 0
        };
        if (req.session.errorsAdminLoad){
            errors.anyError= 1;
            req.session.errorsAdminLoad = false;
        }
        res.render('admin/file/add.html', {username: req.session.username, role: req.session.role, errors: errors});
    });

    app.post('/adm/file/add', function (req, res) {
        const postInfo= req.body;
        if (postInfo.professorsFile != null && postInfo.studentsFile != null){
            const professorsFileName= postInfo.professorsFile;
            const studentsFileName= postInfo.studentsFile;
            const extProfessorsFile= professorsFileName.split(".")[professorsFileName.split(".").length-1];
            const extStudentsFile= studentsFileName.split(".")[studentsFileName.split(".").length-1];
            if (extStudentsFile !== "csv" || extProfessorsFile !== "csv"){
                req.session.errorsAdminLoad = true;
                res.redirect("/adm/file/add");
            } else{

            }
        } else{
            req.session.errorsAdminLoad = true;
            res.redirect("/adm/file/add");
        }
    });
};
