import Card from '../components/Card';
import cardData from '../data/cards.json';
import "../assets/css/Home.css";

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
    </section>
  );
}