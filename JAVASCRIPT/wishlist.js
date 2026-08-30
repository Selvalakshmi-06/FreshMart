// ========================================
// FRESHMART - USER WISHLIST
// ========================================


// ----------------------------------------
// CURRENT USER
// ----------------------------------------

const currentUser =
    localStorage.getItem("freshmartUser");

const wishlistKey = currentUser
    ? "freshmartWishlist_" +
      currentUser.replace(/[^a-zA-Z0-9]/g, "_")
    : "freshmartWishlist_guest";


// ----------------------------------------
// LOAD USER WISHLIST
// ----------------------------------------

let wishlist =
    JSON.parse(
        localStorage.getItem(wishlistKey)
    ) || [];


// ----------------------------------------
// SAVE
// ----------------------------------------

function saveWishlist() {

    localStorage.setItem(
        wishlistKey,
        JSON.stringify(wishlist)
    );

}


// ----------------------------------------
// LIKE BUTTON
// ----------------------------------------

document.addEventListener(
    "click",
    function (event) {

        const button =
            event.target.closest(".wishlist");

        if (!button) return;


        const productCard =
            button.closest(".product-card");

        if (!productCard) return;


        const nameElement =
            productCard.querySelector("h3");

        if (!nameElement) return;


        const productName =
            nameElement.textContent.trim();


        const index =
            wishlist.indexOf(productName);


        if (index === -1) {

            wishlist.push(productName);

            button.textContent = "♥";

            button.classList.add("liked");

        } else {

            wishlist.splice(index, 1);

            button.textContent = "♡";

            button.classList.remove("liked");

        }


        saveWishlist();

    }
);


// ----------------------------------------
// WISHLIST PAGE PRODUCT DATA
// ----------------------------------------

const products = {

    Apple: {
        emoji: "🍎",
        category: "Fresh Fruits",
        price: 120,
        unit: "kg"
    },

    Banana: {
        emoji: "🍌",
        category: "Fresh Fruits",
        price: 60,
        unit: "dozen"
    },

    Orange: {
        emoji: "🍊",
        category: "Fresh Fruits",
        price: 90,
        unit: "kg"
    },

    Carrot: {
        emoji: "🥕",
        category: "Vegetables",
        price: 70,
        unit: "kg"
    },

    Tomato: {
        emoji: "🍅",
        category: "Vegetables",
        price: 45,
        unit: "kg"
    },

    Potato: {
        emoji: "🥔",
        category: "Vegetables",
        price: 40,
        unit: "kg"
    },

    Milk: {
        emoji: "🥛",
        category: "Dairy",
        price: 65,
        unit: "litre"
    },

    Onion: {
        emoji: "🧅",
        category: "Vegetables",
        price: 50,
        unit: "kg"
    },

    Mango: {
        emoji: "🥭",
        category: "Fresh Fruits",
        price: 100,
        unit: "kg"
    },

    Bread: {
        emoji: "🍞",
        category: "Groceries",
        price: 45,
        unit: "pack"
    },

    Eggs: {
        emoji: "🥚",
        category: "Dairy",
        price: 90,
        unit: "dozen"
    },

    Rice: {
        emoji: "🍚",
        category: "Groceries",
        price: 80,
        unit: "kg"
    }

};


// ----------------------------------------
// DISPLAY WISHLIST
// ----------------------------------------

function displayWishlist() {

    const container =
        document.getElementById("wishlistItems");

    if (!container) return;


    container.innerHTML = "";


    if (wishlist.length === 0) {

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


    wishlist.forEach(function (productName) {

        const product =
            products[productName];

        if (!product) return;


        const card =
            document.createElement("div");

        card.className =
            "product-card";


        card.innerHTML = `

            <div class="product-image">

                ${product.emoji}

            </div>

            <div class="product-info">

                <h3>
                    ${productName}
                </h3>

                <p class="product-category">
                    ${product.category}
                </p>

                <span class="product-price">

                    ₹${product.price} / ${product.unit}

                </span>

                <div class="product-actions">

                    <button
                        type="button"
                        class="wishlist liked"
                        data-product="${productName}">

                        ♥

                    </button>

                    <button
                        type="button"
                        class="add-cart"
                        data-product="${productName}">

                        Add to Cart

                    </button>

                </div>

            </div>
        `;


        container.appendChild(card);

    });

}


// ----------------------------------------
// WISHLIST PAGE BUTTONS
// ----------------------------------------

document.addEventListener(
    "click",
    function (event) {


        // Remove from wishlist
        const wishlistButton =
            event.target.closest(
                ".wishlist[data-product]"
            );


        if (wishlistButton) {

            const productName =
                wishlistButton.dataset.product;


            wishlist =
                wishlist.filter(function (name) {

                    return name !== productName;

                });


            saveWishlist();

            displayWishlist();

            return;

        }


        // Add wishlist item to cart
        const cartButton =
            event.target.closest(
                ".add-cart[data-product]"
            );


        if (cartButton) {

            const productName =
                cartButton.dataset.product;

            const product =
                products[productName];

            if (!product) return;


            const user =
                localStorage.getItem(
                    "freshmartUser"
                );


            const cartKey = user
                ? "freshmartCart_" +
                  user.replace(
                      /[^a-zA-Z0-9]/g,
                      "_"
                  )
                : "freshmartCart_guest";


            let cart =
                JSON.parse(
                    localStorage.getItem(cartKey)
                ) || [];


            const existing =
                cart.find(function (item) {

                    return item.name === productName;

                });


            if (existing) {

                existing.quantity =
                    Number(
                        existing.quantity || 1
                    ) + 1;

            } else {

                cart.push({

                    name: productName,

                    price: product.price,

                    quantity: 1

                });

            }


            localStorage.setItem(
                cartKey,
                JSON.stringify(cart)
            );


            alert(
                "🛒 " +
                productName +
                " added to cart!"
            );

        }

    }
);


// ----------------------------------------
// DISPLAY
// ----------------------------------------

displayWishlist();