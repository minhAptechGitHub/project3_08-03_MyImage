import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import userService from '../../services/userService';
import HeroBanner from '../../components/HeroBanner';
import '../../styles/customer/customer.css';

function Home() {
    const [products, setProducts] = useState([]);
    const navigate = useNavigate();

    useEffect(() => {
        fetchProducts();
    }, []);

    const fetchProducts = async () => {
        try {
            const data = await userService.getAvailableTemplates();
            setProducts(data || []);
        } catch (err) {
            console.error('Lỗi khi tải danh sách dịch vụ:', err);
        }
    };

    const features = [
        { icon: '🖼️', title: 'Chất lượng cao', desc: 'In ảnh sắc nét, màu sắc trung thực với công nghệ in hiện đại.' },
        { icon: '🚀', title: 'Giao hàng nhanh', desc: 'Giao toàn quốc trong 2–5 ngày, có tùy chọn giao nhanh 24h.' },
        { icon: '💰', title: 'Giá cạnh tranh', desc: 'Bảng giá minh bạch, ưu đãi hấp dẫn cho đơn hàng số lượng lớn.' },
        { icon: '🎨', title: 'Đa dạng mẫu mã', desc: 'Hơn 50+ kiểu in từ Polaroid, Canvas, Photobook đến dải ảnh.' },
    ];

    return (
        <div className="home-page">
            {/* Hero */}
            <section className="hero-section">
                <HeroBanner />
            </section>

            {/* Giới thiệu */}
            <section className="about-section">
                <div className="container">
                    <div className="about-inner">
                        <div className="about-text">
                            <span className="section-tag">Về chúng tôi</span>
                            <h2>Chuyên in ảnh đẹp — Lưu trọn kỷ niệm</h2>
                            <p>
                                Chúng tôi là dịch vụ in ảnh chuyên nghiệp với hơn <strong>5 năm kinh nghiệm</strong>,
                                phục vụ hàng nghìn khách hàng trên toàn quốc. Từ ảnh Polaroid cổ điển, tranh canvas
                                nghệ thuật đến photobook cao cấp — mỗi sản phẩm đều được làm thủ công tỉ mỉ với
                                chất liệu bền đẹp.
                            </p>
                            <p>
                                Sứ mệnh của chúng tôi là biến từng khoảnh khắc của bạn thành tác phẩm nghệ thuật
                                đáng trân trọng mãi mãi.
                            </p>
                        </div>
                        <div className="about-image">
                            <img src="/images/banners/banner1.png" alt="Giới thiệu dịch vụ in ảnh" />
                        </div>
                    </div>
                </div>
            </section>

            {/* Services */}
            <section className="product-section">
                <div className="container">
                    <div className="customer-section-header">
                        <span className="section-tag">Dịch vụ</span>
                        <h2>Dịch vụ của chúng tôi</h2>
                        <p>Lựa chọn sản phẩm phù hợp để lưu giữ kỷ niệm đẹp của bạn</p>
                    </div>

                    <div className="product-grid">
                        {products.length > 0 ? (
                            products.map((product) => (
                                <div
                                    key={product.templateId}
                                    className="product-card"
                                    onClick={() => navigate(`/product/${product.templateId}`)}
                                    role="button"
                                    tabIndex={0}
                                    onKeyDown={(e) => {
                                        if (e.key === 'Enter' || e.key === ' ') {
                                            e.preventDefault();
                                            navigate(`/product/${product.templateId}`);
                                        }
                                    }}
                                >
                                    <div className="product-card-img">
                                        <img
                                            src={product.imageUrl ? `http://localhost:5002/${product.imageUrl}` : 'https://placehold.co/400x300?text=No+Image'}
                                            alt={product.templateName}
                                            loading="lazy"
                                            onError={(e) => { e.target.src = 'https://placehold.co/400x300?text=No+Image'; }}
                                        />
                                    </div>
                                    <div className="product-card-body">
                                        <h3>{product.templateName}</h3>
                                        <span className="product-card-cta">Xem chi tiết →</span>
                                    </div>
                                </div>
                            ))
                        ) : (
                            <p className="empty-message">Hiện tại chưa có dịch vụ nào khả dụng</p>
                        )}
                    </div>
                </div>
            </section>

            {/* Why us */}
            <section className="features-section">
                <div className="container">
                    <div className="customer-section-header">
                        <span className="section-tag">Lý do chọn chúng tôi</span>
                        <h2>Tại sao khách hàng tin tưởng?</h2>
                    </div>
                    <div className="features-grid">
                        {features.map((f, i) => (
                            <div className="feature-card" key={i}>
                                <div className="feature-icon">{f.icon}</div>
                                <h4>{f.title}</h4>
                                <p>{f.desc}</p>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* CTA */}
            <section className="cta-section">
                <div className="cta-inner">
                    <h2>Sẵn sàng tạo ảnh đẹp?</h2>
                    <p>Hàng nghìn khách hàng đã tin tưởng dịch vụ in ảnh của chúng tôi.</p>
                    <button className="cta-btn" onClick={() => navigate('/order/custom')}>
                        Đặt in ngay
                    </button>
                </div>
            </section>
        </div>
    );
}

export default Home;