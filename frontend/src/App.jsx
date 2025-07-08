import { useState, useEffect } from 'react';
import { BrowserRouter } from 'react-router-dom';
import Header from './components/Header';
import Footer from './components/Footer';
import cardsData from './data/cards.json'
import AppRouter from './router';
import './App.css';

export default function App() {
  const [data, setData] = useState(null);

  useEffect(() => {
    setData(cardsData); 
  }, [])

  return (
    <BrowserRouter>
      <div className="app-layout">
        <Header />
        <main className="main-content">
          <AppRouter data={data} />
        </main>
        <Footer />
      </div>
    </BrowserRouter>
  );
}
