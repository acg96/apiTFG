const tableHeadersDetail = loadTableDetailsHeaders();
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
featuresDataTableLong["order"]= [[1, "desc"],[0, "asc"]]; //Sorted by date and by name
featuresDataTableShort["columns"] = [
        null,
        null,
        null,
        null,
        { "orderable": false, "searchable": false}
    ];
featuresDataTableShort["order"]= [[1, "desc"]]; //Sorted by last notification date

function openModal(option) {
    const modalContent= $('#modalContent');
    const studentSelected = option;
    $("#modalHeaderTitle").text(studentSelected === "NoUserProvided" ? "Sin usuario" : studentSelected);
    let htmlToLoad = "<table class='table table-hover' id='tableNotificationsDetails'>";
    htmlToLoad += tableHeadersDetail;
    htmlToLoad += "</table>";
    modalContent.append(htmlToLoad);
    const rowsCode = loadStudent(studentSelected);
    $("#tableBodyDetails").append(rowsCode);
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

function loadDataTableOnMainTable(){
    $('#tableNotificationsT').DataTable(featuresDataTableShort);
}

function loadStudent(student){
    const jsonNotifications = $("#notificationsJson-"+student).val();
    const parseJson = JSON.parse(jsonNotifications);
    let rowsCode = "";
    for (let i= 0; i < parseJson.length; ++i){
        rowsCode += "<tr>";
        let currentControl = true;
        if (!(parseJson[i].actionName === "Inicio de sesión" || parseJson[i].actionName === "Comienzo de slot")){
            currentControl = false;
        }
        rowsCode += "<td " + (currentControl ? "" : "style='color:#EA4335;'") + ">" + parseJson[i].actionName + "</td>";
        rowsCode += "<td data-sort=\""+ parseJson[i].actionTimeMS +"\">" + parseJson[i].actionTime + "</td>";
        rowsCode += "<td>" + parseJson[i].moreInfo + "</td>";
        rowsCode += "<td>" + parseJson[i].tofCache + "</td>";
        rowsCode += "<td>" + parseJson[i].extIp + "</td>";
        rowsCode += "<td>" + parseJson[i].intIps + "</td>";
        rowsCode += "<td>" + parseJson[i].somethingWrong + "</td>";
        rowsCode += "</tr>";
    }
    return rowsCode;
}

function loadTableDetailsHeaders(){
    return "<thead><tr><th>Acción</th><th>Fecha</th><th>Más información</th>" +
        "<th>Tiempo de vuelo</th><th>IP externa</th><th>IPs internas</th><th>¿Algo raro?</th></tr></thead><tbody id='tableBodyDetails'></tbody>";
}
