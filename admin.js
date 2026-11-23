
import { auth, db } from "./firebase.js";

import {
    signInWithEmailAndPassword,
    onAuthStateChanged,
    signOut
} from "https://www.gstatic.com/firebasejs/13.4.0/firebase-auth.js";

import {
    collection,
    getDocs,
    query,
    orderBy,
    doc,
    updateDoc
} from "https://www.gstatic.com/firebasejs/13.4.0/firebase-firestore.js";

// THAY BẰNG UID TÀI KHOẢN ADMIN CỦA BẠN

const ADMIN_UID = "r4cf6Cm9IJQC2GxrqkMN0lX9eGj2";

const loginBox = document.getElementById("loginBox");
const dashboard = document.getElementById("dashboard");

// CHỐNG CHÈN HTML TỪ THÔNG TIN KHÁCH

function escapeHTML(value) {
    return String(value ?? "").replace(/[&<>"']/g, char => ({
        "&": "&amp;",
        "<": "&lt;",
        ">": "&gt;",
        '"': "&quot;",
        "'": "&#39;"
    })[char]);
}

// KIỂM TRA QUYỀN ADMIN

onAuthStateChanged(auth, async user => {
    if (user && user.uid === ADMIN_UID) {
        loginBox.style.display = "none";
        dashboard.style.display = "block";
        await loadOrders();
    } else {
        dashboard.style.display = "none";
        loginBox.style.display = "block";

        if (user) {
            await signOut(auth);
            document.getElementById("loginMessage").innerText =
                "Tài khoản này không có quyền quản trị.";
        }
    }
});

// ĐĂNG NHẬP

document.getElementById("loginButton").onclick = async () => {
    const email = document.getElementById("email").value.trim();
    const password = document.getElementById("password").value;

    const message = document.getElementById("loginMessage");

    try {
        await signInWithEmailAndPassword(auth, email, password);
        message.innerText = "";
    } catch (error) {
    console.error("Lỗi Firebase:", error.code, error.message);
    alert("Mã lỗi: " + error.code);
    }
};

// ĐĂNG XUẤT

document.getElementById("logoutButton").onclick = async () => {
    await signOut(auth);
};

// LẤY ĐƠN HÀNG

async function loadOrders() {
    const area = document.getElementById("orders");

    try {
        const q = query(
            collection(db, "orders"),
            orderBy("createdAt", "desc")
        );

        const snapshot = await getDocs(q);

        let revenue = 0;

        snapshot.forEach(item => {
            revenue += Number(item.data().total) || 0;
        });

        document.getElementById("summary").innerText =
            "Tổng số đơn: " + snapshot.size +
            " | Tổng giá trị đơn: " +
            revenue.toLocaleString("vi-VN") + "đ";

        if (snapshot.empty) {
            area.innerText = "Chưa có khách hàng đặt hàng.";
            return;
        }

        area.innerHTML = snapshot.docs.map(item => {
            const p = item.data();

            const products = (p.items || []).map(product =>
                `<li>${escapeHTML(product.name)} -
                ${escapeHTML(product.quantity)} sản phẩm -
                ${Number(product.price * product.quantity)
                    .toLocaleString("vi-VN")}đ</li>`
            ).join("");

            const time = p.createdAt?.toDate
                ? p.createdAt.toDate().toLocaleString("vi-VN")
                : "Đang cập nhật";

            return `
                <div class="order">
                    <h3>Đơn hàng: ${escapeHTML(item.id)}</h3>
                    <p><b>Khách hàng:</b> ${escapeHTML(p.customerName)}</p>
                    <p><b>Số điện thoại:</b> ${escapeHTML(p.phone)}</p>
                    <p><b>Địa chỉ:</b> ${escapeHTML(p.address)}</p>
                    <p><b>Sản phẩm:</b></p>
                    <ul>${products}</ul>
                    <p><b>Tổng tiền:</b>
                    ${Number(p.total).toLocaleString("vi-VN")}đ</p>
                    <p><b>Thời gian:</b> ${escapeHTML(time)}</p>

                    <label>Trạng thái:</label>
                    <select id="status-${item.id}">
                        ${["Chờ xác nhận","Đang xử lý","Đang giao","Hoàn thành","Đã hủy"]
                        .map(s => `
                            <option value="${s}"
                            ${p.status === s ? "selected" : ""}>
                            ${s}</option>
                        `).join("")}
                    </select>

                    <button data-save="${item.id}">Lưu trạng thái</button>
                </div>
            `;
        }).join("");

        document.querySelectorAll("[data-save]").forEach(button => {
            button.onclick = async () => {
                const id = button.dataset.save;
                const status = document.getElementById("status-" + id).value;

                try {
                    await updateDoc(doc(db, "orders", id), {
                        status: status
                    });

                    alert("Đã cập nhật đơn hàng!");
                } catch (error) {
                    alert("Không cập nhật được đơn hàng.");
                }
            };
        });

    } catch (error) {
        console.error(error);
        area.innerText = "Không thể tải đơn hàng. Hãy kiểm tra quyền truy cập.";
    }
}
