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
featuresDataTableLong["order"]= [[0, "desc"]]; //Sorted by date
featuresDataTableShort["columns"] = [
        null,
        null,
        null,
        null,
        null,
        { "orderable": false, "searchable": false}
    ];
featuresDataTableShort["order"]= [[2, "asc"]]; //Sorted by last notification date

function openModal(extIp, intIps, signalName) {
    const modalContent= $('#modalContent');
    $("#modalHeaderTitle").text(extIp + " - " + intIps);
    let htmlToLoad = "<table class='table table-hover' id='tableNotificationsDetails'>";
    htmlToLoad += tableHeadersDetail;
    htmlToLoad += "</table>";
    modalContent.append(htmlToLoad);
    const rowsCode = loadComputer(extIp, intIps, signalName);
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

function loadComputer(extIp, intIps, signalName){
    const jsonNotifications = $("#notificationsJson-"+signalName).val();
    const parseJson = JSON.parse(jsonNotifications);
    let rowsCode = "";
    for (let i= 0; i < parseJson.length; ++i){
        rowsCode += "<tr>";
        rowsCode += "<td data-sort=\""+ parseJson[i].actionTimeMS +"\">" + parseJson[i].actionTime + "</td>";
        rowsCode += "<td>" + parseJson[i].tofCache + "</td>";
        rowsCode += "</tr>";
    }
    return rowsCode;
}

function loadTableDetailsHeaders(){
    return "<thead><tr><th>Fecha</th>"+
        "<th>Tiempo de vuelo</th></tr></thead><tbody id='tableBodyDetails'></tbody>";
}
