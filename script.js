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
    loadSubjects() {
        const db = firebase.database().ref("subjects");
        db.once('value', snapshot => {
            snapshot.forEach(childSnapshot => {
                const subject = childSnapshot.val();
                const subjectId = childSnapshot.key;
                if (!localSubjects[subject]) {
                    localSubjects[subject] = [];
                }
                localSubjects[subject].push({
                    id: subjectId,
                    name: subject.name,
                    color: subject.color
                });
            });
        });
    }

    loadCategories() {
        const db = firebase.database().ref("categories");
        db.once('value', snapshot => {
            snapshot.forEach(childSnapshot => {
                const category = childSnapshot.val();
                const categoryId = childSnapshot.key;
                if (!localCategories[category]) {
                    localCategories[category] = [];
                }
                localCategories[category].push({
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
                if (!localGrades[grade]) {
                    localGrades[grade] = [];
                }
                localGrades[grade].push({
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



class createSubjects{
    
}




document.addEventListener("DOMContentLoaded", function () {
    const saveLocalData = new SaveLocalData();
    saveLocalData.loadSubjects();
    saveLocalData.loadCategories();
    saveLocalData.loadGrades();



});