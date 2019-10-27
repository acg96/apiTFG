const modal = document.getElementById("modalView");
const closeButton = document.getElementsByClassName("close")[0];
function openModal(option) {
    const optSelected = option.split("-")[0];
    const idSelected = option.split("-")[1];
    if (optSelected === "details"){
        showDetails(idSelected);
    } else{
        confirmDelete(idSelected);
    }
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

function confirmDelete(slotId){
    const modalContent= $('#modalContent');
    modalContent.append("<div class='modal-header'><h2 style='text-align: center;'>¿Estás seguro que deseas borrar el slot?</h2></div>");
    modalContent.append("<div class='container-fluid'><div class='col-xs-12 text-center'><a href='/prf/slot/del/"+slotId+"' style='width: 8em; margin-bottom: 2em; margin-top: 2em;' class='btn btn-lg btn-success'>Sí</a>" +
        "<button type='button' onclick='hideModal()' class='btn btn-lg btn-danger' style='margin-left: 0.5em; margin-bottom: 2em; margin-top: 2em; width: 8em;'>No</button></div></div>");
}

function showDetails(slotId){
    const currentValue= $('#input-'+slotId).val().trim();
    const valueJson= JSON.parse(currentValue);
    const modalContent= $('#modalContent');
    modalContent.append("<div class='modal-header'><h2 style='text-align: center;'>"+ valueJson.groupName +"</h2></div>");
    let initHtml= "<ul style='list-style: none;'>";
    initHtml+= "<li>"+ "<b>Detalles:</b> " + valueJson.description +"</li>";
    initHtml+= "<li>"+ "<b>Comienzo:</b> " + valueJson.startTime +"</li>";
    initHtml+= "<li>"+ "<b>Fin:</b> " + valueJson.endTime +"</li>";
    initHtml+= "<li>"+ "<b>Modo:</b> " + (valueJson.listMode === "whitelist" ? "Lista blanca" : "Lista negra") +"</li>";
    initHtml+= "<li>"+ "<b>Autor:</b> " + valueJson.author +"</li>";
    initHtml+= "</ul>";
    modalContent.append(initHtml);
    modalContent.append("<div class='modal-header2'><h3>Urls:</h3></div>");
    let urlsHtml = "<ul>";
    for (let i= 0; i < valueJson.urls.length; ++i){
        urlsHtml+= "<li>"+ valueJson.urls[i] +"</li>";
    }
    urlsHtml+= "</ul>";
    modalContent.append(urlsHtml);
    modalContent.append("<div class='modal-header2'><h3>Estudiantes incluidos:</h3></div>");
    let includedStudentsHtml = "<ul>";
    for (let i= 0; i < valueJson.studentsIncluded.length; ++i){
        includedStudentsHtml+= "<li>"+ valueJson.studentsIncluded[i] +"</li>";
    }
    includedStudentsHtml+= "</ul>";
    modalContent.append(includedStudentsHtml);
    modalContent.append("<div class='modal-header2'><h3>Estudiantes excluidos:</h3></div>");
    let excludedStudentsHtml = "<ul>";
    for (let i= 0; i < valueJson.studentsExcluded.length; ++i){
        excludedStudentsHtml+= "<li>"+ valueJson.studentsExcluded[i] +"</li>";
    }
    excludedStudentsHtml+= "</ul>";
    if (valueJson.studentsExcluded.length === 0){
        excludedStudentsHtml = "<ul style='list-style: none;'><li>No hay</li></ul>";
    }
    modalContent.append(excludedStudentsHtml);
}

