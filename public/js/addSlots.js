let groups = [];
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

function showGroups(optionSelected){
    if (optionSelected != null){
        $('#groupSelect').empty();
        $('#groupsExcludedText').empty();
        $('#excludedGroups').empty();

        $('#studentsGroup').empty();
        $('#excludedGroup').empty();
        $('#studentsExcludedText').val("");
        const arraySelected = optionSelected.value.split("%%65&4-%.43%%");
        groups = JSON.parse(arraySelected[1]);
        groups.sort((a, b) => {
            if (a.name < b.name){
                return -1;
            } else if (a.name > b.name){
                return 1;
            } else{
                return 0;
            }
        });
        const students = [];
        for (let i= 0; i < groups.length; ++i){
            $('#groupSelect').append(`<option value="${groups[i].id.trim()}">
                                       ${groups[i].name.trim()}
                                  </option>`);
            students.push(...groups[i].students);
        }
        const remainingIncluded= $('#groupSelect').find('option');
        let groupsIncludedText= "";
        for (let i= 0; i < remainingIncluded.length; ++i){
            if (groupsIncludedText === ""){
                groupsIncludedText += remainingIncluded[i].value.trim();
            } else{
                groupsIncludedText += "%$-%5$%-$7-%$-8%$-9%$" + remainingIncluded[i].value.trim();
            }
        }
        $('#groupsIncludedText').val(groupsIncludedText);
        showStudents(students);
    }
}

function showStudents(students){
    if (students != null) {
        students.sort((a, b) => {
            if (a > b) {
                return 1;
            } else if (a < b) {
                return -1;
            } else {
                return 0;
            }
        });
        for (let i = 0; i < students.length; ++i) {
            $('#studentsGroup').append(`<option value="${students[i]}">
                                       ${students[i]}
                                  </option>`);
        }
    }
}

function removeGroup(){
    const result= $('#groupSelect').find('option:selected');
    for (let i= 0; i < result.length; ++i){
        $('#excludedGroups').append(`<option value="${result[i].value.trim()}">
                                       ${result[i].text.trim()}
                                  </option>`);
    }
    result.remove();
    const remainingIncluded= $('#groupSelect').find('option');
    let groupsIncludedText= "";
    for (let i= 0; i < remainingIncluded.length; ++i){
        if (groupsIncludedText === ""){
            groupsIncludedText += remainingIncluded[i].value.trim();
        } else{
            groupsIncludedText += "%$-%5$%-$7-%$-8%$-9%$" + remainingIncluded[i].value.trim();
        }
    }
    $('#groupsIncludedText').val(groupsIncludedText);
    updateStudentsDueToGroupChanges();
}

function updateStudentsDueToGroupChanges(){
    $('#studentsGroup').empty();
    $('#excludedGroup').empty();
    $('#studentsExcludedText').val("");
    const result= $('#groupSelect').find('option');
    const students= [];
    for (let i= 0; i < result.length; ++i){
        const groupId = result[i].value.trim();
        for (let e= 0; e < groups.length; ++e){
            if (groups[e].id === groupId){
                students.push(...groups[e].students);
                break;
            }
        }
    }
    showStudents(students);
}

function removeExcludedGroup(){
    const result= $('#excludedGroups').find('option:selected');
    let groupsIncludedText = $('#groupsIncludedText').val().trim();
    for (let i= 0; i < result.length; ++i){
        $('#groupSelect').append(`<option value="${result[i].value.trim()}">
                                       ${result[i].text.trim()}
                                  </option>`);
        if (groupsIncludedText === ""){
            groupsIncludedText += result[i].value.trim();
        } else{
            groupsIncludedText += "%$-%5$%-$7-%$-8%$-9%$" + result[i].value.trim();
        }
    }
    result.remove();
    $('#groupsIncludedText').val(groupsIncludedText);
    updateStudentsDueToGroupChanges();
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
