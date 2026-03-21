import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import './HeroBanner.css';

const slides = [
  {
    image: '/images/banners/banner1.png',
    title: 'In ảnh cực đẹp',
    subtitle: 'Lưu giữ kỷ niệm theo cách của bạn',
  },
  {
    image: '/images/banners/banner2.jpg',
    title: 'Polaroid • Canvas • Photobook',
    subtitle: 'Tạo dấu ấn cá nhân với mỗi bức ảnh',
  },
  {
    image: '/images/banners/banner3.png',
    title: 'In ảnh đẹp chất lượng cao',
    subtitle: 'Giao nhanh toàn quốc • Chất lượng cao',
  },
  {
    image: '/images/banners/banner4.png',
    title: 'In ảnh theo phong cách riêng',
    subtitle: 'Tạo dấu ấn cá nhân với mỗi bức ảnh',
  },
];

function HeroBanner() {
  const [current, setCurrent] = useState(0);

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrent((prev) => (prev + 1) % slides.length);
    }, 5000);

    return () => clearInterval(timer);
  }, []);

  return (
    <div className="hero-banner">
      <img
        src={slides[current].image}
        alt={slides[current].title}  // alt ý nghĩa hơn
        className="banner-image"
        loading="lazy"
      />

      {/* Text Overlay */}
      <div className="banner-text">
        <h1>{slides[current].title}</h1>
        <p>{slides[current].subtitle}</p>
        <Link to='/order/custom' className="banner-btn">  {/* thay /home bằng route phù hợp */}
          Đặt in ngay
        </Link>
      </div>

      {/* Dots */}
      <div className="banner-dots">
        {slides.map((slide, index) => (
          <span
            key={index}
            className={`dot ${index === current ? 'active' : ''}`}
            onClick={() => setCurrent(index)}
            role="button"
            tabIndex={0}
            aria-label={`Chuyển đến slide ${index + 1}: ${slide.title}`}
            onKeyDown={(e) => {
              if (e.key === 'Enter' || e.key === ' ') {
                e.preventDefault();
                setCurrent(index);
              }
            }}
          />
        ))}
      </div>
    </div>
  );
}

export default HeroBanner;