import React from "react";
import { Link } from "react-router-dom";
import "../assets/css/Footer.css";

function Footer() {
  return (
    <footer id="footer">
      <div className="wrap">
        <nav className="left">
          <Link to="/" className="logo">DLab</Link>
        </nav>
        <div className="middle flex">
          <p>ⓒ 2025 Team Studio 3 │Designed & Developed by 경유라, 김선우, 박선아</p>
          <p>Uicons by <a href="https://fontawesome.com/" target="_blank">fontawesome</a>
            · Images by <a href="https://unsplash.com/ko" target="_blank">Unsplash</a>
            · music by <a href="" target="_blank">utube</a>
          </p>
        </div>
        <div className="right flex">
          <ul>
            <li className="github"><a href="https://github.com/Nooya1215/DLab" target="_blank"></a></li>
            <li className="notion"><a href="https://www.notion.so/MVP-22a7017f822b8067a9b6c55e8b19bd03?source=copy_link" target="_blank"></a></li>
            <li className="figma"><a href="https://www.figma.com/design/HlwLUspTrTSxOoOziQnjPt/%EB%AF%B8%EB%94%94%EC%96%B4-%EC%82%AC%EC%9D%B4%ED%8A%B8?node-id=0-1&p=f&t=DPsgmWoGpWBcjDv9-0" target="_blank"></a></li>
          </ul>
        </div>
      </div>
    </footer>
  );
}

export default Footer;