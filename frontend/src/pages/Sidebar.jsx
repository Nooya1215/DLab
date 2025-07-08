
// client\src\components\Header.jsx
import React from "react";
import { Link } from "react-router-dom";

export default function Header() {

  return (
    <div id="sidebar" className="bg-white shadow p-4 flex justify-between items-center px-8">
      {/* 로고 */}
      <Link to="/" className="text-xl font-bold">AI EduSearch</Link>

      {/* 우측 메뉴 */}
      <nav className="flex gap-6 text-sm font-medium">
        <Link to="/about" className="hover:underline">서비스 소개</Link>
        <Link to="/search" className="hover:underline">강의 검색</Link>
        <Link to="/FavoriteCourses" className="hover:underline">찜한 강의</Link>
      </nav>
    </div>
  );
}
