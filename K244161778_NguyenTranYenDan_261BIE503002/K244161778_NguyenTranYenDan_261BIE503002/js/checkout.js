// Regex theo yêu cầu Câu 7: SĐT Việt Nam và Email
const phoneRegex = /^(0|\+84)(3[2-9]|5[6|8|9]|7[0|6-9]|8[1-5]|9[0-9])[0-9]{7}$/;
const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

document.addEventListener('DOMContentLoaded', () => {
  const phoneInput = document.getElementById('custPhone');
  const emailInput = document.getElementById('custEmail');

  if (phoneInput && emailInput) {
    // Validate ngay lập tức khi keyup hoặc blur
    phoneInput.addEventListener('keyup', () => validateField(phoneInput, phoneRegex, 'phoneError', 'SĐT không đúng định dạng VN (10 số, đầu 03/05/07/08/09 hoặc +84)'));
    phoneInput.addEventListener('blur', () => validateField(phoneInput, phoneRegex, 'phoneError', 'SĐT không đúng định dạng VN'));

    emailInput.addEventListener('keyup', () => validateField(emailInput, emailRegex, 'emailError', 'Email không hợp lệ (VD: user@domain.com)'));
    emailInput.addEventListener('blur', () => validateField(emailInput, emailRegex, 'emailError', 'Email không hợp lệ'));
  }
});

function validateField(input, regex, errorId, errorMsg) {
  const errorEl = document.getElementById(errorId);
  if (!regex.test(input.value.trim())) {
    errorEl.textContent = errorMsg;
    return false;
  } else {
    errorEl.textContent = '';
    return true;
  }
}

function openCheckoutModal() {
  if (CartManager.items.length === 0) {
    alert('Giỏ hàng đang trống!');
    return;
  }
  document.getElementById('checkoutModal').classList.add('active');
  document.getElementById('miniCart').style.display = 'none';
}

function submitCheckout() {
  const phoneInput = document.getElementById('custPhone');
  const emailInput = document.getElementById('custEmail');
  const nameInput = document.getElementById('custName');

  const isPhoneOk = validateField(phoneInput, phoneRegex, 'phoneError', 'SĐT không hợp lệ');
  const isEmailOk = validateField(emailInput, emailRegex, 'emailError', 'Email không hợp lệ');

  if (isPhoneOk && isEmailOk) {
    // Giả lập lưu đơn hàng vào LocalStorage
    const savedOrders = JSON.parse(localStorage.getItem('orders')) || [];
    const newOrder = {
      orderId: 'HD' + Date.now().toString().slice(-5),
      customerName: nameInput.value.trim(),
      phone: phoneInput.value.trim(),
      email: emailInput.value.trim(),
      date: new Date().toLocaleDateString('vi-VN'),
      items: CartManager.items,
      total: CartManager.getTotalPrice()
    };

    savedOrders.push(newOrder);
    localStorage.setItem('orders', JSON.stringify(savedOrders));

    // Reset giỏ hàng
    CartManager.items = [];
    CartManager.saveState();
    CartManager.renderMiniCart();
    CartManager.updateCartBadge();

    alert('Đặt hàng thành công! Đơn hàng đã được lưu trữ.');
    closeModal('checkoutModal');
  }
}

function closeModal(id) {
  document.getElementById(id).classList.remove('active');
}