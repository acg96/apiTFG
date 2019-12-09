module.exports = function (app, logger, administratorService, csvToJson) {
    app.get('/adm/file/add', function (req, res) {
        let errors= {
            anyError: 0
        };
        if (req.session.errorsDetected != null){
            errors= req.session.errorsDetected;
            req.session.errorsDetected= null;
        }
        if (req.session.errorsAdminLoad){
            errors.anyError= 1;
            req.session.errorsAdminLoad = false;
        }
        let correct = false;
        if (req.session.adminLoadCorrect){
            correct= true;
            req.session.adminLoadCorrect= false;
        }
        res.render('admin/file/add.html', {username: req.session.username, role: req.session.role, errors: errors, correct: correct});
    });

    app.post('/adm/file/add', function (req, res) {
        const postInfo= req.files;
        if (postInfo.professorsFile != null && postInfo.studentsFile != null){
            const professorsFileName= postInfo.professorsFile.name;
            const studentsFileName= postInfo.studentsFile.name;
            const extProfessorsFile= professorsFileName.split(".")[professorsFileName.split(".").length-1];
            const extStudentsFile= studentsFileName.split(".")[studentsFileName.split(".").length-1];
            if (extStudentsFile !== "csv" || extProfessorsFile !== "csv"){
                req.session.errorsAdminLoad = true;
                res.redirect("/adm/file/add");
            } else{
                const professorsFilePath= postInfo.professorsFile.tempFilePath;
                const studentsFilePath= postInfo.studentsFile.tempFilePath;
                csvToJson({
                    trim: true,
                    delimiter: ";",
                    ignoreEmpty: true,
                    noheader: false
                }).fromFile(professorsFilePath).then((jsonProfessors)=>{
                    csvToJson({
                        trim: true,
                        delimiter: ";",
                        ignoreEmpty: true,
                        noheader: false
                    }).fromFile(studentsFilePath).then((jsonStudents)=>{
                        administratorService.addFiles(jsonProfessors, jsonStudents, errors => {
                           if  (errors.anyError === 1){
                               req.session.errorsDetected = errors;
                               res.redirect("/adm/file/add");
                           } else {
                               req.session.adminLoadCorrect = true;
                               res.redirect("/adm/file/add");
                           }
                        });
                    }).catch((err) => {
                        if (err) {
                            req.session.errorsAdminLoad = true;
                            res.redirect("/adm/file/add");
                        }
                    });
                }).catch((err) => {
                    if (err){
                        req.session.errorsAdminLoad = true;
                        res.redirect("/adm/file/add");
                    }
                });
            }
        } else{
            req.session.errorsAdminLoad = true;
            res.redirect("/adm/file/add");
        }
    });
};
