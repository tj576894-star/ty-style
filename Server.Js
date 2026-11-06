
const express = require("express");
const fs = require("fs");
const path = require("path");

const app = express();
const PORT = 3000;

app.use(express.json());
app.use(express.static(__dirname));

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
