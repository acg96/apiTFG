module.exports = {
    app: null,
    bdManagement: null,
    csvToJson: null,
    init: function (app, bdManagement, csvToJson) {
        this.app = app;
        this.bdManagement = bdManagement;
        this.csvToJson = csvToJson;
    },
    getJsonFromCsv: function (filePath, callback){
        this.csvToJson({
            trim: true,
            delimiter: ";",
            ignoreEmpty: true,
            noheader: false,
            checkColumn: true
        }).fromFile(filePath).then((jsonFile)=>{
            callback(jsonFile);
        }).catch((err) => {
            if (err){
                callback(null);
            }
        });
    },
    addFileProfessors: function (jsonProfessors, callback){
        const modulesGroupsProfessors= this.getModulesGroupsAndProfessors(jsonProfessors);
        let infoProfessorsCorrect= modulesGroupsProfessors.modules.length > 0 || modulesGroupsProfessors.groups.length > 0 || modulesGroupsProfessors.professors.length > 0;
        for (let i= 0; i < modulesGroupsProfessors.modules.length && infoProfessorsCorrect; ++i){
            if (typeof modulesGroupsProfessors.modules[i] === "undefined"){
                infoProfessorsCorrect= false;
            }
        }
        for (let i= 0; i < modulesGroupsProfessors.groups.length && infoProfessorsCorrect; ++i){
            if (typeof modulesGroupsProfessors.groups[i] === "undefined"){
                infoProfessorsCorrect= false;
            }
        }
        for (let i= 0; i < modulesGroupsProfessors.professors.length && infoProfessorsCorrect; ++i){
            if (typeof modulesGroupsProfessors.professors[i] === "undefined"){
                infoProfessorsCorrect= false;
            }
        }
        if (infoProfessorsCorrect){
            this.bdManagement.getModule({}, modules => {
                this.bdManagement.getUser({}, users => {
                    this.bdManagement.getClassGroup({}, groups => {
                        if (modules != null && users != null && groups != null){
                            const modulesDeleted = [];
                            for (let i= 0; i < modules.length; ++i){
                                let passed= false;
                                for (let e= 0; e < modulesGroupsProfessors.modules.length; ++e) {
                                    if (modules[i].code === modulesGroupsProfessors.modules[e].code){
                                        modulesGroupsProfessors.modules[e]._id= this.bdManagement.mongoPure.ObjectID(modules[i]._id);
                                        passed= true;
                                        break;
                                    }
                                }
                                if (!passed){
                                    modulesDeleted.push(modules[i]);
                                }
                            }
                            const studentsAdministratorsAndDeletedProfessors = [];
                            for (let i= 0; i < users.length; ++i){
                                let passed= false;
                                if (users[i].role === "professor") {
                                    for (let e = 0; e < modulesGroupsProfessors.professors.length; ++e) {
                                        if (users[i].username === modulesGroupsProfessors.professors[e].username) {
                                            modulesGroupsProfessors.professors[e]._id = this.bdManagement.mongoPure.ObjectID(users[i]._id);
                                            passed = true;
                                            break;
                                        }
                                    }
                                }
                                if (!passed){
                                    studentsAdministratorsAndDeletedProfessors.push(users[i]);
                                }
                            }
                            const groupsDeleted = [];
                            for (let i= 0; i < groups.length; ++i){
                                let passed= false;
                                for (let e= 0; e < modulesGroupsProfessors.groups.length; ++e) {
                                    if (groups[i].name === modulesGroupsProfessors.groups[e].name){
                                        modulesGroupsProfessors.groups[e]._id= this.bdManagement.mongoPure.ObjectID(groups[i]._id);
                                        modulesGroupsProfessors.groups[e].students= groups[i].students;
                                        passed= true;
                                        break;
                                    }
                                }
                                if (!passed){
                                    groupsDeleted.push(groups[i]);
                                }
                            }
                            const totalGroups = [];
                            totalGroups.push(...groupsDeleted);
                            totalGroups.push(...modulesGroupsProfessors.groups);

                            const totalModules = [];
                            totalModules.push(...modulesDeleted);
                            totalModules.push(...modulesGroupsProfessors.modules);

                            const totalUsers = [];
                            totalUsers.push(...studentsAdministratorsAndDeletedProfessors);
                            totalUsers.push(...modulesGroupsProfessors.professors);

                            //Backup the proper collections renaming them to another not existing values
                            this.bdManagement.renameCertainCollections(["users", "groups", "modules"], result => {
                                if (result) {
                                    //Load the new data
                                    this.bdManagement.addSomeUsers(totalUsers, numberOfUsersAdded => {
                                        if (numberOfUsersAdded !== totalUsers.length) {
                                            callback({
                                                anyError: 1
                                            });
                                        } else {
                                            this.bdManagement.addSomeClassGroups(totalGroups, numberOfGroupsAdded => {
                                                if (numberOfGroupsAdded !== totalGroups.length) {
                                                    callback({
                                                        anyError: 1
                                                    });
                                                } else {
                                                    //Update the modules with the group ids
                                                    this.getModulesWithGroupIds(totalModules, modulesUpdated => {
                                                        if (modulesUpdated != null) {
                                                            this.bdManagement.addSomeModules(modulesUpdated, numberOfModulesAdded => {
                                                                if (numberOfModulesAdded !== modulesUpdated.length) {
                                                                    callback({
                                                                        anyError: 1
                                                                    });
                                                                } else {
                                                                    callback({
                                                                        anyError: 0
                                                                    });
                                                                }
                                                            });
                                                        } else {
                                                            callback({
                                                                anyError: 1
                                                            });
                                                        }
                                                    });
                                                }
                                            });
                                        }
                                    });
                                } else {
                                    callback({
                                        anyError: 1
                                    });
                                }
                            });
                        } else{
                            callback({
                                anyError: 1
                            });
                        }
                    });
                });
            });

        } else{
            callback({
                anyError: 1,
                errProfessorsFile: "Formato de archivo incorrecto"
            });
        }
    },
    restoreBackup: function(backupIdentificator, callback){
        if (backupIdentificator != null && backupIdentificator.trim() !== ""){
            //Backup the current data
            this.bdManagement.renameAllCollections(result => {
                if (result){
                    //Restore the requested backup
                    const allCollectionsBaseNames= ["users", "groups", "notifications", "modules", "slots"];
                    const allCollectionsToChange= [];
                    for (let i= 0; i < allCollectionsBaseNames.length; ++i){
                        allCollectionsToChange.push(allCollectionsBaseNames[i] + backupIdentificator);
                    }
                    this.bdManagement.restoreBackup(allCollectionsToChange, backupIdentificator, resultRestoring => {
                        callback(resultRestoring);
                    });
                } else{
                    callback(false);
                }
            });
        } else{
            callback(false);
        }
    },
    getNoSlotReportList: function(callback){
        this.bdManagement.getNotifications({slotId: "-1", idUser: {$ne: null}}, notificationsList => {
            if (notificationsList != null){
                const moment = this.app.get("moment");
                const studentsArray = [];
                const studentsObjArray = [];
                for (let i = 0; i < notificationsList.length; ++i){
                    let intIps= "";
                    for (let j= 0; j < notificationsList[i].intIps.length; ++j){
                        if (j === 0){
                            intIps+= notificationsList[i].intIps[j];
                        } else{
                            intIps+= ", " + notificationsList[i].intIps[j];
                        }
                    }
                    const notificationObj = {
                        actionName:  this.app.get('actionCodeTranslation')[notificationsList[i].actionCode],
                        actionTimeMS: notificationsList[i].actionTime,
                        actionTime: moment(notificationsList[i].actionTime).format("DD MMM YYYY HH:mm:ss"),
                        moreInfo: notificationsList[i].moreInfo,
                        tofCache: notificationsList[i].tofCache ? "Activado" : "Desactivado",
                        extIp: notificationsList[i].requestExtIp === "::1" ? "localhost" : notificationsList[i].requestExtIp === null ? "localhost" : notificationsList[i].requestExtIp.replace("::ffff:", ""),
                        intIps: intIps,
                        somethingWrong: notificationsList[i].whyInfoNoCorrect
                    };
                    if (!studentsArray.includes(notificationsList[i].idUser)){
                        studentsArray.push(notificationsList[i].idUser);
                        const studentObj = {
                            username: notificationsList[i].idUser,
                            noProblems: notificationObj.actionName === "Inicio de sesión" || notificationObj.actionName === "Comienzo de slot",
                            msMajorDate: notificationObj.actionTimeMS,
                            stringMajorDate: notificationObj.actionTime,
                            numberNotifications: 1,
                            notificationsList: [notificationObj]
                        };
                        studentsObjArray.push(studentObj);
                    } else{
                        const resultArray = studentsObjArray.filter(currentStudent => currentStudent.username === notificationsList[i].idUser);
                        ++ resultArray[0].numberNotifications;
                        resultArray[0].noProblems = resultArray[0].noProblems && (notificationObj.actionName === "Inicio de sesión" || notificationObj.actionName === "Comienzo de slot");
                        resultArray[0].msMajorDate = resultArray[0].msMajorDate < notificationObj.actionTimeMS ? notificationObj.actionTimeMS : resultArray[0].msMajorDate;
                        resultArray[0].stringMajorDate = resultArray[0].msMajorDate === notificationObj.actionTimeMS ? notificationObj.actionTime : resultArray[0].stringMajorDate;
                        resultArray[0].notificationsList.push(notificationObj);
                    }
                }
                for (let i = 0; i < studentsObjArray.length; ++i){
                    studentsObjArray[i].notificationsList = JSON.stringify(studentsObjArray[i].notificationsList);
                }
                callback(studentsObjArray);
            } else{
                callback([]);
            }
        });
    },
    deleteBackup: function(backupIdentificator, callback){
        if (backupIdentificator != null && backupIdentificator.trim() !== ""){
            //Delete the requested backup
            const allCollectionsBaseNames= ["users", "groups", "notifications", "modules", "slots"];
            const allCollectionsToErase= [];
            for (let i= 0; i < allCollectionsBaseNames.length; ++i){
                allCollectionsToErase.push(allCollectionsBaseNames[i] + backupIdentificator);
            }
            this.bdManagement.deleteBackup(allCollectionsToErase, resultErasing => {
                callback(resultErasing);
            });
        } else{
            callback(false);
        }
    },
    getBackupsList: function(callback){
        this.bdManagement.getListOfCollections(collectionNames => {
            if (collectionNames != null){
                const collectionBaseNames = ["users", "groups", "notifications", "modules", "slots"];
                const backupsMsDates = [];
                for (let i= 0; i < collectionNames.length; ++i){
                    for (let e= 0; e < collectionBaseNames.length; ++e) {
                        const arrayName = collectionNames[i].split(collectionBaseNames[e]);
                        if (arrayName.length === 2 && arrayName[1].trim() !== ""){
                            const msDate = arrayName[1];
                            if (!backupsMsDates.includes(msDate)){
                                backupsMsDates.push(msDate);
                            }
                            break;
                        }
                    }
                }
                callback(backupsMsDates);
            } else{
                callback([]);
            }
        });
    },
    addFileStudents: function (jsonStudents, callback){
        this.bdManagement.getClassGroup({}, groups => {
            if (groups != null && groups.length > 0){
                const studentsAndGroupUpdatedWithStudents= this.getStudentsAndGroupsWithStudents(jsonStudents, groups);
                let infoStudentsCorrect= studentsAndGroupUpdatedWithStudents.students.length > 0 && studentsAndGroupUpdatedWithStudents.groups.length > 0;
                for (let i= 0; i < studentsAndGroupUpdatedWithStudents.students.length && infoStudentsCorrect; ++i){
                    if (typeof studentsAndGroupUpdatedWithStudents.students[i] === "undefined") {
                        infoStudentsCorrect= false;
                    }
                }
                for (let i= 0; i < studentsAndGroupUpdatedWithStudents.groups.length && infoStudentsCorrect; ++i){
                    if (typeof studentsAndGroupUpdatedWithStudents.groups[i] === "undefined") {
                        infoStudentsCorrect= false;
                    }
                }
                if (infoStudentsCorrect){
                    this.bdManagement.getUser({}, users => {
                        if (users != null){
                            const professorsAdministratorsAndDeletedStudents = [];
                            for (let i= 0; i < users.length; ++i){
                                let passed= false;
                                if (users[i].role === "student") {
                                    for (let e = 0; e < studentsAndGroupUpdatedWithStudents.students.length; ++e) {
                                        if (users[i].username === studentsAndGroupUpdatedWithStudents.students[e].username) {
                                            studentsAndGroupUpdatedWithStudents.students[e]._id = this.bdManagement.mongoPure.ObjectID(users[i]._id);
                                            passed = true;
                                            break;
                                        }
                                    }
                                }
                                if (!passed){
                                    professorsAdministratorsAndDeletedStudents.push(users[i]);
                                }
                            }
                            const totalUsers = [];
                            totalUsers.push(...professorsAdministratorsAndDeletedStudents);
                            totalUsers.push(...studentsAndGroupUpdatedWithStudents.students);
                            //Backup the proper collections renaming them to another not existing values
                            this.bdManagement.renameCertainCollections(["users", "groups"], result => {
                                if (result) {
                                    //Load the new data
                                    this.bdManagement.addSomeUsers(totalUsers, numberOfUsersAdded => {
                                        if (numberOfUsersAdded !== totalUsers.length) {
                                            callback({
                                                anyError: 1
                                            });
                                        } else {
                                            this.bdManagement.addSomeClassGroups(studentsAndGroupUpdatedWithStudents.groups, numberOfGroupsAdded => {
                                                if (numberOfGroupsAdded !== studentsAndGroupUpdatedWithStudents.groups.length) {
                                                    callback({
                                                        anyError: 1
                                                    });
                                                } else {
                                                    callback({
                                                        anyError: 0
                                                    });
                                                }
                                            });
                                        }
                                    });
                                } else{
                                    callback({
                                        anyError: 1
                                    });
                                }
                            });
                        } else{
                            callback({
                                anyError: 1
                            });
                        }
                    });
                } else {
                    callback({
                        anyError: 1,
                        errStudentsFile: "Formato de archivo incorrecto"
                    });
                }
            } else{
                callback({
                    anyError: 1,
                    errStudentsFile: "Deben haberse cargado previamente asignaturas, grupos y profesores"
                });
            }
        });
    },
    addFiles: function (professorsJson, studentsJson, callback) {
        const modulesGroupsProfessors= this.getModulesGroupsAndProfessors(professorsJson);
        let infoProfessorsCorrect= modulesGroupsProfessors.modules.length > 0 && modulesGroupsProfessors.groups.length > 0 && modulesGroupsProfessors.professors.length > 0;
        for (let i= 0; i < modulesGroupsProfessors.modules.length && infoProfessorsCorrect; ++i){
            if (typeof modulesGroupsProfessors.modules[i] === "undefined"){
                infoProfessorsCorrect= false;
            }
        }
        for (let i= 0; i < modulesGroupsProfessors.groups.length && infoProfessorsCorrect; ++i){
            if (typeof modulesGroupsProfessors.groups[i] === "undefined"){
                infoProfessorsCorrect= false;
            }
        }
        for (let i= 0; i < modulesGroupsProfessors.professors.length && infoProfessorsCorrect; ++i){
            if (typeof modulesGroupsProfessors.professors[i] === "undefined"){
                infoProfessorsCorrect= false;
            }
        }

        if (infoProfessorsCorrect){
            const studentsAndGroupUpdatedWithStudents= this.getStudentsAndGroupsWithStudents(studentsJson, modulesGroupsProfessors.groups);
            let infoStudentsCorrect= studentsAndGroupUpdatedWithStudents.students.length > 0 && studentsAndGroupUpdatedWithStudents.groups.length > 0;
            for (let i= 0; i < studentsAndGroupUpdatedWithStudents.students.length && infoStudentsCorrect; ++i){
                if (typeof studentsAndGroupUpdatedWithStudents.students[i] === "undefined") {
                    infoStudentsCorrect= false;
                }
            }
            for (let i= 0; i < studentsAndGroupUpdatedWithStudents.groups.length && infoStudentsCorrect; ++i){
                if (typeof studentsAndGroupUpdatedWithStudents.groups[i] === "undefined") {
                    infoStudentsCorrect= false;
                }
            }
            if (infoStudentsCorrect){
                const professors= modulesGroupsProfessors.professors;
                const modules= modulesGroupsProfessors.modules;
                const groups= studentsAndGroupUpdatedWithStudents.groups;
                const students= studentsAndGroupUpdatedWithStudents.students;
                //Backup all the db renaming the collections to another not existing values
                this.bdManagement.renameAllCollections(result => {
                    if (result){
                        //Load the new data
                        this.bdManagement.loadAdministrators();
                        const users= [];
                        users.push(...professors);
                        users.push(...students);
                        this.bdManagement.addSomeUsers(users, numberOfUsersAdded => {
                            if (numberOfUsersAdded !== users.length){
                                callback({
                                    anyError: 1
                                });
                            } else{
                                this.bdManagement.addSomeClassGroups(groups, numberOfGroupsAdded => {
                                    if (numberOfGroupsAdded !== groups.length){
                                        callback({
                                            anyError: 1
                                        });
                                    } else{
                                        //Update the modules with the group ids
                                        this.getModulesWithGroupIds(modules, modulesUpdated => {
                                            if (modulesUpdated != null){
                                                this.bdManagement.addSomeModules(modulesUpdated, numberOfModulesAdded => {
                                                   if (numberOfModulesAdded !== modulesUpdated.length){
                                                       callback({
                                                           anyError: 1
                                                       });
                                                   } else{
                                                       callback({
                                                           anyError: 0
                                                       });
                                                   }
                                                });
                                            } else{
                                                callback({
                                                    anyError: 1
                                                });
                                            }
                                        });
                                    }
                                });
                            }
                        });
                    } else{
                        callback({
                            anyError: 1
                        });
                    }
                });
            } else {
                callback({
                    anyError: 1,
                    errStudentsFile: "Formato de archivo incorrecto"
                });
            }
        } else {
            callback({
                anyError: 1,
                errProfessorsFile: "Formato de archivo incorrecto"
            });
        }
    },
    getModulesWithGroupIds: function (modules, callback){
        this.bdManagement.getClassGroup({}, groups => {
            if (groups != null && groups.length > 0){
                for (let i= 0; i < groups.length; ++i){
                    const currentGroup = groups[i];
                    const currentGroupModuleAbbr = currentGroup.name.split(".L.")[0];
                    for (let e = 0; e < modules.length; ++e){
                        const currentModule = modules[e];
                        if (currentGroupModuleAbbr === currentModule.shortName && !currentModule.groupsIds.includes(currentGroup._id.toString())){
                            currentModule.groupsIds.push(currentGroup._id.toString());
                        }
                    }
                }
                callback(modules);
            } else{
                callback(null);
            }
        });
    },
    getStudentsAndGroupsWithStudents: function (studentsJson, groups){
        try {
            const students = [];
            for (let i = 0; i < studentsJson.length; ++i) {
                const student = {
                    username: studentsJson[i]['Email universidad'].split("@")[0].toUpperCase(),
                    password: this.app.get("crypto").createHmac('sha256', this.app.get('passKey'))
                        .update("654321").digest('hex'),
                    role: "student"
                };
                const res = students.filter(current => current.username === student.username);
                if (res.length === 0) {
                    students.push(student);
                }
            }
            for (let i = 0; i < groups.length; ++i) {
                const moduleShortName = groups[i].name.split(".L.")[0];
                const groupNumber = groups[i].groupNumber;
                let groupModified = false;
                const studentsCurrentGroup = groups[i].students;
                groups[i].students= [];
                for (let e = 0; e < studentsJson.length; ++e) {
                    if (studentsJson[e][moduleShortName] != null && studentsJson[e][moduleShortName] === groupNumber) {
                        groupModified = true;
                        if (!groups[i].students.includes(studentsJson[e]['Email universidad'].split("@")[0].toUpperCase())) {
                            groups[i].students.push(studentsJson[e]['Email universidad'].split("@")[0].toUpperCase());
                        }
                    }
                }
                if (!groupModified){
                    groups[i].students= studentsCurrentGroup;
                }
            }
            return {
                students: students,
                groups: groups
            };
        } catch(error){
            return {
                students: [],
                groups: []
            }
        }
    },
    getModulesGroupsAndProfessors: function (professorsJson){
        try {
            const modules = [];
            const laboratoryProfessors = []; //Used on the next step to avoid repeating the loop with all the professors including theory lessons
            for (let i = 0; i < professorsJson.length; ++i) {
                if (professorsJson[i].Modalidad === "Prácticas de Laboratorio") {
                    const module = {
                        name: professorsJson[i]['Asignatura-largo'],
                        shortName: professorsJson[i].Asignatura,
                        code: professorsJson[i]['Código'],
                        year: professorsJson[i].Curso,
                        term: professorsJson[i].Semestre,
                        groupsIds: []
                    };
                    const res = modules.filter(current => current.code === module.code);
                    if (res.length === 0) {
                        modules.push(module);
                    }
                    laboratoryProfessors.push(professorsJson[i]);
                }
            }
            const groups = [];
            for (let e = 0; e < laboratoryProfessors.length; ++e) {
                const group = {
                    name: laboratoryProfessors[e].Grupo,
                    groupNumber: laboratoryProfessors[e].Grupo.split(".L.")[laboratoryProfessors[e].Grupo.split(".L.").length - 1],
                    professors: [],
                    students: []
                };
                const res = groups.filter(current => current.name === group.name);
                if (res.length === 0) {
                    groups.push(group);
                }
            }
            const professors = [];
            for (let i = 0; i < groups.length; ++i) {
                for (let e = 0; e < laboratoryProfessors.length; ++e) {
                    if (groups[i].name === laboratoryProfessors[e].Grupo) {
                        if (!groups[i].professors.includes(laboratoryProfessors[e].CorreoProfesor)) {
                            groups[i].professors.push(laboratoryProfessors[e].CorreoProfesor);
                        }
                    }
                    const professor = {
                        username: laboratoryProfessors[e].CorreoProfesor,
                        password: this.app.get("crypto").createHmac('sha256', this.app.get('passKey'))
                            .update("123456").digest('hex'),
                        role: "professor",
                        name: laboratoryProfessors[e].Profesores
                    };
                    const res = professors.filter(current => current.username === professor.username);
                    if (res.length === 0) {
                        professors.push(professor);
                    }
                }
            }
            return {
                modules: modules,
                groups: groups,
                professors: professors
            };
        } catch(error){
            return {
                modules: [],
                groups: [],
                professors: []
            };
        }
    }
};
