const CartManager = {
  // Quản lý state giỏ hàng bằng JS Object (Câu 6)
  items: JSON.parse(localStorage.getItem('cartState')) || [],

  // Thêm mới hoặc tăng số lượng theo variant (màu sắc/size)
  addItem(id, variant, title, price, image) {
    const existingIndex = this.items.findIndex(i => i.id === id && i.variant === variant);

    if (existingIndex > -1) {
      this.items[existingIndex].quantity += 1;
    } else {
      this.items.push({
        id: id,
        variant: variant || 'Tiêu chuẩn',
        title: title,
        price: parseFloat(price),
        image: image,
        quantity: 1
      });
    }

    this.saveState();
    this.renderMiniCart();
    this.updateCartBadge();
  },

  getTotalPrice() {
    return this.items.reduce((sum, item) => sum + (item.price * item.quantity), 0).toFixed(2);
  },

  saveState() {
    localStorage.setItem('cartState', JSON.stringify(this.items));
  },

  updateCartBadge() {
    const totalCount = this.items.reduce((sum, i) => sum + i.quantity, 0);
    const badge = document.getElementById('cartCount');
    if (badge) badge.innerText = totalCount;
  },

  // Render Mini Cart hiển thị đầy đủ tên không bị cắt và kèm hình thu nhỏ
  renderMiniCart() {
    const cartList = document.getElementById('cartItemsList');
    const totalEl = document.getElementById('cartTotal');
    if (!cartList) return;

    cartList.innerHTML = '';
    if (this.items.length === 0) {
      cartList.innerHTML = '<li style="text-align:center; color: #888; padding: 1.5rem 0;">Giỏ hàng của bạn đang trống</li>';
      totalEl.innerText = '0.00';
      return;
    }

    this.items.forEach(item => {
      const li = document.createElement('li');
      li.className = 'cart-item-row';
      li.innerHTML = `
        <div class="cart-item-info">
          <img src="${item.image}" alt="${item.title}" class="cart-thumb">
          <div class="cart-text">
            <span class="cart-item-title">${item.title}</span>
            <span class="cart-item-meta">Màu: <b>${item.variant}</b> | SL: <b>${item.quantity}</b></span>
          </div>
        </div>
        <div class="cart-item-price">$${(item.price * item.quantity).toFixed(2)}</div>
      `;
      cartList.appendChild(li);
    });

    totalEl.innerText = this.getTotalPrice();
  },

  toggleMiniCart() {
    const miniCart = document.getElementById('miniCart');
    if (miniCart.style.display === 'block') {
      miniCart.style.display = 'none';
    } else {
      miniCart.style.display = 'block';
    }
  }
};