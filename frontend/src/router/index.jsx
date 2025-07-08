import { Routes, Route } from 'react-router-dom';
import Home from '../pages/Home';
import Detailpage from '../pages/Detailpage';
import Wishlist from '../pages/Wishlist';
import Admin from '../pages/Admin';

export default function AppRouter() {
  return (
    <Routes>
      <Route path="/" element={<Home />} />
      <Route path="/detailpage" element={<Detailpage />} />
      <Route path="/wishlist" element={<Wishlist />} />
      <Route path="/admin" element={<Admin />} />
    </Routes>
  );
}
