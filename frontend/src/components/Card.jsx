import React from "react";
import { Link } from 'react-router-dom';
import "../assets/css/Card.css";

export default function Card({ id, title, image, price, wish, downloads }) {
  return (
    <Link to={`/detailpage/${id}`} id="card">
      <div className="img-box">
        <img className="card-image" src={image} alt={title} />
        <div className="overlay"></div>
        <h3 className="card-title">{title}</h3>
      </div>
      <div className="card-content">
        <div className="card-info">
          <p>{price}</p>
          <div className="wish">
            <p>{wish}</p>
          </div>
          <div className="down">
            <p>{downloads}</p>
          </div>
        </div>
        <button className="card-button">Download</button>
      </div>
    </Link>
  );
}
