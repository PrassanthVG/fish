"use client";

import { useEffect, useState } from "react";
import Confetti from "./components/Confetti";
import Fireworks from "./components/Fireworks";

export default function Home() {
  const [opened, setOpened] = useState(false);
  const [burst, setBurst] = useState(true);
  const [intensity, setIntensity] = useState("normal");

  useEffect(() => {
    const t = setTimeout(() => setBurst(false), 3500);
    return () => clearTimeout(t);
  }, []);

  function claim() {
    setOpened(true);
    setBurst(true);
    setIntensity("high");
    setTimeout(() => setBurst(false), 3500);
    setTimeout(() => setIntensity("normal"), 5000);
  }

  return (
    <main className="prize-page">
      <Fireworks intensity={intensity} />
      {burst && <Confetti count={140} />}

      <span className="prize-float" style={{ top: "10%", left: "8%" }}>🎉</span>
      <span className="prize-float" style={{ top: "18%", right: "10%", animationDelay: "1.5s" }}>✨</span>
      <span className="prize-float" style={{ bottom: "14%", left: "12%", animationDelay: "3s" }}>🎊</span>
      <span className="prize-float" style={{ bottom: "20%", right: "14%", animationDelay: "4.5s" }}>💰</span>

      <div className="prize-card">
        <div className={`prize-box ${opened ? "prize-box-open" : ""}`} onClick={!opened ? claim : undefined}>
          🎁
        </div>

        <div className="prize-badge">🏆 Congratulations!</div>

        <h1 className="prize-title">
          You Won<br />
          <span className="prize-amount">₹1,000</span>
        </h1>

        <p className="prize-subtitle">
          {opened
            ? "Your reward has been added to your wallet 🎉"
            : "Tap the gift box to reveal & claim your reward"}
        </p>

        <button className="prize-btn" onClick={claim} disabled={opened}>
          {opened ? "✅ Claimed!" : "🎁 Claim My Reward"}
        </button>
      </div>
    </main>
  );
}
