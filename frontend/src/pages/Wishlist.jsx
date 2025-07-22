import React, { useEffect, useState } from "react";
import Card from "../components/Card";
import {
  fetchWishlist,
  addToWishlist,
  removeFromWishlist,
} from "../services/wishlist";
import { fetchCourseById } from "../services/course";
import { useApp } from "../components/AppContext"; // ✅ 로그인 상태 감지
import "../assets/css/wishlist.css";

export default function Wishlist() {
  const [items, setItems] = useState([]);
  const { user } = useApp(); // ✅ 전역 로그인 상태

  useEffect(() => {
    async function loadWishlist() {
      if (!user) {
        setItems([]); // ✅ 로그아웃 시 찜 목록 초기화
        return;
      }

      try {
        const wishlist = await fetchWishlist();

        const mapped = await Promise.all(
          wishlist.map(async (item) => {
            try {
              const course = await fetchCourseById(item.courseId);
              return {
                id: item.courseId,
                title: course.title || "제목 없음",
                image: course.image || "",
                price: course.price ?? "무료",
                wishCount: course.wishCount ?? 0,
                downloads: course.downloads ?? 0,
                isWished: true,
              };
            } catch {
              return {
                id: item.courseId,
                title: item.title || "제목 없음",
                image: item.image || "",
                price: "무료",
                wishCount: 0,
                downloads: 0,
                isWished: true,
              };
            }
          })
        );

        setItems(mapped);
      } catch (e) {
        console.error("위시리스트 불러오기 실패", e);
        setItems([]);
      }
    }

    loadWishlist();
  }, [user]); // ✅ user 변경 시 자동 반응

  const handleWishClick = async (id) => {
    const target = items.find((i) => i.id === id);
    if (!target) return;

    try {
      if (target.isWished) {
        await removeFromWishlist(id);
        setItems((prev) => prev.filter((i) => i.id !== id));
      } else {
        await addToWishlist(id, target.title, target.image, target.price);
        setItems((prev) =>
          prev.map((i) => (i.id === id ? { ...i, isWished: true } : i))
        );
      }
    } catch (error) {
      console.error("찜 처리 실패", error);
    }
  };

  return (
    <div className="wishlist-page">
      <h1 className="wishlist-title">WISH LIST</h1>

      {items.length === 0 ? (
        <p className="wishlist-empty">찜한 콘텐츠가 없습니다.</p>
      ) : (
        <div className="wishlist-grid">
          {items.map((item) => (
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
      )}
    </div>
  );
}
