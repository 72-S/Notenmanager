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



class SaveLocalData {
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
                    color: subject.color
                });
            });
            if (callback && typeof callback === 'function') {
                callback();
            }
        });
    }

    loadCategories() {
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
                    subjectId: category.subjectId
                });
            });
        });
    }

    loadGrades() {
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
                    categoryId: grade.categoryId
                });
            });
        });
    }
}



//funktion to add Subject to UI

function addSubjectToUI(name, color, id) {

    const container = document.getElementsByClassName("subjects-wrapper")[0];
    if (!container) {
        return console.error("Container not found");
    }
    const box = document.createElement("div");
    box.classList.add("subject-box");
    box.style.backgroundColor = color;
    box.textContent = name;

    const average = document.createElement("p");
    average.classList.add("subject-average");
    average.textContent = "0.0";

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
    box.appendChild(average);
}


editSubject = (id) => {
    const popup = document.getElementById('editFachPopup');
    popup.style.display = "block";
}


deleteSubject = (id, box) => {
    return;
}

document.addEventListener("DOMContentLoaded", function () {
    const saveLocalData = new SaveLocalData();
    saveLocalData.loadSubjects(function () {
        const noSubjectMessage = document.getElementById("noSubjectMessage");
        if (Object.keys(localSubjects).length === 0) {
            noSubjectMessage.style.display = "block";
        } else {
            noSubjectMessage.style.display = "none";
            Object.values(localSubjects).forEach(subjectArray => {
                subjectArray.forEach(subject => {
                    addSubjectToUI(subject.name, subject.color, subject.id);
                    console.log(subject.name, subject.color, subject.id);
                });
            });
        }
    });


    saveLocalData.loadCategories();
    saveLocalData.loadGrades();
});