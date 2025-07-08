import React from "react";
import { Link } from 'react-router-dom';
import "../assets/css/Card.css";

export default function Card({ id, title, mediaUrl, type, price, wish, downloads }) {
  // 미디어 뷰 렌더링
  const renderMedia = () => {
    if (type === "image") {
      return <img className="card-media" src={mediaUrl} alt={title} />;
    }
    if (type === "video") {
      return <video className="card-media" src={mediaUrl} controls />;
    }
    if (type === "audio") {
      return <audio className="card-media" src={mediaUrl} controls />;
    }
    return <p>지원하지 않는 미디어 형식</p>;
  };

  return (
    <Link to={`/detailpage/${id}`} id="card">
      <div className="media-box">
        {renderMedia()}
        <div className="overlay"></div>
        <h3 className="card-title">{title}</h3>
      </div>
      <div className="card-content">
        <div className="card-info">
          <p>{price === 0 ? "FREE" : `${price}원`}</p>
          <div className="wish">
            <p>{wish}</p>
          </div>
          <div className="down">
            <p>{downloads}</p>
          </div>
        </div>
        <button className="card-button">Download</button>
      </div>
    </Link>
  );
}
