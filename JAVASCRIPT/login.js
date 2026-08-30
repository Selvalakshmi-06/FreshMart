// ========================================
// FRESHMART - LOGIN
// ========================================

console.log("LOGIN JS LOADED");

document.addEventListener("DOMContentLoaded", function () {

    const loginForm =
        document.getElementById("loginForm");

    const loginError =
        document.getElementById("loginError");


    if (!loginForm) {

        console.error("Login form not found!");

        return;
    }


    loginForm.addEventListener(
        "submit",
        async function (event) {

            event.preventDefault();

            console.log("LOGIN BUTTON CLICKED");


            const email =
                document
                    .getElementById("loginEmail")
                    .value
                    .trim();


            const password =
                document
                    .getElementById("loginPassword")
                    .value;


            if (loginError) {

                loginError.textContent = "";
                loginError.style.display = "none";

            }


            try {

                const response =
                    await fetch(
                        "http://localhost:5000/api/login",
                        {
                            method: "POST",

                            headers: {
                                "Content-Type":
                                    "application/json"
                            },

                            body: JSON.stringify({
                                email: email,
                                password: password
                            })
                        }
                    );


                const data =
                    await response.json();


                console.log(
                    "LOGIN RESPONSE:",
                    data
                );


                if (!response.ok) {

                    if (loginError) {

                        loginError.textContent =
                            data.message ||
                            "Invalid email or password.";

                        loginError.style.display =
                            "block";

                    }

                    return;
                }


                // ========================================
                // SAVE TOKEN
                // ========================================

                localStorage.setItem(
                    "freshmartToken",
                    data.token
                );


                // ========================================
                // SAVE USER
                // ========================================

                localStorage.setItem(
                    "freshmartUser",
                    JSON.stringify(data.user)
                );


                console.log(
                    "ROLE:",
                    data.user.role
                );


                alert("Login successful!");


                // ========================================
                // ADMIN
                // ========================================

                if (data.user.role === "admin") {

                    window.location.href =
                        "admin.html";

                    return;
                }
                window.location.herf = "index.html";

                // ========================================
                // NORMAL USER
                // ========================================

                window.location.href =
                    "index.html";

            }


            catch (error) {

                console.error(
                    "LOGIN ERROR:",
                    error
                );


                if (loginError) {

                    loginError.textContent =
                        "Cannot connect to FreshMart server.";

                    loginError.style.display =
                        "block";

                }

            }

        }
    );

});