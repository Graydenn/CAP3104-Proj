document.addEventListener('DOMContentLoaded', () => {
    // Page Navigation
    const navLinks = document.querySelectorAll('nav a, .leaderboard-link');
    const pages = document.querySelectorAll('.page');

    function checkWeek(date)
    {
        const today = new Date();
        const todayDate = today.getDate();
        const todayDay = today.getDay();
      
        // get first date of week
        const firstDayOfWeek = new Date(today.setDate(todayDate - todayDay));
      
        // get last date of week
        const lastDayOfWeek = new Date(firstDayOfWeek);
        lastDayOfWeek.setDate(lastDayOfWeek.getDate() + 6);
      
        // if date is equal or within the first and last dates of the week
        return date >= firstDayOfWeek && date <= lastDayOfWeek;
        
    }

    function checkMonth(date)
    {
        const today = new Date();
        const todayMonth = today.getMonth();
        const dateMonth= date.getMonth();

        return (dateMonth ===todayMonth);
    }

    class User {
        constructor(name, weekly, monthly, allTime) {
            this.name = name;
            this.weekly = weekly;
            this.monthly = monthly;
            this.allTime = allTime;
        }
        get getName(){
            return this.name;
        }
        get getWeekly()
        {
            return this.weekly;
        }
        get getMonthly()
        {
            return this.monthly;
        }
        get getAllTime(){
            return this.allTime;
        }
        set setName(newName){
            this.name= newName;
        }
        set setWeekly(newWeekly)
        {
            this.weekly= newWeekly;
        }
        set setMonthly(newMonthly)
        {
            this.monthly= newMonthly;
        }
        set setAllTime(newAllTime){
            this.allTime= newAllTime;
        }
        workoutLogged(date, time) {
            time  = parseInt(time, 10);

            if(checkWeek(date))
            {
                this.weekly = (parseInt(this.weekly, 10) || 0) + time;
            }
            if (checkMonth(date))
            {
                this.monthly = (parseInt(this.monthly, 10) || 0) + time;
            }
            this.allTime = (parseInt(this.allTime, 10) || 0) + time;
        }

    }

    let users = loadUsers(); // Load users from local storage
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

            const dateFormatted= new Date(date);
            addWorkoutEntry(date, activity, duration);
            currUser.workoutLogged(dateFormatted, duration);

            saveUsers();

            badgeCheck(users);
            logNewPopup.close();
            logNewForm.reset();
            updateDaysSinceWorkout(new Date(date));
            saveWorkouts();
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

        // Save goal to localStorage
        localStorage.setItem('goal', JSON.stringify({ description, progress }));
    }

    function loadGoal() {
        const storedGoal = localStorage.getItem('goal');
        if (storedGoal) {
            const { description, progress } = JSON.parse(storedGoal);
            updateGoal(description, progress);
        }
    }

    function updateDaysSinceWorkout(lastWorkoutDateString) {
        const today = dayjs(); // Get today's date using Day.js
        const lastWorkout = dayjs(lastWorkoutDateString); // Parse the input date string
      
        const diffDays = today.diff(lastWorkout, 'day'); // Calculate difference in days
      
        const daysSinceWorkout = document.getElementById('days-since-workout');
        if (daysSinceWorkout) {
          daysSinceWorkout.textContent = ((Math.max(0, diffDays))-1);
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

    function attachLeaderboardEventListener()
    {
        const periodDropdown = document.querySelector('#leaderboard-period');
        if (periodDropdown) {
            periodDropdown.addEventListener('change', (event) => {
                populateLeaderboard();
            });
        }
    }

    function homePopulateLeaderboard() {

        const weeklySorted = [...users].sort((a, b) => b.weekly - a.weekly);
  
  
          const list = document.getElementById("top-users-list");
          list.innerHTML = ''; // Clear previous entries
  
          for (let i = 0; i < Math.min(5, weeklySorted.length); ++i) {
              let li = document.createElement('li');
              li.innerText = weeklySorted[i].name;
              list.appendChild(li);
          }
    }

    function populateLeaderboard() {

        period = document.querySelector('#leaderboard-period');
        dropdown = period.options[period.selectedIndex].value;

        const lbTable = document.createElement("table");
        lbTable.innerHTML = "<thead><th>Rank</th><th>User</th><th>Workout Duration</th></thead>";
        const target = document.getElementById('leaderboard-list');
        target.innerHTML = "";


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


            lbTable.appendChild(newRow);
        }


        target.appendChild(lbTable);
    }

    // Update profile information
    const profileName = document.getElementById('profile-name');
    const profileEmail = document.getElementById('profile-email');
    if (profileName && profileEmail) {
        profileName.textContent = 'Example';
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

    // Set initial dark mode state (off by default)
    const savedDarkMode = localStorage.getItem('darkMode');
    setDarkMode(savedDarkMode === 'true');
   
    if (darkModeToggle) {
        darkModeToggle.checked = body.classList.contains('dark-mode');
        darkModeToggle.addEventListener('change', () => {
            setDarkMode(darkModeToggle.checked);
        });
    }


    document.body.addEventListener('submit', (event) => {
        if (event.target.id === 'login-form') {
            event.preventDefault();
            const username = document.getElementById('username').value;
            const password = document.getElementById('password').value;
            if (username === 'example' && password === 'password123') {
                showPage('home');
            } else {
                alert('Invalid credentials');
            }
        }
    });

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

        // Local Storage and User Management
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
    
        function createUser(username, password) { // No email in this example
            return new user(username, 0, 0, 0); // Assuming 'user' class is defined
        }
    
        function loginUser(username, password) {
            // In a real application, you'd verify against a database/server
            if (username === 'example' && password === 'password123') { // Replace with actual logic
                currentUser = loadUserFromLocalStorage() || createUser(username); // Load or create if new
                saveUserToLocalStorage(currentUser);
                showPage('home');
                updateProfileInfo(); // Update profile section with user data
                return true; // Successful login
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
                // ... (other profile updates)
            }
        }
    
        // Modify logout button functionality
        const logoutButton = document.querySelector('.log-out-button');
        if (logoutButton) {
            logoutButton.addEventListener('click', logoutUser); // Call logoutUser function
        }
    
        // Login form handling
        document.body.addEventListener('submit', (event) => {
            if (event.target.id === 'login-form') {
                event.preventDefault();
                const username = document.getElementById('username').value;
                const password = document.getElementById('password').value;
    
                if (loginUser(username, password)) {
                    // Successful login, page will be shown by loginUser()
                } else {
                    alert('Invalid credentials');
                }
            }
        });
    
        // ... rest of the code
    
    
        // Initial page load (modified)
        currentUser = loadUserFromLocalStorage();
        if (currentUser) {
            showPage('home');
            updateProfileInfo();
        } else {
            showPage('login'); // Start at login if no user in local storage
        }
});