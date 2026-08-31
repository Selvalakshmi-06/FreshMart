// ========================================
// FRESHMART AUTHENTICATION
// LOGIN + REGISTER + LOGOUT
// ========================================


// ========================================
// REGISTER
// ========================================

const registerForm = document.getElementById("registerForm");

if (registerForm) {

    registerForm.addEventListener("submit", async function (event) {

        event.preventDefault();

        const name =
            document.getElementById("registerName").value.trim();

        const email =
            document.getElementById("registerEmail").value.trim();

        const password =
            document.getElementById("registerPassword").value;

        const confirmPassword =
            document.getElementById("confirmPassword").value;


        // Check passwords
        if (password !== confirmPassword) {

            alert("Passwords do not match!");
            return;

        }


        try {

            const response = await fetch(
                "https://freshmart-qzx3.onrender.com/api/register",
                {
                    method: "POST",

                    headers: {
                        "Content-Type": "application/json"
                    },

                    body: JSON.stringify({
                        name: name,
                        email: email,
                        password: password
                    })
                }
            );


            const data = await response.json();


            if (response.ok) {

                alert("Registration successful!");

                window.location.href = "login.html";

            } else {

                alert(data.message);

            }


        } catch (error) {

            console.error("Registration error:", error);

            alert(
                "Unable to connect to the server. Make sure the backend is running."
            );

        }

    });

}


// ========================================
// LOGIN
// ========================================

const loginForm = document.getElementById("loginForm");

if (loginForm) {

    loginForm.addEventListener("submit", async function (event) {

        event.preventDefault();

        const email =
            document.getElementById("loginEmail").value.trim();

        const password =
            document.getElementById("loginPassword").value;

        const errorMessage =
            document.getElementById("loginError");


        try {

            const response = await fetch(
                "https://freshmart-qzx3.onrender.com/api/login",
                {
                    method: "POST",

                    headers: {
                        "Content-Type": "application/json"
                    },

                    body: JSON.stringify({
                        email: email,
                        password: password
                    })
                }
            );


            const data = await response.json();


            if (response.ok) {

                localStorage.setItem(
                    "freshmartLoggedIn",
                    "true"
                );

                localStorage.setItem(
                    "freshmartUser",
                    data.user.email
                );

                localStorage.setItem(
                    "freshmartUserName",
                    data.user.name
                );


                if (errorMessage) {
                    errorMessage.style.display = "none";
                }


                alert("Login successful!");


                window.location.href = "index.html";

            } else {

    if (errorMessage) {
        errorMessage.textContent = data.message;
        errorMessage.style.display = "block";
    }

    alert(data.message);

}

        } catch (error) {

            console.error("Login error:", error);

            alert(
                "Unable to connect to the server. Make sure the backend is running."
            );

        }

    });

}
// ========================================
// LOGIN STATUS
// ========================================

const userIcon =
    document.getElementById("userIcon");

const logoutBtn =
    document.getElementById("logoutBtn");

const loggedIn =
    localStorage.getItem("freshmartLoggedIn");


if (loggedIn === "true") {

    if (userIcon) {
        userIcon.style.display = "none";
    }

    if (logoutBtn) {
        logoutBtn.style.display = "inline-block";
    }

}


// ========================================
// LOGOUT
// ========================================

if (logoutBtn) {

    logoutBtn.addEventListener("click", function () {

        localStorage.removeItem(
            "freshmartLoggedIn"
        );

        localStorage.removeItem(
            "freshmartUser"
        );


        alert("You have been logged out.");


        window.location.href =
            "login.html";

    });

}
