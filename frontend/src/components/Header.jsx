import { useState, useEffect } from 'react';
import LoginSign from './LoginSign';
import "../assets/css/Header.css";

export default function Header() {
  const [showLoginSign, setShowLoginSign] = useState(false);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [loading, setLoading] = useState(true);

  // 로그인 상태 체크
  const checkLoginStatus = async () => {
    try {
      const res = await fetch('/api/auth/check', {
        credentials: 'include',
      });
      const data = await res.json();
      if (res.ok && data.loggedIn) setIsLoggedIn(true);
      else setIsLoggedIn(false);
    } catch {
      setIsLoggedIn(false);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    checkLoginStatus();
  }, []);

  const openModal = () => setShowLoginSign(true);
  const closeModal = () => setShowLoginSign(false);

  const handleLoginSuccess = () => {
    setIsLoggedIn(true);
    closeModal();
  };

  const handleLogout = async () => {
    try {
      const res = await fetch('http://localhost:5000/api/logout', {
        method: 'POST',
        credentials: 'include',  // 쿠키 포함 필수
      });

      if (res.ok) {
        setIsLoggedIn(false);
      } else {
        console.error('로그아웃 실패:', res.statusText);
        // 필요하면 사용자에게 알림 띄우기
      }
    } catch (error) {
      console.error('로그아웃 중 오류 발생:', error);
    }
  };

  if (loading) return null;

  return (
    <>
      <header id="header">
        <div className="wrap">
          <h1>Logo</h1>
          {isLoggedIn ? (
            <button onClick={handleLogout}>Logout</button>
          ) : (
            <button onClick={openModal}>Login</button>
          )}
        </div>
      </header>

      {showLoginSign && (
        <LoginSign onLoginSuccess={handleLoginSuccess} onClose={closeModal} />
      )}
    </>
  );
}
