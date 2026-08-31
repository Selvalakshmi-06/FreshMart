const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
require("dotenv").config();
const User = require("./models/User");
const Cart = require("./models/Cart");
const Order = require("./models/Order");
const Product = require("./models/Product");
const Wishlist = require("./models/Wishlist");
const app = express();

const PORT = process.env.PORT || 5000;

const JWT_SECRET = process.env.JWT_SECRET;



// =========================================
// MIDDLEWARE
// =========================================

app.use(express.json());
app.use(cors());

// =========================================
// MONGODB CONNECTION
// =========================================

mongoose
    .connect(process.env.MONGO_URI)
    .then(() => {
        console.log("MongoDB connected successfully!");
    })
    .catch((error) => {
        console.log("MongoDB connection failed:");
        console.log(error);
    });

// =========================================
// TEST ROUTE
// =========================================

app.get("/", (req, res) => {
    res.send("FreshMart Backend is Running!");
});

// =========================================
// REGISTER
// =========================================

app.post("/api/register", async (req, res) => {
    try {
        const { name, email, password } = req.body;

        const existingUser = await User.findOne({ email });

        if (existingUser) {
            return res.status(400).json({
                message: "Email already registered"
            });
        }

        const hashedPassword = await bcrypt.hash(password, 10);

        const user = new User({
            name,
            email,
            password: hashedPassword
        });

        await user.save();

        res.status(201).json({
            message: "User registered successfully"
        });

    } catch (error) {
        res.status(500).json({
            message: "Registration failed",
            error: error.message
        });
    }
});

// =========================================
// JWT AUTHENTICATION MIDDLEWARE
// =========================================

function authenticateToken(req, res, next) {

    const authHeader = req.headers["authorization"];

    const token =
        authHeader && authHeader.split(" ")[1];

    if (!token) {
        return res.status(401).json({
            message: "Access denied. Token required."
        });
    }

    jwt.verify(token, JWT_SECRET, (error, user) => {

        if (error) {
            return res.status(403).json({
                message: "Invalid or expired token"
            });
        }

        req.user = user;

        next();
    });
}

// =========================================
// ADMIN AUTHENTICATION MIDDLEWARE
// =========================================

function isAdmin(req, res, next) {

    if (req.user.role !== "admin") {
        return res.status(403).json({
            message: "Access denied. Admin only."
        });
    }

    next();
}

// =========================================
// LOGIN
// =========================================

app.post("/api/login", async (req, res) => {

    try {

        const { email, password } = req.body;

        const user = await User.findOne({ email });

        if (!user) {
            return res.status(401).json({
                message: "Invalid email or password"
            });
        }

        const passwordMatch = await bcrypt.compare(
            password,
            user.password
        );

        if (!passwordMatch) {
            return res.status(401).json({
                message: "Invalid email or password"
            });
        }

        const token = jwt.sign(
            {
                userId: user._id,
                email: user.email,
                role: user.role
            },
            JWT_SECRET,
            {
                expiresIn: "1h"
            }
        );

    res.status(200).json({
    message: "Login successful",
    token: token,
    user: {
        name: user.name,
        email: user.email,
        role: user.role
    }
});

    } catch (error) {

        res.status(500).json({
            message: "Login failed",
            error: error.message
        });

    }

});

// =========================================
// PROTECTED TEST ROUTE
// =========================================

app.get("/api/profile", authenticateToken, async (req, res) => {

    try {

        const user = await User.findById(req.user.userId)
            .select("-password");

        if (!user) {
            return res.status(404).json({
                message: "User not found"
            });
        }

        res.status(200).json({
            message: "Protected route accessed successfully",
            user: user
        });

    } catch (error) {

        res.status(500).json({
            message: "Server error",
            error: error.message
        });

    }

});

// =========================================
// ADD TO CART
// =========================================

app.post("/api/cart/add", authenticateToken, async (req, res) => {

    try {

        const {
            productId,
            name,
            price,
            quantity,
            image
        } = req.body;

        if (
            !productId ||
            !name ||
            price === undefined ||
            quantity === undefined
        ) {
            return res.status(400).json({
                message: "Product details are required"
            });
        }

        let cart = await Cart.findOne({
            userId: req.user.userId
        });

        if (!cart) {

            cart = new Cart({
                userId: req.user.userId,
                items: []
            });

        }

        const existingItem = cart.items.find(
            item => item.productId === productId
        );

        if (existingItem) {

            existingItem.quantity =
                Number(existingItem.quantity) +
                Number(quantity);

        } else {

            cart.items.push({
                productId,
                name,
                price: Number(price),
                quantity: Number(quantity),
                image: image || ""
            });

        }

        await cart.save();

        res.status(200).json({
            message: "Product added to cart",
            cart: cart
        });

    } catch (error) {

        res.status(500).json({
            message: "Failed to add product to cart",
            error: error.message
        });

    }

});

// =========================================
// VIEW CART
// =========================================

app.get("/api/cart", authenticateToken, async (req, res) => {

    try {

        const cart = await Cart.findOne({
            userId: req.user.userId
        });

        if (!cart) {

            return res.status(200).json({
                message: "Cart is empty",
                cart: {
                    items: []
                }
            });

        }

        res.status(200).json({
            message: "Cart retrieved successfully",
            cart: cart
        });

    } catch (error) {

        res.status(500).json({
            message: "Failed to retrieve cart",
            error: error.message
        });

    }

});

// =========================================
// UPDATE CART QUANTITY
// =========================================

app.put("/api/cart/update", authenticateToken, async (req, res) => {

    try {

        const {
            productId,
            quantity
        } = req.body;

        if (!productId || Number(quantity) < 1) {

            return res.status(400).json({
                message: "Product ID and valid quantity are required"
            });

        }

        const cart = await Cart.findOne({
            userId: req.user.userId
        });

        if (!cart) {

            return res.status(404).json({
                message: "Cart not found"
            });

        }

        const item = cart.items.find(
            item => item.productId === productId
        );

        if (!item) {

            return res.status(404).json({
                message: "Product not found in cart"
            });

        }

        item.quantity = Number(quantity);

        await cart.save();

        res.status(200).json({
            message: "Cart updated successfully",
            cart: cart
        });

    } catch (error) {

        res.status(500).json({
            message: "Failed to update cart",
            error: error.message
        });

    }

});

// =========================================
// REMOVE PRODUCT FROM CART
// =========================================

app.delete("/api/cart/remove", authenticateToken, async (req, res) => {

    try {

        const { productId } = req.body;

        if (!productId) {

            return res.status(400).json({
                message: "Product ID is required"
            });

        }

        const cart = await Cart.findOne({
            userId: req.user.userId
        });

        if (!cart) {

            return res.status(404).json({
                message: "Cart not found"
            });

        }

        const itemExists = cart.items.some(
            item => item.productId === productId
        );

        if (!itemExists) {

            return res.status(404).json({
                message: "Product not found in cart"
            });

        }

        cart.items = cart.items.filter(
            item => item.productId !== productId
        );

        await cart.save();

        res.status(200).json({
            message: "Product removed from cart",
            cart: cart
        });

    } catch (error) {

        res.status(500).json({
            message: "Failed to remove product from cart",
            error: error.message
        });

    }

});

// =========================================
// CLEAR CART
// =========================================

app.delete("/api/cart/clear", authenticateToken, async (req, res) => {

    try {

        const cart = await Cart.findOne({
            userId: req.user.userId
        });

        if (!cart) {

            return res.status(404).json({
                message: "Cart not found"
            });

        }

        cart.items = [];

        await cart.save();

        res.status(200).json({
            message: "Cart cleared successfully",
            cart: cart
        });

    } catch (error) {

        res.status(500).json({
            message: "Failed to clear cart",
            error: error.message
        });

    }

});
// =========================================
// WISHLIST - GET
// =========================================

app.get("/api/wishlist", authenticateToken, async (req, res) => {

    try {

        let wishlist = await Wishlist.findOne({
            userId: req.user.userId
        });

        if (!wishlist) {

            wishlist = new Wishlist({
                userId: req.user.userId,
                items: []
            });

            await wishlist.save();
        }

        res.status(200).json({
            message: "Wishlist retrieved successfully",
            wishlist: wishlist
        });

    } catch (error) {

        console.error("GET WISHLIST ERROR:", error);

        res.status(500).json({
            message: "Failed to retrieve wishlist",
            error: error.message
        });

    }

});


// =========================================
// WISHLIST - ADD
// =========================================

app.post("/api/wishlist/add", authenticateToken, async (req, res) => {

    try {

        const {
            productId,
            name,
            price,
            image
        } = req.body;

        if (!productId || !name || price === undefined) {

            return res.status(400).json({
                message: "Product details are required"
            });

        }

        let wishlist = await Wishlist.findOne({
            userId: req.user.userId
        });

        if (!wishlist) {

            wishlist = new Wishlist({
                userId: req.user.userId,
                items: []
            });

        }

        const existingItem = wishlist.items.find(
            item => item.productId === productId
        );

        if (existingItem) {

            return res.status(400).json({
                message: "Product already in wishlist"
            });

        }

        wishlist.items.push({
            productId: productId,
            name: name,
            price: Number(price),
            image: image || ""
        });

        await wishlist.save();

        res.status(200).json({
            message: "Product added to wishlist",
            wishlist: wishlist
        });

    } catch (error) {

        console.error("ADD WISHLIST ERROR:", error);

        res.status(500).json({
            message: "Failed to add product to wishlist",
            error: error.message
        });

    }

});


// =========================================
// WISHLIST - REMOVE
// =========================================

app.delete("/api/wishlist/remove", authenticateToken, async (req, res) => {

    try {

        const {
            productId
        } = req.body;

        if (!productId) {

            return res.status(400).json({
                message: "Product ID is required"
            });

        }

        const wishlist = await Wishlist.findOne({
            userId: req.user.userId
        });

        if (!wishlist) {

            return res.status(404).json({
                message: "Wishlist not found"
            });

        }

        const itemExists = wishlist.items.some(
            item => item.productId === productId
        );

        if (!itemExists) {

            return res.status(404).json({
                message: "Product not found in wishlist"
            });

        }

        wishlist.items = wishlist.items.filter(
            item => item.productId !== productId
        );

        await wishlist.save();

        res.status(200).json({
            message: "Product removed from wishlist",
            wishlist: wishlist
        });

    } catch (error) {

        console.error("REMOVE WISHLIST ERROR:", error);

        res.status(500).json({
            message: "Failed to remove product from wishlist",
            error: error.message
        });

    }

});


// =========================================
// WISHLIST - CLEAR
// =========================================

app.delete("/api/wishlist/clear", authenticateToken, async (req, res) => {

    try {

        const wishlist = await Wishlist.findOne({
            userId: req.user.userId
        });

        if (!wishlist) {

            return res.status(404).json({
                message: "Wishlist not found"
            });

        }

        wishlist.items = [];

        await wishlist.save();

        res.status(200).json({
            message: "Wishlist cleared successfully",
            wishlist: wishlist
        });

    } catch (error) {

        console.error("CLEAR WISHLIST ERROR:", error);

        res.status(500).json({
            message: "Failed to clear wishlist",
            error: error.message
        });

    }

});
// =========================================
// PLACE ORDER
// =========================================

app.post("/api/orders", authenticateToken, async (req, res) => {

    try {

        const {
            name,
            phone,
            address,
            city,
            pincode,
            paymentMethod
        } = req.body;

        // =========================================
        // CHECK SHIPPING DETAILS
        // =========================================

        if (
            !name ||
            !phone ||
            !address ||
            !city ||
            !pincode ||
            !paymentMethod
        ) {

            return res.status(400).json({
                message: "Please fill all shipping details"
            });

        }

        // =========================================
        // GET USER CART
        // =========================================

        const cart = await Cart.findOne({
            userId: req.user.userId
        });

        if (
            !cart ||
            !cart.items ||
            cart.items.length === 0
        ) {

            return res.status(400).json({
                message: "Cart is empty"
            });

        }

        // =========================================
        // CHECK STOCK
        // =========================================

        for (const item of cart.items) {

            const product = await Product.findOne({
                productId: item.productId
            });

            if (!product) {

                return res.status(400).json({
                    message:
                        "Product not found: " +
                        item.name
                });

            }

            if (
                Number(product.quantity) <
                Number(item.quantity)
            ) {

                return res.status(400).json({
                    message:
                        "Not enough stock for " +
                        item.name +
                        ". Available stock: " +
                        product.quantity
                });

            }

        }

        // =========================================
        // CALCULATE TOTAL
        // =========================================

        const totalAmount = cart.items.reduce(
            (total, item) => {

                return total +
                    (
                        Number(item.price) *
                        Number(item.quantity)
                    );

            },
            0
        );

        // =========================================
        // PAYMENT METHOD
        // =========================================

        let finalPaymentMethod;

        if (
            paymentMethod === "cod" ||
            paymentMethod === "Cash on Delivery"
        ) {

            finalPaymentMethod = "Cash on Delivery";

        } else if (
            paymentMethod === "online" ||
            paymentMethod === "Online Payment"
        ) {

            finalPaymentMethod = "Online Payment";

        } else {

            return res.status(400).json({
                message: "Invalid payment method"
            });

        }

        // =========================================
        // CREATE ORDER
        // =========================================

        const order = new Order({

            userId: req.user.userId,

            items: cart.items.map((item) => {

                return {
                    productId: item.productId,
                    name: item.name,
                    price: Number(item.price),
                    quantity: Number(item.quantity),
                    image: item.image || ""
                };

            }),

            totalAmount: totalAmount,

            shippingAddress: {

                name: String(name).trim(),
                phone: String(phone).trim(),
                address: String(address).trim(),
                city: String(city).trim(),
                pincode: String(pincode).trim()

            },

            paymentMethod: finalPaymentMethod,

            status: "Pending"

        });

        // =========================================
        // SAVE ORDER
        // =========================================

        await order.save();

        // =========================================
        // REDUCE STOCK
        // =========================================

        for (const item of cart.items) {

            const product = await Product.findOne({
                productId: item.productId
            });

            if (product) {

                product.quantity =
                    Number(product.quantity) -
                    Number(item.quantity);

                await product.save();

            }

        }

        // =========================================
        // CLEAR CART
        // =========================================

        cart.items = [];

        await cart.save();

        // =========================================
        // SUCCESS
        // =========================================

        return res.status(201).json({

            message: "Order placed successfully",

            order: order

        });

    } catch (error) {

        console.error(
            "PLACE ORDER ERROR:",
            error
        );

        return res.status(500).json({

            message: "Failed to place order",

            error: error.message

        });

    }

});

// =========================================
// VIEW MY ORDERS
// =========================================

app.get("/api/orders", authenticateToken, async (req, res) => {

    try {

        const orders = await Order.find({
            userId: req.user.userId
        }).sort({
            createdAt: -1
        });

        res.status(200).json({
            message: "Orders retrieved successfully",
            orders: orders
        });

    } catch (error) {

        res.status(500).json({
            message: "Failed to retrieve orders",
            error: error.message
        });

    }

});

// =========================================
// VIEW SINGLE ORDER
// =========================================

app.get("/api/orders/:id", authenticateToken, async (req, res) => {

    try {

        const order = await Order.findOne({
            _id: req.params.id,
            userId: req.user.userId
        });

        if (!order) {

            return res.status(404).json({
                message: "Order not found"
            });

        }

        res.status(200).json({
            message: "Order retrieved successfully",
            order: order
        });

    } catch (error) {

        res.status(500).json({
            message: "Failed to retrieve order",
            error: error.message
        });

    }

});

// =========================================
// CANCEL ORDER
// =========================================

app.put("/api/orders/:id/cancel", authenticateToken, async (req, res) => {

    try {

        const order = await Order.findOne({
            _id: req.params.id,
            userId: req.user.userId
        });

        if (!order) {

            return res.status(404).json({
                message: "Order not found"
            });

        }

        if (order.status !== "Pending") {

            return res.status(400).json({
                message:
                    "Only pending orders can be cancelled"
            });

        }

        order.status = "Cancelled";

        await order.save();

        res.status(200).json({
            message: "Order cancelled successfully",
            order: order
        });

    } catch (error) {

        res.status(500).json({
            message: "Failed to cancel order",
            error: error.message
        });

    }

});

// =========================================
// ADMIN - VIEW ALL ORDERS
// =========================================

app.get(
    "/api/admin/orders",
    authenticateToken,
    isAdmin,
    async (req, res) => {

        try {

            const orders = await Order.find()
                .populate("userId", "name email")
                .sort({
                    createdAt: -1
                });

            res.status(200).json({
                message:
                    "All orders retrieved successfully",
                orders: orders
            });

        } catch (error) {

            res.status(500).json({
                message:
                    "Failed to retrieve all orders",
                error: error.message
            });

        }

    }
);

// =========================================
// ADMIN - UPDATE ORDER STATUS
// =========================================

app.put(
    "/api/admin/orders/:id/status",
    authenticateToken,
    isAdmin,
    async (req, res) => {

        try {

            const { status } = req.body;

            const allowedStatuses = [
                "Pending",
                "Confirmed",
                "Shipped",
                "Delivered",
                "Cancelled"
            ];

            if (!allowedStatuses.includes(status)) {

                return res.status(400).json({
                    message: "Invalid order status"
                });

            }

            const order = await Order.findById(
                req.params.id
            );

            if (!order) {

                return res.status(404).json({
                    message: "Order not found"
                });

            }

            order.status = status;

            await order.save();

            res.status(200).json({
                message:
                    "Order status updated successfully",
                order: order
            });

        } catch (error) {

            res.status(500).json({
                message:
                    "Failed to update order status",
                error: error.message
            });

        }

    }
);

// =========================================
// ADMIN - VIEW ALL USERS
// =========================================

app.get(
    "/api/admin/users",
    authenticateToken,
    isAdmin,
    async (req, res) => {

        try {

            const users = await User.find()
                .select("-password")
                .sort({
                    name: 1
                });

            res.status(200).json({
                message: "All users retrieved successfully",
                users: users
            });

        } catch (error) {

            res.status(500).json({
                message: "Failed to retrieve users",
                error: error.message
            });

        }

    }
);

// =========================================
// ADMIN - ADD PRODUCT
// =========================================

app.post(
    "/api/admin/products",
    authenticateToken,
    isAdmin,
    async (req, res) => {

        try {

            const {
                productId,
                name,
                price,
                quantity,
                image,
                category,
                description
            } = req.body;

            if (
                !productId ||
                !name ||
                price === undefined
            ) {

                return res.status(400).json({
                    message:
                        "Product ID, name and price are required"
                });

            }

            const existingProduct =
                await Product.findOne({
                    productId
                });

            if (existingProduct) {

                return res.status(400).json({
                    message:
                        "Product ID already exists"
                });

            }

            const product = new Product({

                productId,
                name,
                price,
                quantity: quantity || 0,
                image: image || "",
                category: category || "General",
                description: description || ""

            });

            await product.save();

            res.status(201).json({
                message: "Product added successfully",
                product: product
            });

        } catch (error) {

            res.status(500).json({
                message: "Failed to add product",
                error: error.message
            });

        }

    }
);

// =========================================
// GET ALL PRODUCTS
// =========================================

app.get("/api/products", async (req, res) => {

    try {

        const products = await Product.find()
            .sort({
                createdAt: -1
            });

        res.status(200).json({
            message: "Products retrieved successfully",
            products: products
        });

    } catch (error) {

        res.status(500).json({
            message: "Failed to retrieve products",
            error: error.message
        });

    }

});

// =========================================
// GET SINGLE PRODUCT
// =========================================

app.get("/api/products/:id", async (req, res) => {

    try {

        const product = await Product.findOne({
            productId: req.params.id
        });

        if (!product) {

            return res.status(404).json({
                message: "Product not found"
            });

        }

        res.status(200).json({
            message: "Product retrieved successfully",
            product: product
        });

    } catch (error) {

        res.status(500).json({
            message: "Failed to retrieve product",
            error: error.message
        });

    }

});

// =========================================
// ADMIN - UPDATE PRODUCT
// =========================================

app.put(
    "/api/admin/products/:id",
    authenticateToken,
    isAdmin,
    async (req, res) => {

        try {

            const {
                name,
                price,
                quantity,
                image,
                category,
                description
            } = req.body;

            const product = await Product.findOne({
                productId: req.params.id
            });

            if (!product) {

                return res.status(404).json({
                    message: "Product not found"
                });

            }

            if (name !== undefined) {
                product.name = name;
            }

            if (price !== undefined) {
                product.price = price;
            }

            if (quantity !== undefined) {
                product.quantity = quantity;
            }

            if (image !== undefined) {
                product.image = image;
            }

            if (category !== undefined) {
                product.category = category;
            }

            if (description !== undefined) {
                product.description = description;
            }

            await product.save();

            res.status(200).json({
                message: "Product updated successfully",
                product: product
            });

        } catch (error) {

            res.status(500).json({
                message: "Failed to update product",
                error: error.message
            });

        }

    }
);

// =========================================
// ADMIN - DELETE PRODUCT
// =========================================

app.delete(
    "/api/admin/products/:id",
    authenticateToken,
    isAdmin,
    async (req, res) => {

        try {

            const product = await Product.findOne({
                productId: req.params.id
            });

            if (!product) {

                return res.status(404).json({
                    message: "Product not found"
                });

            }

            await Product.deleteOne({
                productId: req.params.id
            });

            res.status(200).json({
                message: "Product deleted successfully"
            });

        } catch (error) {

            res.status(500).json({
                message: "Failed to delete product",
                error: error.message
            });

        }

    }
);

// =========================================
// START SERVER
// =========================================

app.listen(PORT, () => {

    console.log(
        `FreshMart server running on http://localhost:${PORT}`
    );

});