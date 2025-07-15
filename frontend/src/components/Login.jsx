import { useState } from 'react';
import { useApp } from './AppContext';   // ✅ AppContext에서 가져오기
import "../assets/css/Login.css";

export default function Login({ onLoginSuccess, onSwitchToSignup, onClose }) {
  const [useridOrEmail, setUseridOrEmail] = useState('');
  const [password, setPassword] = useState('');
  const { setUser } = useApp();           // ✅ Context의 setUser

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!useridOrEmail || !password) {
      alert('아이디(이메일)와 비밀번호를 모두 입력해주세요.');
      return;
    }

    try {
      const res = await fetch('http://localhost:5000/api/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ useridOrEmail, password }),
      });

      const data = await res.json();

      if (res.ok && data.success) {
        // ✅ Context 상태 업데이트
        setUser({ userid: data.userid, role: data.role });

        if (data.isAdmin) {
          alert('관리자님 환영합니다!');
        } else {
          alert('로그인 성공!');
        }

        onLoginSuccess();
      } else {
        alert(data.message || '로그인 실패: 아이디 또는 비밀번호를 확인하세요.');
      }
    } catch {
      alert('서버 오류가 발생했습니다.');
    }
  };

  return (
    <div id='login' onClick={onClose}>
      <div className="wrap" onClick={(e) => e.stopPropagation()}>
        <button className="close-btn" onClick={onClose}>X</button>
        <h2>로그인하고 딱 맞는 <br />위시리스트를 만들어보세요</h2>
        <form className="login" onSubmit={handleSubmit}>
          <input
            type="text"
            name="useridOrEmail"
            placeholder="이메일 또는 아이디"
            value={useridOrEmail}
            onChange={e => setUseridOrEmail(e.target.value)}
            autoComplete="username"
          />
          <input
            type="password"
            name="password"
            placeholder="비밀번호"
            value={password}
            onChange={e => setPassword(e.target.value)}
            autoComplete="current-password"
          />
          <button type="button">아이디/비밀번호 찾기</button>
          <button type="submit">로그인</button>
          <p>
            아직 회원이 아니신가요?{' '}
            <button type="button" onClick={onSwitchToSignup}>
              회원가입
            </button>
          </p>
        </form>
      </div>
    </div>
  );
}
