import { Routes, Route } from 'react-router-dom';
import Home from '../pages/Home';
import Detailpage from '../pages/Detailpage';
import Wishlist from '../pages/Wishlist';

export default function AppRouter({ data }) {
  return (
    <Routes>
      <Route path="/" element={<Home />} />
      <Route path="/detailpage/:id" element={<Detailpage data={data} />} />
      <Route path="/wishlist" element={<Wishlist />} />
    </Routes>
  );
}
