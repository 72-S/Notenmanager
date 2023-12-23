
// Firebase Initialisierung (Ersetzen Sie dies mit Ihrer Konfiguration)
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


// Lokale Speicherung für Daten
let localSubjects = {};
let localCategories = {};
let localGrades = {};
let selectedColor = '';
let currentSubjectId;
// Event Listener für das Laden der Anwendung
document.addEventListener('DOMContentLoaded', function () {
    
    loadSubjects();
    setSubmitButtonState();



    document.getElementById('newSubjectButton').addEventListener('click', function () {
        const popup = document.getElementById('newSubjectPopup');
        popup.style.display = 'block';
        setTimeout(function() {
            popup.classList.add('show'); // Fügt die .show Klasse hinzu
        }, 20); // Warten Sie einen kurzen Moment, bevor Sie die Klasse hinzufügen, um sicherzustellen, dass die Transition funktioniert
    });

    document.getElementById('closePopup').addEventListener('click', function (e) {
        e.preventDefault(); // Verhindert das Neuladen der Seite
        const popup = document.getElementById('newSubjectPopup');
        popup.classList.remove('show'); // Entfernt die .show Klasse
        setTimeout(function() {
            popup.style.display = 'none';
        }, 300); // Warten Sie, bis die Transition abgeschlossen ist, bevor Sie das Display auf 'none' setzen
    });




    document.getElementById('EditPopup').addEventListener('click', function(event) {
        event.preventDefault();
        // Schließen Sie das Popup
        document.getElementById('EditSubjectPopup').style.display = 'none';
    });
    
    function updateSubjectInUI(id, name, color) {
        // Zugriff auf das Fach-Element in der Benutzeroberfläche
        const subjectBox = document.getElementById(`subject-${id}`);
        if (subjectBox) {
            // Aktualisieren Sie den Namen und die Farbe des Fachs
            const nameElement = subjectBox.querySelector('.subject-name');
            if (nameElement) {
                nameElement.textContent = name;
            }
            subjectBox.style.backgroundColor = color;
        }
    }
    

    

    // Zugriff auf den "Fach bearbeiten"-Button
    // Zugriff auf den "Fach bearbeiten"-Button
        const editFachButton = document.getElementById('EditFach');

        editFachButton.addEventListener('click', function(event) {
            event.preventDefault(); // Verhindert das Neuladen der Seite
            document.getElementById('EditSubjectPopup').style.display = 'none';
            // Zugriff auf das Eingabefeld und die ausgewählte Farbe
            const editSubjectNameInput = document.getElementById('EditsubjectName');
            const selectedEditColor = document.querySelector('#EditcolorOptions .color-choice.selected').dataset.color;

            // Aktualisieren Sie das Fach in der Firebase-Datenbank
            firebase.database().ref('subjects/' + currentSubjectId).update({
                name: editSubjectNameInput.value,
                color: selectedEditColor
            }).then(() => {
                // Laden Sie das Fach erneut aus der Firebase-Datenbank
                firebase.database().ref('subjects/' + currentSubjectId).once('value').then(function(snapshot) {
                    const updatedSubject = snapshot.val();

                    // Aktualisieren Sie das Fach im lokalen Speicher
                    localSubjects[currentSubjectId] = updatedSubject;

                    // Aktualisieren Sie das Fach in der Benutzeroberfläche
                    const subjectBox = document.getElementById(`subject-${currentSubjectId}`);
                    if (subjectBox) {
                        subjectBox.textContent = updatedSubject.name;
                        subjectBox.style.backgroundColor = updatedSubject.color;
                    }

                    updateSubjectInUI(currentSubjectId, updatedSubject.name, updatedSubject.color);

                    // Schließen Sie das Bearbeitungs-Popup
                    
                });
            });
        });





    document.getElementById('subjectName').addEventListener('input', setSubmitButtonState);

    document.getElementById('createFach').addEventListener('click', function (e) {
        e.preventDefault(); // Verhindert das Neuladen der Seite
        const subjectName = document.getElementById('subjectName').value.trim();
        
        // Verwenden Sie `selectedColor`, das beim Klick auf ein Farb-Span-Element aktualisiert wurde
        if (!selectedColor) {
            alert('Bitte wählen Sie eine Farbe aus.');
            return; // Beenden Sie die Funktion frühzeitig, wenn keine Farbe ausgewählt wurde
        }

        // Fach in Firebase speichern und Fach-Box erstellen
        var newSubjectRef = firebase.database().ref('subjects').push();
        newSubjectRef.set({
            name: subjectName,
            color: selectedColor
        }).then(() => {
            createSubjectBox(subjectName, selectedColor, newSubjectRef.key);
            document.getElementById('newSubjectPopup').style.display = 'none';
            document.getElementById('newSubjectForm').reset();
            resetNewSubjectForm(); // Reset the form
            setSubmitButtonState();
            document.getElementById('noSubjectsMessage').style.display = 'none';
        });
    });
});









function resetNewSubjectForm() {
    // Setzen Sie das Eingabefeld für den Fachnamen zurück
    const subjectNameInput = document.getElementById('subjectName');
    subjectNameInput.value = '';

    // Deaktivieren Sie den Button zum Erstellen eines neuen Faches
    const createSubjectButton = document.getElementById('createFach');
    createSubjectButton.disabled = true;

    // Setzen Sie die ausgewählten Farben zurück
    const colorChoices = document.querySelectorAll('.color-choice.selected');
    colorChoices.forEach(function(choice) {
        choice.classList.remove('selected');
    });

    // Setzen Sie die Variable für die ausgewählte Farbe zurück
    selectedColor = '';
}




function selectColor(element) {
    // Entferne die 'selected'-Klasse von allen Farboptionen und füge sie dem ausgewählten hinzu
    document.querySelectorAll('.color-choice').forEach(colorElement => {
        colorElement.classList.remove('selected');
    });
    element.classList.add('selected');

    // Aktualisiere die ausgewählte Farbe
    selectedColor = element.getAttribute('data-color');
    setSubmitButtonState();
}

// Event-Listener zu allen Farbwahl-Span-Elementen hinzufügen
document.querySelectorAll('.color-choice').forEach(span => {
    span.addEventListener('click', () => selectColor(span));

});



function setSubmitButtonState() {
    const subjectName = document.getElementById('subjectName').value.trim();
    const submitButton = document.getElementById('newSubjectForm').querySelector('button[type="submit"]');
    submitButton.disabled = !subjectName || !selectedColor;
}


function setAddGradeButtonState() {
    const gradeDateElement = document.getElementById('gradeDate');
    const addGradeButton = document.getElementById('createNote');

    // Prüft, ob das Eingabefeld für das Datum leer ist
    // und deaktiviert/aktiviert den Button entsprechend
    addGradeButton.disabled = !gradeDateElement.value;
}

// Event-Listener für das Datumseingabefeld, der bei jeder Änderung aufgerufen wird
document.getElementById('gradeDate').addEventListener('input', setAddGradeButtonState);

// Initialer Aufruf, um den Zustand beim Laden der Seite zu setzen
setAddGradeButtonState();


function calculateSubjectAverage(subjectId) {
    return new Promise((resolve, reject) => {
        // Überprüfen, ob der Durchschnitt bereits berechnet wurde
        if (localSubjects[subjectId] && localSubjects[subjectId].average !== null) {
            resolve(localSubjects[subjectId].average);
            return;
        }

        var dbRef = firebase.database().ref('grades');
        dbRef.orderByChild('subjectId').equalTo(subjectId).once('value', snapshot => {
            var total = 0;
            var count = 0;
            var gradePromises = [];

            snapshot.forEach(childSnapshot => {
                var childData = childSnapshot.val();
                var gradeValue = parseFloat(childData.value); // Konvertiert den Wert in eine Zahl
                var categoryName = childData.categoryName;

                // Gewichtung der Kategorie abrufen
                var gradePromise = getCategoryWeight(subjectId, categoryName).then(categoryWeight => {
                    categoryWeight = parseFloat(categoryWeight); // Konvertiert das Gewicht in eine Zahl

                    if (!isNaN(gradeValue) && !isNaN(categoryWeight)) {
                        total += gradeValue * categoryWeight;
                        count += categoryWeight;
                    }
                }).catch(() => { });

                gradePromises.push(gradePromise);
            });

            Promise.all(gradePromises).then(() => {
                if (count > 0) {
                    var average = total / count;
                    // Ensure localSubjects[subjectId] is defined before setting its average property
                    localSubjects[subjectId] = localSubjects[subjectId] || {};
                    localSubjects[subjectId].average = average; // Speichern des Durchschnitts
                    resolve(average);
                } else {
                    // Ensure localSubjects[subjectId] is defined before setting its average property
                    localSubjects[subjectId] = localSubjects[subjectId] || {};
                    localSubjects[subjectId].average = 0; // Keine Noten gefunden, setze Durchschnitt auf 0
                    resolve(0);
                }
            });
        });
    });
}
function setCreateCategoryButtonState() {
    const categoryNameInput = document.getElementById('categoryInput');
    const createCategoryButton = document.getElementById('createCategory');
    createCategoryButton.disabled = !categoryNameInput.value.trim();
}




function createSubjectBox(name, color, id) {
    // Finde das 'rectangle' Element in deinem HTML
    const rectangle = document.querySelector('.boxmain .rectangle .subjects-wrapper');
    if (!rectangle) {
        console.error('Rectangle container not found');
        return;
    }

    const box = document.createElement('div');
    box.classList.add('subjectBox');
    box.style.backgroundColor = color;
    box.textContent = name;
    box.style.opacity = '0'; // Setzt die Anfangs-Opacity auf 0
    box.id = `subject-${id}`;

    // Event Listener für das Öffnen der Fachseite
    box.addEventListener('click', function () {
        openSubjectPage(name, id);
    });

    // Event Listener für das Kontextmenü
    box.addEventListener('contextmenu', function (event) {
        event.preventDefault(); // Verhindert das Standard-Kontextmenü
    
        // Entfernen Sie ein vorhandenes Kontextmenü
        const existingMenu = document.querySelector('.context-menu');
        if (existingMenu) {
            existingMenu.remove();
        }
    
        // Erstellen Sie das Kontextmenü
        const contextMenu = document.createElement('div');
        contextMenu.classList.add('context-menu');
        contextMenu.style.position = 'absolute';
        contextMenu.style.top = `${event.clientY}px`;
        contextMenu.style.left = `${event.clientX}px`;
        contextMenu.style.backgroundColor = 'white';
        contextMenu.style.border = '1px solid black';
        contextMenu.style.padding = '10px';
        
        // Erstellen Sie die Menüpunkte
        
        const editItem = document.createElement('button');
        editItem.textContent = 'Bearbeiten';
        editItem.addEventListener('click', function () {
            // Öffnen Sie das Popup
            currentSubjectId = id;
            const editPopup = document.getElementById('EditSubjectPopup');
            editPopup.style.display = 'block';

            // Setzen Sie den Wert des Eingabefelds auf den Namen des Fachs
            const editSubjectNameInput = document.getElementById('EditsubjectName');
            editSubjectNameInput.value = localSubjects[id].name;

            // Setzen Sie die ausgewählte Farbe auf die Farbe des Fachs
            const colorChoices = document.querySelectorAll('#EditcolorOptions .color-choice');
            colorChoices.forEach(function(choice) {
                if (choice.dataset.color === localSubjects[id].color) {
                    choice.classList.add('selected');
                } else {
                    choice.classList.remove('selected');
                }
            });

            contextMenu.remove();
            // Hier können Sie die Funktion zum Bearbeiten des Fachs aufrufen
        });
    
        const deleteItem = document.createElement('button');
        deleteItem.textContent = 'Löschen';
        deleteItem.addEventListener('click', function () {
            // Löschen Sie das Fach aus der Datenbank
            firebase.database().ref('subjects/' + id).remove();

            // Löschen Sie alle Kategorien, die zu diesem Fach gehören
            firebase.database().ref('categories').orderByChild('subjectId').equalTo(id).once('value', function(snapshot) {
                snapshot.forEach(function(childSnapshot) {
                    firebase.database().ref('categories/' + childSnapshot.key).remove();
                });
            });

            // Löschen Sie alle Noten, die zu diesem Fach gehören
            firebase.database().ref('grades').orderByChild('subjectId').equalTo(id).once('value', function(snapshot) {
                snapshot.forEach(function(childSnapshot) {
                    firebase.database().ref('grades/' + childSnapshot.key).remove();
                });
            });

            // Entfernen Sie das Fach aus der Benutzeroberfläche
            box.remove();

            // Schließen Sie das Kontextmenü
            contextMenu.remove();
        });
    
        // Fügen Sie die Menüpunkte zum Kontextmenü hinzu
        contextMenu.appendChild(editItem);
        contextMenu.appendChild(deleteItem);
    
        // Fügen Sie das Kontextmenü zum Dokument hinzu
        document.body.appendChild(contextMenu);
    });
    
    // Event Listener, um das Kontextmenü zu schließen, wenn Sie irgendwo anders klicken
    document.addEventListener('click', function (event) {
        const contextMenu = document.querySelector('.context-menu');
        if (contextMenu && !contextMenu.contains(event.target)) {
            contextMenu.remove();
        }
    });

    // Durchschnitt berechnen und anzeigen
    calculateSubjectAverage(id)
        .then(average => {
            if (average !== null) {
                localSubjects[id].average = average; // Durchschnitt in lokaler Speicherung aktualisieren
                const averageElement = document.createElement('p');
                averageElement.textContent = average.toFixed(2);
                box.appendChild(averageElement);
            }
        });

    // Füge das 'box' Element dem 'rectangle' hinzu anstatt es zum 'body' hinzuzufügen
    rectangle.appendChild(box);

    // Fügt die Fade-In-Animation hinzu
    setTimeout(function() {
        box.style.opacity = '1';
        box.classList.add('show');
    }, 20); // Warten Sie einen kurzen Moment, bevor Sie die Opacity ändern, um sicherzustellen, dass die Transition funktioniert
}



function loadSubjects() {
    var dbRef = firebase.database().ref('subjects');
    dbRef.once('value', function (snapshot) {
        if (snapshot.exists()) {
            document.getElementById('noSubjectsMessage').style.display = 'none';
        }
        else {
            document.getElementById('noSubjectsMessage').style.display = 'block';
        }
        snapshot.forEach(function (childSnapshot) {
            var childData = childSnapshot.val();
            localSubjects[childSnapshot.key] = childData;
            localSubjects[childSnapshot.key].average = null; // Durchschnitt initialisieren
            createSubjectBox(childData.name, childData.color, childSnapshot.key);
            // Durchschnitt neu berechnen
            calculateSubjectAverage(childSnapshot.key);
        });
    });
}
function openSubjectPage(subjectName, subjectId) {
    
    document.getElementById('mainContent').style.display = 'none';
    const subjectBoxes = document.getElementsByClassName('subjectBox');
    for (let box of subjectBoxes) {
        box.style.display = 'none';
    }

    const subjectPage = document.createElement('div');
    subjectPage.id = 'subjectPage';
    subjectPage.innerHTML = `<h1 id="Fachname">${subjectName}</h1>
                             <button id="CreateCategory" onclick="openCategoryCreationPopup('${subjectId}')">Neue Kategorie <img id="add" src="assets/add.svg" alt="+"></button>
                             <button id="BacktoMain" onclick="closeSubjectPage()">Zurück zur Hauptseite <img id="back" src="assets/back.svg" alt="-"></button>
                         <div id="categoryCreationPopup" class="popup2" style="display: none;">
                            <div class="popup-content2">
                             <input id="categoryInput" type="text" placeholder="Kategoriename">
                            <select id="weightInput">
                                <option value="0.25">0.25</option>
                                <option value="0.5">0.5</option>
                                <option value="0.75">0.75</option>
                                <option value="1" selected>1</option>
                                <option value="1.25">1.25</option>
                                <option value="1.5">1.5</option>
                                <option value="1.75">1.75</option>
                                <option value="2">2</option>
                            </select>
                             <div class="category-popup-buttons">
                             <button id="createCategory" onclick="createCategory('${subjectId}')">Kategorie erstellen</button>
                             <button id="cancelCategory" onclick="closeCategoryCreationPopup()">Schließen</button>
                             </div>
                             </div>
                         </div>
                         <div class="categoriesContainer"></div>`;
    document.body.appendChild(subjectPage);

    // Rufen Sie diese Funktion auf, um den Anfangszustand des Buttons zu setzen
setCreateCategoryButtonState();

// Fügen Sie den Event-Listener hinzu, der die Funktion aufruft, wenn sich der Inhalt des Eingabefeldes ändert
document.getElementById('categoryInput').addEventListener('input', setCreateCategoryButtonState);

    // Kategorien und Noten für das Fach laden
    loadCategories(subjectId);
    loadGradesForSubject(subjectId);
}

function resetCategoryInputs() {
    const categoryInput = document.getElementById('categoryInput');
    const weightInput = document.getElementById('weightInput');
    
    categoryInput.value = ''; // Setzt den Kategorienamen zurück
    weightInput.value = '1'; // Setzt das Gewicht zurück auf den Standardwert
}

function closeCategoryCreationPopup() {
    resetCategoryInputs();
    setCreateCategoryButtonState();
    document.getElementById('categoryCreationPopup').style.display = 'none';
}

function openCategoryCreationPopup(subjectId) {
    document.getElementById('categoryCreationPopup').style.display = 'block';
    document.getElementById('categoryCreationPopup').setAttribute('data-subjectId', subjectId);
    console.log(subjectId);
}

function createCategory(subjectId) {
    const categoryName = document.getElementById('categoryInput').value;
    const categoryWeight = document.getElementById('weightInput').value || 1;

    var newCategoryRef = firebase.database().ref('categories').push();
    newCategoryRef.set({
        name: categoryName,
        weight: categoryWeight,
        subjectId: subjectId
    }).then(() => {
        // Aktualisieren der lokalen Speicherung mit der neuen Kategorie
        if (!localCategories[subjectId]) {
            localCategories[subjectId] = [];
        }
        localCategories[subjectId].push({
            name: categoryName,
            weight: categoryWeight
        });

        createCategoryBar(categoryName, categoryWeight, subjectId);
        document.getElementById('categoryCreationPopup').style.display = 'none';
        document.getElementById('categoryInput').value = '';
        document.getElementById('weightInput').value = '';
        resetCategoryInputs();
        setCreateCategoryButtonState();
    });
}


// Diese Funktion wird nur einmal aufgerufen, wenn die Seite geladen wird
function loadCategories(subjectId) {
    if (localCategories[subjectId]) {
        localCategories[subjectId].forEach(category => {
            createCategoryBar(category.name, category.weight, subjectId);
        });
    } else {
        var dbRef = firebase.database().ref('categories');
        dbRef.orderByChild('subjectId').equalTo(subjectId).once('value', function (snapshot) {
            localCategories[subjectId] = [];
            snapshot.forEach(function (childSnapshot) {
                var childData = childSnapshot.val();
                localCategories[subjectId].push(childData);
                createCategoryBar(childData.name, childData.weight, subjectId);
            });
        });
    }
}

// Diese Funktion wird aufgerufen, um eine neue Kategorie hinzuzufügen
function addCategory(subjectId, categoryName, categoryWeight) {
    var newCategoryRef = firebase.database().ref('categories').push();
    newCategoryRef.set({
        name: categoryName,
        weight: categoryWeight,
        subjectId: subjectId
    }).then(() => {
        createCategoryBar(categoryName, categoryWeight, subjectId);
        document.getElementById('categoryCreationPopup').style.display = 'none';
        document.getElementById('categoryName').value = '';
        document.getElementById('categoryWeight').value = '';

        // Durchschnitt neu berechnen
        calculateSubjectAverage(subjectId);
    });
}



function createCategoryBar(name, weight, subjectId) {
    const categoryBar = document.createElement('div');
    categoryBar.className = 'categoryBar';
    categoryBar.innerHTML = `
        <div class="titleContainer">
            <span id="CategoriNameTitle">${name}</span>
            <span id="GewichtNameTitle">x ${weight}</span>
        </div>
        
        <button id="GradeCreationPopupButton" onclick="openGradeCreationPopup('${name}', '${subjectId}')">Note hinzufügen <img id="add" src="assets/add.svg" alt="+"></button>
        <div class="gradesContainer"></div>
        `;
    categoryBar.id = `category-${name}`; // Hinzufügen einer ID für die spätere Verwendung

    const subjectPage = document.getElementById('subjectPage');
    const subjectContainer = subjectPage.querySelector('.categoriesContainer');
    subjectContainer.appendChild(categoryBar);
}


function closeSubjectPage() {
    document.getElementById('mainContent').style.display = 'block';
    const subjectBoxes = document.getElementsByClassName('subjectBox');
    for (let box of subjectBoxes) {
        box.remove(); // Remove each subject box
    }
    document.getElementById('subjectPage').remove();
    // Subjects und deren Durchschnitt neu laden
    loadSubjects();
}


function openGradeCreationPopup(categoryName, subjectId) {
    // Speichern Sie categoryName und subjectId als globale Variablen oder als Attribute des Popups
    window.currentCategoryName = categoryName;
    window.currentSubjectId = subjectId;

    const gradePopup = document.getElementById('gradePopup');
    gradePopup.style.display = 'block';
}


function addGrade() {
    const gradeValueElement = document.getElementById('gradeValue');
    const gradeDateElement = document.getElementById('gradeDate');

    if (!gradeValueElement || !gradeDateElement) {
        console.error('Grade input elements not found');
        return;
    }

    const gradeValue = gradeValueElement.value;
    const gradeDate = gradeDateElement.value;

    if (!gradeValue || !gradeDate) {
        console.error('Grade value or date is missing');
        return;
    }

    var newGradeRef = firebase.database().ref('grades').push();
    newGradeRef.set({
        value: gradeValue,
        date: gradeDate,
        categoryName: window.currentCategoryName,
        subjectId: window.currentSubjectId
    }).then(() => {
        // Aktualisieren Sie die lokale Speicherung mit der neuen Note
        if (!localGrades[window.currentSubjectId]) {
            localGrades[window.currentSubjectId] = [];
        }
        localGrades[window.currentSubjectId].push({
            value: gradeValue,
            date: gradeDate,
            categoryName: window.currentCategoryName
        });

        // Zeigen Sie die neue Note an
        displayGrade(window.currentCategoryName, gradeValue, gradeDate);

        gradeDateElement.value = '';
        setAddGradeButtonState();
        closeGradePopup();

        // Durchschnitt neu berechnen
        calculateSubjectAverage(window.currentSubjectId);
    }).catch(error => {
        console.error('Error adding grade:', error);
    });
}





function closeGradePopup() {
    const gradePopup = document.getElementById('gradePopup');
    const gradeDateElement = document.getElementById('gradeDate');
    
    // Setzen Sie das Datum zurück
    gradeDateElement.value = '';
    
    // Aktualisieren Sie den Zustand des Buttons zum Hinzufügen von Noten
    setAddGradeButtonState();
    
    gradePopup.style.display = 'none';
}


document.getElementById('closePopup').addEventListener('click', function(e) {
    e.preventDefault();
    resetNewSubjectForm();
    const popup = document.getElementById('newSubjectPopup');
    popup.style.display = 'none';
});


function displayGrade(categoryName, gradeValue, gradeDate) {
    const gradeElement = document.createElement('div');
    gradeElement.className = 'gradeElement';
    gradeElement.innerHTML = ` 
        <span id="gradeDate">${gradeDate}</span>
        <span id="gradeValue">${gradeValue}</span>
        
    `;

    // Anhängen der Note an die entsprechende Kategorie
    const categoryBar = document.getElementById(`category-${categoryName}`);
    
    const gradesContainer = categoryBar.querySelector('.gradesContainer');
    gradesContainer.appendChild(gradeElement);
}



function getCategoryWeight(subjectId, categoryName) {
    return new Promise((resolve, reject) => {
        var dbRef = firebase.database().ref('categories');
        dbRef.orderByChild('subjectId').equalTo(subjectId).once('value', function (snapshot) {
            snapshot.forEach(function (childSnapshot) {
                var childData = childSnapshot.val();
                if (childData.name === categoryName) {
                    resolve(parseFloat(childData.weight)); // Konvertiert das Gewicht in eine Zahl
                }
            });
            reject('Kategorie nicht gefunden');
        });
    });
}

function loadGradesForSubject(subjectId) {
    if (localGrades[subjectId]) {
        localGrades[subjectId].forEach(grade => {
            displayGrade(grade.categoryName, grade.value, grade.date);
        });
    } else {
        var dbRef = firebase.database().ref('grades');
        dbRef.orderByChild('subjectId').equalTo(subjectId).once('value', function (snapshot) {
            localGrades[subjectId] = [];
            snapshot.forEach(function (childSnapshot) {
                var childData = childSnapshot.val();
                localGrades[subjectId].push(childData);
                displayGrade(childData.categoryName, childData.value, childData.date);
            });
        });
    }
}




function addSubject() {
    const subjectName = document.getElementById('newSubjectName').value;
    const subjectColor = document.getElementById('newSubjectColor').value;

    // Fach in Firebase speichern
    var newSubjectRef = firebase.database().ref('subjects').push();
    newSubjectRef.set({
        name: subjectName,
        color: subjectColor
    }).then(() => {
        
        createSubjectBox(subjectName, subjectColor, newSubjectRef.key);

        // Fach im Cache speichern
        cache.subjects[newSubjectRef.key] = {
            name: subjectName,
            color: subjectColor
        };

        // Verstecke die Nachricht und zeige den Button an
        document.getElementById('noSubjectsMessage').style.display = 'none';
        document.getElementById('newSubjectButton').style.display = 'block';

        // Durchschnitt für das neue Fach berechnen
        calculateSubjectAverage(newSubjectRef.key);
        
    });
}



