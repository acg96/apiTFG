module.exports = function (app, logger, administratorService) {
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

    app.get('/adm/back/rest', function (req, res) {
        let errors= null;
        if (req.session.errorsBackupDetected != null){
            errors= req.session.errorsBackupDetected;
            req.session.errorsBackupDetected= null;
        }
        let correct= null;
        if (req.session.correctBackupDetected != null){
            correct= req.session.correctBackupDetected;
            req.session.correctBackupDetected= null;
        }
        administratorService.getBackupsList(dateMsStringList => {
            const moment = app.get("moment");
            const objsBackupList = [];
            //Order the dates from major to minor
            dateMsStringList.sort((a, b) => {
                const aInt = parseFloat(a);
                const bInt = parseFloat(b);
                return b - a;
            });
            for (let i= 0; i < dateMsStringList.length; ++i){
                const objBackupList = {
                    backupMS: parseFloat(dateMsStringList[i]),
                    dateToShow: moment(parseFloat(dateMsStringList[i])).format("DD MMM YYYY HH:mm")
                };
                objsBackupList.push(objBackupList);
            }
            res.render('admin/backup/restore.html', {username: req.session.username, role: req.session.role, errors: errors, correct: correct, backups: objsBackupList});
        });
    });

    app.post('/adm/back/rest', function (req, res) {
        const optSelected = req.body.backupSelector;
        
    });

    app.post('/adm/file/add', function (req, res) {
        const postInfo= req.files;
        if (postInfo.professorsFile != null && postInfo.studentsFile != null && postInfo.professorsFile.size !== 0 && postInfo.studentsFile.size !== 0){
            const professorsFileName= postInfo.professorsFile.name;
            const studentsFileName= postInfo.studentsFile.name;
            const extProfessorsFile= professorsFileName.split(".")[professorsFileName.split(".").length-1];
            const extStudentsFile= studentsFileName.split(".")[studentsFileName.split(".").length-1];
            if (extStudentsFile !== "csv" || extProfessorsFile !== "csv"){
                req.session.errorsAdminLoad = true;
                logger.info("Error loading structure files by " + req.session.username + ". Not csv files provided - IP: " + res.ipReal);
                res.redirect("/adm/file/add");
            } else{
                const professorsFilePath= postInfo.professorsFile.tempFilePath;
                const studentsFilePath= postInfo.studentsFile.tempFilePath;
                administratorService.getJsonFromCsv(professorsFilePath, jsonProfessors => {
                    if (jsonProfessors != null){
                        administratorService.getJsonFromCsv(studentsFilePath, jsonStudents => {
                            if (jsonStudents != null){
                                administratorService.addFiles(jsonProfessors, jsonStudents, errors => {
                                    if  (errors.anyError === 1){
                                        req.session.errorsDetected = errors;
                                        logger.info("Error loading structure files by " + req.session.username + ". Error while adding files - IP: " + res.ipReal);
                                        res.redirect("/adm/file/add");
                                    } else {
                                        req.session.adminLoadCorrect = true;
                                        logger.info("Structure files loaded by " + req.session.username + " - IP: " + res.ipReal);
                                        res.redirect("/adm/file/add");
                                    }
                                });
                            } else{
                                req.session.errorsDetected= {
                                    anyError: 1,
                                    errStudentsFile: "El archivo está conformado de forma incorrecta"
                                };
                                logger.info("Error loading structure files by " + req.session.username + ". Students file structure invalid - IP: " + res.ipReal);
                                res.redirect("/adm/file/add");
                            }
                        });
                    } else{
                        req.session.errorsDetected= {
                            anyError: 1,
                            errProfessorsFile: "El archivo está conformado de forma incorrecta"
                        };
                        logger.info("Error loading structure files by " + req.session.username + ". Professors file structure invalid - IP: " + res.ipReal);
                        res.redirect("/adm/file/add");
                    }
                });
            }
        } else if (postInfo.professorsFile != null && postInfo.professorsFile.size !== 0){
            //Check the extension file
            const professorsFileName= postInfo.professorsFile.name;
            const extProfessorsFile= professorsFileName.split(".")[professorsFileName.split(".").length-1];
            if (extProfessorsFile !== "csv"){
                req.session.errorsDetected= {
                    anyError: 1,
                    errProfessorsFile: "El archivo no es un csv"
                };
                logger.info("Error loading structure files by " + req.session.username + ". Not csv file provided - IP: " + res.ipReal);
                res.redirect("/adm/file/add");
            } else{
                const professorsFilePath= postInfo.professorsFile.tempFilePath;
                administratorService.getJsonFromCsv(professorsFilePath, jsonProfessors => {
                    if (jsonProfessors != null) {
                        administratorService.addFileProfessors(jsonProfessors, errors => {
                            if  (errors.anyError === 1){
                                req.session.errorsDetected = errors;
                                logger.info("Error loading professor structure file by " + req.session.username + ". Error while adding file - IP: " + res.ipReal);
                                res.redirect("/adm/file/add");
                            } else {
                                req.session.adminLoadCorrect = true;
                                logger.info("Professor structure file loaded by " + req.session.username + " - IP: " + res.ipReal);
                                res.redirect("/adm/file/add");
                            }
                        });
                    } else{
                        req.session.errorsDetected= {
                            anyError: 1,
                            errProfessorsFile: "El archivo está conformado de forma incorrecta"
                        };
                        logger.info("Error loading structure files by " + req.session.username + ". Professors file structure invalid - IP: " + res.ipReal);
                        res.redirect("/adm/file/add");
                    }
                });
            }
        } else if (postInfo.studentsFile != null && postInfo.studentsFile.size !== 0){
            //Check the extension file
            const studentsFileName= postInfo.studentsFile.name;
            const extStudentsFile= studentsFileName.split(".")[studentsFileName.split(".").length-1];
            if (extStudentsFile !== "csv"){
                req.session.errorsDetected= {
                    anyError: 1,
                    errStudentsFile: "El archivo no es un csv"
                };
                logger.info("Error loading structure files by " + req.session.username + ". Not csv file provided - IP: " + res.ipReal);
                res.redirect("/adm/file/add");
            } else{
                const studentsFilePath= postInfo.studentsFile.tempFilePath;
                administratorService.getJsonFromCsv(studentsFilePath, jsonStudents => {
                    if (jsonStudents != null){
                        administratorService.addFileStudents(jsonStudents, errors => {
                            if  (errors.anyError === 1){
                                req.session.errorsDetected = errors;
                                logger.info("Error loading students structure file by " + req.session.username + ". Error while adding file - IP: " + res.ipReal);
                                res.redirect("/adm/file/add");
                            } else {
                                req.session.adminLoadCorrect = true;
                                logger.info("Student structure file loaded by " + req.session.username + " - IP: " + res.ipReal);
                                res.redirect("/adm/file/add");
                            }
                        });
                    } else{
                        req.session.errorsDetected= {
                            anyError: 1,
                            errStudentsFile: "El archivo está conformado de forma incorrecta"
                        };
                        logger.info("Error loading structure files by " + req.session.username + ". Students file structure invalid - IP: " + res.ipReal);
                        res.redirect("/adm/file/add");
                    }
                });
            }
        }else{
            req.session.errorsAdminLoad = true;
            logger.info("Error loading structure files by " + req.session.username + ". Files not found - IP: " + res.ipReal);
            res.redirect("/adm/file/add");
        }
    });
};
