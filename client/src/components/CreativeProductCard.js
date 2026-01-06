import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { FiShoppingCart, FiHeart, FiEye, FiStar, FiZap, FiPackage, FiShield } from 'react-icons/fi';
import { BsClock, BsTruck } from 'react-icons/bs';

const CreativeProductCard = ({ product, onAddToCart, onViewDetails, disabled }) => {
  const [isHovered, setIsHovered] = useState(false);
  const [isLiked, setIsLiked] = useState(false);

  const cardVariants = {
    initial: { opacity: 0, y: 50 },
    animate: {
      opacity: 1,
      y: 0,
      transition: {
        duration: 0.5,
        ease: "easeOut"
      }
    },
    hover: {
      y: -15,
      transition: {
        duration: 0.3,
        ease: "easeOut"
      }
    }
  };

  const badgeVariants = {
    initial: { scale: 0, rotate: -180 },
    animate: {
      scale: 1,
      rotate: 0,
      transition: {
        delay: 0.2,
        type: "spring",
        stiffness: 200
      }
    }
  };

  const buttonVariants = {
    initial: { x: 50, opacity: 0 },
    animate: {
      x: 0,
      opacity: 1,
      transition: {
        delay: 0.3,
        type: "spring",
        stiffness: 100
      }
    }
  };

  const getBadgeColor = (badge) => {
    const colors = {
      'New': 'from-green-400 to-green-600',
      'Hot': 'from-red-400 to-orange-600',
      'Sale': 'from-purple-400 to-purple-600',
      'Limited': 'from-blue-400 to-blue-600'
    };
    return colors[badge] || 'from-gray-400 to-gray-600';
  };

  return (
    <motion.div
      className="creative-product-card"
      variants={cardVariants}
      initial="initial"
      animate="animate"
      whileHover="hover"
      onHoverStart={() => setIsHovered(true)}
      onHoverEnd={() => setIsHovered(false)}
      layout
    >
      {/* Product Image Container with 3D Effect */}
      <motion.div
        className="product-image-container"
        whileHover={{ scale: 1.05 }}
        transition={{ duration: 0.3 }}
      >
        <div className="image-placeholder">
          <div className="tech-pattern"></div>
          <div className="product-icon">
            {product.category?.includes('phone') ? '📱' :
             product.category?.includes('laptop') ? '💻' :
             product.category?.includes('watch') ? '⌚' :
             product.category?.includes('camera') ? '📷' :
             product.category?.includes('headphone') ? '🎧' : '📦'}
          </div>
        </div>

        {/* Floating Badges */}
        <AnimatePresence>
          {product.isNew && (
            <motion.div
              className={`product-badge new ${getBadgeColor('New')}`}
              variants={badgeVariants}
              initial="initial"
              animate="animate"
              exit={{ scale: 0, rotate: 180 }}
            >
              New
            </motion.div>
          )}

          {product.isHot && (
            <motion.div
              className={`product-badge hot ${getBadgeColor('Hot')}`}
              variants={badgeVariants}
              initial="initial"
              animate="animate"
              exit={{ scale: 0, rotate: 180 }}
              style={{ top: '60px' }}
            >
              <FiZap /> Hot
            </motion.div>
          )}
        </AnimatePresence>

        {/* Quick Actions */}
        <motion.div
          className="quick-actions"
          initial={{ opacity: 0 }}
          animate={{
            opacity: isHovered ? 1 : 0,
            y: isHovered ? 0 : 20
          }}
          transition={{ duration: 0.2 }}
        >
          <motion.button
            className="action-btn like-btn"
            whileHover={{ scale: 1.2, rotate: 15 }}
            whileTap={{ scale: 0.9 }}
            onClick={() => setIsLiked(!isLiked)}
          >
            <FiHeart className={isLiked ? 'filled' : ''} />
          </motion.button>

          <motion.button
            className="action-btn view-btn"
            whileHover={{ scale: 1.2, rotate: -15 }}
            whileTap={{ scale: 0.9 }}
            onClick={onViewDetails}
          >
            <FiEye />
          </motion.button>
        </motion.div>
      </motion.div>

      {/* Product Content */}
      <motion.div
        className="product-content"
        animate={{
          backgroundColor: isHovered ? 'rgba(255, 255, 255, 0.98)' : 'rgba(255, 255, 255, 0.95)'
        }}
      >
        {/* Product Category */}
        <motion.div
          className="product-category"
          animate={{
            color: isHovered ? '#0ea5e9' : '#6b7280'
          }}
        >
          {product.category?.toUpperCase() || 'TECH'}
        </motion.div>

        {/* Product Title */}
        <motion.h3
          className="product-title"
          layoutId={`title-${product._id}`}
        >
          {product.name}
        </motion.h3>

        {/* Product Description */}
        <motion.p
          className="product-description"
          animate={{
            height: isHovered ? 'auto' : '40px',
            opacity: isHovered ? 1 : 0.7
          }}
        >
          {product.description || 'Latest technology and innovation in one device'}
        </motion.p>

        {/* Product Features */}
        <AnimatePresence>
          {isHovered && (
            <motion.div
              className="product-features"
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              transition={{ duration: 0.3 }}
            >
              <div className="feature-item">
                <BsTruck />
                <span>Free Delivery</span>
              </div>
              <div className="feature-item">
                <FiShield />
                <span>1 Year Warranty</span>
              </div>
              <div className="feature-item">
                <BsClock />
                <span>24h Dispatch</span>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Rating */}
        <div className="product-rating">
          <div className="stars">
            {[...Array(5)].map((_, i) => (
              <FiStar
                key={`${product._id || product.id}-star-${i}`}
                className={`star ${i < (product.rating || 4) ? 'filled' : ''}`}
              />
            ))}
          </div>
          <span className="rating-text">({product.reviews || 128})</span>
        </div>

        {/* Product Footer */}
        <motion.div
          className="product-footer"
          layout
        >
          <div className="price-section">
            <motion.div
              className="current-price"
              animate={{
                scale: isHovered ? 1.1 : 1,
                color: isHovered ? '#0ea5e9' : '#10b981'
              }}
            >
              ৳{product.price || '99.99'}
            </motion.div>

            {product.originalPrice && (
              <div className="original-price">
                ৳{product.originalPrice}
              </div>
            )}
          </div>

          <motion.div
            className="action-buttons"
            variants={buttonVariants}
            initial="initial"
            animate="animate"
          >
            <motion.button
              className="cart-btn"
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              layoutId={`cart-${product._id}`}
              onClick={onAddToCart}
              disabled={disabled}
              style={{
                opacity: disabled ? 0.5 : 1,
                cursor: disabled ? 'not-allowed' : 'pointer'
              }}
            >
              <FiShoppingCart />
              <span>{disabled ? 'Out of Stock' : 'Add'}</span>
            </motion.button>
          </motion.div>
        </motion.div>
      </motion.div>

      {/* Glow Effect on Hover */}
      <motion.div
        className="glow-effect"
        animate={{
          opacity: isHovered ? 0.3 : 0,
          scale: isHovered ? 1.2 : 0.8
        }}
        transition={{ duration: 0.5 }}
      />
    </motion.div>
  );
};

export default CreativeProductCard;