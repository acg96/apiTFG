module.exports = {
    validateAddSlot: function(app, postInfo, bdManagement, username, callback) {
        if (postInfo == null || postInfo.initDate == null ||  postInfo.initTime == null || postInfo.endDate == null || postInfo.endTime == null || postInfo.description == null ||
            postInfo.groupSelect == null || postInfo.listRadio == null || postInfo.urls == null || postInfo.studentsExcluded == null){
            callback(null, null);
        } else {
            const moment = app.get('moment');
            const currentTimeDate = new Date();
            const errors = {
                errInitDate: '',
                errInitTime: '',
                errEndDate: '',
                errEndTime: '',
                errDescription: '',
                errGroupSelect: '',
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
                groupName: '',
                groupId: '',
                studentsExcluded: []
            };

            if (postInfo.initDate.trim() === '') {
                errors.errInitDate = 'La fecha inicial no puede estar vacía';
                errors.anyError = 1;
            } else if (!moment(postInfo.initDate.trim(), 'YYYY-MM-DD', true).isValid()) {
                errors.errInitDate = 'La fecha inicial no tiene el formato adecuado o es inválida';
                errors.anyError = 1;
            } else {
                const initDate = moment(postInfo.initDate.trim(), 'YYYY-MM-DD', true);
                const currentDate = moment([currentTimeDate.getFullYear(), currentTimeDate.getMonth(), currentTimeDate.getDate()]);
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
                const currentDate = moment([currentTimeDate.getFullYear(), currentTimeDate.getMonth(), currentTimeDate.getDate(), currentTimeDate.getHours(), currentTimeDate.getMinutes()]);
                const endDate = moment(postInfo.endDate.trim() + " " + postInfo.endTime.trim(), 'YYYY-MM-DD HH:mm', true);
                if (!currentDate.isBefore(endDate)) {
                    errors.errEndDate = 'La fecha final no puede ser anterior o igual a la fecha de hoy';
                    errors.anyError = 1;
                }
                const initDate = moment(postInfo.initDate.trim() + " " + postInfo.initTime.trim(), 'YYYY-MM-DD HH:mm', true);
                if (!initDate.isBefore(endDate)) {
                    errors.errEndDate = 'La fecha final no puede ser anterior o igual a la fecha inicial';
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

            if (postInfo.groupSelect.trim() === "") {
                errors.errGroupSelect = "Se debe seleccionar un grupo";
                errors.anyError = 1;
            } else {
                const groupId = postInfo.groupSelect.trim().split("%%65&4-%.43%%")[0].trim();
                if (groupId.length !== 24) {
                    errors.errGroupSelect = "El id del grupo seleccionado es incorrecto";
                    errors.anyError = 1;
                } else if (errors.errStudentsExcluded === "") {
                    const criteriaGroup = {
                        _id: bdManagement.mongo.ObjectID(groupId),
                        professors: username
                    };
                    bdManagement.getClassGroup(criteriaGroup, groups => {
                        if (groups == null || groups.length !== 1) {
                            errors.errGroupSelect = "El id del grupo seleccionado es incorrecto";
                            errors.anyError = 1;
                        } else {
                            const group = groups[0];
                            let controlExcluded = 0;
                            for (let i = 0; i < arrayStudentsExcluded.length; ++i) {
                                if (!group.students.includes(arrayStudentsExcluded[i])) {
                                    controlExcluded = 1;
                                    break;
                                }
                            }
                            if (controlExcluded === 1) {
                                errors.errStudentsExcluded = "Algún estudiante excluido no pertenece al grupo seleccionado";
                                errors.anyError = 1;
                            } else if (group.students.length === arrayStudentsExcluded.length && group.students.length !== 0) {
                                errors.errStudentsExcluded = "No se puede excluir a todos los alumnos de un grupo";
                                errors.anyError = 1;
                            } else if (group.students.length === 0) {
                                errors.errGroupSelect = "El grupo seleccionado no tiene alumnos asignados";
                                errors.anyError = 1;
                            }
                            if (errors.errStudentsExcluded === "" && errors.errGroupSelect === "") {
                                processedResult.groupName = group.name;
                                processedResult.groupId = group._id;
                                processedResult.studentsExcluded = arrayStudentsExcluded;
                            }
                            callback(errors, processedResult);
                        }
                    });
                }
            }
        }
    }
}
