import { BrowserRouter } from 'react-router-dom';
import { AppProvider } from './components/AppContext';
import Header from './components/Header';
import Sidebar from './pages/Sidebar';
import Footer from './components/Footer';
import AppRouter from './router';
import './App.css';

export default function App() {
  return (
    <AppProvider>
      <BrowserRouter>
        <div className="app-layout">
          <Header />
          <Sidebar />
          <ScrollToTop />
          <main className="main-content">
            <AppRouter />
          </main>
          <Footer />
        </div>
      </BrowserRouter>
    </AppProvider>
  );
}
