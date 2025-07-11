// services/wishlist.js

const BASE_URL = "http://localhost:5000";

// 찜 추가
export async function addToWishlist(courseId, title, image, price) {
  const response = await fetch(`${BASE_URL}/api/wishlist/add`, {
    method: 'POST',
    credentials: 'include',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ courseId, title, image, price }),
  });

  if (response.status === 401) {
    throw new Error('로그인 필요');
  }

  if (!response.ok) {
    const errorData = await response.json();
    throw new Error(errorData.message || '찜 추가 실패');
  }

  return await response.json();
}

// 찜 목록 조회
export async function fetchWishlist() {
  const response = await fetch(`${BASE_URL}/api/wishlist`, {
    method: 'GET',
    credentials: 'include',
  });

  if (response.status === 401) {
    throw new Error('로그인 필요');
  }

  if (!response.ok) {
    throw new Error('찜 목록 조회 실패');
  }

  return await response.json();
}

// 찜 해제
export async function removeFromWishlist(courseId) {
  const response = await fetch(`${BASE_URL}/api/wishlist/remove`, {
    method: 'POST',
    credentials: 'include',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ courseId }),
  });

  if (response.status === 401) {
    throw new Error('로그인 필요');
  }

  if (!response.ok) {
    const errorData = await response.json();
    throw new Error(errorData.message || '찜 해제 실패');
  }

  return await response.json();
}
