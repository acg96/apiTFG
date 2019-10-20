function addUrl(){
    const currentUrl= $("#newUrl").val().trim().toLowerCase();
    let resultUrl= "";
    try {
        const urlFormat = new URL(currentUrl);
        resultUrl= urlFormat.origin;
        $('#urlsGroup').append(`<option value="${resultUrl}">
                                       ${resultUrl}
                                  </option>`);
        const currentValue= $('#urlsText').val().trim();
        if (currentValue === ""){
            $('#urlsText').val(resultUrl);
        } else {
            $('#urlsText').val(currentValue + "%$-%5$%-$7-%$-8%$-9%$" + resultUrl);
        }
        resultUrl= "";
    }catch(e){
        resultUrl= "El formato de la url no es correcto";
    }
    $("#newUrl").val(resultUrl);
}

function removeUrls(){
    $('#urlsGroup').find('option:selected').remove();
    const options= $('#urlsGroup').find('option');
    let tempUrlText= "";
    for (let i= 0; i < options.length; ++i){
        if (tempUrlText === "") {
            tempUrlText += options[i].value;
        } else{
            tempUrlText += "%$-%5$%-$7-%$-8%$-9%$" + options[i].value;
        }
    }
    $('#urlsText').val(tempUrlText);
}

function showStudents(optionSelected){
    if (optionSelected != null) {
        $('#studentsGroup').empty();
        $('#excludedGroup').empty();
        $('#studentsExcludedText').val("");
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
    let studentsExcludedText = $('#studentsExcludedText').val().trim();
    for (let i= 0; i < result.length; ++i){
        $('#excludedGroup').append(`<option value="${result[i].value}">
                                       ${result[i].value}
                                  </option>`);
        if (studentsExcludedText === ""){
            studentsExcludedText += result[i].value;
        } else{
            studentsExcludedText += "%$-%5$%-$7-%$-8%$-9%$" + result[i].value;
        }
    }
    result.remove();
    $('#studentsExcludedText').val(studentsExcludedText);
}

function removeExcluded(){
    const result= $('#excludedGroup').find('option:selected');
    for (let i= 0; i < result.length; ++i){
        $('#studentsGroup').append(`<option value="${result[i].value}">
                                       ${result[i].value}
                                  </option>`);
    }
    result.remove();
    const remainingExcluded= $('#excludedGroup').find('option');
    let studentsExcludedText= "";
    for (let i= 0; i < remainingExcluded.length; ++i){
        if (studentsExcludedText === ""){
            studentsExcludedText += remainingExcluded[i].value;
        } else{
            studentsExcludedText += "%$-%5$%-$7-%$-8%$-9%$" + remainingExcluded[i].value;
        }
    }
    $('#studentsExcludedText').val(studentsExcludedText);
}
