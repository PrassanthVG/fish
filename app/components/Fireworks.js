"use client";

import { useEffect, useRef } from "react";

const PALETTES = [
  ["#ffd166", "#ff8c42", "#ff3d3d"], // gold/red
  ["#ff5ab3", "#ff8ad4", "#ffd1ec"], // pink
  ["#6ae3ff", "#4fb3ff", "#7a8cff"], // blue
  ["#7dffb0", "#06d6a0", "#b9ff6b"], // green
  ["#ffe66d", "#ffffff", "#ffc94d"], // white gold
];

function rand(min, max) {
  return Math.random() * (max - min) + min;
}

class Particle {
  constructor(x, y, color, angle, speed) {
    this.x = x;
    this.y = y;
    this.color = color;
    this.vx = Math.cos(angle) * speed;
    this.vy = Math.sin(angle) * speed;
    this.alpha = 1;
    this.decay = rand(0.012, 0.025);
    this.gravity = 0.045;
    this.drag = 0.985;
    this.size = rand(1.5, 3);
    this.spark = Math.random() < 0.35;
  }

  update() {
    this.vx *= this.drag;
    this.vy *= this.drag;
    this.vy += this.gravity;
    this.x += this.vx;
    this.y += this.vy;
    this.alpha -= this.decay;
    return this.alpha > 0;
  }

  draw(ctx) {
    ctx.save();
    ctx.globalAlpha = Math.max(this.alpha, 0);
    ctx.fillStyle = this.color;
    ctx.shadowBlur = this.spark ? 8 : 0;
    ctx.shadowColor = this.color;
    ctx.beginPath();
    ctx.arc(this.x, this.y, this.size, 0, Math.PI * 2);
    ctx.fill();
    ctx.restore();
  }
}

class Rocket {
  constructor(width, height) {
    this.x = rand(width * 0.12, width * 0.88);
    this.y = height + 10;
    this.targetY = rand(height * 0.14, height * 0.48);
    this.vy = -rand(7.5, 10.5);
    this.vx = rand(-0.6, 0.6);
    this.trail = [];
    this.colors = PALETTES[Math.floor(Math.random() * PALETTES.length)];
    this.exploded = false;
  }

  update() {
    this.trail.push({ x: this.x, y: this.y, alpha: 1 });
    if (this.trail.length > 10) this.trail.shift();
    this.x += this.vx;
    this.y += this.vy;
    this.vy += 0.04;
    if (this.vy >= 0 || this.y <= this.targetY) {
      this.exploded = true;
    }
  }

  draw(ctx) {
    this.trail.forEach((t, i) => {
      ctx.save();
      ctx.globalAlpha = (i / this.trail.length) * 0.6;
      ctx.fillStyle = "#fff3d0";
      ctx.beginPath();
      ctx.arc(t.x, t.y, 1.8, 0, Math.PI * 2);
      ctx.fill();
      ctx.restore();
    });
    ctx.save();
    ctx.fillStyle = "#fff8e8";
    ctx.shadowBlur = 10;
    ctx.shadowColor = "#ffdd99";
    ctx.beginPath();
    ctx.arc(this.x, this.y, 2.4, 0, Math.PI * 2);
    ctx.fill();
    ctx.restore();
  }

  explode(particles) {
    const count = Math.floor(rand(55, 90));
    for (let i = 0; i < count; i++) {
      const angle = (Math.PI * 2 * i) / count + rand(-0.1, 0.1);
      const speed = rand(1.5, 5.5);
      const color = this.colors[Math.floor(Math.random() * this.colors.length)];
      particles.push(new Particle(this.x, this.y, color, angle, speed));
    }
    // inner bright core burst
    for (let i = 0; i < 16; i++) {
      const angle = rand(0, Math.PI * 2);
      const speed = rand(0.5, 2);
      particles.push(new Particle(this.x, this.y, "#ffffff", angle, speed));
    }
  }
}

export default function Fireworks({ intensity = "normal" }) {
  const canvasRef = useRef(null);
  const rafRef = useRef(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    const ctx = canvas.getContext("2d");
    let width, height;
    let dpr = Math.min(window.devicePixelRatio || 1, 2);

    function resize() {
      width = canvas.offsetWidth;
      height = canvas.offsetHeight;
      canvas.width = width * dpr;
      canvas.height = height * dpr;
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    }
    resize();
    window.addEventListener("resize", resize);

    let rockets = [];
    let particles = [];
    let lastLaunch = 0;
    const launchGap = intensity === "high" ? 480 : 850;

    function spawnIfReady(time) {
      if (time - lastLaunch > launchGap + rand(-150, 250)) {
        rockets.push(new Rocket(width, height));
        lastLaunch = time;
        if (intensity === "high" && Math.random() < 0.4) {
          rockets.push(new Rocket(width, height));
        }
      }
    }

    function frame(time) {
      ctx.fillStyle = "rgba(10, 6, 28, 0.22)";
      ctx.fillRect(0, 0, width, height);

      spawnIfReady(time);

      rockets = rockets.filter((r) => {
        r.update();
        r.draw(ctx);
        if (r.exploded) {
          r.explode(particles);
          return false;
        }
        return r.y > -20;
      });

      particles = particles.filter((p) => {
        const alive = p.update();
        if (alive) p.draw(ctx);
        return alive;
      });

      rafRef.current = requestAnimationFrame(frame);
    }

    rafRef.current = requestAnimationFrame(frame);

    return () => {
      cancelAnimationFrame(rafRef.current);
      window.removeEventListener("resize", resize);
    };
  }, [intensity]);

  return <canvas ref={canvasRef} className="fireworks-canvas" aria-hidden="true" />;
}
