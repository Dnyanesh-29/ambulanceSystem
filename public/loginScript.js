document.addEventListener('DOMContentLoaded', () => {
    const loginForm = document.getElementById('loginForm');

    loginForm.addEventListener('submit', function (event) {
        event.preventDefault();

        const usernameInput = document.getElementById('username').value;
        const passwordInput = document.getElementById('password').value;
        const message = document.getElementById('message');

        // Fetch user credentials from the JSON file
        fetch('policeUsers.json')
            .then(response => response.json())
            .then(users => {
                // Validate input against fetched credentials
                const user = users.find(user => user.username === usernameInput && user.password === passwordInput);

                if (user) {
                    message.textContent = 'Login successful!';
                    message.style.color = 'green';
                    window.location.href = "police.html";
                    loginForm.reset();
                } else {
                    message.textContent = 'Invalid username or password. Please try again.';
                    message.style.color = 'red';
                }
            })
            .catch(error => {
                console.error('Error fetching user data:', error);
                message.textContent = 'An error occurred. Please try again later.';
                message.style.color = 'red';
            });
    });
});
