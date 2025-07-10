import { useState } from 'react';
import "../assets/css/Sign.css";

export default function Sign({ onSwitchToLogin, onClose }) {
  const [userid, setUserid] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [passwordConfirm, setPasswordConfirm] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!userid || !email || !password || !passwordConfirm) {
      alert('모든 항목을 입력해주세요.');
      return;
    }

    if (password !== passwordConfirm) {
      alert('비밀번호가 일치하지 않습니다.');
      return;
    }

    try {
      const res = await fetch('http://localhost:5000/api/sign', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userid, email, password }),
        credentials: 'include',
      });

      const data = await res.json();

      if (res.ok) {
        alert('회원가입 성공! 로그인해주세요.');
        onSwitchToLogin();
      } else {
        alert(data.message || '회원가입 실패');
      }
    } catch {
      alert('서버 오류가 발생했습니다.');
    }
  };

  return (
    <div id='sign' onClick={onClose}>
      <div className="wrap" onClick={(e) => e.stopPropagation()}>
        <button className="close-btn" onClick={onClose}>X</button>
        <h2>회원가입</h2>
        <form className="signup" onSubmit={handleSubmit}>
          <input
            type="text"
            placeholder="아이디"
            value={userid}
            onChange={e => setUserid(e.target.value)}
            required
          />
          <input
            type="email"
            placeholder="이메일"
            value={email}
            onChange={e => setEmail(e.target.value)}
            required
          />
          <input
            type="password"
            placeholder="비밀번호"
            value={password}
            onChange={e => setPassword(e.target.value)}
            required
          />
          <input
            type="password"
            placeholder="비밀번호 확인"
            value={passwordConfirm}
            onChange={e => setPasswordConfirm(e.target.value)}
            required
          />
          <button className='sign-btn' type="submit">회원가입</button>
          <p>
            이미 회원이신가요?{' '}
            <button type="button" onClick={onSwitchToLogin}>
              로그인
            </button>
          </p>
        </form>
      </div>
    </div>
  );
}
