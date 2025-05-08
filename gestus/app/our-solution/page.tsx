'use client';
import { useEffect } from 'react';
import anime from 'animejs/lib/anime.es.js';
 
export default function OurSolution() {
  useEffect(() => {
    anime({
      targets: '.solution-section h1, .solution-section h2, .solution-section h3',
      translateY: [-20, 0],
      opacity: [0, 1],
      delay: anime.stagger(150),
      easing: 'easeOutExpo',
    });
  }, []);

  return (
    <section className="solution-section p-8 max-w-5xl mx-auto flex flex-col gap-8">
      {/* Hero Card */}
      <div className="bg-white/20 backdrop-blur-md border border-blue-300/50 rounded-3xl p-8 shadow-md hover:scale-105 transition-transform">
        <h1 className="text-5xl font-extrabold accent">Teaching sign language at low cost using AI</h1>
        <p className="mt-4 text-lg text-[var(--foreground)]/80">
          Gestus offers an AI-driven app that delivers immersive sign language lessons through the largest proprietary database of signs. Our platform uses advanced AI to provide personalised, interactive, and engaging learning experiences.
        </p>
      </div>
      {/* Key Differentiators Card */}
      <div className="bg-white/50 backdrop-blur-sm border border-gray-200/70 rounded-3xl p-6 shadow-md hover:scale-105 transition-transform">
        <h2 className="text-2xl font-semibold accent mb-4">Key Differentiators</h2>
        <ul className="list-disc list-inside space-y-2 text-[var(--foreground)]">
          <li><strong>Proprietary Database:</strong> The most extensive collection of signs, ensuring comprehensive coverage and accuracy.</li>
          <li><strong>AI-Driven Personalization:</strong> Tailors lessons to individual learning paces and styles, enhancing effectiveness.</li>
          <li><strong>Immersive Learning:</strong> Interactive modules and real-time feedback facilitate better retention and practical application.</li>
        </ul>
      </div>
      {/* Target Demographic Card */}
      <div className="bg-white/20 backdrop-blur-sm border border-green-300/50 rounded-3xl p-6 shadow-md hover:scale-105 transition-transform">
        <h2 className="text-2xl font-semibold accent mb-4">Target Demographic</h2>
        <p className="text-[var(--foreground)]"><strong>Primary Users:</strong> Deaf individuals seeking to enhance their communication skills.</p>
        <p className="mt-2 text-[var(--foreground)]"><strong>Secondary Users:</strong> Hearing individuals aiming to learn sign language for personal or professional reasons, including educators and employers.</p>
      </div>
      {/* Market Positioning Card */}
      <div className="bg-white/50 backdrop-blur-sm border border-yellow-300/50 rounded-3xl p-6 shadow-md hover:scale-105 transition-transform">
        <h2 className="text-2xl font-semibold accent mb-4">Market Positioning</h2>
        <p className="text-[var(--foreground)]">
          Gestus stands out by offering an AI-powered, scalable solution that is both accessible and affordable. Unlike traditional methods, our platform provides continuous updates and improvements, ensuring users have access to the latest educational content.
        </p>
      </div>
      {/* First-to-Market Potential Card */}
      <div className="bg-white/20 backdrop-blur-sm border border-blue-300/50 rounded-3xl p-6 shadow-md hover:scale-105 transition-transform">
        <h2 className="text-2xl font-semibold accent mb-4">First-to-Market Potential</h2>
        <p className="text-[var(--foreground)]">
          By leveraging cutting-edge AI technology and a vast sign database, Gestus is poised to lead the market in sign language education, setting new standards for accessibility and user engagement.
        </p>
      </div>
      {/* Business Strategy Card */}
      <div className="bg-white/50 backdrop-blur-sm border border-purple-300/50 rounded-3xl p-6 shadow-md hover:scale-105 transition-transform">
        <h2 className="text-2xl font-semibold accent mb-4">Business Strategy</h2>
        <h3 className="text-xl font-semibold accent mb-2">Revenue Model:</h3>
        <ul className="list-disc list-inside space-y-1 text-[var(--foreground)] mb-4">
          <li><strong>Subscription Tiers:</strong>
            <ul className="list-disc list-inside ml-6">
              <li>Basic Course: $5/month</li>
              <li>Advanced Access: Up to $15/month for full access to the AI chatbot and advanced features</li>
            </ul>
          </li>
          <li><strong>Institutional Partnerships:</strong>
            <ul className="list-disc list-inside ml-6">
              <li>Private Schools:
                <ul className="list-disc list-inside ml-6">
                  <li>1-100 students: $3/student/month</li>
                  <li>101-500 students: $2/student/month</li>
                  <li>501-1,000 students: $1/student/month</li>
                  <li>1,500+ students: $1,500/month</li>
                </ul>
              </li>
            </ul>
          </li>
          <li><strong>Teacher Connection Platform:</strong>
            <ul className="list-disc list-inside ml-6">
              <li>Commission Model: 10% of session fees</li>
              <li>Waived Subscription: Regular students gain free access to teacher services</li>
            </ul>
          </li>
        </ul>
        <h3 className="text-xl font-semibold accent mb-2">Revenue Projections:</h3>
        <ul className="list-disc list-inside space-y-1 text-[var(--foreground)]">
          <li>Year 1: 500 monthly subscribers, generating $2.5K in monthly revenue</li>
          <li>Years 2-3: Scaling to reach $10K in revenue and 2,000 subscribers</li>
          <li>One local event generated 100 sign-ups; with a 30% conversion rate, 30 become paying users per event.</li>
          <li>50 new users/month (30 from events + 20 via social media) → 600 new users/year → $3,000 annual revenue at $5/user.</li>
        </ul>
      </div>
      {/* Call to Action */}
      <div className="text-center">
        <a href="#" className="inline-block px-6 py-3 bg-[var(--accent)] text-white rounded-full font-semibold shadow-lg hover:opacity-90 transition">
          🚀 Join the Fun
        </a>
      </div>
    </section>
  );
} 