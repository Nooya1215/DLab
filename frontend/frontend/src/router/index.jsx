import React from 'react';
import { Routes, Route } from 'react-router-dom';
import Home from '../pages/Home';
import Detailpage from '../pages/Detailpage';
import Wishlist from '../pages/Wishlist';
import Admin from '../pages/Admin';
import ProtectedAdminRoute from '../components/ProtectedAdminRoute';

export default function AppRouter({ data }) {
  return (
    <Routes>
      <Route path="/" element={<Home />} />
      <Route path="/detailpage/:id" element={<Detailpage data={data} />} />
      <Route path="/wishlist" element={<Wishlist />} />
      <Route
        path="/admin"
        element={
          <ProtectedAdminRoute>
            <Admin />
          </ProtectedAdminRoute>
        }
      />
    </Routes>
  );
}
