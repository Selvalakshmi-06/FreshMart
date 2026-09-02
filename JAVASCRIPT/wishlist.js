
// ========================================
// FRESHMART - WISHLIST
// MongoDB / Backend Version
// ========================================

const API_URL = "https://freshmart-qzx3.onrender.com";


// ========================================
// GET TOKEN
// ========================================

function getToken() {
    return localStorage.getItem("freshmartToken");
}


// ========================================
// LOAD WISHLIST FROM SERVER
// ========================================

async function loadWishlist() {

    const container =
        document.getElementById("wishlistItems");

    if (!container) return;

    const token = getToken();

    // User must be logged in
    if (!token) {

        container.innerHTML = `
            <div class="empty-wishlist">

                <div style="font-size:70px;">
                    ❤️
                </div>

                <h2>
                    Please Login
                </h2>

                <p>
                    Login to view your wishlist.
                </p>

                <a
                    href="login.html"
                    class="btn btn-primary">

                    Login

                </a>

            </div>
        `;

        return;
    }


    try {

        const response = await fetch(
            API_URL + "/api/wishlist",
            {
                method: "GET",

                headers: {
                    "Authorization": "Bearer " + token
                }
            }
        );


        const data = await response.json();

        console.log(
            "WISHLIST RESPONSE:",
            data
        );


        // Token problem
        if (response.status === 401 ||
            response.status === 403) {

            localStorage.removeItem("freshmartToken");
            localStorage.removeItem("freshmartUser");

            alert("Your login session has expired. Please login again.");

            window.location.href = "login.html";

            return;
        }


        if (!response.ok) {

            container.innerHTML = `
                <div class="empty-wishlist">

                    <h2>
                        Unable to load wishlist
                    </h2>

                    <p>
                        ${data.message || "Something went wrong."}
                    </p>

                </div>
            `;

            return;
        }


        const items =
            data.wishlist &&
            Array.isArray(data.wishlist.items)
                ? data.wishlist.items
                : [];


        displayWishlist(items);


    } catch (error) {

        console.error(
            "LOAD WISHLIST ERROR:",
            error
        );


        container.innerHTML = `
            <div class="empty-wishlist">

                <h2>
                    Cannot connect to FreshMart
                </h2>

                <p>
                    Please try again.
                </p>

            </div>
        `;

    }

}


// ========================================
// DISPLAY WISHLIST
// ========================================

function displayWishlist(items) {

    const container =
        document.getElementById("wishlistItems");

    if (!container) return;


    container.innerHTML = "";


    if (!items || items.length === 0) {

        container.innerHTML = `

            <div class="empty-wishlist">

                <div style="font-size:70px;">
                    ♡
                </div>

                <h2>
                    Your Wishlist is Empty
                </h2>

                <p>
                    Like products to see them here.
                </p>

                <a
                    href="products.html"
                    class="btn btn-primary">

                    Browse Products

                </a>

            </div>

        `;

        return;
    }


    items.forEach(function (item) {

        const card =
            document.createElement("div");

        card.className =
            "product-card";


        const imageHTML =
            item.image
                ? `<img src="${item.image}" alt="${item.name}">`
                : `<div style="font-size:60px;">🛒</div>`;


        card.innerHTML = `

            <div class="product-image">

                ${imageHTML}

            </div>

            <div class="product-info">

                <h3>
                    ${item.name}
                </h3>

                <p class="product-category">
                    Fresh Product
                </p>

                <span class="product-price">

                    ₹${Number(item.price)}

                </span>

                <div class="product-actions">

                    <button
                        type="button"
                        class="wishlist liked"
                        data-product-id="${item.productId}">

                        ♥
                    </button>

                    <button
                        type="button"
                        class="add-cart"
                        data-product-id="${item.productId}"
                        data-product-name="${item.name}"
                        data-product-price="${item.price}"
                        data-product-image="${item.image || ""}">

                        Add to Cart

                    </button>

                </div>

            </div>
        `;


        container.appendChild(card);

    });

}


// ========================================
// REMOVE FROM WISHLIST
// ========================================

document.addEventListener(
    "click",
    async function (event) {

        const button =
            event.target.closest(
                ".wishlist[data-product-id]"
            );


        if (!button) return;


        const productId =
            button.dataset.productId;


        const token = getToken();


        if (!token) {

            alert("Please login first.");

            window.location.href =
                "login.html";

            return;
        }


        try {

            const response =
                await fetch(
                    API_URL +
                    "/api/wishlist/remove",
                    {
                        method: "DELETE",

                        headers: {
                            "Content-Type":
                                "application/json",

                            "Authorization":
                                "Bearer " + token
                        },

                        body: JSON.stringify({
                            productId:
                                productId
                        })
                    }
                );


            const data =
                await response.json();


            console.log(
                "REMOVE WISHLIST RESPONSE:",
                data
            );


            if (response.status === 401 ||
                response.status === 403) {

                localStorage.removeItem(
                    "freshmartToken"
                );

                localStorage.removeItem(
                    "freshmartUser"
                );

                alert(
                    "Your login session has expired. Please login again."
                );

                window.location.href =
                    "login.html";

                return;
            }


            if (!response.ok) {

                alert(
                    data.message ||
                    "Failed to remove wishlist item."
                );

                return;
            }


            // Reload from MongoDB
            loadWishlist();


        } catch (error) {

            console.error(
                "REMOVE WISHLIST ERROR:",
                error
            );

            alert(
                "Cannot connect to FreshMart server."
            );

        }

    }
);


// ========================================
// ADD WISHLIST ITEM TO CART
// ========================================

document.addEventListener(
    "click",
    async function (event) {

        const button =
            event.target.closest(
                ".add-cart[data-product-id]"
            );


        if (!button) return;


        const token = getToken();


        if (!token) {

            alert("Please login first.");

            window.location.href =
                "login.html";

            return;
        }


        const productId =
            button.dataset.productId;

        const productName =
            button.dataset.productName;

        const productPrice =
            Number(
                button.dataset.productPrice
            );

        const productImage =
            button.dataset.productImage || "";


        try {

            const response =
                await fetch(
                    API_URL + "/api/cart/add",
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

                            quantity:
                                1,

                            image:
                                productImage

                        })
                    }
                );


            const data =
                await response.json();


            if (response.status === 401 ||
                response.status === 403) {

                localStorage.removeItem(
                    "freshmartToken"
                );

                localStorage.removeItem(
                    "freshmartUser"
                );

                alert(
                    "Your login session has expired. Please login again."
                );

                window.location.href =
                    "login.html";

                return;
            }


            if (!response.ok) {

                alert(
                    data.message ||
                    "Failed to add product to cart."
                );

                return;
            }


            alert(
                "🛒 " +
                productName +
                " added to cart!"
            );


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
);


// ========================================
// START
// ========================================

document.addEventListener(
    "DOMContentLoaded",
    function () {

        console.log(
            "FreshMart wishlist page loaded"
        );

        loadWishlist();

    }
);

