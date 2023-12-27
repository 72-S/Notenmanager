
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
let gradesToDelete = [];
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
                
                    removeBoxes(); 
                    
            });
        });

        function removeBoxes() {
            document.getElementById('mainContent').style.display = 'block';
            const subjectBoxes = Array.from(document.getElementsByClassName('subjectBox'));
            for (let box of subjectBoxes) {
                box.remove(); // Remove each subject box
            }
            loadSubjects();
        }
       

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
            localSubjects[newSubjectRef.key] = {
                name: subjectName,
                color: selectedColor,
                average: null // Setzen Sie den Durchschnittswert initial auf null
            };
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
            subjectId: subjectId,
            weight: categoryWeight,
            id: newCategoryRef.key // Die ID von Firebase
        });

        createCategoryBar(categoryName, categoryWeight, subjectId, newCategoryRef.key);
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
            createCategoryBar(category.name, category.weight, subjectId, category.id);
        });
    } else {
        var dbRef = firebase.database().ref('categories');
        dbRef.orderByChild('subjectId').equalTo(subjectId).once('value', function (snapshot) {
            localCategories[subjectId] = [];
            snapshot.forEach(function (childSnapshot) {
                var childData = childSnapshot.val();
                // Add the id to the local object
                childData.id = childSnapshot.key;
                localCategories[subjectId].push(childData);
                createCategoryBar(childData.name, childData.weight, subjectId, childSnapshot.key);
            });
        });
    }
}

// Diese Funktion wird aufgerufen, um eine neue Kategorie hinzuzufügen



function createCategoryBar(name, weight, subjectId, categoryId) {
    const categoryBar = document.createElement('div');
    categoryBar.className = 'categoryBar';
    categoryBar.innerHTML = `
        <div class="titleContainer">
            <span id="CategoriNameTitle">${name}</span>
            <span id="GewichtNameTitle">x ${weight}</span>
        </div>
        <div class="buttonsContainerKategorie">
        <button id="GradeCreationPopupButton" onclick="openGradeCreationPopup('${name}', '${subjectId}', '${categoryId}')">Note hinzufügen <img id="add" src="assets/add.svg" alt="+"></button>
        <button id="GradeEditPopupButton" onclick="openGradeEditPopup('${name}', '${subjectId}', '${weight}', '${categoryId}')">Bearbeiten <img id="add" src="assets/edit.svg" alt="+"></button>
        </div>
        <div class="gradesContainer"></div>
        `;
    categoryBar.id = `category-${categoryId}`; // Hinzufügen einer ID für die spätere Verwendung

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


function openGradeCreationPopup(categoryName, subjectId, categoryId) {
    // Speichern Sie categoryName und subjectId als globale Variablen oder als Attribute des Popups
    window.currentCategoryName = categoryName;
    window.currentSubjectId = subjectId;
    window.currentCategoryId = categoryId;
    console.log(categoryId);

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
    const currentCategoryName = window.currentCategoryName;
    const currentSubjectId = window.currentSubjectId;
    const currentCategoryId = window.currentCategoryId;

    if (!gradeValue || !gradeDate) {
        console.error('Grade value or date is missing');
        return;
    }

    // Erstellen einer neuen Note in Firebase und Speichern der ID
    var newGradeRef = firebase.database().ref('grades').push();
    newGradeRef.set({
        value: gradeValue,
        date: gradeDate,
        categoryName: currentCategoryName,
        subjectId: currentSubjectId,
        categoryId: currentCategoryId
    }).then(() => {
        // Die ID der neuen Note ist der Schlüssel, den Firebase generiert hat
        const newGradeId = newGradeRef.key;

        // Aktualisieren der lokalen Speicherung mit der neuen Note, einschließlich der ID
        const newGrade = {
            categoryName: currentCategoryName,
            date: gradeDate,
            subjectId: currentSubjectId,
            value: gradeValue,
            id: newGradeId,
            categoryId: currentCategoryId // Die ID von Firebase
        };

        if (!localGrades[currentSubjectId]) {
            localGrades[currentSubjectId] = [];
        }

        localGrades[currentSubjectId].push(newGrade);

        // Anzeigen der neuen Note, inklusive der ID
        displayGrade(currentCategoryName, gradeValue, gradeDate, currentCategoryId); //!display Grade

        // Zurücksetzen des Formulars
        gradeValueElement.value = '';
        gradeDateElement.value = '';
        setAddGradeButtonState();

        // Schließen des Popups
        closeGradePopup();

        // Durchschnitt neu berechnen, falls notwendig
        calculateSubjectAverage(currentSubjectId);
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


function displayGrade(categoryName, gradeValue, gradeDate, categoryID) {
    const gradeElement = document.createElement('div');
    gradeElement.className = 'gradeElement';
    gradeElement.innerHTML = ` 
        <span id="gradeDate">${gradeDate}</span>
        <span id="gradeValue">${gradeValue}</span>
        
    `;

    // Anhängen der Note an die entsprechende Kategorie
    const categoryBar = document.getElementById(`category-${categoryID}`);
    console.log("displayGrade sucssesful called with grade id:",categoryID);
    
    if (categoryBar) {
        const gradesContainer = categoryBar.querySelector('.gradesContainer');
        if (gradesContainer) {
            gradesContainer.appendChild(gradeElement);
        } else {
            console.error(`gradesContainer not found in category-${categoryName}`);
        }
    } else {
        console.error(`category-${categoryName} not found`);
    }
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
    // Überprüfen Sie, ob die Noten bereits lokal geladen wurden
    if (localGrades[subjectId]) {
        // Anzeigen der lokal gespeicherten Noten
        localGrades[subjectId].forEach(grade => {
            displayGrade(grade.categoryName, grade.value, grade.date, grade.categoryId); //!display Grade
            console.log("loadGradesForSubject sucssesful called with grade id:",grade.categoryId);
        });
    } else {
        // Laden der Noten aus Firebase
        var dbRef = firebase.database().ref('grades');
        dbRef.orderByChild('subjectId').equalTo(subjectId).once('value', function (snapshot) {
            localGrades[subjectId] = [];
            snapshot.forEach(function (childSnapshot) {
                // Der Schlüssel des Kind-Snapshots ist die ID der Note
                var gradeId = childSnapshot.key;
                var grade = childSnapshot.val();
                grade.id = gradeId; // Fügen Sie die ID dem Notenobjekt hinzu
                localGrades[subjectId].push(grade); // Speichern der Note im lokalen Array
                displayGrade(grade.categoryName, grade.value, grade.date, grade.categoryId); //!display Grade
                console.log("loadGradesForSubject sucssesful called from firebase with grade id:",grade.categoryId);
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

function getGradesForCategory(subjectId, categoryName) {
    // Erstellen Sie eine Referenz zur Datenbank
    const grades = localGrades[subjectId];
    if (!grades) {
        return error('Grades not found in local storage');
    }

    const gradesfilter = grades.filter(grade => grade.categoryName === categoryName);

    gradesfilter.forEach(grade => {
        console.log(`Datum: ${grade.date}, Wert: ${grade.value}`);
    });

    return gradesfilter;
}

function openGradeEditPopup(categoryName, subjectId, weight, categroyId) {
    // Speichern Sie categoryName und subjectId als globale Variablen oder als Attribute des Popups
    window.currentCategoryName = categoryName;
    window.currentSubjectId = subjectId;
    window.currentWeight = weight;
    window.currentCategoryId = categroyId;

    const gradeEditPopup = document.getElementById('editGrades');
    const gradeWeightElement = document.getElementById('EditgradeWeight');
    const categoryNameElement = document.getElementById('editCategoryName');
    const gradesListElement = document.getElementById('gradesList'); // Element, in dem die Noten angezeigt werden

    gradeEditPopup.style.display = 'block';
    categoryNameElement.value = categoryName;
    gradeWeightElement.value = weight;

    // Noten aus der Datenbank abrufen und im Popup anzeigen
    const grades = getGradesForCategory(subjectId, categoryName);
    gradesListElement.innerHTML = '';
    for (let grade of grades) {
        const gradeElement = document.createElement('div');
        gradeElement.textContent = `Datum: ${grade.date}, Wert: ${grade.value}`;

        // Erstellen Sie einen Checkbox
        const deleteCheckbox = document.createElement('input');
        deleteCheckbox.type = 'checkbox';
        deleteCheckbox.addEventListener('change', function() {
            if (deleteCheckbox.checked) {
                // Wenn der Haken gesetzt ist, fügen Sie die ID der Note zu gradesToDelete hinzu
                gradesToDelete.push(grade.id);
            } else {
                // Wenn der Haken entfernt ist, entfernen Sie die ID der Note aus gradesToDelete
                gradesToDelete = gradesToDelete.filter(id => id !== grade.id);
            }
        });

        // Fügen Sie die Checkbox zum gradeElement hinzu
        gradeElement.appendChild(deleteCheckbox);

        gradesListElement.appendChild(gradeElement);
    }
}

function deleteGrade(subjectId, categoryId, gradeId) {
    // Check if parameters are not undefined
    if (!subjectId || !categoryId || !gradeId) {
        console.error('Invalid parameters:', subjectId, categoryId, gradeId);
        return;
    }

    // Erstellen Sie eine Referenz zur Datenbank
    var dbRef = firebase.database().ref();

    // Löschen Sie die Note aus der Firebase-Datenbank
    dbRef.child('grades/' + gradeId).remove()
        .then(function() {
            console.log('Grade removed from Firebase');
        })
        .catch(function(error) {
            console.error('Error removing grade from Firebase:', error);
        });

    // Löschen Sie die Note aus dem lokalen Speicher
    localGrades[subjectId] = localGrades[subjectId].filter(function(grade) {
        return grade.id !== gradeId;
    });

    console.log('Grade removed from local storage');
    
}


function removeCategoriesFromUI() {
    const categoryBars = document.getElementsByClassName('categoryBar');
    while(categoryBars.length > 0){
        categoryBars[0].parentNode.removeChild(categoryBars[0]);
    }
}


function closeGradeEditPopup() {
    const gradeEditPopup = document.getElementById('editGrades');
    const gradeDateElement = document.getElementById('gradeDate');
    
    // Setzen Sie das Datum zurück
    gradeDateElement.value = '';
    
    // Aktualisieren Sie den Zustand des Buttons zum Hinzufügen von Noten
    setAddGradeButtonState();
    
    gradeEditPopup.style.display = 'none';
}


function saveChangesGradeEditPopup() {
    const gradeEditPopup = document.getElementById('editGrades');
    const gradeDateElement = document.getElementById('gradeDate');
    
    // Setzen Sie das Datum zurück
    gradeDateElement.value = '';

    for (let gradeId of gradesToDelete) {
        deleteGrade(window.currentSubjectId, window.currentCategoryId, gradeId);
    }

    // Leeren Sie gradesToDelete
    gradesToDelete = [];
    
    // Aktualisieren Sie den Zustand des Buttons zum Hinzufügen von Noten
    setAddGradeButtonState();
    
    gradeEditPopup.style.display = 'none';

    // Entfernen Sie die Kategorien aus der Benutzeroberfläche
    removeCategoriesFromUI();

    // Laden Sie die Kategorien und Noten neu
    const subjectId = window.currentSubjectId; // Ersetzen Sie dies durch die tatsächliche Methode, um die subjectId zu erhalten
    loadCategories(subjectId);
    loadGradesForSubject(subjectId);
    
}