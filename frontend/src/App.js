import { useEffect, useState } from "react";
import "@/App.css";

const REGISTER_URL = "https://tally.so/r/rjgQ9v";
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
            <a href="#tournament" data-testid="nav-link-tournament">1v1 Tournament</a>
            <a href="#about" data-testid="nav-link-about">About</a>
          </nav>

          <div className="nav-cta">
            <a href={REGISTER_URL} target="_blank" rel="noopener noreferrer" className="btn btn-primary" data-testid="nav-register-btn">
              Register <i className="fa-solid fa-arrow-right"></i>
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
        <a href="#tournament" onClick={closeMenu}>1v1 Tournament</a>
        <a href="#about" onClick={closeMenu}>About</a>
        <a href={REGISTER_URL} target="_blank" rel="noopener noreferrer" className="btn btn-primary" onClick={closeMenu}>
          Register for Next Event
        </a>
      </div>

      {/* HERO */}
      <section className="hero" id="hero">
        <div className="container hero-content">
          <span className="eyebrow">Local Sports · Real Community</span>
          <h1 className="display">
            Connect. Play.<br /><span className="hl">Dominate.</span>
          </h1>
          <p className="sub">The ultimate hub for sports lovers. Find your next game.</p>
          <div className="hero-actions">
            <a href={REGISTER_URL} target="_blank" rel="noopener noreferrer" className="btn btn-primary" data-testid="hero-register-btn">
              Register for Next Event <i className="fa-solid fa-arrow-right"></i>
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
              <p>We handle everything so you can focus on what matters — the play. From the first whistle to the final highlight reel.</p>
            </div>

            <div className="feature-grid">
              <div className="feature reveal">
                <span className="num">01</span>
                <div className="icon"><i className="fa-solid fa-bullhorn"></i></div>
                <h3>Organize Events</h3>
                <p>We set up the pitch, the refs, and the gear. Turn up and play — the logistics are handled.</p>
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
                <h3>Capture the Moment</h3>
                <p>High-quality media and portfolios of every game. Relive your best plays in cinematic detail.</p>
              </div>
            </div>
          </div>
        </section>

        {/* SPORTS WE COVER */}
        <section className="section" id="sports" style={{ paddingTop: 0 }}>
          <div className="container">
            <div className="section-head reveal">
              <span className="eyebrow">Sports We Cover</span>
              <h2 className="display">Pick Your Arena</h2>
              <p>From the baseline to the net — BallersPlay runs premium, competitive events across more than just the pitch.</p>
            </div>

            <div className="sports-grid">
              <div className="sport-card reveal">
                <img src="https://images.unsplash.com/photo-1554068865-24cecd4e34b8?auto=format&fit=crop&w=800&q=75" alt="Tennis" loading="lazy" />
                <div className="sport-info">
                  <div className="s-icon"><i className="fa-solid fa-table-tennis-paddle-ball"></i></div>
                  <h3>Tennis</h3>
                  <p>Singles &amp; doubles showdowns on premium courts.</p>
                </div>
              </div>
              <div className="sport-card reveal">
                <img src="https://images.unsplash.com/photo-1722087642932-9b070e9a066e?auto=format&fit=crop&w=800&q=75" alt="Badminton" loading="lazy" />
                <div className="sport-info">
                  <div className="s-icon"><i className="fa-solid fa-feather-pointed"></i></div>
                  <h3>Badminton</h3>
                  <p>Fast rallies and high-flying smashes indoors.</p>
                </div>
              </div>
              <div className="sport-card reveal">
                <img src="https://images.pexels.com/photos/6203501/pexels-photo-6203501.jpeg?auto=compress&cs=tinysrgb&w=800" alt="Volleyball" loading="lazy" />
                <div className="sport-info">
                  <div className="s-icon"><i className="fa-solid fa-volleyball"></i></div>
                  <h3>Volleyball</h3>
                  <p>Team spikes, blocks and pure court energy.</p>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* 1v1 TOURNAMENT */}
        <section className="section tournament" id="tournament">
          <div className="vs-watermark">VS</div>
          <div className="container tournament-inner reveal">
            <span className="badge"><span className="dot"></span> Coming Soon</span>
            <h2 className="display">The Ultimate <span className="hl">1vs1</span> Showdown</h2>
            <p>Think you have what it takes to beat the best? Our exclusive 1vs1 tournament is dropping soon. High stakes, pure skill.</p>
            <a href={REGISTER_URL} target="_blank" rel="noopener noreferrer" className="btn btn-primary" data-testid="waitlist-btn">
              Join the Waitlist <i className="fa-solid fa-bolt"></i>
            </a>
          </div>
        </section>

        {/* EVENTS — UPCOMING */}
        <section className="section" id="events">
          <div className="container">
            <div className="section-head reveal">
              <span className="eyebrow">Upcoming Events</span>
              <h2 className="display">Get In The Game</h2>
              <p>Lock in your spot. Limited slots, maximum intensity — register before the whistle blows.</p>
            </div>

            <div className="event-grid">
              <article className="event-card reveal">
                <div className="event-media">
                  <span className="tag">5-a-side</span>
                  <img src="https://images.unsplash.com/photo-1762013315117-1c8005ad2b41?auto=format&fit=crop&w=900&q=75" alt="Night Football League" loading="lazy" />
                </div>
                <div className="event-body">
                  <h3>Night Lights League</h3>
                  <div className="event-meta">
                    <span><i className="fa-regular fa-calendar"></i> Coming Soon</span>
                    <span><i className="fa-solid fa-location-dot"></i> Wrocław, Poland</span>
                  </div>
                  <a href={REGISTER_URL} target="_blank" rel="noopener noreferrer" className="btn btn-primary" data-testid="event-register-1">
                    Register Now <i className="fa-solid fa-arrow-right"></i>
                  </a>
                </div>
              </article>

              <article className="event-card reveal">
                <div className="event-media">
                  <span className="tag">Street</span>
                  <img src="https://images.pexels.com/photos/12253473/pexels-photo-12253473.jpeg?auto=compress&cs=tinysrgb&w=900" alt="Street Football Cup" loading="lazy" />
                </div>
                <div className="event-body">
                  <h3>Street Kings Cup</h3>
                  <div className="event-meta">
                    <span><i className="fa-regular fa-calendar"></i> Coming Soon</span>
                    <span><i className="fa-solid fa-location-dot"></i> Wrocław, Poland</span>
                  </div>
                  <a href={REGISTER_URL} target="_blank" rel="noopener noreferrer" className="btn btn-primary" data-testid="event-register-2">
                    Register Now <i className="fa-solid fa-arrow-right"></i>
                  </a>
                </div>
              </article>

              <article className="event-card reveal">
                <div className="event-media">
                  <span className="tag">Hoops</span>
                  <img src="https://images.unsplash.com/photo-1608245449230-4ac19066d2d0?auto=format&fit=crop&w=900&q=75" alt="Basketball Showcase" loading="lazy" />
                </div>
                <div className="event-body">
                  <h3>Hardwood Showcase</h3>
                  <div className="event-meta">
                    <span><i className="fa-regular fa-calendar"></i> Coming Soon</span>
                    <span><i className="fa-solid fa-location-dot"></i> Wrocław, Poland</span>
                  </div>
                  <a href={REGISTER_URL} target="_blank" rel="noopener noreferrer" className="btn btn-primary" data-testid="event-register-3">
                    Register Now <i className="fa-solid fa-arrow-right"></i>
                  </a>
                </div>
              </article>
            </div>
          </div>
        </section>

        {/* PAST EVENTS — MASONRY GALLERY */}
        <section className="section" id="legacy" style={{ paddingTop: 0 }}>
          <div className="container">
            <div className="section-head reveal">
              <span className="eyebrow">Legacy</span>
              <h2 className="display">Past Events</h2>
              <p>The moments that built BallersPlay. Sweat, skill, and unforgettable nights on the pitch.</p>
            </div>

            <div className="gallery">
              <figure className="reveal">
                <img src="https://images.unsplash.com/photo-1776065636845-65e402c2decb?auto=format&fit=crop&w=800&q=75" alt="Players on the field at night" loading="lazy" />
                <figcaption>Midnight Derby · Wrocław</figcaption>
              </figure>
              <figure className="reveal">
                <img src="https://images.pexels.com/photos/32190714/pexels-photo-32190714.jpeg?auto=compress&cs=tinysrgb&w=800" alt="Intense football battle" loading="lazy" />
                <figcaption>The Final Whistle · Wrocław</figcaption>
              </figure>
              <figure className="reveal">
                <img src="https://images.unsplash.com/photo-1584992120020-defa7d36fdfb?auto=format&fit=crop&w=800&q=75" alt="Basketball action" loading="lazy" />
                <figcaption>Hoops Night · Wrocław</figcaption>
              </figure>
              <figure className="reveal">
                <img src="https://images.unsplash.com/photo-1773850561705-dacec6d0b16b?auto=format&fit=crop&w=800&q=75" alt="Soccer game in progress" loading="lazy" />
                <figcaption>Summer Slam · Wrocław</figcaption>
              </figure>
              <figure className="reveal">
                <img src="https://images.unsplash.com/photo-1770631070393-fdcf5a751c04?auto=format&fit=crop&w=800&q=75" alt="Street football culture" loading="lazy" />
                <figcaption>Street Culture · Wrocław</figcaption>
              </figure>
              <figure className="reveal">
                <img src="https://images.pexels.com/photos/31847342/pexels-photo-31847342.jpeg?auto=compress&cs=tinysrgb&w=800" alt="Stadium atmosphere" loading="lazy" />
                <figcaption>Full House · Wrocław</figcaption>
              </figure>
            </div>
          </div>
        </section>

        {/* ABOUT */}
        <section className="section about" id="about">
          <div className="container about-grid">
            <div className="reveal">
              <span className="eyebrow">About Us</span>
              <h2 className="display">Born on the Pitch.</h2>
              <p>Based in Poland, BallersPlay was created by athletes, for athletes. We believe sports are better together, and we're on a mission to build the strongest local sports community by hosting premium, highly competitive, and casual events.</p>
              <div className="about-stats">
                <div className="stat"><div className="n">10+</div><div className="l">Events Hosted</div></div>
                <div className="stat"><div className="n">500+</div><div className="l">Players Connected</div></div>
                <div className="stat"><div className="n">1</div><div className="l">City</div></div>
              </div>
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
              <p>Organizing, hosting, and showcasing local sports events. Connect with players, find your next game, and dominate.</p>
              <div className="socials">
                <a href={INSTAGRAM_URL} target="_blank" rel="noopener noreferrer" aria-label="Instagram" data-testid="instagram-link">
                  <i className="fa-brands fa-instagram"></i>
                </a>
                <a href="#" aria-label="TikTok"><i className="fa-brands fa-tiktok"></i></a>
              </div>
            </div>

            <div className="footer-col">
              <h4>Explore</h4>
              <a href="#what-we-do">What We Do</a>
              <a href="#events">Events</a>
              <a href="#tournament">1v1 Tournament</a>
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
