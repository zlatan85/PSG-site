import { readNews } from '../lib/news-store';

const sortByDateDesc = <T extends { date: string }>(items: T[]) =>
  [...items].sort((a, b) => b.date.localeCompare(a.date));

export default async function Ticker() {
  const news = await readNews();
  const headlines = sortByDateDesc(news).slice(0, 6);

  if (headlines.length === 0) {
    return null;
  }

  const loopItems = [...headlines, ...headlines];

  return (
    <div className="sticky top-16 z-30 h-9 border-b border-white/10 bg-[#000f1d] psgx-ticker-scroll">
      <div className="psgx-ticker-track font-plex-mono h-9 items-center text-xs tracking-wide text-[#7fa3c4]">
        {loopItems.map((item, index) => (
          <span key={`${item.id}-${index}`} className="flex items-center gap-2">
            <span className={index % 2 === 0 ? 'text-[#E30613]' : 'text-[#CEAB5D]'}>●</span>
            {item.title}
          </span>
        ))}
      </div>
    </div>
  );
}
