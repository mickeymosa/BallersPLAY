import { useEffect, useState } from "react";
import "@/App.css";
import MatchDiscovery from "./components/MatchDiscovery";
import AdminDashboard from "./components/AdminDashboard";
import OrganizerSubmission from "./components/OrganizerSubmission";


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

  const page = window.location.pathname.replace(/\/$/, "") || "/";
  if (page === "/admin") return <AdminDashboard />;
  if (page === "/matches" || page === "/organize") return (
    <div className="bp bp-inner-page">
      <header className="bp-inner-header"><div className="container bp-inner-nav">
        <a href="/" className="logo"><LogoMark fallbackId="innerLogoFallback" /></a>
        <nav><a href="/">Home</a><a href="/matches">Find Matches</a><a href="/organize">Organize a Match</a></nav>
      </div></header>
      <main>{page === "/matches" ? <MatchDiscovery /> : <OrganizerSubmission />}</main>
      <footer className="bp-inner-footer"><div className="container">BallersPlay · Wrocław football community</div></footer>
    </div>
  );

  return (
    <div className="bp" data-testid="ballersplay-page">
      {/* Cinematic football backdrop, dimmed to protect typography */}
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
          <a href="/" className="logo" aria-label="BallersPlay home" data-testid="nav-logo">
            <LogoMark fallbackId="logoFallback" />
          </a>

          <nav className="nav-links">
            <a href="#what-we-do" data-testid="nav-link-what-we-do">What We Do</a>
            <a href="#players" data-testid="nav-link-events">For Players</a>
            <a href="#organizers" data-testid="nav-link-tournament">For Organizers</a>
            <a href="#about" data-testid="nav-link-about">About</a>
          </nav>

          <div className="nav-cta">
            <a href="/matches" className="btn btn-primary" data-testid="nav-register-btn">
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
        <a href="#players" onClick={closeMenu}>For Players</a>
        <a href="#organizers" onClick={closeMenu}>For Organizers</a>
        <a href="#about" onClick={closeMenu}>About</a>
        <a href="/matches" className="btn btn-primary" onClick={closeMenu}>
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
            <a href="/matches" className="btn btn-primary" data-testid="hero-register-btn">
              Find a Game <i className="fa-solid fa-arrow-right"></i>
            </a>
            <a href="/organize" className="btn btn-ghost">Organize a Game <i className="fa-solid fa-arrow-right"></i></a>
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
        <section className="section bp-intro" id="what-we-do">
          <div className="container">
            <div className="section-head reveal"><span className="eyebrow">The local football network</span><h2 className="display">Less Searching.<br/><span className="hl">More Football.</span></h2><p>One community, two ways to get on the pitch. BallersPlay connects players looking for games with organizers looking for players in Wrocław.</p></div>
            <div className="bp-steps">
              <div className="bp-step reveal"><span>01 / DISCOVER</span><h3>Find your people.</h3><p>Players share their availability and interests. Organizers submit matches that need players.</p></div>
              <div className="bp-step reveal"><span>02 / CONNECT</span><h3>Make the match.</h3><p>We review requests and connect players with suitable opportunities.</p></div>
              <div className="bp-step reveal"><span>03 / PLAY</span><h3>Show up & play.</h3><p>Spots are confirmed with the organizer before anyone turns up to play.</p></div>
            </div>
          </div>
        </section>

        <section className="section bp-audience" id="players">
          <div className="container bp-audience-grid">
            <div className="bp-audience-copy reveal"><span className="eyebrow">For players</span><h2 className="display">Your Next<br/><span className="hl">Game Awaits.</span></h2><p>New to Wrocław? Missing a regular squad? Or just want more football in your week? Tell us when you want to play and we'll help you discover opportunities.</p><div className="bp-points"><span><i className="fa-solid fa-check"></i> Football-focused local community</span><span><i className="fa-solid fa-check"></i> No need to organize a full team</span><span><i className="fa-solid fa-check"></i> Confirmation before match day</span></div><a href="/matches" className="btn btn-primary">Join as a Player <i className="fa-solid fa-arrow-right"></i></a><p className="bp-fineprint">Register your interest. A submitted form is not a confirmed match booking.</p></div>
            <div className="bp-photo bp-photo-player reveal" role="img" aria-label="Football pitch under floodlights"><div className="bp-photo-label">WROCŁAW / FOOTBALL / COMMUNITY</div></div>
          </div>
        </section>
        <section className="section bp-audience bp-organizer-section" id="organizers">
          <div className="container bp-audience-grid bp-organizer-grid">
            <div className="bp-photo bp-photo-organizer reveal" role="img" aria-label="Football players on a pitch"><div className="bp-photo-label">BUILT FOR INDEPENDENT ORGANIZERS</div></div>
            <div className="bp-audience-copy reveal"><span className="eyebrow">For organizers</span><h2 className="display">You Run The Game.<br/><span className="hl">We Help Fill It.</span></h2><p>Already organizing football in Wrocław? Keep control of your match while BallersPlay helps you reach players interested in joining.</p><div className="bp-points"><span><i className="fa-solid fa-check"></i> Submit match details and open spots</span><span><i className="fa-solid fa-check"></i> Reach players outside your usual group</span><span><i className="fa-solid fa-check"></i> Review participants before confirmation</span></div><a href="/organize" className="btn btn-primary" data-testid="organizer-submit-btn">Submit Your Match <i className="fa-solid fa-arrow-right"></i></a><p className="bp-fineprint">Submitting a match is a request, not automatic publication or a guaranteed player match.</p></div>
          </div>
        </section>
        <section className="section bp-final-cta" id="events"><div className="container reveal"><span className="eyebrow">Wrocław pilot</span><h2 className="display">Football Happens<br/><span className="hl">Together.</span></h2><p>We're starting with local players and organizers, learning from real matches, and building something worth coming back to.</p><div className="hero-actions"><a href="/matches" className="btn btn-primary">Find a Game <i className="fa-solid fa-arrow-right"></i></a><a href="/organize" className="btn btn-ghost">Organize a Game <i className="fa-solid fa-arrow-right"></i></a></div></div></section>
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
              <a href="#players">For Players</a>
              <a href="#organizers">For Organizers</a>
              <a href="#about">About</a>
            </div>

            <div className="footer-col">
              <h4>Get In Touch</h4>
              <a href={`mailto:${CONTACT_EMAIL}`} data-testid="contact-email">{CONTACT_EMAIL}</a>
              <span>Wrocław, Poland</span>
              <a href="/matches">Register for an Event</a>
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
