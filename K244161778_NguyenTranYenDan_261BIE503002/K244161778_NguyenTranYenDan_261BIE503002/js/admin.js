document.addEventListener('DOMContentLoaded', () => {
  // Kiểm tra quyền Admin
  const adminSession = sessionStorage.getItem('adminLogged');
  if (!adminSession) {
    window.location.href = 'login.html';
    return;
  }

  const adminInfo = JSON.parse(adminSession);
  document.getElementById('adminName').textContent = `Xin chào, ${adminInfo.fullname} (${adminInfo.role})`;

  loadDashboardStats();
});

function loadDashboardStats() {
  const orders = JSON.parse(localStorage.getItem('orders')) || [];
  
  // Tính tổng
  const totalOrders = orders.length;
  let totalRevenue = 0;
  let totalSoldUnits = 0;

  const tableBody = document.getElementById('orderTableBody');
  tableBody.innerHTML = '';

  if (orders.length === 0) {
    tableBody.innerHTML = '<tr><td colspan="6" style="text-align:center;">Chưa có đơn hàng nào được tạo.</td></tr>';
  }

  orders.forEach(order => {
    totalRevenue += parseFloat(order.total);
    
    // Đếm tổng số lượng sản phẩm bán ra
    let itemCount = 0;
    order.items.forEach(i => {
      itemCount += i.quantity;
      totalSoldUnits += i.quantity;
    });

    const tr = document.createElement('tr');
    tr.innerHTML = `
      <td><b>${order.orderId}</b></td>
      <td>${order.customerName}</td>
      <td>${order.phone}</td>
      <td>${order.date}</td>
      <td>${itemCount}</td>
      <td><strong style="color: #27ae60;">$${parseFloat(order.total).toFixed(2)}</strong></td>
    `;
    tableBody.appendChild(tr);
  });

  // Cập nhật lên UI thống kê
  document.getElementById('totalOrders').textContent = totalOrders;
  document.getElementById('totalRevenue').textContent = `$${totalRevenue.toFixed(2)}`;
  document.getElementById('totalProductsSold').textContent = totalSoldUnits;
}

// Đăng xuất: xóa session đăng nhập và chuyển hướng thẳng về trang chủ (index.html)
function logoutAdmin() {
  sessionStorage.removeItem('adminLogged');
  window.location.href = 'index.html';
}