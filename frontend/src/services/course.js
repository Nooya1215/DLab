// services/course.js
const BASE_URL = "http://localhost:5000";

// 코스 상세 정보 불러오기
export async function fetchCourseById(id) {
  const res = await fetch(`${BASE_URL}/api/courses/${id}`);
  if (!res.ok) {
    throw new Error("코스 상세 정보 불러오기 실패");
  }
  return await res.json();
}
