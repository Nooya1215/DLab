import { useEffect, useState } from 'react';
import axiosInstance from '../services/axiosInstance'; // 설정된 인스턴스
import Card from '../components/Card';
import Top from '../components/Top';
import "../assets/css/home.css";

export default function Home() {
  const [cardData, setCardData] = useState([]);

  useEffect(() => {
    axiosInstance.get('/courses')
      .then(res => setCardData(res.data))
      .catch(err => console.error('카드 데이터 불러오기 실패:', err));
  }, []);

  return (
    <section id="home">
      <div className='wrap'>
        <div className="card-grid">
          {cardData.map((item) => (
            <Card key={item._id || item.id} {...item} />
          ))}
        </div>
      </div>
      <Top />
    </section>
  );
}
