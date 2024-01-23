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
                    console.log("overwrite");
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
                    db.push({
                        name: category.name,
                        weight: category.weight,
                        subjectId: category.subjectId
                    });
                    category.action = "get";
                } else if (category.action === "overwrite") {
                    const categoryRef = db.child(category.id);
                    categoryRef.update({
                        name: category.name,
                        color: category.color
                    });
                    category.action = "get";
                } else if (category.action === "delete") {
                    const categoryRef = db.child(category.id);
                    categoryRef.remove();
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
                    db.push({
                        name: grade.name,
                        value: grade.value,
                        date: grade.date,
                        subjectId: grade.subjectId,
                        categoryId: grade.categoryId
                    });
                    grade.action = "get";
                } else if (grade.action === "overwrite") {
                    const gradeRef = db.child(grade.id);
                    gradeRef.update({
                        name: grade.name,
                        color: grade.color
                    });
                    subject.action = "get";
                } else if (grade.action === "delete") {
                    const gradeRef = db.child(grade.id);
                    gradeRef.remove();
                    grade.action = "get";
                }
            });
        });
    }
}


//function to open subject page
function openSubjectPage(id, name) {
    document.getElementById("mainContent").style.display = "none";
    
}





//funktion to add Subject to UI

function addSubjectToUI(name, color, id) {

    const container = document.getElementsByClassName("subjects-wrapper")[0];
    if (!container) {
        return console.error("Container not found");
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
});