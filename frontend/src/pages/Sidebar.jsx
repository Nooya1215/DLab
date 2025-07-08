import React from "react";
import { Link } from "react-router-dom";
import "../assets/css/sidebar.css"

console.log("✅ Sidebar 컴포넌트 로드됨");

export default function Sidebar() {
console.log("✅ Sidebar 렌더링됨");
  return (
    <nav id="sidebar" className="flex">
      <Link to="/" className="home">홈</Link>
      <Link to="/" className="search">검색</Link>
      <Link to="/wishlist" className="wishlist">위시리스트</Link>
      <Link to="/" className="mypage">마이페이지</Link>
    </nav>
  );
}