const ReviewManager = {
  reviewsList: [],
  ratingSummary: {}, // { [productId]: { avg: 4.5, total: 2, reviews: [] } }

  async fetchAndProcessReviews() {
    try {
      const res = await fetch('data/reviews.xml');
      const xmlText = await res.text();

      // Sử dụng DOMParser để đọc file XML (Câu 5)
      const parser = new DOMParser();
      const xmlDoc = parser.parseFromString(xmlText, "text/xml");
      const reviewNodes = xmlDoc.getElementsByTagName('review');

      this.reviewsList = [];
      this.ratingSummary = {};

      for (let node of reviewNodes) {
        const productId = node.getElementsByTagName('product_id')[0].textContent.trim();
        const customer = node.getElementsByTagName('customer_name')[0].textContent.trim();
        const score = parseFloat(node.getElementsByTagName('rating')[0].textContent.trim());
        const comment = node.getElementsByTagName('comment')[0].textContent.trim();

        if (!this.ratingSummary[productId]) {
          this.ratingSummary[productId] = { totalPoints: 0, count: 0, list: [] };
        }

        this.ratingSummary[productId].totalPoints += score;
        this.ratingSummary[productId].count += 1;
        this.ratingSummary[productId].list.push({ customer, score, comment });
      }

      // Gắn rating vào DOM ảnh sản phẩm
      this.renderRatingsToDOM();
    } catch (err) {
      console.error("Lỗi parse XML Reviews: ", err);
    }
  },

  renderRatingsToDOM() {
    Object.keys(this.ratingSummary).forEach(prodId => {
      const data = this.ratingSummary[prodId];
      const avg = (data.totalPoints / data.count).toFixed(1);

      const wrapper = document.querySelector(`.card[data-id="${prodId}"] .img-wrapper`);
      if (wrapper) {
        // Tránh nhân đôi thẻ nếu gọi lại
        const existingSpan = wrapper.querySelector('.badge-rating');
        if (existingSpan) existingSpan.remove();

        // Tạo thẻ span chèn số sao trung bình lên ảnh (Câu 5)
        const span = document.createElement('span');
        span.className = 'badge-rating';
        span.dataset.id = prodId;
        span.title = "Bấm để xem danh sách đánh giá";
        span.innerHTML = `⭐ ${avg} (${data.count})`;
        wrapper.appendChild(span);
      }
    });
  },

  showRatingDetailModal(productId) {
    const data = this.ratingSummary[productId];
    const modalContent = document.getElementById('ratingDetailContent');
    const modal = document.getElementById('ratingModal');

    if (!data || data.list.length === 0) {
      modalContent.innerHTML = '<p>Sản phẩm này chưa có đánh giá nào.</p>';
    } else {
      modalContent.innerHTML = data.list.map(r => `
        <div style="margin-bottom: 10px; border-bottom: 1px solid #eee; padding-bottom: 5px;">
          <strong>${r.customer}</strong> - <span>${'⭐'.repeat(r.score)} (${r.score}/5)</span>
          <p style="font-size: 0.9rem; color: #555;">${r.comment}</p>
        </div>
      `).join('');
    }
    modal.classList.add('active');
  }
};