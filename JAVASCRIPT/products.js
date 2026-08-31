// ========================================
// FRESHMART - PRODUCTS
// ========================================

const API_URL = "https://freshmart-qzx3.onrender.com";

// ========================================
// GET TOKEN
// ========================================

function getToken() {
    return localStorage.getItem("freshmartToken");
}

// ========================================
// ADD TO CART
// ========================================

async function addToCart(productId, productName, productPrice, productImage) {

    console.log("ADD TO CART CLICKED");
    console.log("Product:", productId, productName, productPrice);

    const token = getToken();

    // Check login
    if (!token) {
        alert("Please login to add products to cart.");
        window.location.href = "login.html";
        return;
    }

    // Check product details
    if (!productId || !productName || productPrice === undefined) {
        alert("Product details are missing.");
        console.error(
            "Missing product details:",
            productId,
            productName,
            productPrice
        );
        return;
    }

    try {

        console.log("Sending product to server...");

        const response = await fetch(
            API_URL + "/api/cart/add",
            {
                method: "POST",

                headers: {
                    "Content-Type": "application/json",
                    "Authorization": "Bearer " + token
                },

                body: JSON.stringify({
                    productId: productId,
                    name: productName,
                    price: Number(productPrice),
                    quantity: 1,
                    image: productImage || ""
                })
            }
        );

        const data = await response.json();

        console.log("SERVER RESPONSE:", data);

        if (!response.ok) {

            alert(
                data.message ||
                "Failed to add product to cart."
            );

            return;
        }

        alert(
            productName +
            " added to cart!"
        );

        updateCartCount();

    } catch (error) {

        console.error(
            "ADD TO CART ERROR:",
            error
        );

        alert(
            "Cannot connect to FreshMart server."
        );
    }
}

// ========================================
// UPDATE CART COUNT
// ========================================

async function updateCartCount() {

    const cartCount =
        document.getElementById("cartCount");

    if (!cartCount) {
        return;
    }

    const token = getToken();

    if (!token) {
        cartCount.textContent = "0";
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

        console.log("CART:", data);

        if (!response.ok) {
            cartCount.textContent = "0";
            return;
        }

        let items = [];

        if (
            data.cart &&
            Array.isArray(data.cart.items)
        ) {
            items = data.cart.items;
        }

        let total = 0;

        items.forEach(function (item) {
            total += Number(item.quantity || 0);
        });

        cartCount.textContent = total;

    } catch (error) {

        console.error(
            "CART COUNT ERROR:",
            error
        );

        cartCount.textContent = "0";
    }
}

// ========================================
// SEARCH
// ========================================

function setupSearch() {

    const searchInput =
        document.getElementById("searchInput");

    if (!searchInput) {
        return;
    }

    searchInput.addEventListener(
        "input",
        function () {

            const value =
                searchInput.value
                    .toLowerCase()
                    .trim();

            const products =
                document.querySelectorAll(
                    ".product-card"
                );

            products.forEach(function (product) {

                const name =
                    product.querySelector("h3");

                if (!name) {
                    return;
                }

                const productName =
                    name.textContent
                        .toLowerCase();

                if (
                    productName.includes(value)
                ) {
                    product.style.display = "";
                } else {
                    product.style.display = "none";
                }

            });
        }
    );
}

// ========================================
// FILTER PRODUCTS
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

            product.style.display = "";

        } else {

            product.style.display = "none";

        }
    });

    const buttons =
        document.querySelectorAll(
            ".filter-btn"
        );

    buttons.forEach(function (button) {
        button.classList.remove("active");
    });

    buttons.forEach(function (button) {

        const text =
            button.textContent
                .trim()
                .toLowerCase();

        if (
            (category === "all" && text === "all") ||
            (category === "fruit" && text === "fruits") ||
            (category === "vegetable" && text === "vegetables") ||
            (category === "dairy" && text === "dairy") ||
            (category === "grocery" && text === "groceries")
        ) {
            button.classList.add("active");
        }

    });
}


// ========================================
// WISHLIST
// ========================================

function setupWishlist() {

    const wishlistButtons =
        document.querySelectorAll(".wishlist");

    console.log(
        "Wishlist buttons found:",
        wishlistButtons.length
    );

    wishlistButtons.forEach(function (button) {

        button.addEventListener("click", async function () {

            console.log("WISHLIST CLICKED");

            const token = getToken();

            if (!token) {

                alert("Please login to use Wishlist.");

                window.location.href = "login.html";

                return;
            }

            const card =
                button.closest(".product-card");

            if (!card) {
                return;
            }

            const nameElement =
                card.querySelector("h3");

            const priceElement =
                card.querySelector(".product-price");

            const cartButton =
                card.querySelector(".add-cart");

            if (!nameElement ||
                !priceElement ||
                !cartButton) {

                alert("Product details are missing.");

                return;
            }

            const productName =
                nameElement.textContent.trim();

            const priceMatch =
                priceElement.textContent.match(/[\d.]+/);

            const productPrice =
                priceMatch
                    ? Number(priceMatch[0])
                    : 0;

            const onclickText =
                cartButton.getAttribute("onclick");

            const idMatch =
                onclickText.match(
                    /addToCart\(['"]([^'"]+)/
                );

            if (!idMatch) {

                console.error(
                    "Product ID not found"
                );

                return;
            }

            const productId =
                idMatch[1];

            const image =
                card.querySelector(
                    ".product-image img"
                );

            let productImage = "";

            if (image) {

                productImage =
                    image.getAttribute("src") || "";

            }

            console.log(
                "Adding wishlist:",
                productId,
                productName,
                productPrice
            );

            try {

                const response =
                    await fetch(
                        API_URL + "/api/wishlist/add",
                        {
                            method: "POST",

                            headers: {
                                "Content-Type":
                                    "application/json",

                                "Authorization":
                                    "Bearer " + token
                            },

                            body: JSON.stringify({

                                productId:
                                    productId,

                                name:
                                    productName,

                                price:
                                    productPrice,

                                image:
                                    productImage

                            })
                        }
                    );

                const data =
                    await response.json();

                console.log(
                    "WISHLIST RESPONSE:",
                    data
                );

                if (!response.ok) {

                    alert(
                        data.message ||
                        "Failed to add to wishlist."
                    );

                    return;
                }

                button.textContent = "♥";

                button.classList.add(
                    "wishlist-active"
                );

                alert(
                    productName +
                    " added to wishlist!"
                );

            } catch (error) {

                console.error(
                    "WISHLIST ERROR:",
                    error
                );

                alert(
                    "Cannot connect to FreshMart server."
                );

            }

        });

    });

}


// ========================================
// START
// ========================================

document.addEventListener(
    "DOMContentLoaded",
    function () {

        console.log(
            "FreshMart products page loaded"
        );

       updateCartCount();

       setupSearch();

       setupWishlist();

    }
);
