let allProducts = [];

document.addEventListener('DOMContentLoaded', async () => {
  // 1. Cập nhật trạng thái giỏ hàng ban đầu
  if (typeof CartManager !== 'undefined') {
    CartManager.updateCartBadge();
    CartManager.renderMiniCart();
  }

  // 2. Tải và parse XML sản phẩm -> Render toàn bộ danh sách ban đầu (Câu 1, 3)
  await loadProductsFromXML();

  // 3. Tải reviews và gắn số sao lên ảnh (Câu 5)
  if (typeof ReviewManager !== 'undefined') {
    await ReviewManager.fetchAndProcessReviews();
  }

  // 4. Gắn Event Delegation cho container sản phẩm (Câu 4)
  setupProductEventDelegation();

  // 5. Gắn sự kiện cho form lọc (chỉ kích hoạt khi bấm nút "Tìm Kiếm") (Câu 2)
  setupFilterEvents();
});

// Đọc file products.xml bằng DOMParser
async function loadProductsFromXML() {
  try {
    const res = await fetch('data/products.xml');
    const xmlText = await res.text();
    const parser = new DOMParser();
    const xmlDoc = parser.parseFromString(xmlText, "text/xml");
    const productNodes = xmlDoc.getElementsByTagName('product');

    allProducts = [];
    for (let node of productNodes) {
      const id = node.getAttribute('id');
      const title = node.getElementsByTagName('title')[0].textContent.trim();
      const price = parseFloat(node.getElementsByTagName('price')[0].textContent.trim());
      const category = node.getElementsByTagName('category')[0].textContent.trim();
      const image = node.getElementsByTagName('image')[0].textContent.trim();
      const stock = parseInt(node.getElementsByTagName('stock')[0].textContent.trim());
      
      const colors = [];
      const colorNodes = node.getElementsByTagName('color');
      for (let c of colorNodes) {
        colors.push(c.textContent.trim());
      }

      allProducts.push({ id, title, price, category, image, colors, stock });
    }

    renderProducts(allProducts);
  } catch (error) {
    console.error("Lỗi khi load products.xml:", error);
  }
}

// Render danh sách sản phẩm ra lưới Grid (Câu 3)
function renderProducts(list) {
  const container = document.getElementById('productList');
  if (!container) return;
  container.innerHTML = '';

  if (list.length === 0) {
    container.innerHTML = '<p style="grid-column: 1/-1; text-align: center; color: #666; font-size: 1.1rem; padding: 2rem;">Không tìm thấy sản phẩm nào phù hợp!</p>';
    return;
  }

  list.forEach(p => {
    const article = document.createElement('article');
    article.className = 'card';
    article.dataset.id = p.id;

    const defaultColor = p.colors[0] || 'Tiêu chuẩn';

    article.innerHTML = `
      <div class="img-wrapper clickable-detail" data-id="${p.id}" title="Bấm để xem chi tiết sản phẩm">
        <img src="${p.image}" alt="${p.title}">
      </div>
      <h4 class="product-title-clickable" data-id="${p.id}" title="Bấm để xem chi tiết sản phẩm">${p.title}</h4>
      <div class="price">$${p.price.toFixed(2)}</div>
      <div style="font-size: 0.8rem; margin-bottom: 8px; color: #64748b;">
        Màu: <span style="font-weight:bold; color: #1e293b;">${p.colors.join(', ')}</span> | Kho: ${p.stock}
      </div>
      <div class="btn-group">
        <button class="btn-add-cart" data-id="${p.id}" data-variant="${defaultColor}">+ Giỏ Hàng</button>
        <button class="btn-quick-view" data-id="${p.id}">Xem Chi Tiết</button>
      </div>
    `;
    container.appendChild(article);
  });

  // Gắn badge rating lên ảnh sản phẩm nếu đã có dữ liệu reviews
  if (typeof ReviewManager !== 'undefined') {
    ReviewManager.renderRatingsToDOM();
  }
}

// Câu 4: Event Delegation trên container #productList
function setupProductEventDelegation() {
  const container = document.getElementById('productList');
  if (!container) return;

  container.addEventListener('click', (event) => {
    const addBtn = event.target.closest('.btn-add-cart');
    const viewBtn = event.target.closest('.btn-quick-view');
    const ratingBadge = event.target.closest('.badge-rating');
    const clickDetail = event.target.closest('.clickable-detail, .product-title-clickable');

    // 1. Nút Thêm vào giỏ hàng
    if (addBtn) {
      const prodId = addBtn.dataset.id;
      const variant = addBtn.dataset.variant;
      const product = allProducts.find(p => p.id === prodId);
      
      if (product && typeof CartManager !== 'undefined') {
        CartManager.addItem(product.id, variant, product.title, product.price, product.image);

        // Hiệu ứng nháy xanh trên nút vừa bấm
        const originalText = addBtn.innerHTML;
        addBtn.classList.add('btn-added-flash');
        addBtn.innerHTML = '✓ Đã thêm';

        setTimeout(() => {
          addBtn.classList.remove('btn-added-flash');
          addBtn.innerHTML = originalText;
        }, 600);

        // Hiệu ứng rung nảy số lượng giỏ hàng trên Menu
        const badge = document.getElementById('cartCount');
        if (badge) {
          badge.classList.remove('cart-bounce');
          void badge.offsetWidth;
          badge.classList.add('cart-bounce');
        }
      }
      return;
    }

    // 2. Bấm vào Badge Rating -> Xem chi tiết đánh giá (Câu 5)
    if (ratingBadge) {
      const prodId = ratingBadge.dataset.id;
      if (typeof ReviewManager !== 'undefined') {
        ReviewManager.showRatingDetailModal(prodId);
      }
      return;
    }

    // 3. Bấm vào nút Xem Chi Tiết HOẶC bấm vào Ảnh/Tên sản phẩm
    if (viewBtn || clickDetail) {
      const targetElement = viewBtn || clickDetail;
      const prodId = targetElement.dataset.id;
      showQuickView(prodId);
    }
  });
}

// Modal Xem Chi Tiết Sản Phẩm
function showQuickView(id) {
  const p = allProducts.find(prod => prod.id === id);
  if (!p) return;

  let ratingText = 'Chưa có đánh giá';
  if (typeof ReviewManager !== 'undefined' && ReviewManager.ratingSummary[p.id]) {
    const r = ReviewManager.ratingSummary[p.id];
    ratingText = `⭐ ${(r.totalPoints / r.count).toFixed(1)}/5 (${r.count} lượt đánh giá)`;
  }

  const content = document.getElementById('quickViewContent');
  content.innerHTML = `
    <div style="text-align: center;">
      <div style="height: 220px; display: flex; align-items: center; justify-content: center; margin-bottom: 1rem; background: #fdfdfd; border-radius: 12px; padding: 10px;">
        <img src="${p.image}" style="max-height: 100%; max-width: 100%; object-fit: contain;">
      </div>
      <h3 style="font-size: 1.15rem; color: #0f172a; margin-bottom: 0.5rem; line-height: 1.4;">${p.title}</h3>
      <p style="color: #2563eb; font-size: 1.4rem; font-weight: 700; margin: 0.5rem 0;">$${p.price.toFixed(2)}</p>
      
      <div style="background: #f8fafc; border: 1px solid #e2e8f0; border-radius: 12px; padding: 1rem; text-align: left; margin: 1rem 0; font-size: 0.9rem; display: flex; flex-direction: column; gap: 8px;">
        <p>📁 Danh mục: <b style="color: #0f172a;">${p.category}</b></p>
        <p>🎨 Màu sắc sẵn có: <b style="color: #0f172a;">${p.colors.join(', ')}</b></p>
        <p>📦 Số lượng trong kho: <b style="color: #10b981;">${p.stock} sản phẩm</b></p>
        <p>🌟 Đánh giá: <b style="color: #f59e0b;">${ratingText}</b></p>
      </div>

      <button class="btn-checkout" onclick="CartManager.addItem('${p.id}', '${p.colors[0] || 'Tiêu chuẩn'}', '${p.title.replace(/'/g, "\\'")}', ${p.price}, '${p.image}'); closeModal('quickViewModal');" style="width: 100%; padding: 0.8rem; font-size: 0.95rem;">+ Thêm Sản Phẩm Này Vào Giỏ Hàng</button>
    </div>
  `;
  document.getElementById('quickViewModal').classList.add('active');
}

// Thiết lập chức năng lọc (chỉ lọc khi bấm nút "Tìm Kiếm")
function setupFilterEvents() {
  const form = document.getElementById('filterForm');
  const priceInp = document.getElementById('filterPrice');
  const colorInp = document.getElementById('filterColor');
  const ratingInp = document.getElementById('filterRating');
  const catInp = document.getElementById('filterCategory');
  const resetBtn = document.getElementById('btnResetFilter');

  if (!form) return;
  form.reset();

  const executeFilter = () => {
    const rawPrice = priceInp.value.trim();
    const maxPrice = rawPrice !== '' ? parseFloat(rawPrice) : Infinity;
    const selColor = colorInp.value.trim().toLowerCase();
    const minRating = parseFloat(ratingInp.value) || 0;
    const selCat = catInp.value.trim().toLowerCase();

    const filtered = allProducts.filter(p => {
      const matchPrice = p.price <= maxPrice;
      const matchColor = !selColor || p.colors.some(c => c.toLowerCase() === selColor);
      const matchCat = !selCat || p.category.toLowerCase() === selCat;

      let avgRate = 0;
      if (typeof ReviewManager !== 'undefined' && ReviewManager.ratingSummary[p.id]) {
        const rData = ReviewManager.ratingSummary[p.id];
        avgRate = rData.count > 0 ? (rData.totalPoints / rData.count) : 0;
      }
      const matchRating = avgRate >= minRating;

      return matchPrice && matchColor && matchCat && matchRating;
    });

    renderProducts(filtered);
  };

  form.addEventListener('submit', (e) => {
    e.preventDefault();
    executeFilter();
  });

  if (resetBtn) {
    resetBtn.addEventListener('click', () => {
      form.reset();
      renderProducts(allProducts);
    });
  }
}