document.addEventListener("DOMContentLoaded", () => {

    const registerForm = document.getElementById("registerForm");

    if (!registerForm) {
        return;
    }

    registerForm.addEventListener("submit", async (event) => {

        event.preventDefault();

        const name =
            document.getElementById("registerName").value.trim();

        const email =
            document.getElementById("registerEmail").value.trim();

        const password =
            document.getElementById("registerPassword").value;

        const confirmPassword =
            document.getElementById("confirmPassword").value;


        // Check password confirmation
        if (password !== confirmPassword) {

            alert("Passwords do not match.");
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

                alert(
                    data.message ||
                    "Registration failed."
                );

            }


        } catch (error) {

            console.error(
                "Registration error:",
                error
            );

            alert(
                "Cannot connect to the FreshMart server."
            );

        }

    });

});
