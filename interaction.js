// interaction.js

document.addEventListener('DOMContentLoaded', () => {
    // Set max attribute for date inputs to today's date to prevent future dates
    const today = new Date().toISOString().split('T')[0];
    const dateInputs = document.querySelectorAll('input[type="date"]');
    dateInputs.forEach(input => {
        input.setAttribute('max', today);
    });

    // Page Navigation
    const navLinks = document.querySelectorAll('nav a, .leaderboard-link');
    const pages = document.querySelectorAll('.page');

    function checkWeek(date) {
        const today = new Date();
        const todayDate = today.getDate();
        const todayDay = today.getDay();

        // Get first date of week
        const firstDayOfWeek = new Date(today);
        firstDayOfWeek.setDate(todayDate - todayDay);

        // Get last date of week
        const lastDayOfWeek = new Date(firstDayOfWeek);
        lastDayOfWeek.setDate(lastDayOfWeek.getDate() + 6);

        // Check if date is within the current week
        return date >= firstDayOfWeek && date <= lastDayOfWeek;
    }

    function checkMonth(date) {
        const today = new Date();
        return date.getMonth() === today.getMonth() && date.getFullYear() === today.getFullYear();
    }

    class User {
        constructor(name, weekly, monthly, allTime) {
            this.name = name;
            this.weekly = weekly;
            this.monthly = monthly;
            this.allTime = allTime;
        }
    }

    // Load users from localStorage or initialize default users
    let users = loadUsers();

    const currUser = users.find(user => user.name === "Example") || new User("Example", 0, 0, 0);
    document.getElementById('user-greeting').textContent = currUser.name;

    function loadUsers() {
        const storedUsers = localStorage.getItem('users');
        return storedUsers ? JSON.parse(storedUsers).map(userData => new User(userData.name, userData.weekly, userData.monthly, userData.allTime)) : [
            new User("Sarah C", 45, 135, 5945),
            new User("Will G.", 20, 60, 2640),
            new User("Alan W.", 15, 66, 1970),
            new User("Alex C.", 25, 74, 3256),
            new User("Paula P.", 10, 35, 1435),
            new User("Brad A.", 90, 270, 10800),
            new User("Rhys S.", 17, 51, 2260),
            new User("Jesse F.", 77, 231, 10164),
            new User("Rose M.", 67, 201, 8890),
            new User("Example", 0, 0, 0)
        ];
    }

    function saveUsers() {
        const usersData = users.map(user => ({
            name: user.name,
            weekly: user.weekly,
            monthly: user.monthly,
            allTime: user.allTime
        }));
        localStorage.setItem('users', JSON.stringify(usersData));
    }

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
        // Adjust header for login page
        if (pageId === 'login') {
            document.querySelector('header>nav').style.display = 'none';
        } else {
            document.querySelector('header>nav').style.display = 'flex';
            navLinks.forEach(link => link.classList.remove('active'));
            const activeLink = document.querySelector(`nav a[href="#${pageId}"]`);
            if (activeLink) {
                activeLink.classList.add('active');
            }
        }
        // Attach event listeners for the new page
        if (pageId === 'home') {
            attachHomeEventListeners();
            homePopulateLeaderboard();
        } else if (pageId === 'log') {
            attachLogEventListeners();
        } else if (pageId === 'leaderboard') {
            populateLeaderboard();
            attachLeaderboardEventListener();
        }
        // Restore badge earned status on page load
        badgeCheck(users);
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

    // Badge Check Function
    function badgeCheck(array) {
        // Sort users by weekly, monthly, and all-time scores to check for badge eligibility
        const createSortedArray = (property) => [...array].sort((a, b) => b[property] - a[property]);
        const weeklySorted = createSortedArray('weekly');
        const monthlySorted = createSortedArray('monthly');
        const allTimeSorted = createSortedArray('allTime');
        const weeklyBadge = document.getElementById("badge1");
        const monthlyBadge = document.getElementById("badge2");
        const allTimeBadge = document.getElementById("badge3");

        function updateBadge(badgeElement, sortedUsers, timeframe) {
            const index = sortedUsers.findIndex(user => user.name === currUser.name);
            if (index !== -1 && index < 3) { // Top 3 get the badge
                badgeElement.classList.remove('badge-desat');
                badgeElement.classList.add('badge');
                // Store badge earned status in localStorage
                localStorage.setItem(`badge-${timeframe}`, 'true');
            } else {
                badgeElement.classList.add('badge-desat');
                badgeElement.classList.remove('badge');
                // Remove badge earned status if no longer eligible
                localStorage.removeItem(`badge-${timeframe}`);
            }
        }

        updateBadge(weeklyBadge, weeklySorted, 'weekly');
        updateBadge(monthlyBadge, monthlySorted, 'monthly');
        updateBadge(allTimeBadge, allTimeSorted, 'allTime');
    }

    // Global workouts array to store all user's workouts
    let workouts = loadWorkouts();

    function loadWorkouts() {
        const storedWorkouts = localStorage.getItem('workouts');
        return storedWorkouts ? JSON.parse(storedWorkouts) : [];
    }

    function saveWorkouts() {
        localStorage.setItem('workouts', JSON.stringify(workouts));
    }

    // Function to recalculate user totals based on workouts array
    function recalculateUserTotals() {
        // Reset totals
        currUser.weekly = 0;
        currUser.monthly = 0;
        currUser.allTime = 0;

        let mostRecentWorkoutDate = null;

        workouts.forEach(workout => {
            const workoutDate = new Date(workout.date);
            const duration = workout.duration;

            if (checkWeek(workoutDate)) {
                currUser.weekly += duration;
            }
            if (checkMonth(workoutDate)) {
                currUser.monthly += duration;
            }
            currUser.allTime += duration;

            if (!mostRecentWorkoutDate || workoutDate > mostRecentWorkoutDate) {
                mostRecentWorkoutDate = workoutDate;
            }
        });

        saveUsers();
        badgeCheck(users);

        // Update days since last workout
        if (!mostRecentWorkoutDate) {
            // No workouts logged
            const lastWorkoutContainer = document.querySelector('.last-workout');
            if (lastWorkoutContainer) {
                lastWorkoutContainer.innerHTML = `<p>You've never logged a workout.</p>`;
            }
        } else {
            // Workouts exist, update the days since last workout
            updateDaysSinceWorkout(mostRecentWorkoutDate);
        }
    }

    // Function to add a new workout
    function addWorkoutEntry(date, activity, duration) {
        const workoutId = Date.now().toString();

        // Add to workouts array
        workouts.push({
            id: workoutId,
            date: date,
            activity: activity,
            duration: parseInt(duration, 10)
        });

        saveWorkouts();
        recalculateUserTotals();
        renderWorkoutEntries();
    }

    // Function to update an existing workout
    function updateWorkoutEntry(id, date, activity, duration) {
        const workout = workouts.find(w => w.id === id);
        if (workout) {
            workout.date = date;
            workout.activity = activity;
            workout.duration = parseInt(duration, 10);

            saveWorkouts();
            recalculateUserTotals();
            renderWorkoutEntries();
        }
    }

    // Function to delete a workout
    function deleteWorkoutEntry(id) {
        const index = workouts.findIndex(w => w.id === id);
        if (index !== -1) {
            workouts.splice(index, 1);

            saveWorkouts();
            recalculateUserTotals();
            renderWorkoutEntries();
        }
    }

    // Function to render workout entries from workouts array
    function renderWorkoutEntries() {
        const workoutEntries = document.getElementById('workout-entries');
        if (workoutEntries) {
            workoutEntries.innerHTML = '';
    
            // Sort workouts by date descending (most recent first)
            const sortedWorkouts = workouts.slice().sort((a, b) => new Date(b.date) - new Date(a.date));
    
            sortedWorkouts.forEach(workout => {
                const entry = document.createElement('div');
                entry.className = 'workout-entry';
                entry.dataset.id = workout.id;
                entry.innerHTML = `
                    <p>Date: ${workout.date} | Activity: ${workout.activity} | Duration: ${workout.duration} mins</p>
                    <button class="edit-workout" data-id="${workout.id}">✏️</button>
                `;
                workoutEntries.appendChild(entry);
                entry.querySelector('.edit-workout').addEventListener('click', () => {
                    openEditWorkoutPopup(workout.id, workout.date, workout.activity, workout.duration);
                });
            });
        }
    }

    // Function to open edit workout popup
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

    // Function to update goal progress
    function updateGoal(description, progress) {
        const goalDescription = document.getElementById('goal-description');
        const goalPercentage = document.getElementById('goal-percentage');
        const goalProgress = document.getElementById('goal-progress');

        if (goalDescription && goalPercentage && goalProgress) {
            goalDescription.textContent = description;
            goalPercentage.textContent = `${progress}`;
            goalProgress.style.width = `${progress}%`;
        }
        // Save goal to localStorage
        localStorage.setItem('goal', JSON.stringify({ description, progress }));
    }

    // Load goal from localStorage
    function loadGoal() {
        const storedGoal = localStorage.getItem('goal');
        if (storedGoal) {
            const { description, progress } = JSON.parse(storedGoal);
            updateGoal(description, progress);
        }
    }

    // Function to update days since last workout
    function updateDaysSinceWorkout(lastWorkoutDate) {
        const today = dayjs(); // Get today's date using Day.js
        const lastWorkout = dayjs(lastWorkoutDate); // Parse the input date
    
        const diffDays = today.diff(lastWorkout, 'day');
    
        const lastWorkoutContainer = document.querySelector('.last-workout');
        if (lastWorkoutContainer) {
            // Update the standard message with the correct number of days
            lastWorkoutContainer.innerHTML = `
                <p>It has been <span id="days-since-workout">${Math.max(0, diffDays)}</span> day(s) since your last workout.</p>
            `;
        }
    }

    // Attach event listeners for Home page
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

    // Attach event listeners for Log page
    function attachLogEventListeners() {
        const logNewButton = document.querySelector('.log-new-button');
        if (logNewButton) {
            logNewButton.addEventListener('click', () => {
                logNewPopup.showModal();
            });
        }
        // Ensure the date input in log new workout form is updated
        const logDateInput = document.getElementById('log-date');
        if (logDateInput) {
            logDateInput.setAttribute('max', today);
        }
    }

    // Attach event listener for Leaderboard page
    function attachLeaderboardEventListener() {
        const periodDropdown = document.querySelector('#leaderboard-period');
        if (periodDropdown) {
            periodDropdown.addEventListener('change', () => {
                populateLeaderboard();
            });
        }
    }

    // Populate Home page leaderboard
    function homePopulateLeaderboard() {
        const weeklySorted = [...users].sort((a, b) => b.weekly - a.weekly);

        const list = document.getElementById("top-users-list");
        list.innerHTML = ''; // Clear previous entries

        for (let i = 0; i < Math.min(5, weeklySorted.length); ++i) {
            let li = document.createElement('li');
            li.innerText = `${weeklySorted[i].name} (${weeklySorted[i].weekly} mins)`;
            list.appendChild(li);
        }
    }

    // Populate Leaderboard page
    function populateLeaderboard() {
        const periodSelect = document.querySelector('#leaderboard-period');
        const dropdown = periodSelect.value;
        const lbTable = document.createElement("table");
        lbTable.innerHTML = "<thead><tr><th>Rank</th><th>User</th><th>Workout Duration</th></tr></thead>";

        const target = document.getElementById('leaderboard-list');
        target.innerHTML = "";
        const tbody = document.createElement('tbody');

        const sortedUsers = [...users].sort((a, b) => b[dropdown] - a[dropdown]);
        for (let i = 0; i < sortedUsers.length; i++) {
            const newRow = document.createElement("tr");
            const rankCell = document.createElement("td");
            const tdName = document.createElement("td");
            const tdTime = document.createElement("td");
            rankCell.textContent = i + 1;  // Add rank
            tdName.textContent = sortedUsers[i].name;
            tdTime.textContent = sortedUsers[i][dropdown];
            newRow.appendChild(rankCell); // Append rank cell
            newRow.appendChild(tdName);
            newRow.appendChild(tdTime);
            if (sortedUsers[i].name === currUser.name) {
                newRow.classList.add("current-user-row");
            }
            tbody.appendChild(newRow);
        }
        lbTable.appendChild(tbody);
        target.appendChild(lbTable);
    }

    // Update profile information
    const profileName = document.getElementById('profile-name');
    const profileEmail = document.getElementById('profile-email');
    if (profileName && profileEmail) {
        profileName.textContent = currUser.name;
        profileEmail.textContent = 'example@site.com';
    }

    // Dark mode implementation
    const darkModeToggle = document.getElementById('dark-mode-toggle');
    const body = document.body;

    function setDarkMode(isDark) {
        if (isDark) {
            body.classList.add('dark-mode');
        } else {
            body.classList.remove('dark-mode');
        }
        localStorage.setItem('darkMode', isDark);
    }

    // Set initial dark mode state
    const savedDarkMode = localStorage.getItem('darkMode');
    setDarkMode(savedDarkMode === 'true');

    if (darkModeToggle) {
        darkModeToggle.checked = body.classList.contains('dark-mode');
        darkModeToggle.addEventListener('change', () => {
            setDarkMode(darkModeToggle.checked);
        });
    }

    // Privacy checkboxes
    const emailNotificationsToggle = document.getElementById('email-notifications-toggle');
    const activityRemindersToggle = document.getElementById('activity-reminders-toggle');

    function showNotification(message) {
        const notification = document.createElement('div');
        notification.className = 'notification';
        notification.textContent = message;
        document.body.appendChild(notification);
        setTimeout(() => {
            notification.classList.add('show');
            setTimeout(() => {
                notification.classList.remove('show');
                setTimeout(() => notification.remove(), 300);
            }, 3000);
        }, 100);
    }

    function handlePrivacyToggle(toggle, settingName) {
        toggle.addEventListener('change', () => {
            const email = document.getElementById('profile-email').textContent;
            const status = toggle.checked ? 'enabled' : 'disabled';
            showNotification(`${settingName} have been ${status} for ${email}.`);
        });
    }
    if (emailNotificationsToggle) {
        handlePrivacyToggle(emailNotificationsToggle, 'Email notifications');
    }
    if (activityRemindersToggle) {
        handlePrivacyToggle(activityRemindersToggle, 'Activity reminders');
    }

    // User Management
    let currentUser = null;
    function loadUserFromLocalStorage() {
        const storedUser = localStorage.getItem('currentUser');
        if (storedUser) {
            return JSON.parse(storedUser);
        }
        return null;
    }

    function saveUserToLocalStorage(user) {
        localStorage.setItem('currentUser', JSON.stringify(user));
    }

    function createUser(username) {
        return new User(username, 0, 0, 0);
    }

    function loginUser(username, password) {
        // Simulate user authentication
        if (username === 'example' && password === 'password123') {
            currentUser = users.find(user => user.name === username) || createUser(username);
            saveUserToLocalStorage(currentUser);
            showPage('home');
            updateProfileInfo();
            return true;
        } else {
            return false; // Login failed
        }
    }

    function logoutUser() {
        localStorage.removeItem('currentUser');
        currentUser = null;
        showPage('login');
    }

    function updateProfileInfo() {
        if (currentUser) {
            document.getElementById('profile-name').textContent = currentUser.name;
        }
    }

    // Modify logout button functionality
    const logoutButton = document.querySelector('.log-out-button');
    if (logoutButton) {
        logoutButton.addEventListener('click', logoutUser);
    }

    // Login form handling
    document.body.addEventListener('submit', (event) => {
        if (event.target.id === 'login-form') {
            event.preventDefault();
            const username = document.getElementById('username').value;
            const password = document.getElementById('password').value;
            if (loginUser(username, password)) {
                // Successful login
            } else {
                alert('Invalid credentials');
            }
        }
    });

    // Initial page load
    currentUser = loadUserFromLocalStorage();
    if (currentUser) {
        currUser.name = currentUser.name;
        updateProfileInfo();
        showPage('home');
    } else {
        showPage('login');
    }

    // Load goals and workouts on page load
    loadGoal();
    renderWorkoutEntries();
    recalculateUserTotals();
});