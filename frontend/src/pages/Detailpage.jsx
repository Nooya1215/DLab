import React, { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import axiosInstance from "../services/axiosInstance";
import "../assets/css/detailpage.css";

export default function Detailpage() {
  const { id } = useParams();
  const [detail, setDetail] = useState(null);
  const [loading, setLoading] = useState(true);
  const [loggedIn, setLoggedIn] = useState(false);

  useEffect(() => {
    // 상세 정보 가져오기
    axiosInstance.get(`/courses/${id}`)
      .then(res => {
        setDetail(res.data);
        setLoading(false);
      })
      .catch(err => {
        console.error("상세 데이터 불러오기 실패:", err);
        setLoading(false);
      });

    // 로그인 상태 확인
    axiosInstance.get("/auth/check", { withCredentials: true })
      .then(res => {
        setLoggedIn(res.data.loggedIn);
      })
      .catch(err => {
        console.warn("로그인 상태 확인 실패:", err);
        setLoggedIn(false);
      });
  }, [id]);

  const downloadImage = async () => {
    try {
      const res = await axiosInstance.get("/auth/check", { withCredentials: true });

      if (!res.data.loggedIn) {
        alert("이미지를 다운로드하려면 먼저 로그인해주세요.");
        return;
      }

      const response = await fetch(detail.image, {
        mode: 'cors',
      });
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `${detail.title || 'image'}.jpg`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      window.URL.revokeObjectURL(url);
    } catch (error) {
      console.error("다운로드 중 오류:", error);
      alert("이미지를 다운로드하려면 먼저 로그인해주세요.");
    }
  };

  if (loading) return <p>불러오는 중...</p>;
  if (!detail) return <p>데이터를 찾을 수 없습니다.</p>;

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
        <button className="download-btn" onClick={downloadImage}>
          Download
        </button>
      </div>
    </div>
  );
}
