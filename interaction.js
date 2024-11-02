document.addEventListener('DOMContentLoaded', () => {
    // Page Navigation
    const navLinks = document.querySelectorAll('nav a, .leaderboard-link');
    const pages = document.querySelectorAll('.page');
    
    class user {

        constructor(name, weekly, monthly, allTime)
        {
            this.name = name;
            this.weekly= weekly;
            this.monthly= monthly;
            this.allTime= allTime;
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
        workoutLogged(time){
            this.weekly+=time;
            this.monthly+=time;
            this.allTime+=time;
        }
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

    function homePopulateLeaderboard()
    {
        const userA= new user("Sarah C", 45, 135, 5945);
        const userB= new user("Will G.", 20, 60, 2640);
        const userC= new user("Alan W.", 15, 66, 1970)
        const userD= new user("Alex C.", 25, 74, 3256);
        const userE= new user("Paula P.", 10, 35, 1435);
        const userF= new user("Brad A.", 90, 270, 10800);
        const userG= new user("Rhys S.", 17, 51, 2260);
        const userH= new user("Jesse F.", 77, 231, 10164);
        const userI= new user("Rose M.", 67, 201, 8890);
        const userJ= new user("Cecil P.", 5, 15, 2200)
        let users= [userA, userB, userC, userD, userE, userF, userG, userH, userI, userJ];
        var res = users.sort((a, b) => b.getWeekly-a.getWeekly);

        let list = document.getElementById("top-users-list");
        for (i = 0; i < 5; ++i) {
            let li = document.createElement('li');
            li.innerText = users[i].getName;
            list.appendChild(li);
        }
    }
    function populateLeaderboard() {
        // Placeholder function for populating leaderboard
        console.log('Populating leaderboard...');
        //create users
        const userA= new user("Sarah C", 45, 135, 5945);
        const userB= new user("Will G.", 20, 60, 2640);
        const userC= new user("Alan W.", 15, 66, 1970)
        const userD= new user("Alex C.", 25, 74, 3256);
        const userE= new user("Paula P.", 10, 35, 1435);
        const userF= new user("Brad A.", 90, 270, 10800);
        const userG= new user("Rhys S.", 17, 51, 2260);
        const userH= new user("Jesse F.", 77, 231, 10164);
        const userI= new user("Rose M.", 67, 201, 8890);
        const userJ= new user("Cecil P.", 5, 15, 2200)
        let users= [userA, userB, userC, userD, userE, userF, userG, userH, userI, userJ];
        //users[10]= currUser

        period =  document.querySelector('#leaderboard-period');
        dropdown = period.options[period.selectedIndex].value;
        const lbTable = document.createElement("table");
        lbTable.innerHTML = "<thead><th>User</th><th>Workout Duration</th></thead>";
        const target = document.getElementById('leaderboard-list');
        target.innerHTML = "";
        if(dropdown==="weekly")
        {
            var res = users.sort((a, b) => b.getWeekly-a.getWeekly);
            for(person of users){
                const newRow = document.createElement("tr");
                const tdName = document.createElement("td");
                const tdTime = document.createElement("td");
                tdName.textContent = person.getName;
                tdTime.textContent = person.getWeekly;    
                newRow.appendChild(tdName);
                newRow.appendChild(tdTime);
                lbTable.appendChild(newRow);
            }
        }
        else if(dropdown==="monthly")
        {
            var res = users.sort((a, b) => b.getMonthly-a.getMonthly);
            for(person of users){
                const newRow = document.createElement("tr");
                const tdName = document.createElement("td");
                const tdTime = document.createElement("td");
                tdName.textContent = person.getName;
                tdTime.textContent = person.getMonthly;    
                newRow.appendChild(tdName);
                newRow.appendChild(tdTime);
                lbTable.appendChild(newRow);
            }
        }
        else if(dropdown==="all-time")
        {
            var res = users.sort((a, b) => b.getAllTime-a.getAllTime);
            for(person of users){
                const newRow = document.createElement("tr");
                const tdName = document.createElement("td");
                const tdTime = document.createElement("td");
                tdName.textContent = person.getName;
                tdTime.textContent = person.getAllTime;    
                newRow.appendChild(tdName);
                newRow.appendChild(tdTime);
                lbTable.appendChild(newRow);
            }
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

    // Logout functionality
    const logoutButton = document.querySelector('.log-out-button');
    
    if (logoutButton) {
        logoutButton.addEventListener('click', () => {
            showPage('login');
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

    // Initial page load
    showPage('home');
});