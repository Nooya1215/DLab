import React, { useState } from 'react';
import "../assets/css/Header.css";

export default function Header() {
  return (
    <header id='header'>
      <div className="wrap">
        <h1>Logo</h1>
        <button>Login</button>
      </div>
    </header>
  );
}
