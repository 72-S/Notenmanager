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
let gradesToDelete = [];


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
                    this.deleteCategoriesAndGradesBySubjectId(subject.id);
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
                    this.deleteGradesByCategoryId(category.id);
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

    deleteCategoriesAndGradesBySubjectId(subjectId) {
        Object.keys(localCategories).forEach(categoryKey => {
            const categories = localCategories[categoryKey];
            categories.forEach((category, index) => {
                if (category.subjectId === subjectId) {
                    this.deleteGradesByCategoryId(category.id);
                    const categoryRef = firebase.database().ref(`categories/${categoryKey}`);
                    categoryRef.remove();
                    categories.splice(index, 1);
                }
            });
            if (categories.length === 0) {
                delete localCategories[categoryKey];
            }
        });
    }

    deleteGradesByCategoryId(categoryId) {
        Object.keys(localGrades).forEach(gradeKey => {
            const grades = localGrades[gradeKey];
            grades.forEach((grade, index) => {
                if (grade.categoryId === categoryId) {
                    const gradeRef = firebase.database().ref(`grades/${gradeKey}`);
                    gradeRef.remove();
                    grades.splice(index, 1);
                }
            });
            if (grades.length === 0) {
                delete localGrades[gradeKey];
            }
        });
    }
}


//function to open subject page
function openSubjectPage(id, name) {
    closeAllPopups();
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

    container.appendChild(box);
}


function closeAllPopups() {
    const popups = document.querySelectorAll('.popup');
    popups.forEach(popup => {
        popup.style.display = "none";
    });
}


function createGrade(subjectId, categoryId) {
    closeAllPopups();
    const popup = document.getElementById('neueNotePopup');
    popup.style.display = "block";
    popup.setAttribute('data-grade-subject-id', subjectId);
    popup.setAttribute('data-grade-category-id', categoryId);

}

function editGrades(name, subjectId, weight, categoryId) {
    closeAllPopups();
    const popup = document.getElementById('editNotePopup');
    popup.style.display = "block";
    popup.setAttribute('data-category-subject-id', subjectId);
    popup.setAttribute('data-category-category-id', categoryId);
    document.getElementById("editNotePopup-input").value = name;
    document.getElementById("editNotePopup-select").value = weight;
    const container = document.getElementById("editNotePopupList");
    if (!container) {
        return console.error("Grade Container not found");
    }
    container.innerHTML = "";
    Object.values(localGrades).forEach(gradeArray => {
        gradeArray.forEach(grade => {
            if (grade.subjectId === subjectId) {
                if (grade.categoryId === categoryId) {
                addGradeToPopupUI(grade.value, grade.date, grade.id);
                }
            }
        });
    });
}

function addGradeToPopupUI(value, date, id) {
    const container = document.getElementById("editNotePopupList");
    if (!container) {
        return console.error("Grade Container not found");
    }
    
    const gradeElement = document.createElement('div');
    gradeElement.className = 'gradePopupElement';
    gradeElement.id = id;

    gradeElement.innerHTML = ` 
        <div class="gradePopupContainer">
            <label class="gradePopup">
                <input type="checkbox" class="gradeCheckbox" id="checkbox-${id}" name="gradeCheckbox">
                ${date}
            </label>
            <span id="gradePopupValue" class="grade">${value}</span>
        </div>
    `;

    container.appendChild(gradeElement);

    const checkbox = gradeElement.querySelector('.gradeCheckbox');
    checkbox.addEventListener('change', function() {
        if (this.checked) {
            gradeElement.classList.add('selectedGrade');
            if (!gradesToDelete.includes(id)) {
                gradesToDelete.push(id);
            }
        } else {
            gradeElement.classList.remove('selectedGrade');
            const index = gradesToDelete.indexOf(id);
            if (index > -1) {
                gradesToDelete.splice(index, 1);
            }
        }
    });

    const gradePopupContainer = gradeElement.querySelector('.gradePopupContainer');
    gradePopupContainer.addEventListener('click', function(event) {
        if (event.target !== checkbox && event.target !== gradePopupContainer.querySelector('label')) {
            checkbox.checked = !checkbox.checked;
            checkbox.dispatchEvent(new Event('change'));
        }
    });
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
    
        document.getElementById('EditSubjectContext').addEventListener('click', () => editSubject(id, color, name));
        document.getElementById('DeleteSubjectContext').addEventListener('click', () => deleteSubject(id, box));
    });
    container.appendChild(box);
    box.appendChild(subjectName);
    box.appendChild(average);
}


function addGradeToUI(value, date, categoryId, id) {
    const container = document.getElementById("gradesContainer" + categoryId);
    if (!container) {
        return console.error("Grade Container not found");
    }

    const gradeElement = document.createElement('div');
    gradeElement.className = 'gradeElement';
    gradeElement.id = id;
    gradeElement.innerHTML = ` 
        <span id="gradeDate" class="grade">${date}</span>
        <span id="gradeValue" class="grade">${value}</span>
        
    `;
    container.appendChild(gradeElement);
}


editSubject = (id, color, name) => {
    const popup = document.getElementById('editFachPopup');
    const contextMenu = document.querySelector('.context-menu');
    contextMenu.remove();
    popup.setAttribute('data-subject-id', id);
    document.getElementById("editFachPopup-input").value = name;
    const colorChoices = document.querySelectorAll('.color-choice');
    colorChoices.forEach(colorChoice => {
        colorChoice.classList.remove('selected');
    });  
    colorChoices.forEach(colorChoice => {
        if (colorChoice.getAttribute('data-color') === color) {
            colorChoice.classList.add('selected');
        }
    });
    selectedColor = color;
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
    setButtonStateneuesFachPopup()
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

function saveChanges(categoryId, subjectId) {
    const input = document.getElementById("editNotePopup-input").value;
    const select = document.getElementById("editNotePopup-select").value;
    const CheckedButton = document.getElementById("Notetrashcan-button");
    if (gradesToDelete.length > 0) {
        gradesToDelete.forEach(gradeId => {
            const gradeElement = document.getElementById(gradeId);
            gradeElement.remove();
            pushGradeClass(gradeId, "", "", "", "", "delete");
        });
    }
    if (CheckedButton.classList.contains('checked')) {
        const categoryElement = document.getElementById(categoryId);
        categoryElement.remove();
        pushCategoryClass(categoryId, "", "", "", "delete");
    } else {
    pushCategoryClass(categoryId, input, select, subjectId, "overwrite");
    }
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

//BUTTON STATE FUNCTIONS
function setButtonStateneuesFachPopup() {
    const nameInput = document.getElementById('neusFachPopup-input').value;
    const isColorSelected = selectedColor !== '';

    const createButton = document.getElementById('neuesFachPopup-create');
    createButton.disabled = !(nameInput && isColorSelected);
}

function setButtonStateEditFachPopup() {
    const nameInput = document.getElementById('editFachPopup-input').value;
    const isColorSelected = selectedColor !== '';

    const saveButton = document.getElementById('editFachPopup-save');
    saveButton.disabled = !(nameInput && isColorSelected);
}


function disableAllButtons() {
    const buttons = document.querySelectorAll('.popup-buttons');
    buttons.forEach(button => {
        button.disabled = true;
    });
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
    setButtonStateneuesFachPopup();
    disableAllButtons();

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
    closeAllPopups();
    const popup = document.getElementById('neuesFachPopup');
    popup.style.display = "block";
    disableAllButtons();
});
 
document.getElementById("neuesFachPopup-cancel").addEventListener("click", function () {
    const popup = document.getElementById('neuesFachPopup');
    popup.style.display = "none";
    resetFachPopup();
    disableAllButtons();
});

document.getElementById("neuesFachPopup-create").addEventListener("click", function () {
    const popup = document.getElementById('neuesFachPopup');
    const noSubjectMessage = document.getElementById("noSubjectMessage");
    const name = document.getElementById("neusFachPopup-input").value;
    const color = selectedColor;
    if (name === "") {
        return;
    }
    pushSubjectClass("", name, color, "push");
    popup.style.display = "none";
    noSubjectMessage.style.display = "none";
    resetFachPopup();
    disableAllButtons();
});

document.getElementById("editFachPopup-cancel").addEventListener("click", function () {
    const popup = document.getElementById('editFachPopup');
    popup.style.display = "none";
    disableAllButtons();
    selectedColor = '';
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
    disableAllButtons();
    selectedColor = '';
});

document.getElementById("neueKategorieButtonClick").addEventListener("click", function () {
    closeAllPopups();
    const popup = document.getElementById('neueKategoriePopup');
    popup.style.display = "block";
    disableAllButtons();
});

document.getElementById("zurückZurMainPage").addEventListener("click", function () {
    closeAllPopups();
    document.getElementById("mainContent").style.display = "block";
    document.getElementById("subjectContent").style.display = "none";
    removeAllCategoriesFromUI();
    disableAllButtons();
});

document.getElementById("neueKategoriePopup-cancel").addEventListener("click", function () {
    const popup = document.getElementById('neueKategoriePopup');
    popup.style.display = "none";
    disableAllButtons();
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
    disableAllButtons();
});


document.getElementById("neueNotePopup-cancel").addEventListener("click", function () {
    const popup = document.getElementById('neueNotePopup');
    popup.style.display = "none";
    disableAllButtons();
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
    disableAllButtons();
});


document.getElementById("editNotePopup-cancel").addEventListener("click", function () {
    const popup = document.getElementById('editNotePopup');
    const CheckedButton = document.getElementById("Notetrashcan-button");
    popup.style.display = "none";
    CheckedButton.classList.remove('checked');
    gradesToDelete = [];
    disableAllButtons();
});


document.getElementById("editNotePopup-save").addEventListener("click", function () {
    const popup = document.getElementById('editNotePopup');
    const name = document.getElementById("editNotePopup-input").value;
    const subjectId = popup.getAttribute('data-category-subject-id');
    const categoryId = popup.getAttribute('data-category-category-id');
    const CheckedButton = document.getElementById("Notetrashcan-button");
    if (name === "") {
        return;
    }
    saveChanges(categoryId, subjectId);
    popup.style.display = "none";
    CheckedButton.classList.remove('checked');
    disableAllButtons();
});



//Button deactivate listeners
document.getElementById('neusFachPopup-input').addEventListener('input', setButtonStateneuesFachPopup);
document.getElementById('editFachPopup-input').addEventListener('input', setButtonStateEditFachPopup);
document.getElementById('neueKategoriePopup-input').addEventListener('input', function () {
    const button = document.getElementById('neueKategoriePopup-create');
    const nameInput = document.getElementById('neueKategoriePopup-input').value;
    button.disabled = !(nameInput);
});
document.getElementById('neueNotePopup-input').addEventListener('input', function () {
    const button = document.getElementById('neueNotePopup-create');
    const nameInput = document.getElementById('neueNotePopup-input').value;
    button.disabled = !(nameInput);
});
document.getElementById('editNotePopup-input').addEventListener('input', function () {
    const button = document.getElementById('editNotePopup-save');
    const nameInput = document.getElementById('editNotePopup-input').value;
    button.disabled = !(nameInput);
});
document.getElementById('Notetrashcan-button').addEventListener('click', function(event) {
    this.classList.toggle('checked');
});
});