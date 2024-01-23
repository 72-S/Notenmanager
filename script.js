const firebaseConfig = {
    apiKey: "AIzaSyBFnHlWuc5pR9NxAvUVZkeFORIZor1lmrs",
    authDomain: "notenmanager-c2a2e.firebaseapp.com",
    databaseURL: "https://notenmanager-c2a2e-default-rtdb.firebaseio.com",
    projectId: "notenmanager-c2a2e",
    storageBucket: "notenmanager-c2a2e.appspot.com",
    messagingSenderId: "21273119934",
    appId: "1:21273119934:web:8448400bde5c124f1aa2ef",
    measurementId: "G-Q7YMZ047F0"
};
firebase.initializeApp(firebaseConfig);


let localSubjects = {};
let localCategories = {};
let localGrades = {};
let selectedColor = '';


class SaveLocalDataFromDB {
    loadSubjects(callback) {
        const db = firebase.database().ref("subjects");
        db.once('value', snapshot => {
            snapshot.forEach(childSnapshot => {
                const subject = childSnapshot.val();
                const subjectId = childSnapshot.key;
                if (!localSubjects[subjectId]) {
                    localSubjects[subjectId] = [];
                }
                localSubjects[subjectId].push({
                    id: subjectId,
                    name: subject.name,
                    color: subject.color,
                    action: "get"
                });
            });
            if (callback && typeof callback === 'function') {
                callback();
            }
        });
    }

    loadCategories(callback) {
        const db = firebase.database().ref("categories");
        db.once('value', snapshot => {
            snapshot.forEach(childSnapshot => {
                const category = childSnapshot.val();
                const categoryId = childSnapshot.key;
                if (!localCategories[categoryId]) {
                    localCategories[categoryId] = [];
                }
                localCategories[categoryId].push({
                    id: categoryId,
                    name: category.name,
                    weight: category.weight,
                    subjectId: category.subjectId,
                    action: "get"
                });
            });
            if (callback && typeof callback === 'function') {
                callback();
            }
        });
    }

    loadGrades(callback) {
        const db = firebase.database().ref("grades");
        db.once('value', snapshot => {
            snapshot.forEach(childSnapshot => {
                const grade = childSnapshot.val();
                const gradeId = childSnapshot.key;
                if (!localGrades[gradeId]) {
                    localGrades[gradeId] = [];
                }
                localGrades[gradeId].push({
                    id: gradeId,
                    name: grade.name,
                    value: grade.value,
                    date: grade.date,
                    subjectId: grade.subjectId,
                    categoryId: grade.categoryId,
                    action: "get"
                });
            });
            if (callback && typeof callback === 'function') {
                callback();
            }
        });
    }
}


class PushLocalDataToDB {
    pushSubjects() {
        const db = firebase.database().ref("subjects");
        Object.values(localSubjects).forEach(subjectArray => {
            subjectArray.forEach(subject => {
                if (subject.action === "push") {
                    const newRef = db.push();
                    newRef.set({
                        name: subject.name,
                        color: subject.color
                    });
                    newRef.then((ref) => {
                        const newId = ref.key;
                        localSubjects[newId] = [{
                            id: newId, 
                            name: subject.name, 
                            color: subject.color,
                            action: "get"
                        }];
                        delete localSubjects[subject.id];
                        addSubjectToUI(subject.name, subject.color, newId);
                    });
                } else if (subject.action === "overwrite") {
                    const subjectRef = db.child(subject.id);
                    subjectRef.update({
                        name: subject.name,
                        color: subject.color
                    });
                    subject.action = "get";
                } else if (subject.action === "delete") {
                    const subjectRef = db.child(subject.id);
                    subjectRef.remove().then(() => {
                        if (localSubjects[subject.id]) {
                            delete localSubjects[subject.id];
                        }
                    });
                    subject.action = "get";
                }
            });
        });
    }

    pushCategories() {
        const db = firebase.database().ref("categories");
        Object.values(localCategories).forEach(categoryArray => {
            categoryArray.forEach(category => {
                if (category.action === "push") {
                    const newRef = db.push();
                    newRef.set({
                        name: category.name,
                        weight: category.weight,
                        subjectId: category.subjectId
                    });
                    newRef.then((ref) => {
                        const newId = ref.key;
                        localCategories[newId] = [{
                            id: newId, 
                            name: category.name, 
                            weight: category.weight,
                            subjectId: category.subjectId,
                            action: "get"
                        }];
                        delete localCategories[category.id];
                        addCategoryToUI(category.name, category.weight, newId, category.subjectId);
                    });
                } else if (category.action === "overwrite") {
                    const categoryRef = db.child(category.id);
                    categoryRef.update({
                        name: category.name, 
                        weight: category.weight
                    });
                    category.action = "get";
                } else if (category.action === "delete") {
                    const categoryRef = db.child(category.id);
                    categoryRef.remove().then(() => {
                        if (localCategories[category.id]) {
                            delete localCategories[category.id];
                        }
                    });
                    category.action = "get";
                }
            });
        });
    }

    pushGrades() {
        const db = firebase.database().ref("grades");
        Object.values(localGrades).forEach(gradeArray => {
            gradeArray.forEach(grade => {
                if (grade.action === "push") {
                    const newRef = db.push();
                    newRef.set({
                        value: grade.value,
                        date: grade.date,
                        subjectId: grade.subjectId,
                        categoryId: grade.categoryId
                    });
                    newRef.then((ref) => {
                        const newId = ref.key;
                        localGrades[newId] = [{
                            id: newId, 
                            value: grade.value,
                            date: grade.date,
                            subjectId: grade.subjectId,
                            categoryId: grade.categoryId,
                            action: "get"
                        }];
                        delete localGrades[grade.id];
                        addGradeToUI(grade.value, grade.date, grade.categoryId, newId);
                    });
                } else if (grade.action === "overwrite") {
                    const gradeRef = db.child(grade.id);
                    gradeRef.update({
                        value: grade.value,
                        date: grade.date
                    });
                    subject.action = "get";
                } else if (grade.action === "delete") {
                    const gradeRef = db.child(grade.id);
                    gradeRef.remove().then(() => {
                        if (localGrades[grade.id]) {
                            delete localGrades[grade.id];
                        }
                    });
                    grade.action = "get";
                }
            });
        });
    }
}


//function to open subject page
function openSubjectPage(id, name) {
    document.getElementById("mainContent").style.display = "none";
    document.getElementById("subjectContent").style.display = "block";
    document.getElementById("neueKategoriePopup").setAttribute("category-data-subject-id", id);
    document.getElementById("FachName").textContent = name;
    Object.values(localCategories).forEach(categoryArray => {
        categoryArray.forEach(category => {
            if (category.subjectId === id) {
                addCategoryToUI(category.name, category.weight, category.id, category.subjectId);
            }
        });
    });
    Object.values(localGrades).forEach(gradeArray => {
        gradeArray.forEach(grade => {
            if (grade.subjectId === id) {
                addGradeToUI(grade.value, grade.date, grade.categoryId, grade.id);
            }
        });
    });
}


//function to add Category to UI
function addCategoryToUI(name, weight, id, subjectId) {
    const container = document.getElementsByClassName("categoriesContainer")[0];
    if (!container) {
        return console.error("Category Container not found");
    }
    const box = document.createElement("div");
    box.classList.add("category-box");
    box.id = id;

    box.innerHTML = `
        <div class="titleContainer">
            <span id="category-name">${name}</span>
            <span id="category-weight">x ${weight}</span>
        </div>
        <div class="buttonsContainerKategorie">
        <button class="neuesFachButton" onclick="createGrade('${subjectId}', '${id}')">Note hinzufügen <img src="assets/add.svg" alt="+" class="IMG"></button>
        <button class="neuesFachButton" onclick="editGrades('${name}', '${subjectId}', '${weight}', '${id}')">Bearbeiten <img src="assets/edit.svg" alt="+" class="IMG"></button>
        </div>
        <div id="gradesContainer${id}" class="gradesContainer"></div>
        `;

    console.log(name, weight, id, subjectId);

    container.appendChild(box);
}



function createGrade(subjectId, categoryId) {
    const popup = document.getElementById('neueNotePopup');
    popup.style.display = "block";
    popup.setAttribute('data-grade-subject-id', subjectId);
    popup.setAttribute('data-grade-category-id', categoryId);

}



//funktion to add Subject to UI

function addSubjectToUI(name, color, id) {

    const container = document.getElementsByClassName("subjects-wrapper")[0];
    if (!container) {
        return console.error("Subject Container not found");
    }
    const box = document.createElement("div");
    box.classList.add("subject-box");
    box.id = id;
    box.style.backgroundColor = color;

    const subjectName = document.createElement("p");
    subjectName.classList.add("subject-name");
    subjectName.textContent = name;

    const average = document.createElement("p");
    average.classList.add("subject-average");
    average.textContent = "0.0";


    box.addEventListener("click", function () {
        openSubjectPage(id, name);
    });

    box.addEventListener("contextmenu", function (event) {
        event.preventDefault();
        const existingMenu = document.querySelector('.context-menu');
        if (existingMenu) {
            existingMenu.remove();
        }
    
        const contextMenuHTML = `
            <div class="context-menu" style="position: absolute; top: ${event.clientY}px; left: ${event.clientX}px;">
                <button class="popup-buttons" id="EditSubjectContext">Bearbeiten</button>
                <button class="popup-buttons" id="DeleteSubjectContext">Löschen</button>
            </div>`;
    
        document.body.insertAdjacentHTML('beforeend', contextMenuHTML);
    
        document.getElementById('EditSubjectContext').addEventListener('click', () => editSubject(id));
        document.getElementById('DeleteSubjectContext').addEventListener('click', () => deleteSubject(id, box));
    });
    container.appendChild(box);
    box.appendChild(subjectName);
    box.appendChild(average);
}


function addGradeToUI(value, date, categoryId, id) {
    console.log(value, date, categoryId, id);
    const container = document.getElementById("gradesContainer" + categoryId);
    if (!container) {
        return console.error("Grade Container not found");
    }
    const gradeValue = document.createElement("p");
    gradeValue.classList.add("grade-value");
    gradeValue.textContent = value;

    const gradeDate = document.createElement("p");
    gradeDate.classList.add("grade-date");
    gradeDate.textContent = date;

    container.appendChild(gradeValue);
    container.appendChild(gradeDate);
}


editSubject = (id) => {
    const popup = document.getElementById('editFachPopup');
    const contextMenu = document.querySelector('.context-menu');
    contextMenu.remove();
    popup.setAttribute('data-subject-id', id);
    popup.style.display = "block";
}


deleteSubject = (id, box) => {
    const contextMenu = document.querySelector('.context-menu');
    contextMenu.remove();
    box.remove();
    pushSubjectClass(id, "", "", "delete");
}

function selectColor(element) {
    document.querySelectorAll('.color-choice').forEach(colorElement => {
        colorElement.classList.remove('selected');
    });
    element.classList.add('selected');
    selectedColor = element.getAttribute('data-color');
}

//funktion to remove Subject from UI
function removeAllSubjectsFromUI() {
    const subjectBoxes = document.getElementsByClassName("subject-box");
    while (subjectBoxes.length > 0) {
        subjectBoxes[0].parentNode.removeChild(subjectBoxes[0]);
    }
}

function removeAllCategoriesFromUI() {
    const categoryBoxes = document.getElementsByClassName("category-box");
    while (categoryBoxes.length > 0) {
        categoryBoxes[0].parentNode.removeChild(categoryBoxes[0]);
    }
}

function resetFachPopup() {
    document.getElementsByClassName("FachPopupInput")[0].value = "";
    const colorChoices = document.querySelectorAll('.color-choice');
    colorChoices.forEach(colorChoice => {
        colorChoice.classList.remove('selected');
    });
    selectedColor = '';
}

function pushSubjectClass(id, name, color, action) {
    const tempId = Date.now();
    if (action === "overwrite") {
        const existingSubjectIndex = localSubjects[id].findIndex(subject => subject.id === id);
        if (existingSubjectIndex !== -1) {
            localSubjects[id][existingSubjectIndex] = {
                id: id,
                name: name,
                color: color,
                action: "overwrite"
            };
        }
    } 
    else if (action === "delete") {
        localSubjects[id] = [{
            id: id, 
            name: name, 
            color: color, 
            action: "delete" 
        }]
    }
    else if (action === "push") {
        localSubjects[tempId] = [{ 
            id: tempId, 
            name: name, 
            color: color, 
            action: "push" 
        }];
    }
    if (action === "push" || action === "overwrite" || action === "delete") {
        const pushData = new PushLocalDataToDB();
        pushData.pushSubjects();
    }
}


function pushCategoryClass(id, name, weight, subjectId, action) {
    const tempId = Date.now();
    if (action === "overwrite") {
        const existingCategoryIndex = localCategories[id].findIndex(category => category.id === id);
        if (existingCategoryIndex !== -1) {
            localCategories[id][existingCategoryIndex] = {
                id: id,
                name: name,
                weight: weight,
                subjectId: subjectId,
                action: "overwrite"
            };
        }
    } 
    else if (action === "delete") {
        localCategories[id] = [{
            id: id, 
            name: name, 
            weight: weight, 
            subjectId: subjectId,
            action: "delete" 
        }]
    }
    else if (action === "push") {
        localCategories[tempId] = [{ 
            id: tempId, 
            name: name, 
            weight: weight, 
            subjectId: subjectId,
            action: "push" 
        }];
    }
    if (action === "push" || action === "overwrite" || action === "delete") {
        const pushData = new PushLocalDataToDB();
        pushData.pushCategories();
    }
}


function pushGradeClass(id, value, date, subjectId, categoryId, action) {
    const tempId = Date.now();
    if (action === "overwrite") {
        const existingGradeIndex = localGrades[id].findIndex(grade => grade.id === id);
        if (existingGradeIndex !== -1) {
            localGrades[id][existingGradeIndex] = {
                id: id,
                value: value,
                date: date,
                subjectId: subjectId,
                categoryId: categoryId,
                action: "overwrite"
            };
        }
    } 
    else if (action === "delete") {
        localGrades[id] = [{
            id: id, 
            value: value, 
            date: date, 
            subjectId: subjectId,
            categoryId: categoryId,
            action: "delete" 
        }]
    }
    else if (action === "push") {
        localGrades[tempId] = [{ 
            id: tempId, 
            value: value, 
            date: date, 
            subjectId: subjectId,
            categoryId: categoryId,
            action: "push" 
        }];
    }
    if (action === "push" || action === "overwrite" || action === "delete") {
        const pushData = new PushLocalDataToDB();
        pushData.pushGrades();
    }
}



document.addEventListener("DOMContentLoaded", function () {
    const saveLocalData = new SaveLocalDataFromDB();
    saveLocalData.loadSubjects(function () {
        const noSubjectMessage = document.getElementById("noSubjectMessage");
        if (Object.keys(localSubjects).length === 0) {
            noSubjectMessage.style.display = "block";
        } else {
            noSubjectMessage.style.display = "none";
            Object.values(localSubjects).forEach(subjectArray => {
                subjectArray.forEach(subject => {
                    addSubjectToUI(subject.name, subject.color, subject.id);
                });
            });
        }
    });
    saveLocalData.loadCategories();
    saveLocalData.loadGrades();

    

//EVENT LISTENER
document.addEventListener('click', function (event) {
    const contextMenu = document.querySelector('.context-menu');
    if (contextMenu && !contextMenu.contains(event.target)) {
        contextMenu.remove();
    }
});

document.querySelectorAll('.color-choice').forEach(span => {
    span.addEventListener('click', () => selectColor(span));

});

document.getElementById("neuesFachButtonClick").addEventListener("click", function () {
    const popup = document.getElementById('neuesFachPopup');
    popup.style.display = "block";
});
 
document.getElementById("neuesFachPopup-cancel").addEventListener("click", function () {
    const popup = document.getElementById('neuesFachPopup');
    popup.style.display = "none";
    resetFachPopup();
});

document.getElementById("neuesFachPopup-create").addEventListener("click", function () {
    const popup = document.getElementById('neuesFachPopup');
    const name = document.getElementById("neusFachPopup-input").value;
    const color = selectedColor;
    if (name === "") {
        return;
    }
    pushSubjectClass("", name, color, "push");
    popup.style.display = "none";
    resetFachPopup();
});

document.getElementById("editFachPopup-cancel").addEventListener("click", function () {
    const popup = document.getElementById('editFachPopup');
    popup.style.display = "none";
});

document.getElementById("editFachPopup-save").addEventListener("click", function () {
    const popup = document.getElementById('editFachPopup');
    const name = document.getElementById("editFachPopup-input").value;
    const color = selectedColor;
    const id = popup.getAttribute('data-subject-id');
    const subjectBox = document.getElementById(id);
    if (name === "") {
        return;
    }
    pushSubjectClass(id, name, color, "overwrite");
    popup.style.display = "none";
    subjectBox.style.backgroundColor = color;
    subjectBox.getElementsByClassName("subject-name")[0].textContent = name;
    resetFachPopup();
});

document.getElementById("neueKategorieButtonClick").addEventListener("click", function () {
    const popup = document.getElementById('neueKategoriePopup');
    popup.style.display = "block";
});

document.getElementById("zurückZurMainPage").addEventListener("click", function () {
    document.getElementById("mainContent").style.display = "block";
    document.getElementById("subjectContent").style.display = "none";
    removeAllCategoriesFromUI();
});

document.getElementById("neueKategoriePopup-cancel").addEventListener("click", function () {
    const popup = document.getElementById('neueKategoriePopup');
    popup.style.display = "none";
});

document.getElementById("neueKategoriePopup-create").addEventListener("click", function () {
    const popup = document.getElementById('neueKategoriePopup');
    const name = document.getElementById("neueKategoriePopup-input").value;
    const weight = document.getElementById("neueKategoriePopup-select").value;
    const subjectId = popup.getAttribute('category-data-subject-id');
    if (name === "") {
        return;
    }
    pushCategoryClass("", name, weight, subjectId, "push");
    popup.style.display = "none";
});


document.getElementById("neueNotePopup-cancel").addEventListener("click", function () {
    const popup = document.getElementById('neueNotePopup');
    popup.style.display = "none";
});

document.getElementById("neueNotePopup-create").addEventListener("click", function () {
    const popup = document.getElementById('neueNotePopup');
    const value = document.getElementById("neueNotePopup-select").value;
    const date = document.getElementById("neueNotePopup-input").value;
    const subjectId = popup.getAttribute('data-grade-subject-id');
    const categoryId = popup.getAttribute('data-grade-category-id');
    if (date === "") {
        return;
    }
    pushGradeClass("", value, date, subjectId, categoryId, "push");
    popup.style.display = "none";
});

});