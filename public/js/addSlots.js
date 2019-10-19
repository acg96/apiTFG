function addUrl(){
    const currentUrl= $("#newUrl").val().trim().toLowerCase();
    let resultUrl= "";
    try {
        const urlFormat = new URL(currentUrl);
        resultUrl= urlFormat.origin;
        $('#urlsGroup').append(`<option value="${resultUrl}">
                                       ${resultUrl}
                                  </option>`);
        resultUrl= "";
    }catch(e){
        resultUrl= "El formato de la url no es correcto";
    }
    $("#newUrl").val(resultUrl);
}

function removeUrls(){
    $('#urlsGroup').find('option:selected').remove();
}

function showStudents(optionSelected){
    if (optionSelected != null) {
        $('#studentsGroup').empty();
        $('#excludedGroup').empty();
        const arraySelected = optionSelected.value.split("%%65&4-%.43%%");
        const students = arraySelected[1].split("-;%;&&-%;-");
        for (let i = 0; i < students.length; ++i) {
            $('#studentsGroup').append(`<option value="${students[i]}">
                                       ${students[i]}
                                  </option>`);
        }
    }
}

function removeStudents(){
    const result= $('#studentsGroup').find('option:selected');
    for (let i= 0; i < result.length; ++i){
        $('#excludedGroup').append(`<option value="${result[i].value}">
                                       ${result[i].value}
                                  </option>`);
    }
    result.remove();
}

function removeExcluded(){
    const result= $('#excludedGroup').find('option:selected');
    for (let i= 0; i < result.length; ++i){
        $('#studentsGroup').append(`<option value="${result[i].value}">
                                       ${result[i].value}
                                  </option>`);
    }
    result.remove();
}
