
import { db } from "./firebase.js";

import {
    collection,
    addDoc,
    serverTimestamp
} from "https://www.gstatic.com/firebasejs/13.4.0/firebase-firestore.js";

// DANH SÁCH SẢN PHẨM

const products = [
    {
        id: 1,
        name: "Nước mắm Cá Thu",
        price: 120000,
        category: "Nước Mắm",
        image: "ca thu.jpg"
    },
    {
        id: 2,
        name: "Nước Mắm Cá Cơm",
        price: 70000,
        category: "Nước Mắm",
        image: "cá cơm.jpg"
    },
    {
        id: 3,
        name: "Nước Mắm Cá Trích",
        price: 70000,
        category: "Nước Mắm",
        image: "cá trích.jpg"
    },
  
];

let cart = [];
let category = "Tất cả";

const money = n => n.toLocaleString("vi-VN") + "đ";

// HIỂN THỊ DANH MỤC

const categories = ["Nước Mắm"];

function showCategories() {
    document.getElementById("categories").innerHTML =
    categories.map(c => `
        <button data-category="${c}"
        style="background:${category === c ? '#333' : '#ff6b35'}">
        ${c}
        </button>
    `).join("");

    document.querySelectorAll("[data-category]").forEach(btn => {
        btn.onclick = () => {
            category = btn.dataset.category;
            showCategories();
            showProducts();
        };
    });
}

// HIỂN THỊ SẢN PHẨM

function showProducts() {
    const keyword = document.getElementById("search")
        .value.toLowerCase();

    const list = products.filter(p =>
        p.name.toLowerCase().includes(keyword) &&
        (category === "Tất cả" || p.category === category)
    );

    document.getElementById("products").innerHTML =
    list.map(p => `
        <div class="product">
            <img src="${p.image}" alt="${p.name}">
            <h3>${p.name}</h3>
            <p class="price">${money(p.price)}</p>
            <button data-add="${p.id}">Thêm vào giỏ</button>
        </div>
    `).join("");

    document.querySelectorAll("[data-add]").forEach(btn => {
        btn.onclick = () => addCart(Number(btn.dataset.add));
    });
}

// GIỎ HÀNG

function addCart(id) {
    const item = cart.find(p => p.id === id);

    if (item) {
        item.quantity++;
    } else {
        const p = products.find(p => p.id === id);
        cart.push({...p, quantity: 1});
    }

    showCart();
}

function changeQuantity(id, amount) {
    const item = cart.find(p => p.id === id);
    if (!item) return;

    item.quantity += amount;
    cart = cart.filter(p => p.quantity > 0);
    showCart();
}

function showCart() {
    const area = document.getElementById("cartItems");

    area.innerHTML = cart.length ? cart.map(p => `
        <div class="item">
            <div>
                <b>${p.name}</b><br>
                ${money(p.price)}
            </div>
            <div>
                <button data-minus="${p.id}">-</button>
                ${p.quantity}
                <button data-plus="${p.id}">+</button>
            </div>
        </div>
    `).join("") : "Chưa có sản phẩm.";

    document.querySelectorAll("[data-minus]").forEach(btn => {
        btn.onclick = () => changeQuantity(Number(btn.dataset.minus), -1);
    });

    document.querySelectorAll("[data-plus]").forEach(btn => {
        btn.onclick = () => changeQuantity(Number(btn.dataset.plus), 1);
    });

    const total = cart.reduce((s,p) => s + p.price*p.quantity, 0);
    const count = cart.reduce((s,p) => s + p.quantity, 0);

    document.getElementById("total").innerText = "Tổng tiền: " + money(total);
    document.getElementById("count").innerText = count;
}

// GỬI ĐƠN HÀNG LÊN FIREBASE

document.getElementById("orderForm").addEventListener("submit", async e => {
    e.preventDefault();

    const message = document.getElementById("message");
    const button = document.getElementById("submitOrder");

    if (cart.length === 0) {
        message.innerText = "Bạn chưa chọn sản phẩm!";
        return;
    }

    const name = document.getElementById("name").value.trim();
    const phone = document.getElementById("phone").value.trim();
    const address = document.getElementById("address").value.trim();

    if (!name || !phone || !address) {
        message.innerText = "Vui lòng nhập đủ thông tin.";
        return;
    }

    const items = cart.map(p => ({
        productId: p.id,
        name: p.name,
        price: p.price,
        quantity: p.quantity
    }));

    const total = cart.reduce((s,p) => s + p.price*p.quantity, 0);

    button.disabled = true;
    button.innerText = "ĐANG GỬI...";

    try {
        const result = await addDoc(collection(db, "orders"), {
            customerName: name,
            phone: phone,
            address: address,
            items: items,
            total: total,
            status: "Chờ xác nhận",
            createdAt: serverTimestamp()
        });

        message.innerText =
            "Đặt hàng thành công! Mã đơn: " + result.id;

        cart = [];
        showCart();
        e.target.reset();

    } catch (error) {
        console.error(error);
        message.innerText =
            "Chưa gửi được đơn hàng. Vui lòng thử lại.";
    } finally {
        button.disabled = false;
        button.innerText = "XÁC NHẬN ĐẶT HÀNG";
    }
});

// KHỞI ĐỘNG

document.getElementById("search").addEventListener("input", showProducts);

showCategories();
showProducts();
showCart();
