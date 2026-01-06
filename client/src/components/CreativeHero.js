import React from 'react';
import { motion } from 'framer-motion';
import { FiShoppingBag, FiTruck, FiHeadphones, FiShield, FiRefreshCw, FiStar } from 'react-icons/fi';
import { BsGpuCard, BsCpu, BsSmartwatch, BsCamera } from 'react-icons/bs';
import { GiConsoleController, GiDrone, GiVRHeadset } from 'react-icons/gi';

const CreativeHero = () => {
  const floatingIcons = [
    { icon: <BsGpuCard />, delay: 0 },
    { icon: <BsCpu />, delay: 0.2 },
    { icon: <BsSmartwatch />, delay: 0.4 },
    { icon: <BsCamera />, delay: 0.6 },
    { icon: <GiConsoleController />, delay: 0.8 },
    { icon: <GiDrone />, delay: 1.0 },
    { icon: <GiVRHeadset />, delay: 1.2 }
  ];

  const features = [
    { icon: <FiTruck />, title: "Fast Delivery", desc: "Free delivery on orders over ৳25,000" },
    { icon: <FiHeadphones />, title: "24/7 Support", desc: "Dedicated customer support" },
    { icon: <FiShield />, title: "Secure Payment", desc: "100% secure transactions" },
    { icon: <FiRefreshCw />, title: "Easy Returns", desc: "30-day return policy" }
  ];

  return (
    <div className="creative-hero">
      {/* Animated Background Elements */}
      <div className="hero-background">
        <div className="gradient-orb orb-1"></div>
        <div className="gradient-orb orb-2"></div>
        <div className="gradient-orb orb-3"></div>

        {/* Floating Tech Icons */}
        {floatingIcons.map((item, index) => (
          <motion.div
            key={index}
            className="floating-icon"
            initial={{ opacity: 0, scale: 0 }}
            animate={{
              opacity: [0, 1, 0],
              scale: [0, 1, 0],
              y: [-20, -100, -20]
            }}
            transition={{
              duration: 4,
              delay: item.delay,
              repeat: Infinity,
              repeatDelay: 2
            }}
            style={{
              left: `${15 + (index * 12)}%`,
              top: `${20 + (index % 2) * 30}%`
            }}
          >
            {item.icon}
          </motion.div>
        ))}
      </div>

      {/* Main Hero Content */}
      <div className="hero-content">
        <motion.div
          className="hero-text"
          initial={{ opacity: 0, y: 50 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
        >
          <motion.h1
            className="hero-title"
            initial={{ scale: 0.8 }}
            animate={{ scale: 1 }}
            transition={{ duration: 0.5, delay: 0.2 }}
          >
            Welcome to <span className="brand-gradient">TechHub</span>
          </motion.h1>

          <motion.p
            className="hero-subtitle"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.5 }}
          >
            Discover cutting-edge technology and innovative gadgets that transform your digital life
          </motion.p>

          <motion.div
            className="hero-stats"
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.7 }}
          >
            <div className="stat-item">
              <motion.span
                className="stat-number"
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ delay: 0.8 }}
              >
                10K+
              </motion.span>
              <span className="stat-label">Products</span>
            </div>
            <div className="stat-item">
              <motion.span
                className="stat-number"
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ delay: 0.9 }}
              >
                50K+
              </motion.span>
              <span className="stat-label">Customers</span>
            </div>
            <div className="stat-item">
              <motion.span
                className="stat-number"
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ delay: 1.0 }}
              >
                24/7
              </motion.span>
              <span className="stat-label">Support</span>
            </div>
          </motion.div>

          <motion.div
            className="hero-cta"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 1.1 }}
          >
            <motion.button
              className="cta-primary"
              whileHover={{ scale: 1.05, boxShadow: "0 20px 40px rgba(14, 165, 233, 0.4)" }}
              whileTap={{ scale: 0.95 }}
            >
              <FiShoppingBag /> Shop Now
            </motion.button>

            <motion.button
              className="cta-secondary"
              whileHover={{ scale: 1.05, backgroundColor: "rgba(124, 58, 237, 0.1)" }}
              whileTap={{ scale: 0.95 }}
            >
              Explore Products
            </motion.button>
          </motion.div>
        </motion.div>

        {/* Feature Cards */}
        <motion.div
          className="features-grid"
          initial={{ opacity: 0, y: 50 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 1.3 }}
        >
          {features.map((feature, index) => (
            <motion.div
              key={index}
              className="feature-card"
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 1.4 + index * 0.1 }}
              whileHover={{
                y: -10,
                boxShadow: "0 20px 40px rgba(0, 0, 0, 0.1)"
              }}
            >
              <div className="feature-icon">{feature.icon}</div>
              <h3 className="feature-title">{feature.title}</h3>
              <p className="feature-desc">{feature.desc}</p>
            </motion.div>
          ))}
        </motion.div>
      </div>
    </div>
  );
};

export default CreativeHero;