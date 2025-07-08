// src/components/Detailpage.jsx
import React from "react";
import { useParams } from "react-router-dom";
import "../assets/css/detailpage.css";

export default function Detailpage({ data }) {
  const { id } = useParams();

  // data가 없거나 빈 배열일 때 로딩 표시
  if (!data || data.length === 0) {
    return <p>데이터를 불러오는 중입니다...</p>;
  }

  const detail = data.find(item => item.id === Number(id));

  if (!detail) {
    return <p>데이터를 찾을 수 없습니다.</p>;
  }

  return (
    <div className="detailpage-container">
        <img className="detail-image" src={detail.image} alt={detail.title} />
        <div className="info-box">
          <h2 className="title">{detail.title}</h2>
          <div className="meta">
            <span>💬 {detail.comments || 20}</span>
            <span>💾 {detail.saves || 12}</span>
          </div>
          <div className="description">
            {detail.description || "미디어 설명이나 구매 방법 같은 공지사항 내용"}
          </div>
          <div className="price">{detail.price}원</div>
          <button className="download-btn">Download</button>
        </div>
    </div>
  );
}
