
const express = require("express");
const fs = require("fs");
const path = require("path");

const app = express();
const PORT = 3000;

app.use(express.json());
app.use(express.static(__dirname));

// REVIEWS FILE
const reviewsFile = path.join(__dirname, "reviews.json");

function getReviews() {
    try {
        if (!fs.existsSync(reviewsFile)) {
            fs.writeFileSync(reviewsFile, "[]");
        }

        return JSON.parse(
            fs.readFileSync(reviewsFile, "utf8")
        );
    } catch (error) {
        return [];
    }
}

function saveReviews(reviews) {
    fs.writeFileSync(
        reviewsFile,
        JSON.stringify(reviews, null, 2)
    );
}

// GET PRODUCT REVIEWS
app.get("/api/reviews/:productId", (req, res) => {
    const reviews = getReviews();

    const productReviews = reviews.filter(
        review =>
            String(review.productId) ===
            String(req.params.productId)
    );

    res.json({
        success: true,
        reviews: productReviews
    });
});

// SUBMIT CUSTOMER REVIEW
app.post("/api/reviews", (req, res) => {
    const { productId, name, rating, comment } = req.body;

    if (
        !productId ||
        !name ||
        !comment ||
        !Number.isInteger(Number(rating)) ||
        Number(rating) < 1 ||
        Number(rating) > 5
    ) {
        return res.status(400).json({
            success: false,
            message: "Please fill all review details correctly."
        });
    }

    const cleanName = String(name).trim();
    const cleanComment = String(comment).trim();

    if (
        cleanName.length < 2 ||
        cleanName.length > 50 ||
        cleanComment.length < 5 ||
        cleanComment.length > 1000
    ) {
        return res.status(400).json({
            success: false,
            message: "Name or review length is invalid."
        });
    }

    const reviews = getReviews();

    const review = {
        id: Date.now(),
        productId: String(productId),
        name: cleanName,
        rating: Number(rating),
        comment: cleanComment,
        date: new Date().toISOString()
    };

    reviews.push(review);
    saveReviews(reviews);

    res.json({
        success: true,
        message: "Thank you! Your review has been submitted.",
        review
    });
});

// CUSTOMER ORDERS
app.post("/api/orders", (req, res) => {
    const order = {
        id: Date.now(),
        customer: req.body.customer,
        items: req.body.items,
        total: req.body.total,
        date: new Date().toISOString(),
        status: "Pending"
    };

    const filePath = path.join(__dirname, "orders.json");

    let orders = [];

    try {
        orders = JSON.parse(fs.readFileSync(filePath, "utf8"));
    } catch (error) {
        orders = [];
    }

    orders.push(order);

    fs.writeFileSync(
        filePath,
        JSON.stringify(orders, null, 2)
    );

    res.json({
        success: true,
        message: "Order successfully received",
        orderId: order.id
    });
});

// GET PRODUCTS
app.get("/api/products", (req, res) => {
    const filePath = path.join(__dirname, "products.json");

    const products = JSON.parse(
        fs.readFileSync(filePath, "utf8")
    );

    res.json(products);
});

// SAVE PRODUCTS
app.post("/api/products", (req, res) => {
    const filePath = path.join(__dirname, "products.json");

    fs.writeFileSync(
        filePath,
        JSON.stringify(req.body, null, 2)
    );

    res.json({ success: true });
});

// UPDATE ORDER STATUS
app.patch("/api/orders/:id/status", (req, res) => {
    const filePath = path.join(__dirname, "orders.json");

    let orders = [];

    try {
        orders = JSON.parse(
            fs.readFileSync(filePath, "utf8")
        );
    } catch (error) {
        return res.status(500).json({
            success: false,
            message: "Orders file error"
        });
    }

    const order = orders.find(
        item => String(item.id) === req.params.id
    );

    if (!order) {
        return res.status(404).json({
            success: false,
            message: "Order not found"
        });
    }

    const allowedStatuses = [
        "Pending",
        "Confirmed",
        "Shipped",
        "Delivered"
    ];

    if (!allowedStatuses.includes(req.body.status)) {
        return res.status(400).json({
            success: false,
            message: "Invalid status"
        });
    }

    order.status = req.body.status;

    fs.writeFileSync(
        filePath,
        JSON.stringify(orders, null, 2)
    );

    res.json({ success: true });
});

// CUSTOMER ORDER TRACKING
app.get("/api/orders/:id", (req, res) => {
    const filePath = path.join(__dirname, "orders.json");

    let orders = [];

    try {
        orders = JSON.parse(
            fs.readFileSync(filePath, "utf8")
        );
    } catch (error) {
        return res.status(500).json({
            success: false,
            message: "Orders file error"
        });
    }

    const order = orders.find(
        item => String(item.id) === req.params.id
    );

    if (
        !order ||
        String(order.customer.phone) !== String(req.query.phone)
    ) {
        return res.status(404).json({
            success: false,
            message: "Order nahi mila."
        });
    }

    res.json({
        success: true,
        orderId: order.id,
        status: order.status || "Pending"
    });
});

// START SERVER
app.listen(PORT, () => {
    console.log(
        `TY Style server chal raha hai: http://localhost:${PORT}`
    );
});
