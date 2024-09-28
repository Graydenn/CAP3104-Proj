document.addEventListener('DOMContentLoaded', () => {
    // Page Navigation
    const navLinks = document.querySelectorAll('nav a, .leaderboard-link');
    const pages = document.querySelectorAll('.page');
    
    function showPage(pageId) {
        pages.forEach(page => page.style.display = 'none');
        const activePage = document.getElementById(pageId);
        if (activePage) {
            activePage.style.display = 'block';
        }

        navLinks.forEach(link => link.classList.remove('active'));
        const activeLink = document.querySelector(`nav a[href="#${pageId}"]`);
        if (activeLink) {
            activeLink.classList.add('active');
        }

        // Attach event listeners for the new page
        if (pageId === 'home') {
            attachHomeEventListeners();
        } else if (pageId === 'log') {
            attachLogEventListeners();
        } else if (pageId === 'leaderboard') {
            populateLeaderboard();
        }
    }

    navLinks.forEach(link => {
        link.addEventListener('click', (event) => {
            event.preventDefault();
            const pageId = link.getAttribute('href').substring(1);
            showPage(pageId);
        });
    });

    // Popup Handling
    const logNewPopup = document.getElementById('log-new-popup');
    const editGoalPopup = document.getElementById('edit-goal-popup');
    const editWorkoutPopup = document.getElementById('edit-workout-popup');

    document.querySelectorAll('.close-popup').forEach(button => {
        button.addEventListener('click', () => {
            button.closest('dialog').close();
        });
    });

    // Log New Workout Form Handling
    const logNewForm = document.getElementById('log-new-form');
    if (logNewForm) {
        logNewForm.addEventListener('submit', (event) => {
            event.preventDefault();
            const date = document.getElementById('log-date').value;
            const activity = document.getElementById('log-activity').value;
            const duration = document.getElementById('log-duration').value;

            addWorkoutEntry(date, activity, duration);
            logNewPopup.close();
            logNewForm.reset();
            updateDaysSinceWorkout(new Date(date));
        });
    }

    // Edit Goal Form Handling
    const editGoalForm = document.getElementById('edit-goal-form');
    if (editGoalForm) {
        editGoalForm.addEventListener('submit', (event) => {
            event.preventDefault();
            const description = document.getElementById('goal-description-input').value;
            const progress = document.getElementById('goal-progress-input').value;

            updateGoal(description, progress);
            editGoalPopup.close();
        });
    }

    // Edit Workout Form Handling
    const editWorkoutForm = document.getElementById('edit-workout-form');
    if (editWorkoutForm) {
        editWorkoutForm.addEventListener('submit', (event) => {
            event.preventDefault();
            const date = document.getElementById('edit-workout-date').value;
            const activity = document.getElementById('edit-workout-activity').value;
            const duration = document.getElementById('edit-workout-duration').value;
            const workoutId = editWorkoutForm.dataset.workoutId;

            updateWorkoutEntry(workoutId, date, activity, duration);
            editWorkoutPopup.close();
        });
    }

    // Delete Workout Button Handling
    const deleteWorkoutBtn = document.getElementById('delete-workout-btn');
    if (deleteWorkoutBtn) {
        deleteWorkoutBtn.addEventListener('click', () => {
            const workoutId = editWorkoutForm.dataset.workoutId;
            deleteWorkoutEntry(workoutId);
            editWorkoutPopup.close();
        });
    }

    // Helper Functions
    function addWorkoutEntry(date, activity, duration) {
        const workoutEntries = document.getElementById('workout-entries');
        if (workoutEntries) {
            const workoutId = Date.now().toString();
            const entry = document.createElement('div');
            entry.className = 'workout-entry';
            entry.dataset.id = workoutId;
            entry.innerHTML = `
                <p>Date: ${date} | Activity: ${activity} | Duration: ${duration} mins</p>
                <button class="edit-workout" data-id="${workoutId}">✏️</button>
            `;
            workoutEntries.prepend(entry);

            entry.querySelector('.edit-workout').addEventListener('click', () => {
                openEditWorkoutPopup(workoutId, date, activity, duration);
            });
        }
    }

    function updateWorkoutEntry(id, date, activity, duration) {
        const entry = document.querySelector(`.workout-entry[data-id="${id}"]`);
        if (entry) {
            entry.innerHTML = `
                <p>Date: ${date} | Activity: ${activity} | Duration: ${duration} mins</p>
                <button class="edit-workout" data-id="${id}">✏️</button>
            `;
            entry.querySelector('.edit-workout').addEventListener('click', () => {
                openEditWorkoutPopup(id, date, activity, duration);
            });
        }
    }

    function deleteWorkoutEntry(id) {
        const entry = document.querySelector(`.workout-entry[data-id="${id}"]`);
        if (entry) {
            entry.remove();
        }
    }

    function openEditWorkoutPopup(id, date, activity, duration) {
        const editWorkoutDate = document.getElementById('edit-workout-date');
        const editWorkoutActivity = document.getElementById('edit-workout-activity');
        const editWorkoutDuration = document.getElementById('edit-workout-duration');
        
        if (editWorkoutDate && editWorkoutActivity && editWorkoutDuration && editWorkoutForm) {
            editWorkoutDate.value = date;
            editWorkoutActivity.value = activity;
            editWorkoutDuration.value = duration;
            editWorkoutForm.dataset.workoutId = id;
            editWorkoutPopup.showModal();
        }
    }

    function updateGoal(description, progress) {
        const goalDescription = document.getElementById('goal-description');
        const goalPercentage = document.getElementById('goal-percentage');
        const goalProgress = document.getElementById('goal-progress');
        
        if (goalDescription && goalPercentage && goalProgress) {
            goalDescription.textContent = description;
            goalPercentage.textContent = `${progress}`;
            goalProgress.style.width = `${progress}%`;
        }
    }

    function updateDaysSinceWorkout(lastWorkoutDate) {
        const today = new Date();
        const diffTime = Math.abs(today - lastWorkoutDate);
        const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
        const daysSinceWorkout = document.getElementById('days-since-workout');
        if (daysSinceWorkout) {
            daysSinceWorkout.textContent = diffDays;
        }
    }

    function attachHomeEventListeners() {
        const editGoalBtn = document.querySelector('.edit-goal');
        if (editGoalBtn) {
            editGoalBtn.addEventListener('click', () => {
                const currentGoal = document.getElementById('goal-description').textContent;
                const currentProgress = document.getElementById('goal-percentage').textContent.replace('%', '');
                
                const goalDescriptionInput = document.getElementById('goal-description-input');
                const goalProgressInput = document.getElementById('goal-progress-input');
                
                if (goalDescriptionInput && goalProgressInput) {
                    goalDescriptionInput.value = currentGoal;
                    goalProgressInput.value = currentProgress;
                    editGoalPopup.showModal();
                }
            });
        }

        const leaderboardLink = document.querySelector('.leaderboard-link');
        if (leaderboardLink) {
            leaderboardLink.addEventListener('click', (event) => {
                event.preventDefault();
                showPage('leaderboard');
            });
        }
    }

    function attachLogEventListeners() {
        const logNewButton = document.querySelector('.log-new-button');
        if (logNewButton) {
            logNewButton.addEventListener('click', () => {
                logNewPopup.showModal();
            });
        }

        // Remove sort button if it exists
        const sortButton = document.querySelector('.sort-button');
        if (sortButton) {
            sortButton.remove();
        }
    }

    function populateLeaderboard() {
        // Placeholder function for populating leaderboard
        console.log('Populating leaderboard...');
    }

    // Initial page load
    showPage('home');
});