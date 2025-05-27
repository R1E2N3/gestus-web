"use client";

import { useEffect, useRef } from "react";
import PlayfulNav from "../components/PlayfulNav";
import { motion, useAnimation, useInView } from "framer-motion";
import { useTranslation } from "../hooks/useTranslation";
import Logo from "../components/Logo";

export default function OurSolution() {
  const t = useTranslation();

  return (
    <>
      <PlayfulNav />
      <HeroSection />
      <KeyDifferentiators />
      <TargetDemographic />
      <MarketPositioning />
      {/* <BusinessStrategy /> */}
      <CallToAction />
    </>
  );
}

// Hero Section
function HeroSection() {
  const controls = useAnimation();
  const ref = useRef(null);
  const inView = useInView(ref, { once: true, amount: 0.2 });
  const t = useTranslation();

  useEffect(() => {
    if (inView) {
      controls.start("visible");
    }
  }, [controls, inView]);

  return (
    <section className="relative pt-24 pb-16 overflow-hidden bg-gradient-to-b from-[#f0f9ff] to-white">
      {/* Background decorative elements */}
      <div className="absolute top-20 right-20 w-64 h-64 rounded-full bg-[#ffd23f]/10 animate-float" />
      <div
        className="absolute bottom-20 left-20 w-80 h-80 rounded-full bg-[#009fe3]/10 animate-float"
        style={{ animationDelay: "1s" }}
      />

      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        <motion.div
          ref={ref}
          initial="hidden"
          animate={controls}
          variants={{
            hidden: { opacity: 0, y: 50 },
            visible: {
              opacity: 1,
              y: 0,
              transition: {
                duration: 0.8,
                ease: "easeOut",
              },
            },
          }}
          className="text-center mb-12"
        >
          <span className="inline-block px-4 py-1 bg-[#ffd23f]/20 text-[#ffd23f] rounded-full text-sm font-medium mb-4">
            {t.solution.heading}
          </span>
          <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold mb-6">
            {t.solution.title}
          </h1>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            {t.solution.subtitle}
          </p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.3, duration: 0.6 }}
          className="relative mx-auto max-w-3xl"
        >
          <div className="relative z-10 bg-white rounded-2xl shadow-xl p-6 md:p-10 overflow-hidden">
            <div className="absolute top-0 left-0 w-full h-full bg-gradient-to-br from-[#ffd23f]/10 to-[#009fe3]/10 z-0" />

            <div className="relative z-10 flex flex-col md:flex-row items-center gap-8">
              <div className="flex-shrink-0">
                <Logo size={180} animated={true} />
              </div>
              <div>
                <h2 className="text-2xl font-bold mb-4">
                  {t.solution.process.title}
                </h2>
                <ul className="space-y-3">
                  {t.solution.process.steps.map((step, index) => (
                    <motion.li
                      key={index}
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: 0.5 + index * 0.1 }}
                      className="flex items-center"
                    >
                      <span className="w-6 h-6 rounded-full bg-[#009fe3] text-white flex items-center justify-center mr-3 flex-shrink-0">
                        ✓
                      </span>
                      <span>{step.title}</span>
                    </motion.li>
                  ))}
                </ul>
              </div>
            </div>
          </div>

          {/* Decorative elements */}
          <div className="absolute -top-6 -right-6 w-12 h-12 bg-[#ffd23f] rounded-full" />
          <div className="absolute -bottom-6 -left-6 w-12 h-12 bg-[#009fe3] rounded-full" />
        </motion.div>
      </div>
    </section>
  );
}

// Key Differentiators Section
function KeyDifferentiators() {
  const t = useTranslation();
  const controls = useAnimation();
  const ref = useRef(null);
  const inView = useInView(ref, { once: true, amount: 0.2 });

  useEffect(() => {
    if (inView) {
      controls.start("visible");
    }
  }, [controls, inView]);

  return (
    <section className="py-20 bg-white relative overflow-hidden">
      {/* Background decorative elements */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <svg
          className="absolute top-1/4 left-10"
          width="120"
          height="120"
          viewBox="0 0 120 120"
        >
          <circle
            cx="60"
            cy="60"
            r="50"
            stroke="#ffd23f"
            strokeWidth="2"
            strokeDasharray="8 6"
            fill="none"
          />
        </svg>
        <svg
          className="absolute bottom-1/4 right-10"
          width="80"
          height="80"
          viewBox="0 0 80 80"
        >
          <circle
            cx="40"
            cy="40"
            r="30"
            stroke="#009fe3"
            strokeWidth="2"
            strokeDasharray="6 4"
            fill="none"
          />
        </svg>
      </div>

      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        <div className="text-center mb-16">
          <motion.div
            ref={ref}
            initial="hidden"
            animate={controls}
            variants={{
              hidden: { opacity: 0, y: 30 },
              visible: {
                opacity: 1,
                y: 0,
                transition: {
                  duration: 0.6,
                },
              },
            }}
          >
            <span className="inline-block px-4 py-1 bg-[#009fe3]/20 text-[#009fe3] rounded-full text-sm font-medium mb-4">
              WHAT MAKES US DIFFERENT
            </span>
            <h2 className="text-3xl md:text-4xl font-bold mb-6">
              {t.solution.features.title}
            </h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              Our unique approach to sign language education sets us apart from
              traditional methods.
            </p>
          </motion.div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {t.solution.features.items.map((feature, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 30 }}
              animate={controls}
              variants={{
                hidden: { opacity: 0, y: 30 },
                visible: {
                  opacity: 1,
                  y: 0,
                  transition: {
                    duration: 0.6,
                    delay: index * 0.2,
                  },
                },
              }}
              whileHover={{ y: -10 }}
              className="bg-white rounded-xl p-6 shadow-lg hover:shadow-xl transition-all duration-300 border border-gray-100"
            >
              <div className="w-16 h-16 rounded-full bg-gradient-to-br from-[#ffd23f]/20 to-[#009fe3]/20 flex items-center justify-center text-3xl mb-6">
                {["📊", "🧠", "🎮", "🌟"][index]}
              </div>
              <h3 className="text-xl font-bold mb-3">{feature.title}</h3>
              <p className="text-gray-600">{feature.description}</p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}

// Target Demographic Section
function TargetDemographic() {
  const t = useTranslation();

  return (
    <section className="py-20 bg-gradient-to-b from-white to-[#f0f9ff] relative overflow-hidden">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-12 items-center">
          <motion.div
            initial={{ opacity: 0, x: -50 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
          >
            <span className="inline-block px-4 py-1 bg-[#ffd23f]/20 text-[#ffd23f] rounded-full text-sm font-medium mb-4">
              WHO WE SERVE
            </span>
            <h2 className="text-3xl md:text-4xl font-bold mb-6">
              {t.solution.benefits.title}
            </h2>

            <div className="space-y-4">
              {t.solution.benefits.items.map((benefit, index) => (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, x: -20 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: 0.3 + index * 0.1 }}
                  className="flex items-start"
                >
                  <span
                    className={`w-8 h-8 rounded-full ${
                      index % 2 === 0 ? "bg-[#ffd23f]" : "bg-[#009fe3]"
                    } text-white flex items-center justify-center mr-3 flex-shrink-0`}
                  >
                    {index + 1}
                  </span>
                  <p className="text-lg">{benefit}</p>
                </motion.div>
              ))}
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, scale: 0.8 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6, delay: 0.3 }}
            className="relative"
          >
            <div className="relative mx-auto max-w-sm">
              <div className="absolute -top-6 -left-6 w-12 h-12 bg-[#ffd23f] rounded-full" />
              <div className="absolute -bottom-6 -right-6 w-12 h-12 bg-[#009fe3] rounded-full" />

              <div className="relative z-10 bg-white rounded-2xl shadow-xl p-6 overflow-hidden">
                <div className="absolute top-0 left-0 w-full h-full bg-gradient-to-br from-[#ffd23f]/5 to-[#009fe3]/5 z-0" />

                <div className="relative z-10">
                  <div className="flex justify-center mb-8">
                    <Logo size={120} animated={true} />
                  </div>

                  <div className="space-y-4">
                    <div className="flex items-center">
                      <div className="w-4 h-4 rounded-full bg-[#ffd23f] mr-3"></div>
                      <div className="text-sm font-medium">
                        Hearing students
                      </div>
                      <div className="ml-auto font-bold">65%</div>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2.5">
                      <div
                        className="bg-[#ffd23f] h-2.5 rounded-full"
                        style={{ width: "65%" }}
                      ></div>
                    </div>

                    <div className="flex items-center">
                      <div className="w-4 h-4 rounded-full bg-[#009fe3] mr-3"></div>
                      <div className="text-sm font-medium">
                        Educators & Professionals
                      </div>
                      <div className="ml-auto font-bold">25%</div>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2.5">
                      <div
                        className="bg-[#009fe3] h-2.5 rounded-full"
                        style={{ width: "25%" }}
                      ></div>
                    </div>

                    <div className="flex items-center">
                      <div className="w-4 h-4 rounded-full bg-[#7ed957] mr-3"></div>
                      <div className="text-sm font-medium">
                        General Interest
                      </div>
                      <div className="ml-auto font-bold">10%</div>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2.5">
                      <div
                        className="bg-[#7ed957] h-2.5 rounded-full"
                        style={{ width: "10%" }}
                      ></div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  );
}

// Market Positioning Section
function MarketPositioning() {
  const t = useTranslation();
  const controls = useAnimation();
  const ref = useRef(null);
  const inView = useInView(ref, { once: true, amount: 0.2 });

  useEffect(() => {
    if (inView) {
      controls.start("visible");
    }
  }, [controls, inView]);

  return (
    <section className="py-20 bg-[#f0f9ff] relative overflow-hidden">
      <div className="absolute top-0 right-0 w-1/3 h-1/3 bg-[#ffd23f]/5 rounded-bl-full" />
      <div className="absolute bottom-0 left-0 w-1/3 h-1/3 bg-[#009fe3]/5 rounded-tr-full" />

      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-12 items-center">
          <motion.div
            initial={{ opacity: 0, x: -50 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="order-2 md:order-1"
          >
            <div className="bg-white rounded-2xl shadow-lg p-8">
              <h3 className="text-xl font-bold mb-6">
                {t.solution.technology.title}
              </h3>

              <div className="space-y-6">
                <p className="text-gray-600">
                  {t.solution.technology.description}
                </p>

                {t.solution.technology.items.map((item, index) => (
                  <div key={index}>
                    <div className="flex justify-between mb-2">
                      <span className="font-medium">{item.title}</span>
                      <span
                        className={
                          index === 2
                            ? "text-[#ffd23f] font-bold"
                            : "text-gray-500"
                        }
                      >
                        {item.description}
                      </span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-3">
                      <div
                        className={`${
                          index === 2 ? "bg-[#ffd23f]" : "bg-[#009fe3]"
                        } h-3 rounded-full`}
                        style={{
                          width: `${
                            index === 0 ? "50%" : index === 1 ? "65%" : "90%"
                          }`,
                        }}
                      ></div>
                    </div>
                  </div>
                ))}

                <div className="mt-8 flex justify-center">
                  <Logo size={80} animated={true} />
                </div>
              </div>
            </div>
          </motion.div>

          <motion.div
            ref={ref}
            initial="hidden"
            animate={controls}
            variants={{
              hidden: { opacity: 0, x: 50 },
              visible: {
                opacity: 1,
                x: 0,
                transition: {
                  duration: 0.6,
                  delay: 0.3,
                },
              },
            }}
            className="order-1 md:order-2"
          >
            <span className="inline-block px-4 py-1 bg-[#009fe3]/20 text-[#009fe3] rounded-full text-sm font-medium mb-4">
              OUR POSITION
            </span>
            <h2 className="text-3xl md:text-4xl font-bold mb-6">
              {t.solution.features.title}
            </h2>
            <p className="text-xl text-gray-600 mb-6">
              Gestus stands out by offering an AI-powered, scalable solution
              that is both accessible and affordable.
            </p>

            <div className="space-y-4">
              {t.solution.benefits.items.slice(0, 5).map((item, index) => (
                <motion.div
                  key={index}
                  variants={{
                    hidden: { opacity: 0, x: 20 },
                    visible: {
                      opacity: 1,
                      x: 0,
                      transition: {
                        duration: 0.4,
                        delay: 0.5 + index * 0.1,
                      },
                    },
                  }}
                  className="flex items-start"
                >
                  <div className="w-6 h-6 rounded-full bg-[#009fe3]/20 text-[#009fe3] flex items-center justify-center mt-0.5 mr-3 flex-shrink-0">
                    ✓
                  </div>
                  <p>{item}</p>
                </motion.div>
              ))}
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  );
}

// Business Strategy Section
function BusinessStrategy() {
  return (
    <section className="py-20 bg-white relative overflow-hidden">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="text-center mb-16"
        >
          <span className="inline-block px-4 py-1 bg-[#ffd23f]/20 text-[#ffd23f] rounded-full text-sm font-medium mb-4">
            OUR APPROACH
          </span>
          <h2 className="text-3xl md:text-4xl font-bold mb-6">
            Business Strategy
          </h2>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            Our sustainable business model ensures we can continue to provide
            high-quality sign language education.
          </p>
        </motion.div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
          <motion.div
            initial={{ opacity: 0, x: -30 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
          >
            <div className="bg-white rounded-2xl shadow-xl overflow-hidden">
              <div className="bg-gradient-to-r from-[#ffd23f] to-[#009fe3] p-6">
                <h3 className="text-2xl font-bold text-white">Revenue Model</h3>
              </div>

              <div className="p-6 space-y-6">
                <div>
                  <h4 className="text-lg font-bold mb-3 flex items-center">
                    <span className="w-8 h-8 rounded-full bg-[#ffd23f] text-white flex items-center justify-center mr-3">
                      1
                    </span>
                    Subscription Tiers
                  </h4>
                  <ul className="ml-11 space-y-2">
                    <li className="flex justify-between">
                      <span>Basic Course</span>
                      <span className="font-bold">$5/month</span>
                    </li>
                    <li className="flex justify-between">
                      <span>Advanced Access</span>
                      <span className="font-bold">Up to $15/month</span>
                    </li>
                  </ul>
                </div>

                <div>
                  <h4 className="text-lg font-bold mb-3 flex items-center">
                    <span className="w-8 h-8 rounded-full bg-[#009fe3] text-white flex items-center justify-center mr-3">
                      2
                    </span>
                    Institutional Partnerships
                  </h4>
                  <ul className="ml-11 space-y-2">
                    <li className="flex justify-between">
                      <span>1-100 students</span>
                      <span className="font-bold">$3/student/month</span>
                    </li>
                    <li className="flex justify-between">
                      <span>101-500 students</span>
                      <span className="font-bold">$2/student/month</span>
                    </li>
                    <li className="flex justify-between">
                      <span>501-1,000 students</span>
                      <span className="font-bold">$1/student/month</span>
                    </li>
                    <li className="flex justify-between">
                      <span>1,500+ students</span>
                      <span className="font-bold">$1,500/month</span>
                    </li>
                  </ul>
                </div>

                <div>
                  <h4 className="text-lg font-bold mb-3 flex items-center">
                    <span className="w-8 h-8 rounded-full bg-[#7ed957] text-white flex items-center justify-center mr-3">
                      3
                    </span>
                    Teacher Connection Platform
                  </h4>
                  <ul className="ml-11 space-y-2">
                    <li className="flex justify-between">
                      <span>Commission Model</span>
                      <span className="font-bold">10% of session fees</span>
                    </li>
                    <li>
                      <span>
                        Waived Subscription: Regular students gain free access
                        to teacher services
                      </span>
                    </li>
                  </ul>
                </div>
              </div>
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, x: 30 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6, delay: 0.2 }}
          >
            <div className="bg-white rounded-2xl shadow-xl overflow-hidden h-full">
              <div className="bg-gradient-to-r from-[#009fe3] to-[#ffd23f] p-6">
                <h3 className="text-2xl font-bold text-white">
                  Revenue Projections
                </h3>
              </div>

              <div className="p-6">
                <div className="flex justify-center mb-8">
                  <Logo size={100} animated={true} />
                </div>

                <div className="space-y-6">
                  <div className="bg-[#f8f9fa] rounded-xl p-4">
                    <h4 className="font-bold mb-2">Year 1</h4>
                    <div className="flex items-center">
                      <div className="w-full bg-gray-200 rounded-full h-2.5 mr-2">
                        <div
                          className="bg-[#ffd23f] h-2.5 rounded-full"
                          style={{ width: "25%" }}
                        ></div>
                      </div>
                      <span className="whitespace-nowrap font-bold">
                        $2.5K/month
                      </span>
                    </div>
                    <p className="text-sm text-gray-600 mt-2">
                      500 monthly subscribers
                    </p>
                  </div>

                  <div className="bg-[#f8f9fa] rounded-xl p-4">
                    <h4 className="font-bold mb-2">Years 2-3</h4>
                    <div className="flex items-center">
                      <div className="w-full bg-gray-200 rounded-full h-2.5 mr-2">
                        <div
                          className="bg-[#009fe3] h-2.5 rounded-full"
                          style={{ width: "60%" }}
                        ></div>
                      </div>
                      <span className="whitespace-nowrap font-bold">
                        $10K/month
                      </span>
                    </div>
                    <p className="text-sm text-gray-600 mt-2">
                      2,000 subscribers
                    </p>
                  </div>

                  <div className="bg-[#f8f9fa] rounded-xl p-4">
                    <h4 className="font-bold mb-2">Growth Strategy</h4>
                    <ul className="text-sm space-y-2">
                      <li>
                        • One local event generated 100 sign-ups; 30% conversion
                        rate
                      </li>
                      <li>
                        • 50 new users/month (30 from events + 20 via social
                        media)
                      </li>
                      <li>
                        • 600 new users/year → $3,000 annual revenue at $5/user
                      </li>
                    </ul>
                  </div>
                </div>
              </div>
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  );
}

// Call to Action Section
function CallToAction() {
  const t = useTranslation();

  return (
    <section className="py-20 bg-gradient-to-b from-[#f0f9ff] to-white relative overflow-hidden">
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-1/4 right-1/4 w-64 h-64 rounded-full bg-[#ffd23f]/10 animate-float" />
        <div
          className="absolute bottom-1/4 left-1/4 w-80 h-80 rounded-full bg-[#009fe3]/10 animate-float"
          style={{ animationDelay: "1s" }}
        />
      </div>

      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="text-center"
        >
          <span className="inline-block px-4 py-1 bg-[#009fe3]/20 text-[#009fe3] rounded-full text-sm font-medium mb-4">
            JOIN US
          </span>
          <h2 className="text-3xl md:text-4xl font-bold mb-6">
            {t.about.cta.title}
          </h2>
          <p className="text-xl text-gray-600 mb-10 max-w-2xl mx-auto">
            {t.about.cta.content}
          </p>

          <motion.div
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            className="inline-block"
          >
            <a
              href="/prototype"
              className="inline-flex items-center px-8 py-4 bg-gradient-to-r from-[#009fe3] to-[#ffd23f] text-white rounded-full font-bold text-lg shadow-lg hover:shadow-xl transition-all duration-300"
            >
              <span>{t.about.cta.button}</span>
              <svg
                className="ml-2 w-5 h-5 animate-bounce"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2"
                  d="M14 5l7 7m0 0l-7 7m7-7H3"
                ></path>
              </svg>
            </a>
          </motion.div>

          <div className="mt-12 flex justify-center">
            <Logo size={120} animated={true} />
          </div>
        </motion.div>
      </div>
    </section>
  );
}
