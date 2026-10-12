import { useEffect, useState } from "react";
import "@/App.css";


const REGISTER_URL = "https://tally.so/r/rjgQ9v";
const ORGANIZER_URL = "https://tally.so/r/Y5Eyaz";
const INSTAGRAM_URL =
  "https://www.instagram.com/ballers.play?igsh=MXg4MnR2cDdhZWhh&utm_source=qr";
const CONTACT_EMAIL = "ballerplay.2024@gmail.com";
const VIDEO_URL =
  "https://customer-assets.emergentagent.com/job_ba99f296-f872-493d-ac5a-68fd843b5323/artifacts/y2g5eoch_A_cinematic%2C_high-contrast_animation_based_on_a_white_silhouette_logo_of_a_soccer_player_on_a_solid__seed1924638786.mp4";
const LOGO_SRC = "/LogoEnhanced2.png";

const LogoMark = ({ imgStyle, fallbackId }) => (
  <>
    <img
      src={LOGO_SRC}
      alt="BallersPlay"
      style={imgStyle}
      onError={(e) => {
        e.currentTarget.style.display = "none";
        const fb = document.getElementById(fallbackId);
        if (fb) fb.style.display = "inline";
      }}
    />
    <span className="logo-text" id={fallbackId} style={{ display: "none" }}>
      BALLERS<span>PLAY</span>
    </span>
  </>
);

export default function App() {
  const [scrolled, setScrolled] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);

  // Navbar transparent -> solid on scroll
  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 40);
    window.addEventListener("scroll", onScroll, { passive: true });
    onScroll();
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  // Body class for landing styles
  useEffect(() => {
    document.body.classList.add("bp-body");
    return () => document.body.classList.remove("bp-body");
  }, []);

  // Scroll reveal animations
  useEffect(() => {
    const io = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry, i) => {
          if (entry.isIntersecting) {
            entry.target.style.transitionDelay = (i % 3) * 80 + "ms";
            entry.target.classList.add("in");
            io.unobserve(entry.target);
          }
        });
      },
      { threshold: 0.15, rootMargin: "0px 0px -60px 0px" }
    );
    document.querySelectorAll(".reveal").forEach((el) => io.observe(el));
    return () => io.disconnect();
  }, []);

  const closeMenu = () => setMenuOpen(false);

  return (
    <div className="bp" data-testid="ballersplay-page">
      {/* FIXED, LAG-FREE VIDEO BACKGROUND (z-index:-1) */}
      <div className="video-bg">
        <video
          autoPlay
          muted
          loop
          playsInline
          poster="https://images.unsplash.com/photo-1762013315117-1c8005ad2b41?auto=format&fit=crop&w=1600&q=70"
        >
          <source src={VIDEO_URL} type="video/mp4" />
        </video>
      </div>

      {/* NAVBAR */}
      <header className={`nav${scrolled ? " scrolled" : ""}`} id="navbar">
        <div className="container nav-inner">
          <a href="#hero" className="logo" aria-label="BallersPlay home" data-testid="nav-logo">
            <LogoMark fallbackId="logoFallback" />
          </a>

          <nav className="nav-links">
            <a href="#what-we-do" data-testid="nav-link-what-we-do">What We Do</a>
            <a href="#events" data-testid="nav-link-events">Events</a>
            <a href="#organizers" data-testid="nav-link-tournament">Organize a Game</a>
            <a href="#about" data-testid="nav-link-about">About</a>
          </nav>

          <div className="nav-cta">
            <a href={REGISTER_URL} target="_blank" rel="noopener noreferrer" className="btn btn-primary" data-testid="nav-register-btn">
              Find a Game <i className="fa-solid fa-arrow-right"></i>
            </a>
            <button className="burger" aria-label="Open menu" onClick={() => setMenuOpen(true)} data-testid="burger-btn">
              <i className="fa-solid fa-bars"></i>
            </button>
          </div>
        </div>
      </header>

      {/* MOBILE MENU */}
      <div className={`mobile-menu${menuOpen ? " open" : ""}`} data-testid="mobile-menu">
        <button className="mobile-close" aria-label="Close menu" onClick={closeMenu} data-testid="mobile-close-btn">
          <i className="fa-solid fa-xmark"></i>
        </button>
        <a href="#what-we-do" onClick={closeMenu}>What We Do</a>
        <a href="#events" onClick={closeMenu}>Events</a>
        <a href="#organizers" onClick={closeMenu}>Organize a Game</a>
        <a href="#about" onClick={closeMenu}>About</a>
        <a href={REGISTER_URL} target="_blank" rel="noopener noreferrer" className="btn btn-primary" onClick={closeMenu}>
          Find a Game
        </a>
      </div>

      {/* HERO */}
      <section className="hero" id="hero">
        <div className="container hero-content">
          <span className="eyebrow">Wrocław Football · Real Community</span>
          <h1 className="display">
            Find Your Next<br /><span className="hl">Football Game.</span>
          </h1>
          <p className="sub">Find football games in Wrocław, or get help filling spots in matches you organize.</p>
          <div className="hero-actions">
            <a href={REGISTER_URL} target="_blank" rel="noopener noreferrer" className="btn btn-primary" data-testid="hero-register-btn">
              Find a Game <i className="fa-solid fa-arrow-right"></i>
            </a>
            <a href="#what-we-do" className="btn btn-ghost">
              Explore <i className="fa-solid fa-chevron-down"></i>
            </a>
          </div>
        </div>
        <div className="scroll-hint">
          <span>Scroll</span>
          <span className="line"></span>
        </div>
      </section>

      {/* SOLID CONTENT */}
      <main className="content">
        {/* WHAT WE DO */}
        <section className="section" id="what-we-do">
          <div className="container">
            <div className="section-head reveal">
              <span className="eyebrow">What We Do</span>
              <h2 className="display">More Than A Game</h2>
              <p>Connect with football players and organizers in Wrocław.</p>
            </div>

            <div className="feature-grid">
              <div className="feature reveal">
                <span className="num">01</span>
                <div className="icon"><i className="fa-solid fa-bullhorn"></i></div>
                <h3>Support Organizers</h3>
                <p>Submit your football match and request help finding available players.</p>
              </div>
              <div className="feature reveal">
                <span className="num">02</span>
                <div className="icon"><i className="fa-solid fa-people-group"></i></div>
                <h3>Connect Players</h3>
                <p>Bringing local athletes together. Build your squad, meet rivals, and grow the community.</p>
              </div>
              <div className="feature reveal">
                <span className="num">03</span>
                <div className="icon"><i className="fa-solid fa-camera-retro"></i></div>
                <h3>Confirm Your Spot</h3>
                <p>Player requests are reviewed and confirmed before joining a match.</p>
              </div>
            </div>
          </div>
        </section>

        <section className="section" id="organizers"><div className="container"><div className="section-head reveal"><span className="eyebrow">Football in Wrocław</span><h2 className="display">Play Together.</h2><p>BallersPlay helps players find football opportunities and independent organizers fill their matches.</p></div><div className="feature-grid"><article className="feature reveal"><div className="icon"><i className="fa-solid fa-futbol"></i></div><h3>Find a Game</h3><p>Tell us when and where you want to play. We'll reach out about suitable matches. Registration does not guarantee a spot.</p><a className="btn btn-primary" href={REGISTER_URL} target="_blank" rel="noopener noreferrer">Register as a Player</a></article><article className="feature reveal"><div className="icon"><i className="fa-solid fa-calendar-plus"></i></div><h3>Organize a Game</h3><p>Already running a football match? Submit your match details and available spots. We review submissions before publishing matches.</p><a className="btn btn-primary" href={ORGANIZER_URL} target="_blank" rel="noopener noreferrer" data-testid="organizer-submit-btn">Submit Your Match</a></article></div></div></section><section className="section tournament" id="events"><div className="container tournament-inner reveal"><span className="badge">Wrocław Pilot</span><h2 className="display">Get In The <span className="hl">Game.</span></h2><p>Join the local football community. We confirm match availability with organizers before confirming player spots.</p><a href={REGISTER_URL} target="_blank" rel="noopener noreferrer" className="btn btn-primary">Join as a Player</a> <a href={ORGANIZER_URL} target="_blank" rel="noopener noreferrer" className="btn btn-ghost">Organize a Match</a></div></section>
        {/* ABOUT */}
        <section className="section about" id="about">
          <div className="container about-grid">
            <div className="reveal">
              <span className="eyebrow">About Us</span>
              <h2 className="display">Born on the Pitch.</h2>
              <p>BallersPlay connects recreational football players and independent match organizers in Wrocław. We are starting with a hands-on pilot and building from real community feedback.</p>
              
            </div>
            <div className="about-media reveal">
              <img src="https://images.pexels.com/photos/32190714/pexels-photo-32190714.jpeg?auto=compress&cs=tinysrgb&w=900" alt="BallersPlay community" loading="lazy" />
              <div className="flag"><i className="fa-solid fa-location-dot" style={{ color: "var(--accent)" }}></i> Made in Poland</div>
            </div>
          </div>
        </section>
      </main>

      {/* FOOTER */}
      <footer>
        <div className="container">
          <div className="footer-top">
            <div className="footer-brand">
              <a href="#hero" className="logo">
                <LogoMark imgStyle={{ height: "46px" }} fallbackId="footerLogoFallback" />
              </a>
              <p>Helping football players find games and organizers fill available spots in Wrocław.</p>
              <div className="socials">
                <a href={INSTAGRAM_URL} target="_blank" rel="noopener noreferrer" aria-label="Instagram" data-testid="instagram-link">
                  <i className="fa-brands fa-instagram"></i>
                </a>
                
              </div>
            </div>

            <div className="footer-col">
              <h4>Explore</h4>
              <a href="#what-we-do">What We Do</a>
              <a href="#events">Events</a>
              <a href="#organizers">Organize a Game</a>
              <a href="#about">About</a>
            </div>

            <div className="footer-col">
              <h4>Get In Touch</h4>
              <a href={`mailto:${CONTACT_EMAIL}`} data-testid="contact-email">{CONTACT_EMAIL}</a>
              <span>Wrocław, Poland</span>
              <a href={REGISTER_URL} target="_blank" rel="noopener noreferrer">Register for an Event</a>
            </div>
          </div>

          <div className="footer-bottom">
            <span>© {new Date().getFullYear()} BallersPlay. All rights reserved.</span>
            <span>Built for ballers · <a href={`mailto:${CONTACT_EMAIL}`}>{CONTACT_EMAIL}</a></span>
          </div>
        </div>
      </footer>
    </div>
  );
}
