import { useState } from 'react';
import { Link } from "react-router-dom";
import LoginSign from './LoginSign';
import { useApp } from './AppContext';  // 전역 상태에서 logout 포함 가져오기
import "../assets/css/Header.css";

export default function Header() {
  const { user, logout, loading } = useApp();  // ✅ logout 가져오기
  const [showLoginSign, setShowLoginSign] = useState(false);

  const openModal = () => setShowLoginSign(true);
  const closeModal = () => setShowLoginSign(false);

  const handleLogout = async () => {
    await logout(); // ✅ context의 logout 함수 호출
  };

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
            // 로그인 성공 시 AppContext에서 자동 반영
          }}
          onClose={closeModal}
        />
      )}
    </>
  );
}
