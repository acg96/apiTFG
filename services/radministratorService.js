module.exports = {
    app: null,
    bdManagement: null,
    init: function (app, bdManagement) {
        this.app = app;
        this.bdManagement = bdManagement;
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
                for (let e = 0; e < studentsJson.length; ++e) {
                    if (studentsJson[e][moduleShortName] != null && studentsJson[e][moduleShortName] === groupNumber) {
                        if (!groups[i].students.includes(studentsJson[e]['Email universidad'].split("@")[0].toUpperCase())) {
                            groups[i].students.push(studentsJson[e]['Email universidad'].split("@")[0].toUpperCase());
                        }
                    }
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
