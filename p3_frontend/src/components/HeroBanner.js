import React, { useState, useEffect, useRef } from 'react';
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
  const intervalRef = useRef(null);

  const startAuto = () => {
    stopAuto();
    intervalRef.current = setInterval(() => {
      setCurrent((prev) => (prev + 1) % slides.length);
    }, 5000);
  };

  const stopAuto = () => {
    if (intervalRef.current) clearInterval(intervalRef.current);
  };

  const nextSlide = () => {
    setCurrent((prev) => (prev + 1) % slides.length);
    startAuto();
  };

  const prevSlide = () => {
    setCurrent((prev) => (prev - 1 + slides.length) % slides.length);
    startAuto();
  };

  useEffect(() => {
    startAuto();
    return stopAuto;
  }, []);

  return (
    <div
      className="hero-banner"
      onMouseEnter={stopAuto}
      onMouseLeave={startAuto}
    >
      {/* Image */}
      <img
        src={slides[current].image}
        alt={slides[current].title}
        className="banner-image"
      />

      {/* Text */}
      <div className="banner-text">
        <h1>{slides[current].title}</h1>
        <p>{slides[current].subtitle}</p>
        <Link to="/order/custom" className="banner-btn">
          Đặt in ngay
        </Link>
      </div>

      {/* Arrows */}
      <button className="banner-arrow left" onClick={prevSlide}>
        ‹
      </button>
      <button className="banner-arrow right" onClick={nextSlide}>
        ›
      </button>

      {/* Dots */}
      <div className="banner-dots">
        {slides.map((slide, index) => (
          <span
            key={slide.image}
            className={`dot ${index === current ? 'active' : ''}`}
            onClick={() => {
              setCurrent(index);
              startAuto();
            }}
          />
        ))}
      </div>
    </div>
  );
}

export default HeroBanner;