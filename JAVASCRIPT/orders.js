// ========================================
// FRESHMART - MY ORDERS
// ========================================

console.log("ORDERS JS LOADED");


document.addEventListener(
    "DOMContentLoaded",
    function () {

        loadOrders();

    }
);


// ========================================
// LOAD ORDERS
// ========================================

async function loadOrders() {

    const ordersContainer =
        document.getElementById(
            "ordersContainer"
        );


    const token =
        localStorage.getItem(
            "freshmartToken"
        );


    // Check login
    if (!token) {

        ordersContainer.innerHTML = `
            <div class="orders-message">
                <h2>Please login first</h2>
                <p>You need to login to view your orders.</p>
                <a href="login.html">
                    Login
                </a>
            </div>
        `;

        return;
    }


    try {

        const response =
            await fetch(
                "https://freshmart-qzx3.onrender.com/api/orders",
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


        if (!response.ok) {

            ordersContainer.innerHTML = `
                <div class="orders-message">
                    <h2>Unable to load orders</h2>
                    <p>
                        ${data.message ||
                        "Something went wrong."}
                    </p>
                </div>
            `;

            return;
        }


        displayOrders(
            data.orders || []
        );


    } catch (error) {

        console.error(
            "Load orders error:",
            error
        );


        ordersContainer.innerHTML = `
            <div class="orders-message">
                <h2>Server connection failed</h2>
                <p>
                    Please make sure the FreshMart
                    backend is running.
                </p>
            </div>
        `;

    }

}


// ========================================
// DISPLAY ORDERS
// ========================================

function displayOrders(orders) {

    const ordersContainer =
        document.getElementById(
            "ordersContainer"
        );


    if (orders.length === 0) {

        ordersContainer.innerHTML = `
            <div class="orders-message">
                <h2>No orders yet</h2>
                <p>
                    You haven't placed any orders.
                </p>

                <a href="products.html">
                    Start Shopping
                </a>
            </div>
        `;

        return;
    }


    ordersContainer.innerHTML =
        orders.map(function (order) {

            const orderDate =
                new Date(
                    order.createdAt
                ).toLocaleString();


            const productsHTML =
                (order.items || [])
                .map(function (item) {

                    return `
                        <div class="order-product">

                            <span>
                                ${item.name}
                                × ${item.quantity}
                            </span>

                            <span>
                                ₹${item.price}
                            </span>

                        </div>
                    `;

                })
                .join("");


            const cancelButton =
                order.status === "Pending"
                ? `
                    <button
                        class="cancel-btn"
                        onclick="cancelOrder('${order._id}')"
                    >
                        Cancel Order
                    </button>
                `
                : "";


            return `
                <div class="order-card">

                    <div class="order-header">

                        <div>
                            <h2>
                                Order #${order._id}
                            </h2>

                            <p>
                                ${orderDate}
                            </p>
                        </div>

                        <span
                            class="order-status"
                        >
                            ${order.status}
                        </span>

                    </div>


                    <div class="order-products">

                        ${productsHTML}

                    </div>


                    <div class="order-footer">

    <div>

        <strong>
            Total:
            ₹${order.totalAmount}
        </strong>

        <p>
            Payment:
            ${order.paymentMethod || "Cash on Delivery"}
        </p>

    </div>

    ${cancelButton}

</div>

                </div>
            `;

        })
        .join("");

}


// ========================================
// CANCEL ORDER
// ========================================

async function cancelOrder(orderId) {

    const confirmCancel =
        confirm(
            "Are you sure you want to cancel this order?"
        );


    if (!confirmCancel) {
        return;
    }


    const token =
        localStorage.getItem(
            "freshmartToken"
        );


    try {

        const response =
            await fetch(
                "https://freshmart-qzx3.onrender.com/api/orders/" +
                orderId +
                "/cancel",
                {
                    method: "PUT",

                    headers: {
                        "Authorization":
                            "Bearer " + token
                    }
                }
            );


        const data =
            await response.json();


        if (response.ok) {

            alert(
                "Order cancelled successfully!"
            );

            loadOrders();

        } else {

            alert(
                data.message ||
                "Unable to cancel order."
            );

        }


    } catch (error) {

        console.error(
            "Cancel order error:",
            error
        );

        alert(
            "Unable to connect to server."
        );

    }

}
