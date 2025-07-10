import { useState } from 'react';
import { Link } from "react-router-dom";
import LoginSign from './LoginSign';
import { useApp } from './AppContext';  // 전역 상태 가져오기
import "../assets/css/Header.css";

export default function Header() {
  const { user, setUser, loading } = useApp();
  const [showLoginSign, setShowLoginSign] = useState(false);

  const openModal = () => setShowLoginSign(true);
  const closeModal = () => setShowLoginSign(false);

  const handleLogout = async () => {
    try {
      const res = await fetch('http://localhost:5000/api/logout', {
        method: 'POST',
        credentials: 'include',  // 쿠키 포함 필수
      });

      if (res.ok) {
        setUser(null);  // 전역 상태에서 로그아웃 처리
      } else {
        console.error('로그아웃 실패:', res.statusText);
      }
    } catch (error) {
      console.error('로그아웃 중 오류 발생:', error);
    }
  };

  // 로그인 상태 체크 중일 때 로딩 표시하거나 null 반환
  if (loading) return null;

  return (
    <>
      <header id="header">
        <div className="wrap">
          <Link to="/" className="logo font-left">DLab</Link>
          {user ? (
            <button onClick={handleLogout}>Logout</button>
          ) : (
            <button onClick={openModal}>Login</button>
          )}
        </div>
      </header>

      {showLoginSign && (
        <LoginSign 
          onLoginSuccess={() => {
            closeModal();
            // 로그인 후 AppContext에서 user 정보가 갱신되어 있어야 합니다.
          }} 
          onClose={closeModal} 
        />
      )}
    </>
  );
}
