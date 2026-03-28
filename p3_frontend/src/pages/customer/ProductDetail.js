import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import userService from '../../services/userService';
import '../../styles/customer/productDetail.css';

import { Icon } from '@iconify/react';

function ProductDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [template, setTemplate] = useState(null);
  const [selectedImg, setSelectedImg] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchTemplate = async () => {
      try {
        const data = await userService.getTemplateById(id);
        setTemplate(data);
        if (data.productGalleries?.length > 0) {
          setSelectedImg(data.productGalleries[0].imageUrl);
        } else {
          setSelectedImg(data.imageUrl);
        }
      } catch (err) {
        console.error('Lỗi khi tải sản phẩm:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchTemplate();
  }, [id]);

  if (loading) return <div className="pd-loading">Đang tải...</div>;
  if (!template) return <div className="pd-loading">Không tìm thấy sản phẩm.</div>;

  const allImages = template.productGalleries?.length > 0
    ? template.productGalleries.map(g => g.imageUrl)
    : [template.imageUrl];

  return (
    <div className="pd-page">
      <div className="container">

        {/* Breadcrumb */}
        <div className="pd-breadcrumb">
          <span onClick={() => navigate('/')} className="bc-link">Trang chủ</span>
          <span className="bc-sep">›</span>
          {/* <span onClick={() => navigate('/products')} className="bc-link">Dịch vụ</span>
          <span className="bc-sep">›</span> */}
          <span className="bc-current">{template.templateName}</span>
        </div>

        <div className="pd-main">
          {/* LEFT: Gallery */}
          <div className="pd-gallery">
            <div className="pd-main-img">
              <img
                src={`http://localhost:5002/${selectedImg}`}
                alt={template.templateName}
                onError={e => { e.target.src = 'https://placehold.co/400x300?text=Error+Image'; }}
              />
            </div>
            {allImages.length > 1 && (
              <div className="pd-thumbs">
                {allImages.map((img, i) => (
                  <img
                    key={i}
                    src={`http://localhost:5002/${img}`}
                    alt={`Ảnh mẫu ${i + 1}`}
                    className={selectedImg === img ? 'active' : ''}
                    onClick={() => setSelectedImg(img)}
                  />
                ))}
              </div>
            )}
          </div>

          {/* RIGHT: Info */}
          <div className="pd-info">
            <h1 className="pd-title">{template.templateName}</h1>

            <div className="pd-meta">
              <span className="pd-leadtime">
                <Icon icon="twemoji:alarm-clock" width="18" style={{ marginRight: '6px' }} />
                Thời gian: {template.leadTime}
              </span>
            </div>

            {template.details && (
              <p className="pd-desc">{template.details}</p>
            )}

            {/* Bảng giá - chỉ size của template này */}
            <div className="pd-sizes">
              <h3>Bảng giá</h3>
              {template.printSizes?.length > 0 ? (
                <table className="size-table">
                  <thead>
                    <tr>
                      <th>Kích thước</th>
                      <th>Đơn giá</th>
                    </tr>
                  </thead>
                  <tbody>
                    {template.printSizes
                      .filter(s => s.isAvailable)
                      .sort((a, b) => a.price - b.price)
                      .map(size => (
                        <tr key={size.sizeId}>
                          <td>{size.sizeName}</td>
                          <td className="price-cell">
                            {Number(size.price).toLocaleString('vi-VN')}đ
                          </td>
                        </tr>
                      ))}
                  </tbody>
                </table>
              ) : (
                <p className="no-size">Chưa có bảng giá.</p>
              )}
            </div>

            <button
              className="pd-order-btn"
              onClick={() => navigate(`/order/new?templateId=${template.templateId}`)}
            >
              Đặt in ngay
            </button>
          </div>
        </div>

      </div>
    </div>
  );
}

export default ProductDetail;