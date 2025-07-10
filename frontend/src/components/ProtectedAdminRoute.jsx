import React from "react";
import { Navigate } from "react-router-dom";
import { useApp } from "./AppContext";

export default function ProtectedAdminRoute({ children }) {
  const { user, loading } = useApp();

  if (loading) {
    // 로딩 중에는 아무것도 렌더링하지 않거나 로딩 컴포넌트 표시 가능
    return null; 
  }

  if (!user || user.role !== "admin") {
    return <Navigate to="/" replace />;
  }

  return children;
}
