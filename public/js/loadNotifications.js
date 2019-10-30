function showNotifications(optionSelected){
    if (optionSelected != null) {
        $('#tableNotifications').empty();
        loadTableHeaders();
        const groupIdSelected = optionSelected.value;
        const jsonNotifications = $("#studentsJson").val();
        const parseJson = JSON.parse(jsonNotifications);
        const students = Object.keys(parseJson[groupIdSelected]);
        for (let i= 0; i < students.length; ++i){
            loadStudent(parseJson[groupIdSelected][students[i]], students[i]);
        }
    }
}

function loadStudent(notifications, student){
    let rowCode = "";
    let correctControl =  true; //Used to know if some notification is not normal
    let firstRow = "";
    for (let i= 0; i < notifications.length; ++i){
        if (!(notifications[i].actionName === "Inicio de sesión" || notifications[i].actionName === "Comienzo de slot")){
            correctControl = false;
        }
        if (i!== 0) rowCode += "<tr>";
        rowCode += "<td>" + notifications[i].slotDescription + "</td>";
        rowCode += "<td>" + notifications[i].actionName + "</td>";
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
    $('#tableBody').append(rowCode);
}

function loadTableHeaders(){
    const headers= "<thead><tr><th class='notificationHeader'>Alumno</th><th class='notificationHeader'>Slot</th><th class='notificationHeader'>Acción</th><th class='notificationHeader'>Fecha</th><th class='notificationHeader'>Más información</th>" +
        "<th class='notificationHeader'>Tiempo de vuelo</th><th class='notificationHeader'>IP externa</th><th class='notificationHeader'>IPs internas</th><th class='notificationHeader'>¿Algo raro?</th></tr></thead><tbody id='tableBody'></tbody>";
    $('#tableNotifications').append(headers);
}
