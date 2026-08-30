
// ========================================
// FRESHMART - CART
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

async function loadCart() {

    const cartItems = document.getElementById("cartItems");

    if (!cartItems) {
        return;
    }

    const token = getToken();

    if (!token) {

        cartItems.innerHTML = `
            <p>Please login to view your cart.</p>
        `;

        updateSummary([]);
        updateCartCount(0);
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

        console.log("CART DATA:", data);

        if (!response.ok){
            
            cartItems.innerHTML = `
                <p>Unable to load cart.</p>
            `;

            updateSummary([]);
            updateCartCount(0);
            return;
        }

        let items = [];

        if (
            data.cart &&
            Array.isArray(data.cart.items)
        ) {
            items = data.cart.items;
        }

        // ========================================
        // EMPTY CART
        // ========================================

        if (items.length === 0) {

            cartItems.innerHTML = `
                <div class="empty-cart">

                    <h3>Your cart is empty</h3>

                    <p>
                        Add some products to your cart.
                    </p>

                    <br>

                    <a
                        href="products.html"
                        class="btn btn-primary">
                        Shop Now
                    </a>

                </div>
            `;

            updateSummary([]);
            updateCartCount(0);
            return;
        }

        // ========================================
        // DISPLAY CART
        // ========================================

        cartItems.innerHTML = "";

        items.forEach(function (item) {

            const itemDiv =
                document.createElement("div");

            itemDiv.className = "cart-item";

            let imageHTML = "";

            // ========================================
            // PRODUCT IMAGE
            // ========================================

            if (item.image) {

                imageHTML =
                    '<img src="../IMAGES/products/' +
                    item.image +
                    '" alt="' +
                    item.name +
                    '" class="cart-product-image">';

            } else {

                let emoji = "🛒";

                if (item.name === "Apple") {
                    emoji = "🍎";
                } else if (item.name === "Banana") {
                    emoji = "🍌";
                } else if (item.name === "Orange") {
                    emoji = "🍊";
                } else if (item.name === "Carrot") {
                    emoji = "🥕";
                } else if (item.name === "Tomato") {
                    emoji = "🍅";
                } else if (item.name === "Potato") {
                    emoji = "🥔";
                } else if (item.name === "Milk") {
                    emoji = "🥛";
                } else if (item.name === "Onion") {
                    emoji = "🧅";
                } else if (item.name === "Mango") {
                    emoji = "🥭";
                } else if (item.name === "Bread") {
                    emoji = "🍞";
                } else if (item.name === "Eggs") {
                    emoji = "🥚";
                } else if (item.name === "Rice") {
                    emoji = "🍚";
                }

                imageHTML =
                    '<div class="cart-product-emoji">' +
                    emoji +
                    '</div>';
            }

            // ========================================
            // CART ITEM HTML
            // ========================================

            itemDiv.innerHTML = `

                <div class="cart-product">

                    ${imageHTML}

                    <div>

                        <h3>
                            ${item.name}
                        </h3>

                        <p>
                            ₹${item.price}
                        </p>

                    </div>

                </div>


                <div class="cart-controls">

                    <button
                        type="button"
                        class="quantity-btn"
                        onclick="decreaseQuantity(
                            '${item.productId}',
                            ${item.quantity}
                        )">

                        −

                    </button>


                    <span class="quantity-number">
                        ${item.quantity}
                    </span>


                    <button
                        type="button"
                        class="quantity-btn"
                        onclick="increaseQuantity(
                            '${item.productId}',
                            ${item.quantity}
                        )">

                        +

                    </button>

                </div>


                <div class="cart-item-total">

                    <strong>
                        ₹${Number(item.price) *
                        Number(item.quantity)}
                    </strong>

                </div>


                <button
                    type="button"
                    class="delete-cart-btn"
                    title="Remove from cart"
                    onclick="removeFromCart(
                        '${item.productId}'
                    )">

                    🗑️

                </button>

            `;

            cartItems.appendChild(itemDiv);

        });

        // ========================================
        // SUMMARY
        // ========================================

        updateSummary(items);

        // ========================================
        // CART COUNT
        // ========================================

        let count = 0;

        items.forEach(function (item) {

            count += Number(
                item.quantity || 0
            );

        });

        updateCartCount(count);

    } catch (error) {

        console.error(
            "LOAD CART ERROR:",
            error
        );

        cartItems.innerHTML = `
            <p>
                Cannot connect to FreshMart server.
            </p>
        `;

        updateSummary([]);
        updateCartCount(0);
    }
}


// ========================================
// SUMMARY
// ========================================

function updateSummary(items) {

    let subtotal = 0;

    items.forEach(function (item) {

        subtotal +=
            Number(item.price) *
            Number(item.quantity);

    });

    const delivery =
        subtotal > 0 ? 40 : 0;

    const total =
        subtotal + delivery;


    const subtotalElement =
        document.getElementById("subtotal");

    const deliveryElement =
        document.getElementById("delivery");

    const totalElement =
        document.getElementById("total");


    if (subtotalElement) {

        subtotalElement.textContent =
            "₹" + subtotal;

    }


    if (deliveryElement) {

        deliveryElement.textContent =
            "₹" + delivery;

    }


    if (totalElement) {

        totalElement.textContent =
            "₹" + total;

    }
}


// ========================================
// CART COUNT
// ========================================

function updateCartCount(count) {

    const element =
        document.getElementById("cartCount");

    if (element) {

        element.textContent = count;

    }
}


// ========================================
// PLUS
// ========================================

async function increaseQuantity(
    productId,
    currentQuantity
) {

    await updateQuantity(
        productId,
        Number(currentQuantity) + 1
    );
}


// ========================================
// MINUS
// ========================================

async function decreaseQuantity(
    productId,
    currentQuantity
) {

    currentQuantity =
        Number(currentQuantity);

    if (currentQuantity <= 1) {

        await removeFromCart(productId);

        return;
    }

    await updateQuantity(
        productId,
        currentQuantity - 1
    );
}


// ========================================
// UPDATE QUANTITY
// ========================================

async function updateQuantity(
    productId,
    quantity
) {

    const token = getToken();

    if (!token) {

        alert("Please login first.");

        return;
    }

    try {

        const response = await fetch(
            API_URL + "/api/cart/update",
            {
                method: "PUT",

                headers: {
                    "Content-Type":
                        "application/json",

                    "Authorization":
                        "Bearer " + token
                },

                body: JSON.stringify({
                    productId: productId,
                    quantity: Number(quantity)
                })
            }
        );

        const data =
            await response.json();

        if (!response.ok) {

            alert(
                data.message ||
                "Unable to update cart."
            );

            return;
        }

        await loadCart();

    } catch (error) {

        console.error(
            "UPDATE ERROR:",
            error
        );

        alert(
            "Unable to update quantity."
        );
    }
}


// ========================================
// REMOVE FROM CART
// ========================================

async function removeFromCart(
    productId
) {

    const token = getToken();

    if (!token) {

        alert("Please login first.");

        return;
    }

    try {

        const response = await fetch(
            API_URL + "/api/cart/remove",
            {
                method: "DELETE",

                headers: {
                    "Content-Type":
                        "application/json",

                    "Authorization":
                        "Bearer " + token
                },

                body: JSON.stringify({
                    productId: productId
                })
            }
        );

        const data =
            await response.json();

        if (!response.ok) {

            alert(
                data.message ||
                "Unable to remove product."
            );

            return;
        }

        await loadCart();

    } catch (error) {

        console.error(
            "REMOVE ERROR:",
            error
        );

        alert(
            "Unable to remove product."
        );
    }
}


// ========================================
// PROCEED TO CHECKOUT
// ========================================

function setupCheckout() {

    const checkoutBtn =
        document.getElementById(
            "checkoutBtn"
        );

    if (!checkoutBtn) {
        return;
    }

    checkoutBtn.addEventListener(
        "click",
        async function () {

            const token = getToken();

            if (!token) {

                alert(
                    "Please login before checkout."
                );

                window.location.href =
                    "login.html";

                return;
            }

            try {

                const response =
                    await fetch(
                        API_URL + "/api/cart",
                        {
                            method: "GET",

                            headers: {
                                "Authorization":
                                    "Bearer " + token
                            }
                        }
                    );

                const data =
                    await response.json();

                let items = [];

                if (
                    data.cart &&
                    Array.isArray(
                        data.cart.items
                    )
                ) {

                    items =
                        data.cart.items;
                }

                if (items.length === 0) {

                    alert(
                        "Your cart is empty."
                    );

                    return;
                }

                window.location.href =
                    "checkout.html";

            } catch (error) {

                console.error(
                    "CHECKOUT ERROR:",
                    error
                );

                alert(
                    "Unable to proceed to checkout."
                );
            }
        }
    );
}


// ========================================
// START
// ========================================

document.addEventListener(
    "DOMContentLoaded",
    function () {

        loadCart();

        setupCheckout();

    }
);

