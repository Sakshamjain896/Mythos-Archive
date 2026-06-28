import { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence, useScroll, useTransform, useSpring } from 'framer-motion';
import { ArrowRight, Mail, Landmark, Compass, BookOpen } from 'lucide-react';
import Auth from './Auth';
import styles from './Landing.module.css';

const AboutSection = () => {
  const containerVariants = {
    initial: {},
    animate: {
      transition: {
        staggerChildren: 0.2
      }
    }
  };

  const itemVariants = {
    initial: { opacity: 0, y: 30 },
    whileInView: {
      opacity: 1,
      y: 0,
      transition: { duration: 0.8, ease: [0.16, 1, 0.3, 1] }
    }
  };

  return (
    <section className={styles.aboutSection}>
      <motion.h2
        className={styles.aboutTitle}
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ duration: 1.2 }}
      >
        PRESERVING THE ECHOES OF TIME
      </motion.h2>

      <motion.div
        className={styles.aboutGrid}
        variants={containerVariants}
        initial="initial"
        whileInView="whileInView"
        viewport={{ once: true, margin: "-100px" }}
      >
        <motion.div className={styles.aboutCol} variants={itemVariants}>
          <Compass className={styles.aboutIcon} size={32} />
          <h3>THE VISION</h3>
          <p>Our mission is to safeguard the fragmented history of mankind by building an indestructible digital sanctuary. Time and the elements constantly threaten our physical heritage, but by digitizing these artifacts into high-fidelity 3D assets, we transcend physical decay. The Mythos Archive was conceived as a bridge between the ancient world and the modern mind, ensuring that the foundational stories, philosophies, and artistry of early civilizations remain universally accessible for eternity. We aren't just archiving objects; we are preserving the collective memory of humanity for future generations.</p>
        </motion.div>

        <motion.div className={styles.aboutCol} variants={itemVariants}>
          <Landmark className={styles.aboutIcon} size={32} />
          <h3>AI CURATION</h3>
          <p>Leveraging state-of-the-art neural networks, we go beyond simple storage to actively categorize, contextualize, and digitally restore forgotten artifacts. Our AI curation engines cross-reference global mythologies and historical data to provide deep, interactive insights that were previously lost to the ravages of time. By analyzing patterns in ancient craftsmanship and texts, the system dynamically generates the educational layers you explore, connecting the dots between isolated cultures to tell the unified story of human progress.</p>
        </motion.div>

        <motion.div className={styles.aboutCol} variants={itemVariants}>
          <BookOpen className={styles.aboutIcon} size={32} />
          <h3>THE TECHNOLOGY</h3>
          <p>The Mythos Archive pushes the boundaries of modern web architecture. Utilizing advanced WebGL rendering, React Three Fiber, and custom procedural shaders, we bring interactive, museum-quality artifacts directly to your browser without the need for heavy downloads. Every 3D model, lighting environment, and volumetric background is rigorously optimized for high-performance visual fidelity. Whether you are navigating the archive on a flagship workstation or an ultra-portable laptop, the experience remains cinematic, immersive, and buttery smooth.</p>
        </motion.div>
      </motion.div>
    </section>
  );
};

const PremiumFooter = () => {
  return (
    <footer className={styles.footer}>
      <div className={styles.footerBrand}>
        <div className={styles.footerLogo}>
          <Landmark size={18} color="#d4af37" />
          <span>MYTHOS</span>
        </div>
        <p className={styles.footerTagline}>The global repository for digital heritage.</p>
      </div>

      <div className={styles.footerNewsletter}>
        <div className={styles.newsletterInput}>
          <input type="email" placeholder="JOIN THE ARCHIVE" />
          <Mail size={16} color="rgba(212, 175, 55, 0.6)" />
        </div>
      </div>

      <div className={styles.footerLinks}>
        <a href="#">PRIVACY</a>
        <a href="#">TERMS</a>
        <a href="#">CONTACT</a>
      </div>
    </footer>
  );
};

const Landing = ({ onAuthenticate }) => {
  const [showAuth, setShowAuth] = useState(false);
  const videoRef = useRef(null);
  // const scrollRef = useRef(null);
  const { scrollYProgress } = useScroll();
  const smoothProgress = useSpring(scrollYProgress, { stiffness: 100, damping: 30, restDelta: 0.001 });

  // Parallax transformations
  const heroOpacity = useTransform(smoothProgress, [0, 0.3], [1, 0]);
  const heroScale = useTransform(smoothProgress, [0, 0.3], [1, 0.95]);
  const heroY = useTransform(smoothProgress, [0, 0.3], [0, -50]);

  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;

    let unmuteHandler = null;
    video.muted = false;
    video.play().catch(() => {
      video.muted = true;
      video.play();
      unmuteHandler = () => {
        if (videoRef.current) {
          videoRef.current.muted = false;
          videoRef.current.play().catch(() => { });
        }
        window.removeEventListener('click', unmuteHandler);
      };
      window.addEventListener('click', unmuteHandler);
    });

    return () => {
      if (unmuteHandler) window.removeEventListener('click', unmuteHandler);
    };
  }, []);

  return (
    <div className={styles.scrollContainer}>
      <AnimatePresence mode="wait">
        {!showAuth ? (
          <div key="narrative-content">
            {/* FIXED BACKGROUND LAYER */}
            <div className={styles.fixedHero}>
              <video
                ref={videoRef}
                src="/audio/.mp4/hero-bg.mp4"
                autoPlay
                loop
                playsInline
                poster="/images/museum.webp"
                className={styles.videoBackground}
              />
              <div className={styles.overlay} />
            </div>

            {/* SCROLL CONTENT */}
            <section className={styles.heroSection}>
              <motion.div
                style={{ opacity: heroOpacity, scale: heroScale, y: heroY }}
                className={styles.content}
              >
                <motion.h1
                  className={styles.title}
                  initial={{ opacity: 0, scale: 0.9, filter: 'blur(10px)' }}
                  animate={{ opacity: 1, scale: 1, filter: 'blur(0px)' }}
                  transition={{ duration: 2, ease: [0.16, 1, 0.3, 1] }}
                >
                  THE MYTHOS ARCHIVE
                </motion.h1>

                <motion.p
                  className={styles.subtitle}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 1.5, delay: 0.5, ease: "easeOut" }}
                >
                  An AI-curated 3D museum exploring the forgotten echoes of history.
                </motion.p>

                <motion.button
                  className={styles.button}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 1.5, delay: 0.8, ease: "easeOut" }}
                  onClick={() => setShowAuth(true)}
                >
                  <span>Enter the Void</span>
                  <ArrowRight className={styles.icon} size={18} />
                </motion.button>
              </motion.div>
            </section>

            {/* ABOUT SECTION */}
            <AboutSection />

            {/* FOOTER SECTION */}
            <PremiumFooter />

            {/* KINETIC SCROLL INDICATOR */}
            <div className={styles.scrollIndicator}>
              <motion.div
                className={styles.scrollProgress}
                style={{ height: smoothProgress }}
              />
            </div>
          </div>
        ) : (
          <motion.div
            key="auth-container"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className={styles.authWrapper}
          >
            <Auth onAuthenticate={onAuthenticate} />
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default Landing;
