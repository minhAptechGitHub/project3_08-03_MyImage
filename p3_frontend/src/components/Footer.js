import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Icon } from '@iconify/react';
import './Footer.css';

function Footer() {
  const navigate = useNavigate();

  return (
    <footer className="footer">
      <div className="footer-top">
        <div className="footer-brand">
          <h2 className="footer-logo">
            <Icon icon="twemoji:camera" width="24" style={{ marginRight: '6px' }} />
            MyImage
          </h2>

          <p className="footer-tagline">
            In ảnh chất lượng cao — Lưu trọn kỷ niệm của bạn
          </p>

          <div className="footer-socials">
            <a href="#" aria-label="Facebook">
              <Icon icon="logos:facebook" width="20" />
            </a>
            <a href="#" aria-label="Instagram">
              <Icon icon="skill-icons:instagram" width="20" />
            </a>
            <a href="#" aria-label="Zalo">
              <Icon icon="simple-icons:zalo" width="20" />
            </a>
          </div>
        </div>

        <div className="footer-col">
          <h4>Dịch vụ</h4>
          <ul>
            <li onClick={() => navigate('/')}>Rửa ảnh</li>
            <li onClick={() => navigate('/')}>In Canvas</li>
            <li onClick={() => navigate('/')}>Ảnh Polaroid</li>
            <li onClick={() => navigate('/')}>Photobook</li>
            <li onClick={() => navigate('/order/custom')}>In theo yêu cầu</li>
          </ul>
        </div>

        <div className="footer-col">
          <h4>Hỗ trợ</h4>
          <ul>
            <li>Chính sách bảo mật</li>
            <li>Điều khoản sử dụng</li>
            <li>Chính sách hoàn trả</li>
            <li>Hướng dẫn đặt hàng</li>
          </ul>
        </div>

        <div className="footer-col">
          <h4>Liên hệ</h4>
          <ul className="footer-contact">
            <li>
              <span className="contact-icon">
                <Icon icon="twemoji:e-mail" />
              </span>
              <span>support@myimage.com</span>
            </li>
            <li>
              <span className="contact-icon">
                <Icon icon="twemoji:telephone-receiver" />
              </span>
              <span>0123 456 789</span>
            </li>
            <li>
              <span className="contact-icon">
                <Icon icon="twemoji:round-pushpin" />
              </span>
              <span>TP. Hà Nội, Việt Nam</span>
            </li>
            <li>
              <span className="contact-icon">
                <Icon icon="twemoji:alarm-clock" />
              </span>
              <span>8:00 – 21:00, Thứ 2 – Chủ nhật</span>
            </li>
          </ul>
        </div>
      </div>

      <div className="footer-divider" />

      <div className="footer-bottom">
        <span>© 2025 MyImage. Tất cả quyền được bảo lưu.</span>
        <span>
          Thiết kế với <Icon icon="twemoji:red-heart" /> tại Việt Nam
        </span>
      </div>
    </footer>
  );
}

export default Footer;