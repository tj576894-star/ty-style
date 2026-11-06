/* =========================================
   TY STYLE — PREMIUM STORE
   JAVASCRIPT PART 1
========================================= */

let products = [];
let cart = [];

const productContainer = document.getElementById("product-container");
const cartItems = document.getElementById("cart-items");
const cartTotal = document.getElementById("cart-total");
const cartCount = document.getElementById("cart-count");


/* =========================================
   LOAD PRODUCTS
========================================= */

async function loadProducts() {

    try {

        const response = await fetch("/api/products");

        if (!response.ok) {
            throw new Error("Products load nahi huay");
        }

        products = await response.json();

        displayProducts();

    } catch (error) {

        console.error(error);

        productContainer.innerHTML =
            "<p>Products load nahi ho sake. Page refresh karein.</p>";

    }

}


/* =========================================
   DISPLAY PRODUCTS
========================================= */

function displayProducts(productList = products) {

    productContainer.innerHTML = "";

    if (!productList || productList.length === 0) {

        productContainer.innerHTML =
            "<p>No products found.</p>";

        return;

    }

    productList.forEach(product => {

        const card = document.createElement("div");

        card.className = "product-card";

        const sizes = Array.isArray(product.sizes)
            ? product.sizes
            : [];

        const sizeOptions = sizes.length
            ? `
                <select id="size-${product.id}">
                    <option value="">Select Size</option>
                    ${sizes.map(size =>
                        `<option value="${escapeHTML(size)}">${escapeHTML(size)}</option>`
                    ).join("")}
                </select>
            `
            : "";

        card.innerHTML = `

            <img
                src="${escapeHTML(product.image || "")}"
                alt="${escapeHTML(product.name || "TY STYLE product")}"
                loading="lazy"
                onerror="this.src='https://placehold.co/700x900?text=TY+STYLE'"
            >

            <div class="product-info">

                <p class="category">
                    ${escapeHTML(product.category || "")}
                </p>

                <h3>${escapeHTML(product.name || "Product")}</h3>

                <p class="price">
                    Rs. ${Number(product.price || 0).toLocaleString("en-PK")}
                </p>

                ${sizeOptions}

                <button onclick="addToCart(${Number(product.id)})">
                    ADD TO CART
                </button>

                <button onclick="buyNow(${Number(product.id)})">
                    BUY NOW
                </button>

            </div>

        `;

        productContainer.appendChild(card);

    });

}


/* =========================================
   FILTER PRODUCTS
========================================= */

function filterProducts(category) {

    if (category === "all") {

        displayProducts();

        return;

    }

    const filteredProducts = products.filter(product =>
        (product.category || "").toLowerCase() === category.toLowerCase()
    );

    displayProducts(filteredProducts);

    document.querySelector(".products").scrollIntoView({
        behavior: "smooth"
    });

}


/* =========================================
   GET SELECTED SIZE
========================================= */

function getSelectedSize(product) {

    const sizeBox = document.getElementById(`size-${product.id}`);

    if (!sizeBox) {
        return "";
    }

    return sizeBox.value;

}


/* =========================================
   ADD TO CART
========================================= */

function addToCart(productId) {

    const product = products.find(item =>
        Number(item.id) === Number(productId)
    );

    if (!product) {
        alert("Product nahi mila.");
        return;
    }

    if (product.stock === false) {
        alert("Sorry! Ye product out of stock hai.");
        return;
    }

    const size = getSelectedSize(product);

    if (Array.isArray(product.sizes) && product.sizes.length > 0 && !size) {
        alert("Please apna size select karein.");
        return;
    }

    const existingItem = cart.find(item =>
        Number(item.id) === Number(productId) && item.size === size
    );

    if (existingItem) {

        existingItem.quantity++;

    } else {

        cart.push({
            ...product,
            size: size,
            quantity: 1
        });

    }

    updateCart();

    alert("Product cart mein add ho gaya!");

}


/* =========================================
   BUY NOW
========================================= */

function buyNow(productId) {

    const product = products.find(item =>
        Number(item.id) === Number(productId)
    );

    if (!product) {
        alert("Product nahi mila.");
        return;
    }

    if (product.stock === false) {
        alert("Sorry! Ye product out of stock hai.");
        return;
    }

    const size = getSelectedSize(product);

    if (Array.isArray(product.sizes) && product.sizes.length > 0 && !size) {
        alert("Please apna size select karein.");
        return;
    }

    const selectedProduct = {
        ...product,
        size: size,
        quantity: 1
    };

    localStorage.setItem(
        "tyStyleBuyNow",
        JSON.stringify(selectedProduct)
    );

    window.open("buy-now.html", "_blank");

}


/* =========================================
   SAFE HTML TEXT
========================================= */

function escapeHTML(value) {

    return String(value ?? "").replace(/[&<>"']/g, character => {

        const entities = {
            "&": "&amp;",
            "<": "&lt;",
            ">": "&gt;",
            '"': "&quot;",
            "'": "&#039;"
        };

        return entities[character];

    });

}
/* =========================================
   UPDATE CART
========================================= */

function updateCart() {

    cartItems.innerHTML = "";

    if (cart.length === 0) {

        cartItems.innerHTML =
            '<p class="empty-cart">Your cart is currently empty.</p>';

    }

    let total = 0;
    let count = 0;

    cart.forEach((item, index) => {

        const itemTotal = Number(item.price) * item.quantity;

        total += itemTotal;
        count += item.quantity;

        const div = document.createElement("div");

        div.className = "cart-item";

        div.innerHTML = `

            <img
                src="${escapeHTML(item.image || "")}"
                alt="${escapeHTML(item.name)}"
                onerror="this.src='https://placehold.co/150x180?text=TY+STYLE'"
            >

            <div>

                <h4>${escapeHTML(item.name)}</h4>

                <p>Rs. ${Number(item.price).toLocaleString("en-PK")}</p>

                ${item.size ? `<p>Size: ${escapeHTML(item.size)}</p>` : ""}

                <p>Quantity: ${item.quantity}</p>

                <button onclick="increaseQuantity(${index})">+</button>

                <button onclick="decreaseQuantity(${index})">−</button>

                <button onclick="removeFromCart(${index})">Remove</button>

            </div>

        `;

        cartItems.appendChild(div);

    });

    cartTotal.textContent = total.toLocaleString("en-PK");

    cartCount.textContent = count;

}


/* =========================================
   INCREASE QUANTITY
========================================= */

function increaseQuantity(index) {

    if (!cart[index]) return;

    cart[index].quantity++;

    updateCart();

}


/* =========================================
   DECREASE QUANTITY
========================================= */

function decreaseQuantity(index) {

    if (!cart[index]) return;

    cart[index].quantity--;

    if (cart[index].quantity <= 0) {

        cart.splice(index, 1);

    }

    updateCart();

}


/* =========================================
   REMOVE FROM CART
========================================= */

function removeFromCart(index) {

    cart.splice(index, 1);

    updateCart();

}


/* =========================================
   CART OPEN / CLOSE
========================================= */

function toggleCart() {

    const drawer = document.getElementById("cart-drawer");
    const overlay = document.getElementById("cart-overlay");

    drawer.classList.toggle("active");
    overlay.classList.toggle("active");

}


/* =========================================
   TRACK ORDER
========================================= */

const trackingForm = document.getElementById("tracking-form");

if (trackingForm) {

    trackingForm.addEventListener("submit", async function(event) {

        event.preventDefault();

        const orderId = document.getElementById("tracking-order-id").value.trim();

        const result = document.getElementById("tracking-result");

        result.innerHTML = "<p>Checking your order...</p>";

        try {

            const response = await fetch("/api/orders");

            if (!response.ok) {
                throw new Error("Orders load nahi huay");
            }

            const orders = await response.json();

            const order = orders.find(item =>
                String(item.id) === orderId ||
                String(item.orderId) === orderId
            );

            if (!order) {

                result.innerHTML =
                    "<p>Order nahi mila. Apna Order ID check karein.</p>";

                return;

            }

            result.innerHTML = `

                <h3>Order Found!</h3>

                <p><strong>Order ID:</strong> ${escapeHTML(order.id || order.orderId)}</p>

                <p><strong>Status:</strong> ${escapeHTML(order.status || "Received")}</p>

                <p><strong>Total:</strong> Rs. ${Number(order.total || 0).toLocaleString("en-PK")}</p>

            `;

        } catch (error) {

            console.error(error);

            result.innerHTML =
                "<p>Tracking abhi available nahi. Dobara try karein.</p>";

        }

    });

}


/* =========================================
   INVOICE
========================================= */

function showInvoice(order) {

    const invoiceSection = document.getElementById("invoice-section");
    const invoiceContent = document.getElementById("invoice-content");

    if (!invoiceSection || !invoiceContent) return;

    invoiceContent.innerHTML = `

        <h3>TY STYLE</h3>

        <p>Order ID: ${escapeHTML(order.id || order.orderId || "")}</p>

        <p>Customer: ${escapeHTML(order.name || "")}</p>

        <p>Phone: ${escapeHTML(order.phone || "")}</p>

        <p>Address: ${escapeHTML(order.address || "")}</p>

        <hr>

        <p>Total: Rs. ${Number(order.total || 0).toLocaleString("en-PK")}</p>

    `;

    invoiceSection.classList.add("show");

}


/* =========================================
   ORDER CONFIRMATION
========================================= */

function showOrderConfirmation(order) {

    const section = document.getElementById("order-confirmed-section");
    const orderId = document.getElementById("confirmed-order-id");

    if (!section || !orderId) return;

    orderId.textContent = order.id || order.orderId || "";

    section.classList.add("show");

}


/* =========================================
   START WEBSITE
========================================= */

document.addEventListener("DOMContentLoaded", function() {

    loadProducts();

    updateCart();

});
