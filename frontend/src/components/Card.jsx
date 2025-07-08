import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import "../assets/css/Card.css";

export default function Card() {
  return (
    <Link to={123}>
      <img src="" alt="" />
      <h2></h2>
      <button>찜</button>
    </Link>
  );
}
