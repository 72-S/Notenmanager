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
let userId = null;

class SaveLocalDataFromDB {
    loadSubjects(callback, userId) {
        const db = firebase.database().ref("/users/" + userId + "/subjects");
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

    loadCategories(callback, userId) {
        const db = firebase.database().ref("/users/" + userId + "/categories");
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

    loadGrades(callback, userId) {
        const db = firebase.database().ref("/users/" + userId + "/grades");
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
    pushSubjects(userId) {
        const db = firebase.database().ref("/users/" + userId + "/subjects");
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
                        const notSubjectMessage = document.getElementById("noSubjectMessage");
                        if (Object.keys(localSubjects).length === 0) {
                            notSubjectMessage.style.display = "block";
                        } else {
                            notSubjectMessage.style.display = "none";
                        }
                    });
                    subject.action = "get";
                }
            });
        });
    }

    pushCategories(userId) {
        const db = firebase.database().ref("/users/" + userId + "/categories");
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

    pushGrades(userId) {
        const db = firebase.database().ref("/users/" + userId + "/grades");
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

function signInWithGoogle() {
    var provider = new firebase.auth.GoogleAuthProvider();
    firebase.auth().signInWithPopup(provider).then(function (result) {
    }).catch(function (error) {
        var errorCode = error.code;
        var errorMessage = error.message;
        var email = error.email;
        var credential = error.credential;
        console.error("Authentifizierungsfehler", errorCode, errorMessage, email, credential);
    });
}

function signOut() {
    if (confirm("Möchten Sie sich wirklich abmelden?")) {
        firebase.auth().signOut().then(function () {
            userId = null;
            console.log("Abmeldung erfolgreich");
            localCategories = {};
            localGrades = {};
            localSubjects = {};
            removeAllSubjectsFromUI();
        }).catch(function (error) {
            console.error("Fehler beim Abmelden", error);
        });
    }
}


function checkAuthStatus() {
    firebase.auth().onAuthStateChanged(function (user) {
        if (user) {
            // Benutzer ist angemeldet.
            document.getElementById("mainContent").style.display = "block";
            document.getElementById("loginContent").style.display = "none";
            loadUserData(user.uid);
            userId = user.uid;
        } else {
            // Benutzer ist nicht angemeldet.
            console.log("Kein Benutzer angemeldet.");
            document.getElementById("mainContent").style.display = "none";
            document.getElementById("loginContent").style.display = "block";
        }
    });
}


function loadUserData(userId) {
    const saveLocalData = new SaveLocalDataFromDB();
    saveLocalData.loadSubjects(() => {
        saveLocalData.loadCategories(() => {
            saveLocalData.loadGrades(() => {
                removeAllSubjectsFromUI();
                removeAllCategoriesFromUI();
                const noSubjectMessage = document.getElementById("noSubjectMessage");
                if (Object.keys(localSubjects).length === 0) {
                    noSubjectMessage.style.display = "block";
                } else {
                    noSubjectMessage.style.display = "none";
                }
                Object.values(localSubjects).forEach(subjectArray => {
                    subjectArray.forEach(subject => {
                        addSubjectToUI(subject.name, subject.color, subject.id);
                        const average = calculateAverageForSubject(subject.id);
                        document.getElementById("subject-average" + subject.id).textContent = average;
                    });
                });
                calculateAverageForAllSubjects();
                generateChart();
                generateChartDistribution();
            }, userId);
        }, userId);
    }, userId);
}

function getWeekNumber(d) {
    d = new Date(Date.UTC(d.getFullYear(), d.getMonth(), d.getDate()));
    d.setUTCDate(d.getUTCDate() + 4 - (d.getUTCDay() || 7));
    const yearStart = new Date(Date.UTC(d.getUTCFullYear(), 0, 1));
    const weekNo = Math.ceil(((d - yearStart) / 86400000 + 1) / 7);
    return d.getUTCFullYear().toString().substring(2) + "-W" + weekNo.toString().padStart(2, '0');
}


function hexToRGBA(hex, opacity) {
    let r = parseInt(hex.slice(1, 3), 16),
        g = parseInt(hex.slice(3, 5), 16),
        b = parseInt(hex.slice(5, 7), 16);

    if (opacity) {
        return `rgba(${r}, ${g}, ${b}, ${opacity})`;
    } else {
        return `rgb(${r}, ${g}, ${b})`;
    }
}

function changeTextWithTransition(element, newText) {
    if (element.textContent !== newText) {
        element.style.opacity = '0';
        element.style.transform = 'translateY(-10px)';
        setTimeout(() => {
            element.textContent = newText;
            element.style.opacity = '1';
            element.style.transform = 'translateY(0)';
        }, 300);
    }
}

function generateChartData() {
    const grades = [];
    Object.values(localGrades).forEach(subjectArray => {
        subjectArray.forEach(grade => {
            grades.push({
                value: parseFloat(grade.value),
                week: getWeekNumber(new Date(grade.date))
            });
        });
    });
    const gradesByWeek = grades.reduce((acc, grade) => {
        acc[grade.week] = acc[grade.week] || [];
        acc[grade.week].push(grade.value);
        return acc;
    }, {});
    const chartData = Object.entries(gradesByWeek).map(([week, values]) => {
        const average = values.reduce((a, b) => a + b, 0) / values.length;
        return {
            x: week,
            y: average.toFixed(1)
        };
    });
    chartData.sort((a, b) => a.x.localeCompare(b.x));
    return chartData;
}



function generategradeDistributionChartData() {
    let subjectAverages = [];
    let totalAverage = 0;
    Object.values(localSubjects).forEach(subjectArray => {
        subjectArray.forEach(subject => {
            const element = document.getElementById(subject.id);
            if (element) {
                const average = Number(element.getAttribute("data-subject-average"));
                if (average !== 0) {
                    subjectAverages.push({ name: subject.name, average: average, color: subject.color });
                    totalAverage += average;
                }
            }
        });
    });
    let subjectWeights = subjectAverages.map(subject => {
        return {
            name: subject.name,
            weight: parseFloat(((subject.average / totalAverage) * 100).toFixed(2)),
            color: hexToRGBA(subject.color, 0.3),
            borderColor: hexToRGBA(subject.color, 1)
        };
    });

    return subjectWeights;
}




function generateChart() {
    const chartData = generateChartData();
    const canvas = document.getElementById('gradeChart');
    const ctx = canvas.getContext('2d');

    if (window.gradeChart instanceof Chart) {
        window.gradeChart.destroy();
    }
    window.gradeChart = new Chart(ctx, {
        type: 'line',
        data: {
            labels: chartData.map(data => data.x),
            datasets: [{
                label: 'Notedurchschnitt der Woche',
                data: chartData.map(data => data.y),
                backgroundColor: 'rgba(54, 162, 235, 0.2)',
                borderColor: 'rgba(54, 162, 235, 1)',
                borderWidth: 1.3,
                fill: false,
                pointRadius: 3,
                tension: 1
            }]
        },
        options: {
            plugins: {
                legend: {
                    display: false
                }
            },

            animations: {
                tension: {
                    duration: 1000,
                    easing: 'linear',
                    from: 0.7,
                    to: 0,
                    loop: false
                }
            },
            scales: {
                y: {
                    beginAtZero: false,
                    reverse: true,
                    ticks: {
                        stepSize: 1,
                        max: 6,
                        min: 1
                    }
                },
                x: {
                }
            },
            responsive: true,
            maintainAspectRatio: false
        }
    });
}


function generateChartDistribution() {
    const chartData = generategradeDistributionChartData();
    const canvas = document.getElementById('gradeDistributionChart');
    const ctx = canvas.getContext('2d');
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    if (window.gradeDistributionChart instanceof Chart) {
        window.gradeDistributionChart.destroy();
    }
    window.gradeDistributionChart = new Chart(ctx, {
        type: 'polarArea',
        data: {
            labels: chartData.map(data => data.name),
            datasets: [{
                label: 'Fach',
                data: chartData.map(data => data.weight),
                backgroundColor: chartData.map(data => data.color),
                borderColor: chartData.map(data => data.borderColor),
                borderWidth: 1.3,
                fill: false,
                pointRadius: 3,
                tension: 1
            }]
        },
        options: {
            plugins: {
                legend: {
                    display: true
                },
                tooltip: {
                    callbacks: {
                        label: function (context) {
                            return "Gewichtung" + ': ' + context.formattedValue + '%';
                        }
                    }
                }
            },

            animations: {
                tension: {
                    duration: 1000,
                    easing: 'linear',
                    from: 0.7,
                    to: 0,
                    loop: false
                }
            },
            scales: {
                r: {
                    ticks: {
                        backdropColor: 'transparent'
                    }
                }
            },
            responsive: true,
            maintainAspectRatio: false
        }
    });
}




function calculateAverageForSubject(subjectId) {
    let sum = 0;
    let count = 0;
    Object.values(localGrades).forEach(gradeArray => {
        gradeArray.forEach(grade => {
            if (grade.subjectId === subjectId) {
                const category = localCategories[grade.categoryId][0];
                const categoryWeight = category ? parseFloat(category.weight) : 1;
                let gradeValue = parseFloat(grade.value);
                if (!isNaN(gradeValue) && !isNaN(categoryWeight)) {
                    sum += gradeValue * categoryWeight;
                    count += categoryWeight;
                }
            }
        });
    });
    if (count === 0) {
        return "0.00";
    }
    const average = sum / count;
    const container = document.getElementById(subjectId);
    container.setAttribute("data-subject-average", average);
    return average.toFixed(2);
}

function calculateAverageForAllSubjects() {
    let subjectSum = [];
    let count = 0;
    Object.values(localSubjects).forEach(subjectArray => {
        subjectArray.forEach(subject => {
            const element = document.getElementById(subject.id);
            if (element) {
                const average = element.getAttribute("data-subject-average");
                const averageNumber = Number(average);
                if (averageNumber !== 0) {
                    subjectSum.push(averageNumber);
                    count++;
                }
            }
        });
    });

    const allAverage = count > 0
        ? subjectSum.reduce((a, b) => a + b, 0) / count
        : 0;
    document.getElementById("averageMessage").textContent = "Ø " + allAverage.toFixed(2);
}



//function to open subject page
function openSubjectPage(id, name) {
    closeAllPopups();
    document.getElementById("zurückZurMainPage").setAttribute("category-data-subject-id", id);
    document.getElementById("mainContent").style.display = "none";
    document.getElementById("subjectContent").style.display = "block";
    document.getElementById("neueKategoriePopup").setAttribute("category-data-subject-id", id);
    document.getElementById("FachName").textContent = name;
    const subjectboxes = document.getElementsByClassName("subject-box");
    for (let i = 0; i < subjectboxes.length; i++) {
        subjectboxes[i].classList.remove("show");
    }
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
            <span id="category-name${id}" class="category-name">${name}</span>
            <span id="category-weight${id}" class="category-weight">x ${weight}</span>
        </div>
        <div class="buttonsContainerKategorie">
        <button class="neuesFachButton" onclick="createGrade('${subjectId}', '${id}')">Note hinzufügen <img src="assets/add.svg" alt="+" class="IMG"></button>
        <button class="neuesFachButton" onclick="editGrades('${subjectId}', '${id}')">Bearbeiten <img src="assets/edit.svg" alt="+" class="IMG"></button>
        </div>
        <div id="gradesContainer${id}" class="gradesContainer"></div>
        `;

    container.appendChild(box);
    setTimeout(function () {
        box.classList.add("show");
    }, 20);
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
    const input = document.getElementById("neueNotePopup-input");
    const select = document.getElementById("neueNotePopup-select");
    const currentDate = new Date();
    const formattedDate = currentDate.toISOString().split('T')[0];
    const saveButton = document.getElementById('neueNotePopup-create');
    saveButton.disabled = false;
    input.value = formattedDate;
    select.value = 3;
    popup.style.display = "block";
    setTimeout(() => {
        popup.classList.add('show');
    }, 20);
    popup.setAttribute('data-grade-subject-id', subjectId);
    popup.setAttribute('data-grade-category-id', categoryId);

}

function editGrades(subjectId, categoryId) {
    const name = document.getElementById("category-name" + categoryId).textContent;
    let weight = document.getElementById("category-weight" + categoryId).textContent;
    weight = weight.substring(2);
    closeAllPopups();
    const popup = document.getElementById('editNotePopup');
    popup.style.display = "block";
    setTimeout(() => {
        popup.classList.add('show');
    }, 20);
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
    checkbox.addEventListener('change', function () {
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
    gradePopupContainer.addEventListener('click', function (event) {
        if (event.target !== checkbox && event.target !== gradePopupContainer.querySelector('label')) {
            checkbox.checked = !checkbox.checked;
            checkbox.dispatchEvent(new Event('change'));
        }
    });
}


function showContextMenu(event, id, color, name, box) {
    event.preventDefault();
    const existingMenu = document.querySelector('.context-menu');
    if (existingMenu) {
        existingMenu.classList.remove('show');
        setTimeout(function () {
            existingMenu.remove();
        }, 100);
    }

    const contextMenuHTML = `
        <div class="context-menu" style="position: absolute; top: ${event.touches[0].clientY}px; left: ${event.touches[0].clientX}px;">
            <button class="popup-buttons" id="EditSubjectContext">Bearbeiten</button>
            <button class="popup-buttons" id="DeleteSubjectContext">Löschen</button>
        </div>`;

    document.body.insertAdjacentHTML('beforeend', contextMenuHTML);

    setTimeout(() => {
        document.querySelector('.context-menu').classList.add('show');
    }, 20);

    document.getElementById('EditSubjectContext').addEventListener('click', () => editSubject(id, color, name));
    document.getElementById('DeleteSubjectContext').addEventListener('click', () => deleteSubject(id, box));
}



//funktion to add Subject to UI

function addSubjectToUI(name, color, id) {
    let touchTimer;
    const longPressDuration = 300;

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
    average.id = "subject-average" + id;
    average.textContent = "0.00";


    box.addEventListener("click", function () {
        openSubjectPage(id, name);
    });

    box.addEventListener("touchstart", function (event) {
        box.classList.add('pressed');
        touchTimer = setTimeout(() => {
            box.classList.remove('pressed'); 
            showContextMenu(event, id, color, name, box); 
        }, longPressDuration);
    }, { passive: true });

    box.addEventListener("touchend", function () {
        clearTimeout(touchTimer);
        box.classList.remove('pressed');
    });

    box.addEventListener("touchmove", function () {
        clearTimeout(touchTimer);
        box.classList.remove('pressed');
    });

    box.addEventListener("contextmenu", function (event) {
        event.preventDefault();
        const existingMenu = document.querySelector('.context-menu');
        if (existingMenu) {
            contextMenu.classList.remove('show');
            setTimeout(function () {
                contextMenu.remove();
            }, 100);
        }

        const contextMenuHTML = `
            <div class="context-menu" style="position: absolute; top: ${event.clientY}px; left: ${event.clientX}px;">
                <button class="popup-buttons" id="EditSubjectContext">Bearbeiten</button>
                <button class="popup-buttons" id="DeleteSubjectContext">Löschen</button>
            </div>`;

        document.body.insertAdjacentHTML('beforeend', contextMenuHTML);

        setTimeout(() => {
            document.querySelector('.context-menu').classList.add('show');
        }, 20);

        document.getElementById('EditSubjectContext').addEventListener('click', () => editSubject(id, color, name));
        document.getElementById('DeleteSubjectContext').addEventListener('click', () => deleteSubject(id, box));
    });


    container.appendChild(box);
    box.appendChild(subjectName);
    box.appendChild(average);

    setTimeout(function () {
        box.classList.add("show");
    }, 20);
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
        <span id="gradeDate" class="gradeDate grade">${date}</span>
        <span id="gradeValue" class="gradeValue grade">${value}</span>
        
    `;
    container.appendChild(gradeElement);
    setTimeout(function () {
        const gradeDates = document.getElementsByClassName("gradeDate");
        const gradeValues = document.getElementsByClassName("gradeValue");

        for (let i = 0; i < gradeDates.length; i++) {
            gradeDates[i].classList.add("show");
        }
        for (let i = 0; i < gradeValues.length; i++) {
            gradeValues[i].classList.add("show");
        }
    }, 20);
}


function editSubject(id, color, name) {
    const popup = document.getElementById('editFachPopup');
    const popupInput = document.getElementById('editFachPopup-input');
    const subjectName = document.getElementById(id).querySelector('.subject-name').textContent;
    const contextMenu = document.querySelector('.context-menu');
    contextMenu.classList.remove('show');
    setTimeout(function () {
        contextMenu.remove();
    }, 100);
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
    popupInput.value = subjectName;
    popup.style.display = "block";
    setTimeout(() => {
        popup.classList.add('show');
    }, 20);
}


function deleteSubject(id, box) {
    const contextMenu = document.querySelector('.context-menu');
    contextMenu.classList.remove('show');
    setTimeout(function () {
        contextMenu.remove();
    }, 100);

    box.classList.remove("show");
    setTimeout(function () {
        box.remove();
        pushSubjectClass(id, "", "", "delete");
        generateChart();
        calculateAverageForAllSubjects();
        generateChartDistribution();
    }, 300);
}

function selectColor(element) {
    document.querySelectorAll('.color-choice').forEach(colorElement => {
        colorElement.classList.remove('selected');
    });
    element.classList.add('selected');
    selectedColor = element.getAttribute('data-color');
    setButtonStateneuesFachPopup();
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
    const categoryName = document.getElementById("category-name" + categoryId);
    const categoryWeight = document.getElementById("category-weight" + categoryId);
    changeTextWithTransition(categoryName, input);
    changeTextWithTransition(categoryWeight, "x " + select);
    if (gradesToDelete.length > 0) {
        gradesToDelete.forEach(gradeId => {
            const gradeElement = document.getElementById(gradeId);
            const gradeDateElement = gradeElement.querySelector('.gradeDate');
            const gradeValueElement = gradeElement.querySelector('.gradeValue');
            gradeDateElement.classList.remove("show");
            gradeValueElement.classList.remove("show");
            setTimeout(function () {
                gradeElement.remove();
            }, 120);
            pushGradeClass(gradeId, "", "", "", "", "delete");
            gradesToDelete = [];
        });
    }
    if (CheckedButton.classList.contains('checked')) {
        const categoryElement = document.getElementById(categoryId);
        categoryElement.classList.remove("show");
        setTimeout(function () {
            categoryElement.remove();
        }, 180);
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
        pushData.pushSubjects(userId);
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
        pushData.pushCategories(userId);
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
        pushData.pushGrades(userId);
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


function getCookie(name) {
    let cookie = {};
    document.cookie.split(';').forEach(function(el) {
        let [k,v] = el.split('=');
        cookie[k.trim()] = v;
    })
    return cookie[name];
}


document.addEventListener("DOMContentLoaded", function () {
    const body = document.body;
    const darkModeIcon = document.getElementById('darkModeIcon');
    const darkModeStatus = getCookie('darkMode');

    if (darkModeStatus === 'true') {
        body.classList.add('dark');
        darkModeIcon.src = "assets/darkmode.svg";
    } else {
        body.classList.remove('dark');
        darkModeIcon.src = "assets/lightmode.svg";
    }
    checkAuthStatus();
    setButtonStateneuesFachPopup();
    disableAllButtons();

    //EVENT LISTENER
    document.addEventListener('click', function (event) {
        const contextMenu = document.querySelector('.context-menu');
        if (contextMenu && !contextMenu.contains(event.target)) {
            contextMenu.classList.remove('show');
            setTimeout(function () {
                contextMenu.remove();
            }, 100);
        }
    });

    document.querySelectorAll('.color-choice').forEach(span => {
        span.addEventListener('click', () => selectColor(span));
    });

    document.getElementById("neuesFachButtonClick").addEventListener("click", function () {
        closeAllPopups();
        const popup = document.getElementById('neuesFachPopup');
        const input = document.getElementById("neusFachPopup-input");
        input.value = "";
        popup.style.display = "block";
        setTimeout(() => {
            popup.classList.add('show');
        }, 20);
        disableAllButtons();
    });

    document.getElementById("neuesFachPopup-cancel").addEventListener("click", function () {
        const popup = document.getElementById('neuesFachPopup');
        popup.classList.remove('show');
        setTimeout(function () {
            popup.style.display = "none";
        }, 100);
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
        popup.classList.remove('show');
        setTimeout(function () {
            popup.style.display = "none";
        }, 100);
        resetFachPopup();
        disableAllButtons();
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
        changeTextWithTransition(subjectBox.getElementsByClassName("subject-name")[0], name);
        resetFachPopup();
        disableAllButtons();
        generateChartDistribution();
    });

    document.getElementById("neueKategorieButtonClick").addEventListener("click", function () {
        closeAllPopups();
        const popup = document.getElementById('neueKategoriePopup');
        const input = document.getElementById("neueKategoriePopup-input");
        const select = document.getElementById("neueKategoriePopup-select");
        input.value = "";
        select.value = 1;
        popup.style.display = "block";
        setTimeout(() => {
            popup.classList.add('show');
        }, 20);
        disableAllButtons();
    });

    document.getElementById("zurückZurMainPage").addEventListener("click", function () {
        const subjectId = this.getAttribute('category-data-subject-id');
        closeAllPopups();
        document.getElementById("mainContent").style.display = "block";
        document.getElementById("subjectContent").style.display = "none";
        removeAllCategoriesFromUI();
        disableAllButtons();
        generateChart();
        const average = calculateAverageForSubject(subjectId);
        document.getElementById("subject-average" + subjectId).textContent = average;
        calculateAverageForAllSubjects();
        generateChartDistribution();
        const subjectboxes = document.getElementsByClassName("subject-box");
        for (let i = 0; i < subjectboxes.length; i++) {
            subjectboxes[i].classList.add("show");
        }
    });

    document.getElementById("neueKategoriePopup-cancel").addEventListener("click", function () {
        const popup = document.getElementById('neueKategoriePopup');
        popup.classList.remove('show');
        setTimeout(function () {
            popup.style.display = "none";
        }, 100);
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
        popup.classList.remove('show');
        setTimeout(function () {
            popup.style.display = "none";
        }, 100);
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
        popup.classList.remove('show');
        setTimeout(function () {
            popup.style.display = "none";
        }, 100);
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
        popup.classList.remove('show');
        setTimeout(function () {
            popup.style.display = "none";
        }, 100);
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
    document.getElementById('Notetrashcan-button').addEventListener('click', function (event) {
        this.classList.toggle('checked');
    });
    // Event-Listener für den Anmelde-Button
    document.getElementById('loginButton').addEventListener('click', signInWithGoogle);
    // Event-Listener für den Abmelde-Button
    document.getElementById('logoutButton').addEventListener('click', signOut);

    document.getElementById('darkMode').addEventListener('click', function () {
        const body = document.body;
        const darkModeIcon = document.getElementById('darkModeIcon');
    
        if (body.classList.contains('dark')) {
            body.classList.remove('dark');
            darkModeIcon.src = "assets/lightmode.svg";
            document.cookie = "darkMode=false; path=/; max-age=31536000";
        } else {
            body.classList.add('dark');
            darkModeIcon.src = "assets/darkmode.svg";
            document.cookie = "darkMode=true; path=/; max-age=31536000";
        }
    });
});