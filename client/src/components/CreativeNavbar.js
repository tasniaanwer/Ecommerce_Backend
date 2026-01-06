import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { FiMenu, FiX, FiShoppingCart, FiSearch, FiUser, FiChevronDown, FiStar, FiPackage } from 'react-icons/fi';
import { BsGpuCard, BsCpuFill } from 'react-icons/bs';

const CreativeNavbar = () => {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const [cartCount, setCartCount] = useState(3);

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 50);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const navItems = [
    { name: 'Home', href: '/', icon: <FiPackage /> },
    {
      name: 'Products',
      href: '/products',
      icon: <BsGpuCard />,
      dropdown: ['Laptops', 'Smartphones', 'Tablets', 'Accessories']
    },
    { name: 'Categories', href: '/categories', icon: <BsCpuFill /> },
    { name: 'Deals', href: '/deals', icon: <FiStar /> },
    { name: 'About', href: '/about', icon: <FiUser /> }
  ];

  const mobileMenuVariants = {
    initial: { opacity: 0, y: -20 },
    animate: {
      opacity: 1,
      y: 0,
      transition: {
        duration: 0.3,
        staggerChildren: 0.1
      }
    },
    exit: {
      opacity: 0,
      y: -20,
      transition: {
        duration: 0.2
      }
    }
  };

  const cartVariants = {
    initial: { scale: 0 },
    animate: {
      scale: 1,
      transition: {
        type: "spring",
        stiffness: 200,
        damping: 10
      }
    },
    hover: {
      scale: 1.2,
      rotate: 15,
      transition: {
        duration: 0.2
      }
    }
  };

  return (
    <>
      <motion.nav
        className={`creative-navbar ${scrolled ? 'scrolled' : ''}`}
        initial={{ y: -100 }}
        animate={{ y: 0 }}
        transition={{ duration: 0.5, ease: "easeOut" }}
      >
        <div className="navbar-container">
          {/* Logo Section */}
          <motion.div
            className="navbar-brand"
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            <div className="brand-logo">
              <motion.div
                className="logo-icon"
                animate={{
                  rotate: [0, 360],
                  scale: [1, 1.1, 1]
                }}
                transition={{
                  duration: 2,
                  repeat: Infinity,
                  repeatDelay: 3
                }}
              >
                📱
              </motion.div>
              <div className="brand-text">
                <span className="brand-name">TechHub</span>
                <span className="brand-tagline">Innovation Hub</span>
              </div>
            </div>
          </motion.div>

          {/* Desktop Navigation */}
          <div className="desktop-nav">
            {navItems.map((item, index) => (
              <div key={index} className="nav-item-wrapper">
                {item.dropdown ? (
                  <motion.div
                    className="nav-item with-dropdown"
                    whileHover={{ y: -2 }}
                  >
                    <motion.a
                      href={item.href}
                      className="nav-link"
                      whileHover={{ scale: 1.05 }}
                    >
                      <span className="nav-icon">{item.icon}</span>
                      {item.name}
                      <FiChevronDown className="dropdown-arrow" />
                    </motion.a>

                    {/* Dropdown Menu */}
                    <motion.div
                      className="dropdown-menu"
                      initial={{ opacity: 0, y: -10 }}
                      whileHover={{ opacity: 1, y: 0 }}
                      transition={{ duration: 0.2 }}
                    >
                      {item.dropdown.map((subItem, subIndex) => (
                        <motion.a
                          key={subIndex}
                          href={`/${subItem.toLowerCase()}`}
                          className="dropdown-item"
                          initial={{ x: -20, opacity: 0 }}
                          whileHover={{ x: 0, opacity: 1 }}
                          transition={{ delay: subIndex * 0.05 }}
                        >
                          {subItem}
                        </motion.a>
                      ))}
                    </motion.div>
                  </motion.div>
                ) : (
                  <motion.a
                    href={item.href}
                    className="nav-link"
                    whileHover={{ y: -2, scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                  >
                    <span className="nav-icon">{item.icon}</span>
                    {item.name}
                  </motion.a>
                )}
              </div>
            ))}
          </div>

          {/* Right Section */}
          <div className="navbar-actions">
            {/* Search Bar */}
            <motion.div
              className="search-container"
              initial={{ width: 0, opacity: 0 }}
              animate={{ width: 'auto', opacity: 1 }}
              transition={{ delay: 0.5 }}
            >
              <motion.input
                type="text"
                placeholder="Search gadgets..."
                className="search-input"
                whileFocus={{ width: 250, boxShadow: "0 0 0 3px rgba(14, 165, 233, 0.1)" }}
              />
              <FiSearch className="search-icon" />
            </motion.div>

            {/* Cart */}
            <motion.div
              className="cart-container"
              variants={cartVariants}
              initial="initial"
              animate="animate"
              whileHover="hover"
            >
              <div className="cart-icon-wrapper">
                <FiShoppingCart className="cart-icon" />
                <AnimatePresence>
                  {cartCount > 0 && (
                    <motion.span
                      className="cart-count"
                      initial={{ scale: 0, rotate: -180 }}
                      animate={{ scale: 1, rotate: 0 }}
                      exit={{ scale: 0, rotate: 180 }}
                      transition={{ type: "spring", stiffness: 200 }}
                    >
                      {cartCount}
                    </motion.span>
                  )}
                </AnimatePresence>
              </div>
            </motion.div>

            {/* User Account */}
            <motion.button
              className="user-btn"
              whileHover={{ scale: 1.1, rotate: 10 }}
              whileTap={{ scale: 0.9 }}
            >
              <FiUser />
            </motion.button>

            {/* Mobile Menu Toggle */}
            <motion.button
              className="mobile-menu-toggle"
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.9 }}
            >
              <AnimatePresence mode="wait">
                {isMobileMenuOpen ? (
                  <FiX key="close" />
                ) : (
                  <FiMenu key="menu" />
                )}
              </AnimatePresence>
            </motion.button>
          </div>
        </div>

        {/* Mobile Navigation Menu */}
        <AnimatePresence>
          {isMobileMenuOpen && (
            <motion.div
              className="mobile-menu"
              variants={mobileMenuVariants}
              initial="initial"
              animate="animate"
              exit="exit"
            >
              <div className="mobile-menu-content">
                {navItems.map((item, index) => (
                  <motion.a
                    key={index}
                    href={item.href}
                    className="mobile-nav-link"
                    variants={mobileMenuVariants}
                    whileHover={{ x: 10 }}
                    onClick={() => setIsMobileMenuOpen(false)}
                  >
                    <span className="mobile-nav-icon">{item.icon}</span>
                    {item.name}
                  </motion.a>
                ))}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </motion.nav>

      {/* Spacer for fixed navbar */}
      <div className="navbar-spacer"></div>
    </>
  );
};

export default CreativeNavbar;