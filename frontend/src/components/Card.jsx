import React, { useEffect, useState } from "react";
import { Link, useNavigate } from 'react-router-dom';
import { FaRegBookmark, FaBookmark } from 'react-icons/fa';
import { useApp } from './AppContext'; // 로그인 상태 확인용
import "../assets/css/Card.css";

export default function Card({
  id, title, image, price, wishCount, downloads, isWished: initialIsWished, onWishClick
}) {
  const navigate = useNavigate();
  const { user } = useApp(); // 로그인 정보
  const [isWished, setIsWished] = useState(initialIsWished || false);

  // 로그인 상태 또는 외부 찜 상태 변경 시 동기화
  useEffect(() => {
    if (!user) {
      setIsWished(false);
    } else {
      setIsWished(initialIsWished);
    }
  }, [user, initialIsWished]);

  const handleWishClick = async (e) => {
    e.stopPropagation();
    e.preventDefault();

    try {
      const res = await fetch("http://localhost:5000/api/auth/check", {
        method: "GET",
        credentials: "include",
      });

      if (!res.ok) {
        throw new Error("Not authenticated");
      }

      const data = await res.json();
      if (data.loggedIn) {
        // 즉시 반영
        setIsWished(prev => !prev);
        onWishClick(id);
      } else {
        alert("로그인 후 이용해주세요.");
      }
    } catch (error) {
      alert("로그인 후 이용해주세요.");
    }
  };

  return (
    <div id="card" className="card-wrapper">
      {/* 북마크 아이콘 */}
      <div className="bookmark-icon" onClick={handleWishClick}>
        {isWished ? (
          <FaBookmark color="red" size={24} />
        ) : (
          <FaRegBookmark color="#fff" size={24} />
        )}
      </div>

      <Link to={`/detailpage/${id}`} className="card-link">
        <div className="img-box">
          <img className="card-image" src={image} alt={title} />
          <div className="overlay"></div>
          <h3 className="card-title">{title}</h3>
        </div>
        <div className="card-content">
          <div className="card-info">
            <p>{price}</p>
            <div className="wish">
              <p>북마크 {wishCount}</p>
            </div>
            <div className="down">
              <p>{downloads}</p>
            </div>
          </div>
          <button className="card-button">Download</button>
        </div>
      </Link>
    </div>
  );
}
