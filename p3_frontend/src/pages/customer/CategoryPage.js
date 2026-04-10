import React, { useState, useEffect } from 'react';
import { Link, useParams } from 'react-router-dom';
import userService from '../../services/userService';
import '../../styles/customer/categoryPage.css';
import { Icon } from '@iconify/react';

const BASE_URL = 'http://localhost:5002';

const CAT_LABELS = {
    'anh-de-ban': 'Ảnh để bàn',
    'khung-anh': 'Khung ảnh',
    'anh-cong-cuoi': 'Ảnh cổng cưới',
    'in-anh': 'In ảnh',
};

function CategoryPage() {
    const { category } = useParams();
    const [products, setProducts] = useState([]);
    const [loading, setLoading] = useState(true);

    const catLabel = CAT_LABELS[category];

    useEffect(() => {
        if (!category) return;
        setLoading(true);
        userService
            .getTemplatesByCategory(category)
            .then(data => setProducts(Array.isArray(data) ? data : []))
            .catch(() => setProducts([]))
            .finally(() => setLoading(false));
    }, [category]);

    if (!catLabel) return (
        <div className="cat-notfound">
            <p>Danh mục không tồn tại.</p>
            <Link to="/">Về trang chủ</Link>
        </div>
    );

    return (
        <div className="cat-page">
            <div className="cat-breadcrumb">
                <Link to="/">Trang chủ</Link>
                <span>/</span>
                <span>{catLabel}</span>
            </div>

            <div className="cat-header">
                <h1 className="cat-title">{catLabel}</h1>
                <span className="cat-count">
                    {loading ? '' : `${products.length} sản phẩm`}
                </span>
            </div>

            {loading ? (
                <div className="cat-loading">
                    <div className="cat-spinner" />
                    <p>Đang tải sản phẩm...</p>
                </div>
            ) : products.length === 0 ? (
                <div className="cat-empty">
                    <p>Chưa có sản phẩm nào trong danh mục này.</p>
                    <Link to="/" className="cat-back-btn">Về trang chủ</Link>
                </div>
            ) : (
                <div className="cat-grid">
                    {[...products]
                        .sort((a, b) => (b.isFeatured === true) - (a.isFeatured === true))
                        .map(product => (
                            <Link
                                key={product.templateId}
                                to={`/product/${product.templateId}`}
                                className="cat-card"
                            >
                                <div className="cat-card-img-wrap">
                                    <img
                                        src={product.imageUrl ? `${BASE_URL}/${product.imageUrl}` : 'https://placehold.co/300x220?text=No+Image'}
                                        alt={product.templateName}
                                        onError={e => { e.target.src = 'https://placehold.co/300x220?text=No+Image'; }}
                                    />
                                    {product.isFeatured && <span className="cat-badge-featured">Nổi bật</span>}
                                </div>
                                <div className="cat-card-body">
                                    <h3 className="cat-card-name">{product.templateName}</h3>
                                    {product.leadTime && <p className="cat-card-lead">
                                        <Icon icon="twemoji:alarm-clock" width="16" style={{ marginRight: '4px', verticalAlign: 'middle' }} />
                                        {product.leadTime}
                                    </p>}
                                    {product.details && <p className="cat-card-desc">{product.details}</p>}
                                    <span className="cat-card-btn">Xem chi tiết →</span>
                                </div>
                            </Link>
                        ))}
                </div>
            )}
        </div>
    );
}

export default CategoryPage;