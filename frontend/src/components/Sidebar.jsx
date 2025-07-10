// frontend\src\components\Sidebar.jsx
import React from "react";
import { Link } from "react-router-dom";
import { useApp } from "../components/AppContext";
import "../assets/css/sidebar.css"

export default function Sidebar() {
  const { user, loading } = useApp();
  const role = user?.role || "user";
  const mypageLink = role === "admin" ? "/admin" : "/mypage";

  return (
    <nav id="sidebar" className="flex">
      <Link to="/" className="home">홈</Link>
      <Link to="/" className="search">검색</Link>
      <Link to="/wishlist" className="wishlist">위시리스트</Link>
      <Link to={mypageLink} className="mypage">마이페이지</Link>
    </nav>
  );
}
