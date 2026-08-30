// ========================================
// FRESHMART - CHECKOUT
// ========================================

const API_URL = "http://localhost:5000";

// ========================================
// GET TOKEN
// ========================================

function getToken() {
    return localStorage.getItem("freshmartToken");
}

// ========================================
// LOAD CART
// ========================================

async function loadCheckoutCart() {

    const token = getToken();

    if (!token) {
        alert("Please login first.");
        window.location.href = "login.html";
        return;
    }

    try {

        const response = await fetch(
            API_URL + "/api/cart",
            {
                method: "GET",
                headers: {
                    "Authorization": "Bearer " + token
                }
            }
        );

        const data = await response.json();

        console.log("CHECKOUT CART:", data);

        if (!response.ok) {
            alert(data.message || "Unable to load cart.");
            return;
        }

        const items =
            data.cart && Array.isArray(data.cart.items)
                ? data.cart.items
                : [];

        if (items.length === 0) {
            alert("Your cart is empty.");
            window.location.href = "cart.html";
            return;
        }

        let subtotal = 0;

        items.forEach(function (item) {

            subtotal +=
                Number(item.price) *
                Number(item.quantity);

        });

        const delivery = 0;
        const total = subtotal + delivery;

        document.getElementById("checkoutSubtotal").textContent =
            "₹" + subtotal;

        document.getElementById("checkoutDelivery").textContent =
            "₹" + delivery;

        document.getElementById("checkoutTotal").textContent =
            "₹" + total;

    } catch (error) {

        console.error("CHECKOUT CART ERROR:", error);

        alert("Cannot connect to FreshMart server.");

    }
}

// ========================================
// PLACE ORDER
// ========================================

async function placeOrder(event) {

    event.preventDefault();

    const token = getToken();

    if (!token) {
        alert("Please login first.");
        window.location.href = "login.html";
        return;
    }

    // Get values from HTML
    const name =
        document.getElementById("checkoutName").value.trim();

    const phone =
        document.getElementById("checkoutPhone").value.trim();

    const address =
        document.getElementById("checkoutAddress").value.trim();

    const city =
        document.getElementById("checkoutCity").value.trim();

    const pincode =
        document.getElementById("checkoutPincode").value.trim();

    const paymentElement =
        document.querySelector(
            'input[name="payment"]:checked'
        );

    if (!paymentElement) {
        alert("Please select a payment method.");
        return;
    }

    const paymentMethod = paymentElement.value;

    // Check fields
    if (
        !name ||
        !phone ||
        !address ||
        !city ||
        !pincode
    ) {
        alert("Please fill all shipping details.");
        return;
    }

    console.log("ORDER DETAILS:", {
        name,
        phone,
        address,
        city,
        pincode,
        paymentMethod
    });

    try {

        const response = await fetch(
            API_URL + "/api/orders",
            {
                method: "POST",

                headers: {
                    "Content-Type": "application/json",
                    "Authorization": "Bearer " + token
                },

                body: JSON.stringify({
                    name: name,
                    phone: phone,
                    address: address,
                    city: city,
                    pincode: pincode,
                    paymentMethod: paymentMethod
                })
            }
        );

        const data = await response.json();

        console.log("ORDER RESPONSE:", data);

        if (!response.ok) {

            alert(
                data.message ||
                "Failed to place order."
            );

            return;
        }

        alert("Order placed successfully! 🎉");

        window.location.href = "orders.html";

    } catch (error) {

        console.error("PLACE ORDER ERROR:", error);

        alert(
            "Cannot connect to FreshMart server."
        );
    }
}

// ========================================
// START
// ========================================

document.addEventListener(
    "DOMContentLoaded",
    function () {

        loadCheckoutCart();

        const form =
            document.getElementById("checkoutForm");

        if (form) {

            form.addEventListener(
                "submit",
                placeOrder
            );

        }

    }
);