import { useState, useEffect } from 'react';

export default function CountdownTimer({ endTime }) {
  const [timeLeft, setTimeLeft] = useState('');
  const [expired, setExpired] = useState(false);

  useEffect(() => {
    const tick = () => {
      const diff = new Date(endTime) - new Date();
      if (diff <= 0) { setExpired(true); setTimeLeft(''); return; }
      const h = Math.floor(diff / 3600000);
      const m = Math.floor((diff % 3600000) / 60000);
      const s = Math.floor((diff % 60000) / 1000);
      setTimeLeft(`${String(h).padStart(2, '0')}:${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`);
    };
    tick();
    const id = setInterval(tick, 1000);
    return () => clearInterval(id);
  }, [endTime]);

  if (expired || !timeLeft) return null;

  return (
    <span className="font-mono font-black text-xs tabular-nums">{timeLeft}</span>
  );
}
