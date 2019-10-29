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
    for (let i= 0; i < notifications.length; ++i){
        rowCode += "<tr>";
        if (i === 0) {
            rowCode += "<td rowspan='" + notifications.length + "'>" + student + "</td>";
        }
        rowCode += "<td>" + notifications[i].actionName + "</td>";
        rowCode += "<td>" + notifications[i].actionTime + "</td>";
        rowCode += "<td>" + notifications[i].moreInfo + "</td>";
        rowCode += "<td>" + notifications[i].tofCache + "</td>";
        rowCode += "<td>" + notifications[i].extIp + "</td>";
        rowCode += "<td>" + notifications[i].intIps + "</td>";
        rowCode += "<td>" + notifications[i].somethingWrong + "</td>";
        rowCode += "</tr>";
    }
    $('#tableBody').append(rowCode);
}

function loadTableHeaders(){
    const headers= "<thead><tr><th>Alumno</th><th>Acción</th><th>Fecha</th><th>Más información</th>" +
        "<th>Tiempo de vuelo</th><th>IP externa</th><th>IPs internas</th><th>¿Algo raro?</th></tr></thead><tbody id='tableBody'></tbody>";
    $('#tableNotifications').append(headers);
}
