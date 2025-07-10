import Card from '../components/Card';
import Top from '../components/Top';
import cardData from '../data/cards.json';
import "../assets/css/home.css";

export default function Home() {
  return (
    <section id="home">
      <div className='wrap'>
        <div className="card-grid">
          {cardData.map((item) => (
            <Card key={item.id} {...item} />
          ))}
        </div>
      </div>
      <Top />
    </section>
  );
}