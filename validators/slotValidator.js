module.exports = {
    validateAddSlot: function(app, postInfo, bdManagement, username, callback) {
        if (postInfo == null || postInfo.initDate == null ||  postInfo.initTime == null || postInfo.endDate == null || postInfo.endTime == null || postInfo.description == null ||
            postInfo.moduleSelect == null || postInfo.groupsIncluded == null || postInfo.listRadio == null || postInfo.urls == null || postInfo.studentsExcluded == null){
            callback(null, null);
        } else {
            const moment = app.get('moment');
            const currentTimeDate = app.get('currentTime')();
            const errors = {
                errInitDate: '',
                errInitTime: '',
                errEndDate: '',
                errEndTime: '',
                errDescription: '',
                errModuleSelect: '',
                errGroupsIncluded: '',
                errListRadio: '',
                errUrls: '',
                errStudentsExcluded: '',
                anyError: 0
            };

            const processedResult = {
                description: '',
                startTime: '',
                endTime: '',
                listMode: '',
                urls: [],
                groupIds: [],
                studentsExcluded: [],
                author: ""
            };

            if (postInfo.initDate.trim() === '') {
                errors.errInitDate = 'La fecha inicial no puede estar vacía';
                errors.anyError = 1;
            } else if (!moment(postInfo.initDate.trim(), 'YYYY-MM-DD', true).isValid()) {
                errors.errInitDate = 'La fecha inicial no tiene el formato adecuado o es inválida';
                errors.anyError = 1;
            } else {
                const initDate = moment(postInfo.initDate.trim(), 'YYYY-MM-DD', true);
                const currentDate = moment([currentTimeDate.year(), currentTimeDate.month(), currentTimeDate.date()]);
                if (!currentDate.isSameOrBefore(initDate)) {
                    errors.errInitDate = 'La fecha inicial no puede ser anterior a la fecha de hoy';
                    errors.anyError = 1;
                }
            }

            if (postInfo.initTime.trim() === "") {
                errors.errInitTime = 'La hora inicial no puede estar vacía';
                errors.anyError = 1;
            } else if (!moment(postInfo.initTime.trim(), 'HH:mm', true).isValid()) {
                errors.errInitTime = 'La hora inicial no tiene el formato adecuado o es inválida';
                errors.anyError = 1;
            }

            if (postInfo.endTime.trim() === "") {
                errors.errEndTime = 'La hora final no puede estar vacía';
                errors.anyError = 1;
            } else if (!moment(postInfo.endTime.trim(), 'HH:mm', true).isValid()) {
                errors.errEndTime = 'La hora final no tiene el formato adecuado o es inválida';
                errors.anyError = 1;
            }

            if (postInfo.endDate.trim() === '') {
                errors.errEndDate = 'La fecha final no puede estar vacía';
                errors.anyError = 1;
            } else if (!moment(postInfo.endDate.trim(), 'YYYY-MM-DD', true).isValid()) {
                errors.errEndDate = 'La fecha final no tiene el formato adecuado o es inválida';
                errors.anyError = 1;
            } else if (errors.errEndTime === "" && errors.errInitDate === "" && errors.errInitTime === "") {
                const currentDate = moment([currentTimeDate.year(), currentTimeDate.month(), currentTimeDate.date(), currentTimeDate.hour(), currentTimeDate.minute()]);
                const endDate = moment(postInfo.endDate.trim() + " " + postInfo.endTime.trim(), 'YYYY-MM-DD HH:mm', true);
                if (!currentDate.isBefore(endDate)) {
                    errors.errEndDate = 'La fecha final no puede ser anterior o igual a la fecha de hoy';
                    errors.anyError = 1;
                }
                const initDate = moment(postInfo.initDate.trim() + " " + postInfo.initTime.trim(), 'YYYY-MM-DD HH:mm', true);
                if (!initDate.isBefore(endDate)) {
                    errors.errEndDate = 'La fecha final no puede ser anterior o igual a la fecha inicial teniendo en cuenta la hora';
                    errors.anyError = 1;
                }
                if (errors.errEndDate === "") {
                    processedResult.startTime = initDate.valueOf();
                    processedResult.endTime = endDate.valueOf();
                }
            }

            if (postInfo.description.trim() === "") {
                errors.errDescription = "La descripción no puede estar vacía";
                errors.anyError = 1;
            } else if (postInfo.description.trim().length > 100) {
                errors.errDescription = "La descripción no puede contener más de 100 caracteres";
                errors.anyError = 1;
            } else {
                let encodedDescription = "";
                const description = postInfo.description.trim();
                const codesAllowed = [225, 32, 193, 233, 201, 237, 205, 243, 211, 250, 218, 220, 252, 209, 241, 191]; //á whiteSpace Á é É í Í ó Ó ú Ú Ü ü Ñ ñ ¿
                for (let i = 0; i < description.length; ++i) {
                    let currentCharacterEncoded = description[i];
                    if (!codesAllowed.includes(description[i].charCodeAt(0))) {
                        currentCharacterEncoded = encodeURI(description[i]);
                    }
                    encodedDescription += currentCharacterEncoded;
                }
                processedResult.description = encodedDescription;
            }

            if (postInfo.listRadio.trim() !== "whitelist" && postInfo.listRadio.trim() !== "blacklist") {
                errors.errListRadio = "El tipo de lista no es válido";
                errors.anyError = 1;
            } else {
                processedResult.listMode = postInfo.listRadio.trim();
            }

            if (postInfo.urls.trim() === "") {
                errors.errUrls = "Debes indicar al menos 1 url";
                errors.anyError = 1;
            } else {
                const arrayUrls = postInfo.urls.trim().split("%$-%5$%-$7-%$-8%$-9%$");
                if (arrayUrls.length === 0) {
                    errors.errUrls = "Debes indicar al menos 1 url";
                    errors.anyError = 1;
                } else {
                    const correctUrls = [];
                    for (let i = 0; i < arrayUrls.length; ++i) {
                        try {
                            const urlFormat = new URL(arrayUrls[i].trim().toLowerCase());
                            const urlCorrect = urlFormat.origin;
                            if (!correctUrls.includes(urlCorrect)) {
                                correctUrls.push(urlCorrect);
                            }
                        }catch(e){}
                    }
                    if (correctUrls.length === 0){
                        errors.errUrls = "Las url no son válidas";
                        errors.anyError = 1;
                    } else {
                        processedResult.urls = correctUrls;
                    }
                }
            }

            let arrayStudentsExcluded = [];

            if (postInfo.studentsExcluded.trim() !== "") {
                const tempArrayStudentsExcluded = postInfo.studentsExcluded.split("%$-%5$%-$7-%$-8%$-9%$");
                if (tempArrayStudentsExcluded.length === 0) {
                    errors.errStudentsExcluded = "El valor de los estudiantes excluidos no es válido";
                    errors.anyError = 1;
                }
                for (let i = 0; i < tempArrayStudentsExcluded.length; ++i) {
                    const studentValue = tempArrayStudentsExcluded[i].trim().toUpperCase();
                    if (!arrayStudentsExcluded.includes(studentValue)) {
                        arrayStudentsExcluded.push(studentValue);
                    }
                }
            }

            let arrayGroupsIncluded = [];

            if (postInfo.groupsIncluded.trim() !== "") {
                const tempArrayGroupsIncluded = postInfo.groupsIncluded.split("%$-%5$%-$7-%$-8%$-9%$");
                if (tempArrayGroupsIncluded.length === 0) {
                    errors.errGroupsIncluded = "El valor de los grupos incluidos no es válido";
                    errors.anyError = 1;
                }
                for (let i = 0; i < tempArrayGroupsIncluded.length; ++i) {
                    const groupValue = tempArrayGroupsIncluded[i].trim();
                    if (!arrayGroupsIncluded.includes(groupValue)) {
                        arrayGroupsIncluded.push(groupValue);
                    }
                }
            } else{
                errors.errGroupsIncluded = "Debes incluir al menos un grupo";
                errors.anyError = 1;
            }

            if (postInfo.moduleSelect.trim() === "") {
                errors.errModuleSelect = "Se debe seleccionar una asignatura";
                errors.anyError = 1;
                callback(errors, processedResult);
            } else {
                const moduleId = postInfo.moduleSelect.trim().split("%%65&4-%.43%%")[0].trim();
                if (moduleId.length !== 24) {
                    errors.errModuleSelect = "El id de la asignatura seleccionada es incorrecto";
                    errors.anyError = 1;
                    callback(errors, processedResult);
                } else if (errors.errStudentsExcluded === "" && errors.errGroupsIncluded === "") {
                    const moduleCriteria = {
                        _id: bdManagement.mongoPure.ObjectID(moduleId)
                    };
                    bdManagement.getModule(moduleCriteria, modules => {
                        if (modules == null || modules.length !== 1) {
                            errors.errModuleSelect = "El id de la asignatura seleccionada es incorrecto";
                            errors.anyError = 1;
                            callback(errors, processedResult);
                        } else{
                            const module = modules[0];
                            const stringGroupIds = module.groupsIds;
                            let controlIncludedGroups = true;
                            const arrayGroupsIncludedObj = [];
                            //Check all the included groups are included on the selected module
                            for (let i= 0; i < arrayGroupsIncluded.length; ++i){
                                if (!stringGroupIds.includes(arrayGroupsIncluded[i])){
                                    controlIncludedGroups = false;
                                    break;
                                } else{
                                    arrayGroupsIncludedObj.push(bdManagement.mongoPure.ObjectID(arrayGroupsIncluded[i]));
                                }
                            }
                            if (controlIncludedGroups){
                                const groupIdsObject = [];
                                for (let i= 0; i < stringGroupIds.length; ++i){
                                    groupIdsObject.push(bdManagement.mongoPure.ObjectID(stringGroupIds[i]));
                                }
                                bdManagement.getClassGroup({_id: {$in: groupIdsObject}, professors: username}, userGroups => {
                                    if (userGroups == null || userGroups.length === 0) {
                                        errors.errModuleSelect = "El id de la asignatura seleccionada es incorrecto";
                                        errors.anyError = 1;
                                        callback(errors, processedResult);
                                    } else {
                                        bdManagement.getClassGroup({_id: {$in: arrayGroupsIncludedObj}}, groups => { //Just get the selected groups
                                            if (groups != null){
                                                const allStudentsArray = [];
                                                for (let i= 0; i < groups.length; ++i){
                                                    allStudentsArray.push(...groups[i].students);
                                                }
                                                let controlExcluded = 0;
                                                for (let i = 0; i < arrayStudentsExcluded.length; ++i) {
                                                    if (!allStudentsArray.includes(arrayStudentsExcluded[i])) {
                                                        controlExcluded = 1;
                                                        break;
                                                    }
                                                }
                                                if (controlExcluded === 1) {
                                                    errors.errStudentsExcluded = "Algún estudiante excluido no pertenece al grupo seleccionado";
                                                    errors.anyError = 1;
                                                } else if (allStudentsArray.length === arrayStudentsExcluded.length && allStudentsArray.length !== 0) {
                                                    errors.errStudentsExcluded = "No se puede excluir a todos los alumnos de los grupos seleccionados";
                                                    errors.anyError = 1;
                                                } else if (allStudentsArray.length === 0) {
                                                    errors.errGroupsIncluded = "Los grupos seleccionados no tienen estudiantes asignados";
                                                    errors.anyError = 1;
                                                }
                                                if (errors.errStudentsExcluded === "" && errors.errModuleSelect === "" && errors.errGroupsIncluded === "") {
                                                    processedResult.groupIds = arrayGroupsIncluded;
                                                    processedResult.studentsExcluded = arrayStudentsExcluded;
                                                    processedResult.author = username;
                                                }
                                            }
                                            callback(errors, processedResult);
                                        });
                                    }
                                });
                            } else{
                                errors.errGroupsIncluded = "Los grupos seleccionados no pertenecen a la asignatura elegida";
                                errors.anyError = 1;
                                callback(errors, processedResult);
                            }
                        }
                    });
                } else{
                    callback(errors, processedResult);
                }
            }
        }
    }
};
