import React from "react";
import { useParams } from "react-router-dom";
import "../assets/css/detailpage.css";
import cardData from '../data/cards.json';

export default function Detailpage() {
  const { id } = useParams();

  const detail = cardData.find(item => item.id === Number(id));

  if (!detail) {
    return <p>데이터를 찾을 수 없습니다.</p>;
  }

  return (
    <div className="detailpage-container wrap">
      <img className="detail-image" src={detail.image} alt={detail.title} />
      <div className="info-box">
        <h2 className="title">{detail.title}</h2>
        <div className="meta">
          <p>{detail.wish || 20}</p>
          <p>{detail.downloads || 12}</p>
        </div>
        <div className="description">
          {detail.description || "미디어 설명이나 구매 방법 같은 공지사항 내용"}
        </div>
        <div className="price">{detail.price}</div>
        <button className="download-btn">Download</button>
      </div>
    </div>
  );
}
