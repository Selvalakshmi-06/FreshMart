// ========================================
// FRESHMART - MAIN JAVASCRIPT
// ========================================


// ========================================
// GET CURRENT USER CART KEY
// ========================================

function getCurrentCartKey() {

    const currentUser =
        localStorage.getItem("freshmartUser");

    if (currentUser) {

        return "freshmartCart_" +
            currentUser.replace(
                /[^a-zA-Z0-9]/g,
                "_"
            );

    }

    return "freshmartCart_guest";

}


// ========================================
// GET CURRENT USER CART
// ========================================

function getCurrentUserCart() {

    const cartKey =
        getCurrentCartKey();

    return JSON.parse(
        localStorage.getItem(cartKey)
    ) || [];

}


// ========================================
// UPDATE CART NUMBER
// ========================================

function updateCartCount() {

    const cart =
        getCurrentUserCart();

    let totalQuantity = 0;


    cart.forEach(function (item) {

        totalQuantity +=
            Number(item.quantity || 1);

    });


    const cartCounts =
        document.querySelectorAll(
            "#cartCount"
        );


    cartCounts.forEach(function (element) {

        element.textContent =
            totalQuantity;

    });

}




// ========================================
// CATEGORY FILTER
// ========================================

function filterProducts(category) {

    const products =
        document.querySelectorAll(
            ".product-card"
        );


    products.forEach(function (product) {

        const productCategory =
            product.getAttribute(
                "data-category"
            );


        if (
            category === "all" ||
            productCategory === category
        ) {

            product.style.display =
                "";

        } else {

            product.style.display =
                "none";

        }

    });


    const buttons =
        document.querySelectorAll(
            ".filter-btn"
        );


    buttons.forEach(function (button) {

        button.classList.remove(
            "active"
        );

    });


    const activeButton =
        document.querySelector(
            '.filter-btn[onclick*="' +
            category +
            '"]'
        );


    if (activeButton) {

        activeButton.classList.add(
            "active"
        );

    }

}


// ========================================
// START
// ========================================

document.addEventListener(
    "DOMContentLoaded",
    function () {

        updateCartCount();

    }
);
// ========================================
// LOGIN / LOGOUT BUTTON
// ========================================

document.addEventListener("DOMContentLoaded", function () {

    const userIcon = document.getElementById("userIcon");
    const logoutBtn = document.getElementById("logoutBtn");

    const token = localStorage.getItem("freshmartToken");

    // User is logged in
    if (token) {

        if (userIcon) {
            userIcon.style.display = "none";
        }

        if (logoutBtn) {
            logoutBtn.style.display = "inline-block";
        }

    }

    // User is not logged in
    else {

        if (userIcon) {
            userIcon.style.display = "inline-block";
        }

        if (logoutBtn) {
            logoutBtn.style.display = "none";
        }

    }

    // Logout
    if (logoutBtn) {

        logoutBtn.addEventListener("click", function () {

            localStorage.removeItem("freshmartToken");
            localStorage.removeItem("freshmartUser");

            alert("Logged out successfully!");

            window.location.href = "login.html";

        });

    }

});