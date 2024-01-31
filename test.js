
class RealtimeUpdater {
    constructor(userId) {
        this.userId = userId;
        this.dbRef = firebase.database().ref();
    }

    startListening() {
        this.listenForSubjectChanges();
        this.listenForCategoryChanges();
        this.listenForGradeChanges();
    }

    listenForSubjectChanges() {
        this.dbRef.child("/users/" + this.userId + "/subjects").on('child_added', this.handleSubjectAdded.bind(this));
        this.dbRef.child("/users/" + this.userId + "/subjects").on('child_changed', this.handleSubjectChanged.bind(this));
        this.dbRef.child("/users/" + this.userId + "/subjects").on('child_removed', this.handleSubjectRemoved.bind(this));
    }

    listenForCategoryChanges() {
        this.dbRef.child("/users/" + this.userId + "/categories").on('child_added', this.handleCategoryAdded.bind(this));
        this.dbRef.child("/users/" + this.userId + "/categories").on('child_changed', this.handleCategoryChanged.bind(this));
        this.dbRef.child("/users/" + this.userId + "/categories").on('child_removed', this.handleCategoryRemoved.bind(this));
    }

    listenForGradeChanges() {
        this.dbRef.child("/users/" + this.userId + "/grades").on('child_added', this.handleGradeAdded.bind(this));
        this.dbRef.child("/users/" + this.userId + "/grades").on('child_changed', this.handleGradeChanged.bind(this));
        this.dbRef.child("/users/" + this.userId + "/grades").on('child_removed', this.handleGradeRemoved.bind(this));
    }

    handleSubjectAdded(snapshot) {
        const subject = snapshot.val();
        const subjectId = snapshot.key;
        localSubjects[subjectId] = subject;
        addSubjectToUI(subjectId, subject);
    }

    handleSubjectChanged(snapshot) {
        const subject = snapshot.val();
        const subjectId = snapshot.key;
        localSubjects[subjectId] = subject;
        updateSubjectInUI(subjectId, subject);
    }

    handleSubjectRemoved(snapshot) {
        const subjectId = snapshot.key;
        delete localSubjects[subjectId];
        removeSubjectFromUI(subjectId);
    }

    handleCategoryAdded(snapshot) {
        const category = snapshot.val();
        const categoryId = snapshot.key;
        localCategories[categoryId] = category;
        addCategoryToUI(categoryId, category);
    }

    handleCategoryChanged(snapshot) {
        const category = snapshot.val();
        const categoryId = snapshot.key;
        localCategories[categoryId] = category;
        updateCategoryInUI(categoryId, category);
    }

    handleCategoryRemoved(snapshot) {
        const categoryId = snapshot.key;
        delete localCategories[categoryId];
        removeCategoryFromUI(categoryId);
    }

    handleGradeAdded(snapshot) {
        const grade = snapshot.val();
        const gradeId = snapshot.key;
        localGrades[gradeId] = grade;
        addGradeToUI(gradeId, grade);
    }

    handleGradeChanged(snapshot) {
        const grade = snapshot.val();
        const gradeId = snapshot.key;
        localGrades[gradeId] = grade;
        updateGradeInUI(gradeId, grade);
    }

    handleGradeRemoved(snapshot) {
        const gradeId = snapshot.key;
        delete localGrades[gradeId];
        removeGradeFromUI(gradeId);
    }
}




