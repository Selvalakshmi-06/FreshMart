const mongoose = require("mongoose");
const Product = require("./models/product");
require("dotenv").config();

mongoose.connect(process.env.MONGO_URI)
     .then(async() => {
        console.log("MongoDB connected!");

        const products = [

            {
                productId: "apple001",
                name: "Apple",
                price: 130,
                quantity: 100,
                image: "apple.png",
                category: "fruit",
                description: "Fresh apples"
            },

            {
                productId: "banana001",
                name: "Banana",
                price: 60,
                quantity: 100,
                image: "",
                category: "fruit",
                description: "Fresh bananas"
            },

            {
                productId: "orange001",
                name: "Orange",
                price: 90,
                quantity: 100,
                image: "",
                category: "fruit",
                description: "Fresh oranges"
            },

            {
                productId: "carrot001",
                name: "Carrot",
                price: 70,
                quantity: 100,
                image: "",
                category: "vegetable",
                description: "Fresh carrots"
            },

            {
                productId: "tomato001",
                name: "Tomato",
                price: 45,
                quantity: 100,
                image: "",
                category: "vegetable",
                description: "Fresh tomatoes"
            },

            {
                productId: "potato001",
                name: "Potato",
                price: 40,
                quantity: 100,
                image: "",
                category: "vegetable",
                description: "Fresh potatoes"
            },

            {
                productId: "milk001",
                name: "Milk",
                price: 65,
                quantity: 100,
                image: "",
                category: "dairy",
                description: "Fresh milk"
            },

            {
                productId: "onion001",
                name: "Onion",
                price: 50,
                quantity: 100,
                image: "",
                category: "vegetable",
                description: "Fresh onions"
            },

            {
                productId: "mango001",
                name: "Mango",
                price: 100,
                quantity: 100,
                image: "",
                category: "fruit",
                description: "Fresh mangoes"
            },

            {
                productId: "bread001",
                name: "Bread",
                price: 45,
                quantity: 100,
                image: "",
                category: "grocery",
                description: "Fresh bread"
            },

            {
                productId: "eggs001",
                name: "Eggs",
                price: 90,
                quantity: 100,
                image: "",
                category: "dairy",
                description: "Fresh eggs"
            },

            {
                productId: "rice001",
                name: "Rice",
                price: 80,
                quantity: 100,
                image: "",
                category: "grocery",
                description: "Quality rice"
            }

        ];


        for (const productData of products) {

            const existingProduct =
                await Product.findOne({
                    productId: productData.productId
                });


            if (existingProduct) {

                existingProduct.name =
                    productData.name;

                existingProduct.price =
                    productData.price;

                existingProduct.quantity =
                    productData.quantity;

                existingProduct.image =
                    productData.image;

                existingProduct.category =
                    productData.category;

                existingProduct.description =
                    productData.description;

                await existingProduct.save();

                console.log(
                    "Updated:",
                    productData.name
                );

            } else {

                const product =
                    new Product(productData);

                await product.save();

                console.log(
                    "Added:",
                    productData.name
                );
            }
        }


        console.log(
            "All FreshMart products are ready!"
        );

        process.exit(0);

    })
    .catch((error) => {

        console.log(
            "Error:",
            error
        );

        process.exit(1);

    });