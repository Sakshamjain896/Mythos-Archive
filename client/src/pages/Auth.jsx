import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Mail, Lock, Eye, EyeOff, Globe } from 'lucide-react';
import styles from './Auth.module.css';

const SLIDES = [
  {
    image: '/images/museum.webp',
    title: 'DISCOVER HISTORY.',
    subtitle: 'OWN TOMORROW.',
    description: 'Step into a world where time stands still. Explore the high-fidelity 3D archives of our shared human legacy.'
  },
  {
    image: '/images/rome.avif',
    title: 'STRENGTH IN MARBLE.',
    subtitle: 'LEGACY IN LAW.',
    description: 'Witness the stoic majesty of the Roman Republic and the architectural marvels that defined an empire.'
  },
  {
    image: '/images/india.avif',
    title: 'DIVINE RHYTHM.',
    subtitle: 'ETERNAL SPIRIT.',
    description: 'Feel the cosmic dance of the Nataraja and the deep spiritual heritage of the Indian subcontinent.'
  },
  {
    image: '/images/mayan.webp',
    title: 'STARS & JADE.',
    subtitle: 'MYSTIC LINEAGE.',
    description: 'Unravel the astronomical mysteries and the sacred rituals of the jungle-shrouded Mayan temples.'
  }
];

const Auth = ({ onAuthenticate }) => {
  const [isLogin, setIsLogin] = useState(true);
  const [showPassword, setShowPassword] = useState(false);
  const [currentSlide, setCurrentSlide] = useState(0);

  // Auto-slide logic
  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % SLIDES.length);
    }, 6000); // 6 seconds for a more relaxed premium feel
    return () => clearInterval(timer);
  }, []);

  const containerVariants = {
    initial: { opacity: 0, y: 20 },
    animate: { opacity: 1, y: 0, transition: { duration: 0.8, ease: [0.16, 1, 0.3, 1] } },
    exit: { opacity: 0, y: -20, transition: { duration: 0.5 } }
  };

  const formVariants = {
    initial: { opacity: 0, x: 20 },
    animate: { opacity: 1, x: 0, transition: { duration: 0.5, delay: 0.2 } },
    exit: { opacity: 0, x: -20, transition: { duration: 0.3 } }
  };

  return (
    <div className={styles.authContainer}>
      <motion.div 
        className={styles.authCard}
        variants={containerVariants}
        initial="initial"
        animate="animate"
      >
        {/* Left Side: Functional Slider with Local Images */}
        <div className={styles.visualSide}>
          <AnimatePresence mode="wait">
            <motion.div
              key={currentSlide}
              className={styles.slideBackground}
              initial={{ opacity: 0, scale: 1.15, filter: 'blur(10px)' }}
              animate={{ opacity: 1, scale: 1, filter: 'blur(0px)' }}
              exit={{ opacity: 0, scale: 0.95, filter: 'blur(10px)' }}
              transition={{ duration: 1.8, ease: "easeInOut" }}
              style={{ backgroundImage: `url(${SLIDES[currentSlide].image})` }}
            />
          </AnimatePresence>
          
          <div className={styles.visualOverlay} />

          <div className={styles.logo}>
            <div className={styles.logoIcon}>
              <Globe size={20} color="#d4af37" />
            </div>
            <span>Mythos</span>
          </div>
          
          <div className={styles.visualContent}>
            <AnimatePresence mode="wait">
              <motion.div
                key={currentSlide + '-text'}
                initial={{ opacity: 0, y: 30, filter: 'blur(5px)' }}
                animate={{ opacity: 1, y: 0, filter: 'blur(0px)' }}
                exit={{ opacity: 0, y: -20, filter: 'blur(5px)' }}
                transition={{ duration: 1, delay: 0.4 }}
              >
                <h3 className={styles.serifSmall}>{SLIDES[currentSlide].title}</h3>
                <h1 className={styles.serifLarge}>{SLIDES[currentSlide].subtitle}</h1>
                <p className={styles.description}>
                  {SLIDES[currentSlide].description}
                </p>
              </motion.div>
            </AnimatePresence>
            
            <div className={styles.pagination}>
              {SLIDES.map((_, index) => (
                <span 
                  key={index} 
                  className={index === currentSlide ? styles.activeDot : styles.dot}
                  onClick={() => setCurrentSlide(index)}
                />
              ))}
            </div>
          </div>
        </div>

        {/* Right Side: Form */}
        <div className={styles.formSide}>
          <div className={styles.topNav}>
            <button 
              className={styles.ghostButton}
              onClick={() => setIsLogin(!isLogin)}
            >
              {isLogin ? 'Sign up' : 'Sign in'}
            </button>
          </div>

          <AnimatePresence mode="wait">
            <motion.div 
              key={isLogin ? 'login' : 'signup'}
              className={styles.formContent}
              variants={formVariants}
              initial="initial"
              animate="animate"
              exit="exit"
            >
              <h2 className={styles.formTitle}>
                {isLogin ? 'Welcome Back to Mythos!' : 'Begin Your Journey'}
              </h2>
              <div className={styles.separator}>
                <div className={styles.sepIcon}>◇</div>
              </div>
              <p className={styles.formSubtitle}>
                {isLogin ? 'Sign in to continue your journey' : 'Create an account to preserve your legacy'}
              </p>

              <div className={styles.inputGroup}>
                <label>Your Email</label>
                <div className={styles.inputWrapper}>
                  <Mail className={styles.inputIcon} size={18} />
                  <input type="email" placeholder="info.mythos@archive.com" />
                </div>
              </div>

              <div className={styles.inputGroup}>
                <label>Password</label>
                <div className={styles.inputWrapper}>
                  <Lock className={styles.inputIcon} size={18} />
                  <input 
                    type={showPassword ? 'text' : 'password'} 
                    placeholder="••••••••••••" 
                  />
                  <button 
                    className={styles.eyeToggle}
                    onClick={() => setShowPassword(!showPassword)}
                  >
                    {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                  </button>
                </div>
              </div>

              {isLogin && (
                <div className={styles.formExtras}>
                  <label className={styles.checkboxLabel}>
                    <input type="checkbox" />
                    <span>Remember Me</span>
                  </label>
                  <a href="#" className={styles.forgotPass}>Forgot Password?</a>
                </div>
              )}

              <button className={styles.mainButton} onClick={onAuthenticate}>
                {isLogin ? 'Login' : 'Create Account'}
              </button>

              <div className={styles.socialSeparator}>
                <span>Instant {isLogin ? 'Login' : 'Signup'}</span>
              </div>

              <div className={styles.socialButtons}>
                <button className={styles.socialBtn}>
                  <img src="https://www.gstatic.com/images/branding/product/1x/gsa_512dp.png" alt="Google" />
                  Continue with Google
                </button>
                <button className={styles.socialBtn}>
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="#1877F2">
                    <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.469h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/>
                  </svg>
                  Continue with Facebook
                </button>
              </div>

              <p className={styles.switchText}>
                {isLogin ? "Don't have an account? " : "Already have an account? "}
                <span onClick={() => setIsLogin(!isLogin)}>
                  {isLogin ? 'Register' : 'Login'}
                </span>
              </p>
            </motion.div>
          </AnimatePresence>
        </div>
      </motion.div>
    </div>
  );
};

export default Auth;