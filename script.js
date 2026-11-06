let products = [];

const productContainer =
    document.getElementById("product-container");

const cartItems =
    document.getElementById("cart-items");

const cartTotal =
    document.getElementById("cart-total");

const cartCount =
    document.getElementById("cart-count");

let cart = [];


/* PRODUCTS SHOW */

function displayProducts(productList = products) {

    productContainer.innerHTML = "";

    if (productList.length === 0) {

        productContainer.innerHTML =
            "<p>No products found in this category.</p>";

        return;
    }

    productList.forEach(product => {

        const card = document.createElement("div");

        card.className = "product-card";

        card.innerHTML = `

            <img
                src="${product.image}"
                alt="${product.name}"
            >

            <div class="product-info">

                <p class="category">
                    ${product.category}
                </p>

                <h3>
                    ${product.name}
                </h3>

                <h4>
                    Rs. ${Number(product.price).toLocaleString()}
                </h4>

                <label>
                    Size:
                </label>

                <select id="size-${product.id}">

                    ${product.sizes.map(size => `
                        <option value="${size}">
                            ${size}
                        </option>
                    `).join("")}

                </select>

                <button
                    class="add-cart"
                    onclick="addToCart(${product.id})"
                >
                    Add to Cart
                </button>

            </div>
        `;

        productContainer.appendChild(card);

    });

}


/* FILTER PRODUCTS */

function filterProducts(category) {

    if (category === "all") {

        displayProducts(products);

    } else {

        const filteredProducts =
            products.filter(product =>
                String(product.category).toLowerCase() ===
                String(category).toLowerCase()
            );

        displayProducts(filteredProducts);

    }

    document
        .querySelector(".products")
        .scrollIntoView({
            behavior: "smooth",
            block: "start"
        });

}


/* LOAD PRODUCTS */

async function loadProducts() {

    try {

        const response =
            await fetch("/api/products");

        products =
            await response.json();

        displayProducts();

    } catch (error) {

        console.log(
            "Products load nahi hue:",
            error
        );

    }

}


/* ADD TO CART */

function addToCart(productId) {

    const product =
        products.find(
            item => item.id === productId
        );

    if (!product) return;

    const size =
        document.getElementById(
            `size-${productId}`
        ).value;

    const existingItem =
        cart.find(
            item =>
                item.id === productId &&
                item.size === size
        );

    if (existingItem) {

        existingItem.quantity++;

    } else {

        cart.push({

            id: product.id,

            name: product.name,

            price: Number(product.price),

            size: size,

            quantity: 1

        });

    }

    updateCart();

}


/* UPDATE CART */

function updateCart() {

    cartItems.innerHTML = "";

    if (cart.length === 0) {

        cartItems.innerHTML =
            "<p>Your cart is empty.</p>";

        cartTotal.textContent = "0";

        cartCount.textContent = "0";

        updateCheckoutTotal();

        return;
    }

    let total = 0;

    let itemsCount = 0;


    cart.forEach((item, index) => {

        const itemTotal =
            item.price * item.quantity;

        total += itemTotal;

        itemsCount += item.quantity;


        const cartItem =
            document.createElement("div");

        cartItem.className =
            "cart-item";


        cartItem.innerHTML = `

            <div>

                <h3>
                    ${item.name}
                </h3>

                <p>
                    Size: ${item.size}
                </p>

                <p>
                    Rs. ${item.price.toLocaleString()}
                </p>

            </div>


            <div class="quantity">

                <button
                    onclick="decreaseQuantity(${index})"
                >
                    -
                </button>

                <span>
                    ${item.quantity}
                </span>

                <button
                    onclick="increaseQuantity(${index})"
                >
                    +
                </button>

            </div>


            <div>

                <strong>
                    Rs. ${itemTotal.toLocaleString()}
                </strong>

                <button
                    class="remove"
                    onclick="removeItem(${index})"
                >
                    Remove
                </button>

            </div>

        `;

        cartItems.appendChild(cartItem);

    });


    cartTotal.textContent =
        total.toLocaleString();

    cartCount.textContent =
        itemsCount;

    updateCheckoutTotal();

}


/* INCREASE QUANTITY */

function increaseQuantity(index) {

    cart[index].quantity++;

    updateCart();

}


/* DECREASE QUANTITY */

function decreaseQuantity(index) {

    if (cart[index].quantity > 1) {

        cart[index].quantity--;

    } else {

        cart.splice(index, 1);

    }

    updateCart();

}


/* REMOVE ITEM */

function removeItem(index) {

    cart.splice(index, 1);

    updateCart();

}


/* CHECKOUT TOTAL */

function updateCheckoutTotal() {

    let total = 0;


    cart.forEach(item => {

        total +=
            item.price * item.quantity;

    });


    document.getElementById(
        "checkout-total"
    ).textContent =
        total.toLocaleString();

}


/* HTML SECURITY */

function escapeHTML(value) {

    return String(value ?? "")
        .replace(
            /[&<>"']/g,
            character => {

                const entities = {

                    "&": "&amp;",

                    "<": "&lt;",

                    ">": "&gt;",

                    '"': "&quot;",

                    "'": "&#039;"

                };

                return entities[character];

            }
        );

}


/* GENERATE INVOICE */

function showInvoice(
    orderId,
    customer,
    items,
    total
) {

    const invoiceSection =
        document.getElementById(
            "invoice-section"
        );

    const invoiceContent =
        document.getElementById(
            "invoice-content"
        );


    if (
        !invoiceSection ||
        !invoiceContent
    ) {

        alert(
            "Invoice section HTML mein nahi mila."
        );

        return;

    }


    const invoiceDate =
        new Date().toLocaleString();


    const rows =
        items.map(item => {

            const subtotal =
                item.price * item.quantity;


            return `

                <tr>

                    <td>
                        ${escapeHTML(item.name)}
                    </td>

                    <td>
                        ${escapeHTML(item.size)}
                    </td>

                    <td>
                        ${item.quantity}
                    </td>

                    <td>
                        Rs.
                        ${Number(item.price).toLocaleString()}
                    </td>

                    <td>
                        Rs.
                        ${subtotal.toLocaleString()}
                    </td>

                </tr>

            `;

        }).join("");


    invoiceContent.innerHTML = `

        <div class="invoice-header">

            <h1>
                TY STYLE
            </h1>

            <h2>
                Customer Invoice
            </h2>

            <p>
                Thank you for shopping with us!
            </p>

        </div>


        <hr>


        <div class="invoice-details">

            <h3>
                Invoice Details
            </h3>

            <p>
                <strong>
                    Order ID:
                </strong>

                ${escapeHTML(orderId)}
            </p>

            <p>

                <strong>
                    Date:
                </strong>

                ${escapeHTML(invoiceDate)}

            </p>

        </div>


        <hr>


        <div class="invoice-customer">

            <h3>
                Customer Details
            </h3>

            <p>
                <strong>Name:</strong>
                ${escapeHTML(customer.name)}
            </p>

            <p>
                <strong>Phone:</strong>
                ${escapeHTML(customer.phone)}
            </p>

            <p>
                <strong>House No:</strong>
                ${escapeHTML(customer.houseNo)}
            </p>

            <p>
                <strong>Address:</strong>
                ${escapeHTML(customer.address)}
            </p>

            <p>
                <strong>City:</strong>
                ${escapeHTML(customer.city)}
            </p>

            <p>
                <strong>Province:</strong>
                ${escapeHTML(customer.province)}
            </p>

            <p>
                <strong>Notes:</strong>
                ${escapeHTML(
                    customer.notes || "None"
                )}
            </p>

        </div>


        <hr>


        <h3>
            Order Items
        </h3>


        <table class="invoice-table">

            <thead>

                <tr>

                    <th>
                        Product
                    </th>

                    <th>
                        Size
                    </th>

                    <th>
                        Qty
                    </th>

                    <th>
                        Price
                    </th>

                    <th>
                        Subtotal
                    </th>

                </tr>

            </thead>


            <tbody>

                ${rows}

            </tbody>

        </table>


        <div class="invoice-total">

            <h2>
                Total Amount:
                Rs.
                ${Number(total).toLocaleString()}
            </h2>

        </div>


        <hr>


        <div class="invoice-footer">

            <h3>
                Thank You!
            </h3>

            <p>
                TY STYLE - Online Clothing Store
            </p>

        </div>

    `;


    invoiceSection.style.display =
        "block";


    invoiceSection.scrollIntoView({

        behavior: "smooth",

        block: "start"

    });

}


/* PRINT INVOICE */

function printInvoice() {

    window.print();

}


/* ORDER CONFIRMED */

function showOrderConfirmed(orderId) {

    const section =
        document.getElementById(
            "order-confirmed-section"
        );

    const orderIdBox =
        document.getElementById(
            "confirmed-order-id"
        );


    if (
        !section ||
        !orderIdBox
    ) {

        return;

    }


    orderIdBox.textContent =
        "Order ID: " + orderId;


    section.style.display =
        "block";


    section.scrollIntoView({

        behavior: "smooth",

        block: "center"

    });

}


/* TRACKING BUTTON */

function goToTracking() {

    const trackingSection =
        document.querySelector(
            ".tracking-section"
        );


    if (trackingSection) {

        trackingSection.scrollIntoView({

            behavior: "smooth"

        });

    }

}


/* CONTINUE SHOPPING */

function continueShopping() {

    const productsSection =
        document.querySelector(
            ".products"
        );


    if (productsSection) {

        productsSection.scrollIntoView({

            behavior: "smooth"

        });

    }

}


/* CHECKOUT FORM */

document
    .getElementById("checkout-form")
    .addEventListener(
        "submit",
        async function(event) {

            event.preventDefault();


            if (cart.length === 0) {

                alert(
                    "Pehle cart mein product add karo."
                );

                return;

            }


            const customer = {

                name:
                    document.getElementById(
                        "customer-name"
                    ).value,

                phone:
                    document.getElementById(
                        "customer-phone"
                    ).value,

                houseNo:
                    document.getElementById(
                        "house-no"
                    ).value,

                address:
                    document.getElementById(
                        "customer-address"
                    ).value,

                city:
                    document.getElementById(
                        "customer-city"
                    ).value,

                province:
                    document.getElementById(
                        "customer-province"
                    ).value,

                notes:
                    document.getElementById(
                        "order-notes"
                    ).value

            };


            const orderedItems =
                cart.map(item => ({
                    ...item
                }));


            const total =
                orderedItems.reduce(
                    (sum, item) => {

                        return sum +
                            (
                                item.price *
                                item.quantity
                            );

                    },
                    0
                );


            try {

                const response =
                    await fetch(
                        "/api/orders",
                        {

                            method: "POST",

                            headers: {

                                "Content-Type":
                                    "application/json"

                            },

                            body:
                                JSON.stringify({

                                    customer:
                                        customer,

                                    items:
                                        orderedItems,

                                    total:
                                        total

                                })

                        }
                    );


                const result =
                    await response.json();


                if (
                    response.ok &&
                    result.success
                ) {

                    showOrderConfirmed(
                        result.orderId
                    );


                    showInvoice(

                        result.orderId,

                        customer,

                        orderedItems,

                        total

                    );


                    alert(

                        "Thank you " +
                        customer.name +
                        "! Aapka order receive ho gaya hai.\n\nOrder ID: " +
                        result.orderId

                    );


                    cart = [];


                    updateCart();


                    document
                        .getElementById(
                            "checkout-form"
                        )
                        .reset();


                } else {

                    alert(
                        "Order save nahi ho saka."
                    );

                }


            } catch (error) {

                console.error(
                    "Order Error:",
                    error
                );


                alert(
                    "Server se connection nahi ho raha."
                );

            }

        }
    );


/* ORDER TRACKING */

document
    .getElementById("tracking-form")
    .addEventListener(
        "submit",
        async function(event) {

            event.preventDefault();


            const orderId =
                document.getElementById(
                    "tracking-order-id"
                ).value.trim();


            const phone =
                document.getElementById(
                    "tracking-phone"
                ).value.trim();


            const resultBox =
                document.getElementById(
                    "tracking-result"
                );


            resultBox.textContent =
                "Order check ho raha hai...";


            try {

                const response =
                    await fetch(

                        `/api/orders/${encodeURIComponent(orderId)}?phone=${encodeURIComponent(phone)}`

                    );


                const result =
                    await response.json();


                if (
                    response.ok &&
                    result.success
                ) {

                    resultBox.innerHTML = `

                        <h3>
                            Order Found!
                        </h3>

                        <p>
                            Order ID:
                            ${escapeHTML(result.orderId)}
                        </p>

                        <p>
                            Order Status:
                            <strong>
                                ${escapeHTML(result.status)}
                            </strong>
                        </p>

                    `;

                } else {

                    resultBox.textContent =
                        "Order nahi mila. Order ID aur Phone Number check karo.";

                }


            } catch (error) {

                console.error(
                    "Tracking Error:",
                    error
                );


                resultBox.textContent =
                    "Server se connection nahi ho raha.";

            }

        }
    );


/* START */

loadProducts();

updateCart();
