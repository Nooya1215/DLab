import { BrowserRouter } from 'react-router-dom';
import Header from './components/Header';
import Sidebar from './pages/Sidebar';
import Footer from './components/Footer';
import AppRouter from './router';
import './App.css';

export default function App() {
  return (
    <BrowserRouter>
      <div className="app-layout">
        <Header />
        <Sidebar />
        <main className="main-content">
          <AppRouter />
        </main>
        <Footer />
      </div>
    </BrowserRouter>
  );
}
