import React, { useEffect, useState } from "react";
import axios from "axios";
import Card from "../components/Card";
import {
  fetchWishlist,
  addToWishlist,
  removeFromWishlist
} from "../services/wishlist";
import { useApp } from "../components/AppContext"; // ✅ 로그인 상태 가져오기
import "../assets/css/Home.css";

export default function Home() {
  const [cards, setCards] = useState([]);
  const { user } = useApp(); // ✅ 로그인 상태 추적

  useEffect(() => {
    const loadCardsWithWishStatus = async () => {
      try {
        let wishedIds = [];

        if (user) {
          // ✅ 찜 목록 가져오기
          const wishlist = await fetchWishlist();
          wishedIds = wishlist.map((item) => item.courseId);
        }

        // ✅ 카드 목록 MongoDB에서 가져오기
        const coursesRes = await axios.get("http://localhost:5000/api/courses");
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
  }, [user]); // ✅ 로그인 상태가 바뀌면 카드 다시 로드

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
