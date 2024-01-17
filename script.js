
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
let newCategoryName;
let newWeight;
let gradeChart;
let subjectPercentageChart;




function loadAllCategories() {
    const dbRef = firebase.database().ref('categories');
    dbRef.once('value', snapshot => {
        snapshot.forEach(childSnapshot => {
            const category = childSnapshot.val();
            const categoryId = childSnapshot.key;
            // Stellen Sie sicher, dass das `localCategories`-Objekt für jede subjectId initialisiert wird
            if (!localCategories[category.subjectId]) {
                localCategories[category.subjectId] = [];
            }
            localCategories[category.subjectId].push({
                id: categoryId,
                name: category.name,
                weight: category.weight
            
            });
        });
    });
}

function loadAllGrades() {
    const dbRef = firebase.database().ref('grades');
    dbRef.once('value', snapshot => {
        snapshot.forEach(childSnapshot => {
            const grade = childSnapshot.val();
            const gradeId = childSnapshot.key;
            // Stellen Sie sicher, dass das `localGrades`-Objekt für jede subjectId initialisiert wird
            if (!localGrades[grade.subjectId]) {
                localGrades[grade.subjectId] = [];
            }
            localGrades[grade.subjectId].push({
                id: gradeId,
                value: grade.value,
                date: grade.date,
                categoryId: grade.categoryId,
                categoryName: grade.categoryName
            });
        });
        console.log('localGrades:', localGrades);
    });
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



// Event Listener für das Laden der Anwendung
document.addEventListener('DOMContentLoaded', function () {
    loadAllCategories();
    loadAllGrades();
    loadSubjects();
    setSubmitButtonState();
    

    var mainboxes = document.querySelectorAll('.boxmain, .boxaverage, .boxcalculator, .boxgraph, .boxgraph2');
            setTimeout(function() {
                mainboxes.forEach(function(mainboxes) {
                mainboxes.style.opacity = '1';
                mainboxes.style.transform = 'scale(1)';
                });
            }, 10);


            document.getElementById('editCategoryCheckboxButton').addEventListener('click', function(event) {
                // Toggle der 'checked' Klasse beim Klick auf den Button
                this.classList.toggle('checked');
            });
            


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
        const editPopup =document.getElementById('EditSubjectPopup');
        editPopup.classList.remove('show'); // Entfernt die .show Klasse
        setTimeout(function() {
            editPopup.style.display = 'none';
        }, 300);
        
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
            var mainboxes = document.querySelectorAll('.boxmain, .boxaverage, .boxcalculator, .boxgraph, .boxgraph2');
            setTimeout(function() {
                mainboxes.forEach(function(mainboxes) {
                mainboxes.style.opacity = '1';
                mainboxes.style.transform = 'scale(1)';
                });
            }, 10);
            const subjectBoxes = Array.from(document.getElementsByClassName('subjectBox'));
            for (let box of subjectBoxes) {
                box.remove(); // Remove each subject box
            }
            loadSubjects();
        }
       

    

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

function setEditSumbmitButtonState() {
    const subjectName = document.getElementById('EditsubjectName').value.trim();
    const submitButton = document.getElementById('EditFach');
    submitButton.disabled = !subjectName;
}


document.getElementById('subjectName').addEventListener('input', setSubmitButtonState);

document.getElementById('EditsubjectName').addEventListener('input', setEditSumbmitButtonState);


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

function calculateOverallAverage() {
    var total = 0;
    var count = 0;

    // Durchlaufen Sie alle Fächer und addieren Sie ihren Durchschnitt zum Gesamtwert
    for (var subjectId in localSubjects) {
        // Überprüfen Sie, ob der Durchschnitt nicht null und nicht 0.00 ist
        if (localSubjects[subjectId].average !== null && localSubjects[subjectId].average !== 0.00) {
            total += localSubjects[subjectId].average;
            count++;
        }
    }

    // Berechnen Sie den Durchschnitt
    var overallAverage = count > 0 ? total / count : 0;

    // Zeigen Sie den Durchschnitt auf der Hauptseite an
    document.getElementById('overallAverage').textContent = overallAverage.toFixed(2) + "Ø";
}





function calculateSubjectAverage(subjectId) {
    initializeChart();
    initializeRadarChart();
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

            calculateOverallAverage();
            
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
        setTimeout(function() {
            contextMenu.style.opacity = "1";
            contextMenu.style.transform = "scale(1)";
        }, 100);
        
        // Erstellen Sie die Menüpunkte
        
        const editItem = document.createElement('button');
        editItem.textContent = 'Bearbeiten';
        editItem.id = 'EditGradePopupButton';
        editItem.addEventListener('click', function () {
            // Öffnen Sie das Popup
            currentSubjectId = id;
            const editPopup = document.getElementById('EditSubjectPopup');
            editPopup.style.display = 'block';
            setTimeout(function() {
                editPopup.classList.add('show'); // Fügt die .show Klasse hinzu
            }, 20);


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
        deleteItem.id = 'DeleteGradePopupButton';
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

            delete localSubjects[id]; // Entfernen Sie das Fach aus der lokalen Speicherung
            // Entfernen Sie das Fach aus der Benutzeroberfläche
            box.remove();

            // Schließen Sie das Kontextmenü
            contextMenu.remove(); //!contextMenu.remove()
            reloadSubjectPage();
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

function reloadSubjectPage() {  
    let subjectBoxes = document.getElementsByClassName('subjectBox');                                                     //!reloadSubjectPage
    subjectBoxes = Array.from(subjectBoxes); // Convert HTMLCollection to array
    for (let box of subjectBoxes) {
        box.remove(); // Remove each subject box
    }
    // Subjects und deren Durchschnitt neu laden
    loadSubjects();
    initializeChart();
    initializeRadarChart();
    calculateOverallAverage();
}




function openSubjectPage(subjectName, subjectId) {
    
    document.getElementById('mainContent').style.display = 'none';
    var mainboxes = document.querySelectorAll('.boxmain, .boxaverage, .boxcalculator, .boxgraph, .boxgraph2');
            setTimeout(function() {
                mainboxes.forEach(function(mainboxes) {
                mainboxes.style.opacity = '0';
                mainboxes.style.transform = 'scale(0.8)';
                });
            }, 10);
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
    setTimeout(function() {
        categoryBar.style.opacity = '1';
        categoryBar.style.transform = 'scale(1)';
    }, 100); // Warten Sie einen kurzen Moment, bevor Sie die Opacity ändern, um sicherzustellen, dass die Transition funktioniert
}


function closeSubjectPage() {                                                       //!closeSubjectPage
    document.getElementById('mainContent').style.display = 'block';

    var mainboxes = document.querySelectorAll('.boxmain, .boxaverage, .boxcalculator, .boxgraph, .boxgraph2');
            setTimeout(function() {
                mainboxes.forEach(function(mainboxes) {
                mainboxes.style.opacity = '1';
                mainboxes.style.transform = 'scale(1)';
                });
            }, 10);

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
    const selectElement = document.getElementById('EditgradeWeight');

    selectElement.selectedIndex =2;
    
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

    categoryNameElement.addEventListener('change', function() {
        newCategoryName = categoryNameElement.value;
    });

    gradeWeightElement.addEventListener('change', function() {
        newWeight = gradeWeightElement.value;
    });



    gradeEditPopup.style.display = 'block';
    categoryNameElement.value = categoryName;
    gradeWeightElement.value = weight;

    // Noten aus der Datenbank abrufen und im Popup anzeigen
    const grades = getGradesForCategory(subjectId, categoryName);
    gradesListElement.innerHTML = '';
    for (let grade of grades) {
        // Erstellen Sie einen Checkbox
        const deleteCheckbox = document.createElement('input');
        deleteCheckbox.type = 'checkbox';
        deleteCheckbox.id = 'checkbox' + grade.id;
        deleteCheckbox.addEventListener('change', function() {
            if (deleteCheckbox.checked) {
                // Wenn der Haken gesetzt ist, fügen Sie die ID der Note zu gradesToDelete hinzu
                gradesToDelete.push(grade.id);
            } else {
                // Wenn der Haken entfernt ist, entfernen Sie die ID der Note aus gradesToDelete
                gradesToDelete = gradesToDelete.filter(id => id !== grade.id);
            }
        });

        const label = document.createElement('label');
        label.htmlFor = 'checkbox' + grade.id;

        // Erstellen Sie separate Elemente für das Datum und die Note
        const dateElement = document.createElement('span');
        dateElement.textContent = grade.date;
        const gradeValueElement = document.createElement('span');
        gradeValueElement.textContent = grade.value;

        // Erstellen Sie ein div-Element für die Checkbox und das Datum
        const checkboxAndDate = document.createElement('div');
        checkboxAndDate.style.display = 'flex';
        checkboxAndDate.style.justifyContent = 'flex-start';
        
        const customCheckbox = document.createElement('div');
        customCheckbox.className = 'custom-checkbox';

        // Fügen Sie die Checkbox und das Datum zum checkboxAndDate hinzu
        checkboxAndDate.appendChild(deleteCheckbox);
        checkboxAndDate.appendChild(label);

        const gradeElement = document.createElement('div');
        gradeElement.style.display = 'flex';
        gradeElement.style.justifyContent = 'space-between';


        checkboxAndDate.appendChild(customCheckbox);
        checkboxAndDate.appendChild(dateElement);

        // Fügen Sie checkboxAndDate und die Note zum gradeElement hinzu
        gradeElement.appendChild(checkboxAndDate);
        gradeElement.appendChild(gradeValueElement);

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
    const editCategoryCheckbox = document.getElementById('editCategoryCheckboxButton');

if (editCategoryCheckbox.classList.contains('checked')) {
    editCategoryCheckbox.classList.remove('checked');
}
    
    // Setzen Sie das Datum zurück
    gradeDateElement.value = '';
    
    // Aktualisieren Sie den Zustand des Buttons zum Hinzufügen von Noten
    setAddGradeButtonState();
    
    gradeEditPopup.style.display = 'none';
}


function deleteCategoryAndGrades(subjectId, categoryId) {
    // Überprüfen Sie, ob die Parameter nicht undefiniert sind
    if (!subjectId || !categoryId) {
        console.error('Ungültige Parameter:', subjectId, categoryId);
        return;
    }

    // Erstellen Sie eine Referenz zur Datenbank
    var dbRef = firebase.database().ref();

    // Löschen Sie die Kategorie und alle Noten in dieser Kategorie aus der Firebase-Datenbank
    dbRef.child('categories/' + categoryId).remove()
        .then(function() {
            console.log('Kategorie aus Firebase entfernt');
        })
        .catch(function(error) {
            console.error('Fehler beim Entfernen der Kategorie aus Firebase:', error);
        });

    dbRef.child('grades').orderByChild('categoryId').equalTo(categoryId).once('value', snapshot => {
        snapshot.forEach(childSnapshot => {
            dbRef.child('grades/' + childSnapshot.key).remove();
        });
    }).then(function() {
        console.log('Noten in dieser Kategorie aus Firebase entfernt');
    }).catch(function(error) {
        console.error('Fehler beim Entfernen der Noten aus Firebase:', error);
    });

    // Löschen Sie die Kategorie und alle Noten in dieser Kategorie aus dem lokalen Speicher
    localCategories[subjectId] = localCategories[subjectId].filter(category => category.id !== categoryId);
    localGrades[subjectId] = localGrades[subjectId].filter(grade => grade.categoryId !== categoryId);

    console.log('Kategorie und Noten in dieser Kategorie aus dem lokalen Speicher entfernt');
}





function saveChangesGradeEditPopup() {
    const gradeEditPopup = document.getElementById('editGrades');
    const gradeDateElement = document.getElementById('gradeDate');

    const editCategoryCheckbox = document.getElementById('editCategoryCheckboxButton');
    

    // Setzen Sie das Datum zurück
    gradeDateElement.value = '';

    // Überprüfen Sie, ob die Checkbox ausgewählt ist
    if (editCategoryCheckbox.classList.contains('checked')) {
        // Löschen Sie die Kategorie und alle Noten in dieser Kategorie
        deleteCategoryAndGrades(window.currentSubjectId, window.currentCategoryId);
    } else {
        for (let gradeId of gradesToDelete) {
            deleteGrade(window.currentSubjectId, window.currentCategoryId, gradeId);
        }
    }

    if (editCategoryCheckbox.classList.contains('checked')) {
        editCategoryCheckbox.classList.remove('checked');
    }

    
    if (newCategoryName) {
        firebase.database().ref('categories/' + window.currentCategoryId).update({
            name: newCategoryName
        });

        const category = localCategories[window.currentSubjectId].find(category => category.id === window.currentCategoryId);
        if (category) {
            category.name = newCategoryName;
        }
    }
    if (newWeight) {
        firebase.database().ref('categories/' + window.currentCategoryId).update({
            weight: newWeight
        });

        const category = localCategories[window.currentSubjectId].find(category => category.id === window.currentCategoryId);
        if (category) {
            category.weight = newWeight;
        }
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




function getAllGrades() {
    return firebase.database().ref('grades').once('value').then((snapshot) => {
        const grades = [];
        snapshot.forEach((childSnapshot) => {
            const grade = childSnapshot.val();
            grades.push({
                value: parseFloat(grade.value),
                date: new Date(grade.date)
            });
        });
        return grades;
    });
}

function generateChartData(grades) {
    // Sortieren Sie die Noten nach Datum
    grades.sort((a, b) => a.date - b.date);

    // Konvertieren Sie jede Note in ein Objekt, das für das Diagramm verwendet werden kann
    const chartData = grades.map((grade) => {
        return {
            dateLabel: `${grade.date.getDate()}-${grade.date.getMonth() + 1}-${grade.date.getFullYear()}`,
            value: grade.value
        };
    });

    return chartData;
}

function createChart(chartData) {
    const canvas = document.getElementById('gradeChart');
    canvas.style.height = '350px';

    const ctx = canvas.getContext('2d');

    // Wenn ein Chart bereits existiert, zerstören Sie es, bevor Sie ein neues erstellen
    if (window.gradeChart instanceof Chart) {
        window.gradeChart.destroy();
    }

    window.gradeChart = new Chart(ctx, {
        type: 'line',
        data: {
            labels: chartData.map(data => data.dateLabel),
            datasets: [{
                label: 'Note',
                data: chartData.map(data => data.value),
                backgroundColor: 'rgba(54, 162, 235, 0.2)',
                borderColor: 'rgba(54, 162, 235, 1)',
                borderWidth: 1.3,
                fill: false,
                pointRadius: 4,
                tension: 0
            }]
        },
        options: {
            plugins: {
                legend: {
                    display: false // Das blendet die Legende aus
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
                    // Hier können Sie zusätzliche Optionen für die x-Achse konfigurieren
                }
            },
            responsive: true,
            maintainAspectRatio: false
        }
    });
}

// Die Funktion zum Starten des Prozesses
function initializeChart() {
    getAllGrades().then((grades) => {

        const chartData = generateChartData(grades);

        createChart(chartData);
    });
    
}

function extractCategoryNames() {
    const categoryNames = new Set();
    Object.values(localCategories).forEach(categories => {
        categories.forEach(category => {
            categoryNames.add(category.name);
        });
    });
    console.log("labels", Array.from(categoryNames));
    return Array.from(categoryNames);
}


function generateRadarChartData() {
    const categoryNames = extractCategoryNames();
    let totalWeightedScores = 0;
    let totalWeights = 0;
    let subjectTotalWeights = 0;
    const radarChartData = {
        labels: categoryNames,
        datasets: []
    };

    Object.keys(localSubjects).forEach(subjectId => {
        const subjectGrades = localGrades[subjectId] || [];
        subjectGrades.forEach(grade => {
            const weight = localCategories[subjectId].find(category => category.name === grade.categoryName)?.weight || 1;
            totalWeightedScores += grade.value * weight;
            totalWeights += parseFloat(weight);
        });
    });

    // Durchlaufe alle Fächer und erzeuge für jedes Fach ein Dataset
    // Durchlaufe alle Fächer und erzeuge für jedes Fach ein Dataset
    Object.keys(localSubjects).forEach(subjectId => {
        const subject = localSubjects[subjectId];

        // Initialisiere ein Array für die Datenwerte des aktuellen Fachs
        let dataValues = new Array(categoryNames.length).fill(0);

        // Initialize subject total weighted scores and weights for each subject
        let subjectTotalWeightedScores = 0;
        let subjectTotalWeights = 0;

        // Durchlaufe alle Noten des Faches
        (localGrades[subjectId] || []).forEach(grade => {
            // Finde den Index der Kategorie der aktuellen Note
            const categoryIndex = categoryNames.indexOf(grade.categoryName);
            if (categoryIndex !== -1) {
                const weight = localCategories[subjectId].find(category => category.name === grade.categoryName)?.weight || 1;
                // Zähle die Note in der entsprechenden Kategorie
                dataValues[categoryIndex]++;
                dataValues[categoryIndex] *= weight;

                // Add the weighted score and weight to the subject totals
                subjectTotalWeightedScores += grade.value * weight;
                subjectTotalWeights += parseFloat(weight);
            }
        });

        const subjectAverage = subjectTotalWeights ? subjectTotalWeightedScores / subjectTotalWeights : 0;
        const subjectPercentage = totalWeights ? (subjectAverage / (totalWeightedScores / totalWeights) * 100).toFixed(2) : 0;
        console.log("subjectPercentage", subjectPercentage);
        // Füge das Dataset für das aktuelle Fach hinzu
        radarChartData.datasets.push({
            label: subject.name,
            data: dataValues,
            subjectPercentage: subjectPercentage,
            backgroundColor: hexToRGBA(subject.color, 0.2),
            borderColor: subject.color,
            pointBackgroundColor: subject.color
            
        });
    });
    console.log("radarChartData", radarChartData);
    return radarChartData;
    
}


// Helferfunktion, um Hex-Farben in RGBA umzuwandeln
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




function initializeRadarChart() {



    const backgroundColorPlugin = {
        id: 'backgroundColorPlugin',
        beforeDraw: (chart, args, options) => {
          const { ctx, chartArea: { top, bottom, left, right, width, height } } = chart;
          ctx.save();
          ctx.globalCompositeOperation = 'destination-over';
          ctx.fillStyle = options.backgroundColor; // Hintergrundfarbe aus den Optionen
          ctx.fillRect(left, top, width, height);
          ctx.restore();
        }
      };
    // Generiere die Daten für das Radar-Chart.
    const radarChartData = generateRadarChartData();
    const ctx = document.getElementById('gradedistributionchart').getContext('2d');

    // Überprüfe, ob bereits ein Radar-Chart existiert, und zerstöre es, falls notwendig.
    if (window.radarChart instanceof Chart) {
        window.radarChart.destroy();
    }

    // Erstelle das neue Radar-Chart.
    window.radarChart = new Chart(ctx, {
        type: 'radar',
        data: radarChartData,
        options: {
            
            elements: {
                line: {
                    borderWidth: 3 // Stärke der Linien im Radar-Chart.
                }
            },
            scales: {
                r: { // 'r' bezieht sich auf die radiale Achse des Radar-Charts.
                    angleLines: {
                        display: true // Anzeige der Winkel-/Radiallinien.
                    },
                    suggestedMin: 1, // Vorgeschlagener minimaler Wert für die Skala.
                    suggestedMax: 3, // Vorgeschlagener maximaler Wert für die Skala.
                    ticks: {
                        backdropColor: 'transparent',
                        backdropPadding: 5 // Hintergrundfarbe der Skala.
                    },

                }
            },
            plugins: {
                legend: {
                    display: true // Steuere die Anzeige der Legende.
                },
                tooltip: {
                    callbacks: {
                        label: function(context) {
                            // Zugriff auf die 'subjectPercentage' für das aktuelle Dataset
                            var subjectPercentage = context.dataset.subjectPercentage;
                            // Das Label und den prozentualen Anteil zurückgeben
                            return `${context.dataset.label}: ${subjectPercentage}%`;
                        }
                    }

                  }
            },
            responsive: true, // Sorgt dafür, dass das Chart auf die Containergröße reagiert.
            maintainAspectRatio: false // Deaktiviert das Beibehalten des Aspektverhältnisses, sodass Sie die Höhe und Breite anpassen können.
        }
    });
}



