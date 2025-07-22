import React, { useEffect, useState } from "react";
import axios from "axios";
import Card from "../components/Card";
import {
  fetchWishlist,
  addToWishlist,
  removeFromWishlist
} from "../services/wishlist";
import { useApp } from "../components/AppContext";
import "../assets/css/Home.css";

const API_BASE = import.meta.env.VITE_API_URL; // ✅ 환경변수 사용

export default function Home() {
  const [cards, setCards] = useState([]);
  const { user } = useApp();

  useEffect(() => {
    const loadCardsWithWishStatus = async () => {
      try {
        let wishedIds = [];

        if (user) {
          const wishlist = await fetchWishlist();
          wishedIds = wishlist.map((item) => item.courseId);
        }

        // ✅ 환경변수 기반 API 주소 사용
        const coursesRes = await axios.get(`${API_BASE}/api/courses`);
        const mongoCards = coursesRes.data;

        const updatedCards = mongoCards.map((card) => ({
          ...card,
          isWished: wishedIds.includes(card.id),
          wishCount: card.wish || 0,
        }));

        setCards(updatedCards);
      } catch (error) {
        console.error("카드 불러오기 실패:", error);
      }
    };

    loadCardsWithWishStatus();
  }, [user]);

  const handleWishClick = async (id) => {
    const target = cards.find((c) => c.id === id);
    if (!target) return;

    try {
      if (target.isWished) {
        await removeFromWishlist(id);
      } else {
        await addToWishlist(id, target.title, target.image, target.price);
      }

      setCards((prev) =>
        prev.map((card) =>
          card.id === id
            ? {
                ...card,
                isWished: !card.isWished,
                wishCount: card.wishCount + (card.isWished ? -1 : 1),
              }
            : card
        )
      );
    } catch (err) {
      console.error("찜 처리 실패:", err);

      const message =
        err.message.includes("로그인") || err.message.includes("401")
          ? "로그인 후 이용해주세요."
          : "찜 처리 중 오류가 발생했습니다.";

      alert(message);
    }
  };

  return (
    <section id="home">
      <div className="wrap">
        <div className="card-grid">
          {cards.map((item) => (
            <Card
              key={item.id}
              id={item.id}
              title={item.title}
              image={item.image}
              price={item.price}
              wishCount={item.wishCount}
              downloads={item.downloads}
              isWished={item.isWished}
              onWishClick={handleWishClick}
            />
          ))}
        </div>
      </div>
    </section>
  );
}
