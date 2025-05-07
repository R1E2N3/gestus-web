'use client';

import { useEffect } from 'react';
import anime from 'animejs/lib/anime.es.js';
import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer } from 'recharts';
import Image from 'next/image';
import heroImg from '../images/Hero.png'; 
import logoImg from '../images/logo.png';

const chartData = [
  { name: 'Fluent in Libras', value: 36 },
  { name: 'Not fluent in Libras', value: 64 },
];

export default function About() {
  useEffect(() => {
    anime({
      targets: '.about-section h1, .about-section h2',
      translateY: [-20, 0],
      opacity: [0, 1],
      delay: anime.stagger(200),
      easing: 'easeOutExpo',
    });
  }, []);

  return (
    <section className="about-section p-8 max-w-5xl mx-auto flex flex-col gap-8">
      {/* Hero Card */}
      <div className="about-card bg-white/20 backdrop-blur-md border border-[var(--accent)]/50 rounded-3xl p-8 shadow-md hover:scale-105 transition-transform">
        <h1 className="text-5xl font-extrabold accent">🚀 Welcome to Gestus!</h1>
        <p className="mt-4 text-lg text-[var(--foreground)]/80">
          Dive into Libras with our interactive, AI-powered platform—where learning sign language is fun and engaging!
        </p>
      </div>
      {/* Fluency Chart Card */}
      <div className="about-card bg-white/50 backdrop-blur-sm border border-[var(--accent)]/30 rounded-3xl p-6 shadow-md hover:scale-105 transition-transform">
        <h2 className="text-2xl font-semibold accent mb-4">📊 Libras Fluency</h2>
        <div className="h-64">
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie
                dataKey="value"
                data={chartData}
                cx="50%"
                cy="50%"
                innerRadius={60}
                outerRadius={80}
                label
              >
                {chartData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={index === 0 ? 'var(--accent)' : '#ddd'} />
                ))}
              </Pie>
              <Tooltip />
            </PieChart>
          </ResponsiveContainer>
        </div>
      </div>
      {/* Keywords Badges Card */}
      <div className="about-card bg-white/20 backdrop-blur-sm border border-[var(--accent)]/50 rounded-3xl p-6 shadow-md hover:scale-105 transition-transform">
        <h2 className="text-2xl font-semibold accent mb-4">📝 Keywords</h2>
        <div className="flex flex-wrap gap-2">
          {['Libras','AI','Computer Vision','Education','Interactive','Gamification'].map(k => (
            <span key={k} className="bg-[var(--accent)]/20 text-[var(--accent)] px-3 py-1 rounded-full">{k}</span>
          ))}
        </div>
      </div>
      {/* Quick Points Card */}
      <div className="about-card bg-white/50 backdrop-blur-sm border border-[var(--accent)]/30 rounded-3xl p-6 shadow-md hover:scale-105 transition-transform">
        <h2 className="text-2xl font-semibold accent mb-4">✨ Quick Points</h2>
        <ul className="list-disc list-inside space-y-2 text-[var(--foreground)]">
          <li>🌍 Only 36% of Brazil's deaf population is fluent in Libras</li>
          <li>🤝 Community-powered database expands daily</li>
          <li>💡 Real-time AI & computer vision feedback</li>
          <li>🎮 Gamification keeps learning exciting</li>
        </ul>
      </div>
      {/* Image Gallery Card */}
      <div className="about-card bg-white/20 backdrop-blur-sm border border-[var(--accent)]/30 rounded-3xl p-6 shadow-md hover:scale-105 transition-transform">
        <h2 className="text-2xl font-semibold accent mb-4">🖼️ Showcase</h2>
        <div className="flex flex-wrap justify-center gap-6">
          <div className="w-40 h-auto">
            <Image src={heroImg} alt="Hero" className="rounded-lg" />
          </div>
          <div className="w-24 h-auto">
            <Image src={logoImg} alt="Logo" className="rounded-full" />
          </div>
        </div>
      </div>
      {/* Call to Action */}
      <div className="text-center">
        <a href="#" className="inline-block px-6 py-3 bg-[var(--accent)] text-white rounded-full font-semibold shadow-lg hover:opacity-90 transition">
          🎉 Start Your Adventure
        </a>
      </div>
    </section>
  );
} 