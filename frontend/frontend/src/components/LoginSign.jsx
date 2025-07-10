import { useState } from 'react';
import Login from './Login';
import Sign from './Sign';

export default function LoginSign({ onLoginSuccess, onClose }) {
  const [isSignup, setIsSignup] = useState(false);

  return (
    <>
      {isSignup ? (
        <Sign
          onSwitchToLogin={() => setIsSignup(false)}
          onClose={onClose}
        />
      ) : (
        <Login
          onLoginSuccess={onLoginSuccess}
          onSwitchToSignup={() => setIsSignup(true)}
          onClose={onClose}
        />
      )}
    </>
  );
}
