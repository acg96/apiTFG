const tableHeadersDetail = loadTableDetailsHeaders();
let rowNotificationsObject = [];
const modal = document.getElementById("modalView");
const closeButton = document.getElementsByClassName("close")[0];
const featuresDataTableLong = { //Used on details table
    "language": {
        "emptyTable": "No hay registros para mostrar",
        "lengthMenu": "Mostrar _MENU_ registros por página",
        "loadingRecords": "Cargando...",
        "processing": "Procesando...",
        "search": "Búsqueda",
        "zeroRecords": "No se han encontrado coincidencias",
        "paginate": {
            "first":      "Primera",
            "last":       "Última",
            "next":       "Siguiente",
            "previous":   "Anterior"
        },
        "info": "Mostrando página _PAGE_ de _PAGES_",
        "infoEmpty": "No hay registros disponibles",
        "infoFiltered": "(filtrado de un total de _MAX_ registros)",
        "aria": {
            "sortAscending":  ": activar para ordenar de forma ascendente",
            "sortDescending": ": activar para ordenar de forma descendente"
        }
    }
};
const featuresDataTableShort = {...featuresDataTableLong}; //copy object no reference
featuresDataTableLong["order"]= [[3, "desc"]];
featuresDataTableShort["columns"] = [
        null,
        null,
        null,
        null,
        null,
        null,
        { "orderable": false, "searchable": false}
    ];
featuresDataTableShort["order"]= [[3, "desc"], [0, "asc"]];

function openModal(option) {
    const modalContent= $('#modalContent');
    const studentSelected = option;
    $("#modalHeaderTitle").text(studentSelected);
    let htmlToLoad = "<table class='table table-hover' id='tableNotificationsDetails'>";
    htmlToLoad += tableHeadersDetail;
    htmlToLoad += "</table>";
    modalContent.append(htmlToLoad);

    for  (let i= 0; i < rowNotificationsObject.length; ++i){
        if (rowNotificationsObject[i].student === studentSelected){
            $("#tableBodyDetails").append(rowNotificationsObject[i].rowCodeLong);
            break;
        }
    }
    $('#tableNotificationsDetails').DataTable(featuresDataTableLong);
    modal.style.display = "block";
}

function hideModal() {
    modal.style.display = "none";
    $('#modalContent').empty();
}

closeButton.onclick = hideModal;

window.onclick = function(event) {
    if (event.target === modal) {
        hideModal();
    }
};

function manageRedCheckbox(){
    showFirstList($("#redCheckBox").is(":checked"));
}

function showFirstList(justReds){
    const tableNotifications = $('#tableNotifications');
    tableNotifications.empty();
    tableNotifications.append("<table class='table table-hover' id='tableNotificationsT'></table>");
    loadTableMainHeaders();
    loadTableMainRows(justReds);
    $('#tableNotificationsT').DataTable(featuresDataTableShort);
}

function showNotifications(optionSelected){
    if (optionSelected != null) {
        const redCheckBox = $('#redCheckBox');
        $('#redCheckBoxLabel').removeAttr("hidden");
        redCheckBox.removeAttr("hidden");
        const slotIdSelected = optionSelected.value;
        const jsonNotifications = $("#notificationsJson").val();
        const parseJson = JSON.parse(jsonNotifications);
        const usersArray = [];
        const userNamesArray = [];
        for (let i= 0; i < parseJson.length; ++i){
            if (parseJson[i].slotId === slotIdSelected){
                if (!userNamesArray.includes(parseJson[i].idUser)){
                    userNamesArray.push(parseJson[i].idUser);
                    usersArray[parseJson[i].idUser] = [];
                }
                usersArray[parseJson[i].idUser].push(parseJson[i]);
            }
        }

        rowNotificationsObject= [];
        const students = Object.keys(usersArray);
        for (let i= 0; i < students.length; ++i){
            rowNotificationsObject.push(loadStudent(usersArray[students[i]], students[i]));
        }
        showFirstList(redCheckBox.is(":checked"));
    }
}

function loadTableMainRows(justReds){
    let rowCode = "";
    for (let i = 0; i < rowNotificationsObject.length; ++i){
        if (justReds && rowNotificationsObject[i].noProblems) continue;
        rowCode += "<tr>";
        rowCode += "<td " + (rowNotificationsObject[i].noProblems ? "" :  "style='color:#EA4335;'") + ">" + rowNotificationsObject[i].student + "</td>";
        rowCode += "<td>" + rowNotificationsObject[i].moduleName + "</td>";
        rowCode += "<td>" + rowNotificationsObject[i].groupName + "</td>";
        rowCode += "<td data-sort=\""+ rowNotificationsObject[i].msMajorDate +"\">" + rowNotificationsObject[i].stringMajorDate + "</td>";
        rowCode += "<td>" + rowNotificationsObject[i].numberNotifications + "</td>";
        rowCode += "<td>" + (rowNotificationsObject[i].noProblems ? "No" :  "Sí") + "</td>";
        rowCode += "<td>" + "<a href='#' onclick='openModal(\""+ rowNotificationsObject[i].student +"\")'>Ver detalles</a></td>";
        rowCode += "</tr>";
    }
    $('#tableBody').append(rowCode);
}

function loadTableMainHeaders(){
    const headers= "<thead><tr><th style=\"width: 15%;\">Alumno</th><th style=\"width: 15%;\">Asignatura</th><th style=\"width: 15%;\">Grupo</th><th style=\"width: 15%;\">Última notificación</th><th style=\"width: 15%;\">Número de notificaciones</th><th style=\"width: 15%;\">¿Acciones prohibidas?</th><th style=\"width: 10%;\"></th></tr></thead><tbody id='tableBody'></tbody>";
    $('#tableNotificationsT').append(headers);
}

function loadStudent(notifications, student){
    let rowCode = "";
    let correctControl =  true; //Used to know if some notification is not normal
    let majorDate = null;
    let stringMajorDate = null;
    for (let i= 0; i < notifications.length; ++i){
        let currentControl = true;
        if (!(notifications[i].actionName === "Inicio de sesión" || notifications[i].actionName === "Comienzo de slot")){
            correctControl = false;
            currentControl = false;
        }
        if (i === 0){
            majorDate = notifications[i].actionTimeMS;
            stringMajorDate = notifications[i].actionTime;
        } else if (notifications[i].actionTimeMS > majorDate){
            majorDate = notifications[i].actionTimeMS;
            stringMajorDate = notifications[i].actionTime;
        }
        rowCode += "<tr>";
        rowCode += "<td>" + notifications[i].moduleName + "</td>";
        rowCode += "<td>" + notifications[i].groupName + "</td>";
        rowCode += "<td " + (currentControl ? "" : "style='color:#EA4335;'") + ">" + notifications[i].actionName + "</td>";
        rowCode += "<td data-sort=\""+ notifications[i].actionTimeMS +"\">" + notifications[i].actionTime + "</td>";
        rowCode += "<td>" + notifications[i].moreInfo + "</td>";
        rowCode += "<td>" + notifications[i].tofCache + "</td>";
        rowCode += "<td>" + notifications[i].extIp + "</td>";
        rowCode += "<td>" + notifications[i].intIps + "</td>";
        rowCode += "<td>" + notifications[i].somethingWrong + "</td>";
        rowCode += "</tr>";
    }
    return {
        rowCodeLong: rowCode,
        student: student.trim(),
        groupName: notifications[0].groupName,
        moduleName: notifications[0].moduleName,
        numberNotifications: notifications.length,
        noProblems: correctControl,
        stringMajorDate: stringMajorDate,
        msMajorDate: majorDate
    };
}

function loadTableDetailsHeaders(){
    return "<thead><tr><th>Asignatura</th><th>Grupo</th><th>Acción</th><th>Fecha</th><th>Más información</th>" +
        "<th>Tiempo de vuelo</th><th>IP externa</th><th>IPs internas</th><th>¿Algo raro?</th></tr></thead><tbody id='tableBodyDetails'></tbody>";
}
