const tableHeadersDetail = loadTableDetailsHeaders();
let rowNotificationsObject = [];
const modal = document.getElementById("modalView");
const closeButton = document.getElementsByClassName("close")[0];

function openModal(option) {
    const modalContent= $('#modalContent');
    const studentSelected = option;
    let htmlToLoad = "<table class='table table-hover' id='tableNotificationsDetails'>";
    htmlToLoad += tableHeadersDetail;
    for  (let i= 0; i < rowNotificationsObject.length; ++i){
        if (rowNotificationsObject[i].student === studentSelected){
            htmlToLoad += rowNotificationsObject[i].rowCodeLong;
            break;
        }
    }
    htmlToLoad += "</table>";
    modalContent.append(htmlToLoad);
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
}

function showNotifications(optionSelected){
    if (optionSelected != null) {
        $('#tableNotifications').empty();
        const groupIdSelected = optionSelected.value;
        const jsonNotifications = $("#studentsJson").val();
        const parseJson = JSON.parse(jsonNotifications);
        const students = Object.keys(parseJson[groupIdSelected]);
        rowNotificationsObject= [];
        for (let i= 0; i < students.length; ++i){
            rowNotificationsObject.push(loadStudent(parseJson[groupIdSelected][students[i]], students[i]));
        }
        loadTableMainHeaders();
        loadTableMainRows();
    }
}

function loadTableMainRows(){
    let rowCode = "";
    for (let i = 0; i < rowNotificationsObject.length; ++i){
        rowCode += "<tr>";
        rowCode += "<td " + (rowNotificationsObject[i].noProblems ? "" :  "style='color:#EA4335;'") + ">" + rowNotificationsObject[i].student + "</td>";
        rowCode += "<td>" + rowNotificationsObject[i].numberNotifications + "</td>";
        rowCode += "<td>" + (rowNotificationsObject[i].noProblems ? "No" :  "Sí") + "</td>";
        rowCode += "<td>" + "<a href='#' onclick='openModal(\""+ rowNotificationsObject[i].student +"\")'>Ver detalles</a></td>";
        rowCode += "</tr>";
    }
    $('#tableBody').append(rowCode);
}

function loadTableMainHeaders(){
    const headers= "<thead><tr><th class='tableHeaders' style=\"width: 40%;\">Alumno</th><th class='tableHeaders' style=\"width: 30%;\">Número de notificaciones</th><th class='tableHeaders' style=\"width: 15%;\">¿Acciones prohibidas?</th><th class='tableHeaders' style=\"width: 15%;\"></th></tr></thead><tbody id='tableBody'></tbody>";
    $('#tableNotifications').append(headers);
}

function loadStudent(notifications, student){
    let rowCode = "";
    let correctControl =  true; //Used to know if some notification is not normal
    let firstRow = "";
    for (let i= 0; i < notifications.length; ++i){
        let currentControl = true;
        if (!(notifications[i].actionName === "Inicio de sesión" || notifications[i].actionName === "Comienzo de slot")){
            correctControl = false;
            currentControl = false;
        }
        if (i!== 0) rowCode += "<tr>";
        rowCode += "<td>" + notifications[i].slotDescription + "</td>";
        rowCode += "<td " + (currentControl ? "" : "style='color:#EA4335;'") + ">" + notifications[i].actionName + "</td>";
        rowCode += "<td>" + notifications[i].actionTime + "</td>";
        rowCode += "<td>" + notifications[i].moreInfo + "</td>";
        rowCode += "<td>" + notifications[i].tofCache + "</td>";
        rowCode += "<td>" + notifications[i].extIp + "</td>";
        rowCode += "<td>" + notifications[i].intIps + "</td>";
        rowCode += "<td>" + notifications[i].somethingWrong + "</td>";
        if (i!== 0) rowCode += "</tr>";
        if (i === 0){
            firstRow = rowCode;
            rowCode = "";
        }
    }
    let firstCell = "<tr> <td ";
    if (!correctControl){
        firstCell += "style='color:#EA4335;' ";
    }
    firstRow = firstCell + "rowspan='" + notifications.length + "'>" + student + "</td>" + firstRow + "</tr>";
    rowCode = firstRow + rowCode;
    const returnObject = {
      rowCodeLong: rowCode,
      student: student.trim(),
      numberNotifications: notifications.length,
      noProblems: correctControl
    };
    return returnObject;
}

function loadTableDetailsHeaders(){
    const headers= "<thead><tr><th class='tableHeaders' style=\"width: 10%;\">Alumno</th><th class='tableHeaders' style=\"width: 10%;\">Slot</th><th class='tableHeaders' style=\"width: 10%;\">Acción</th><th class='tableHeaders' style=\"width: 10%;\">Fecha</th><th class='tableHeaders' style=\"width: 15%;\">Más información</th>" +
        "<th class='tableHeaders' style=\"width: 10%;\">Tiempo de vuelo</th><th class='tableHeaders' style=\"width: 10%;\">IP externa</th><th class='tableHeaders' style=\"width: 10%;\">IPs internas</th><th class='tableHeaders' style=\"width: 15%;\">¿Algo raro?</th></tr></thead><tbody id='tableBody'></tbody>";
    return headers;
}
