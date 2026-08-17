import React, { useState, useEffect, useRef } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import Avatar from '../components/ui/Avatar';
import {
  FiFileText, FiZap, FiShield, FiSend, FiLayout, FiPieChart,
  FiCheckCircle, FiArrowRight, FiCheck,
  FiChevronLeft, FiChevronRight
} from 'react-icons/fi';

const FAQ_ITEMS = [
  { q: 'Is InvoiceGen really free?', a: 'Yes, InvoiceGen is 100% free forever. Create unlimited GST-compliant invoices, download PDFs, and email clients without any credit card or hidden charges.' },
  { q: 'How is GST calculated automatically?', a: 'We use your business state code and the client state code. Intra-state sales get CGST + SGST, inter-state sales get IGST, all computed instantly as you type items.' },
  { q: 'Can I use my own logo and signature?', a: 'Absolutely. Upload your company logo and digital signature once in Business Profile — they appear automatically on every generated invoice and PDF.' },
  { q: 'What invoice templates are available?', a: 'Five designer templates: Classic, Modern, Elegant, Corporate, and Bold. Switch between them anytime without losing your invoice data.' },
  { q: 'Can I email invoices to my clients?', a: 'Yes, with one click. We generate a pristine PDF and deliver it straight to your client email address using the Resend email platform.' },
  { q: 'Is my data secure?', a: 'Your data is protected with JWT-based sessions, password encryption, and Google OAuth. Invoices and client records are private to your account only.' },
];

const TESTIMONIALS = [
  { name: 'Rahul Sharma', role: 'Freelance Web Developer', quote: 'InvoiceGen saves me hours every month. GST is calculated automatically, and the PDFs look incredibly professional.' },
  { name: 'Priya Verma', role: 'Design Studio Owner', quote: 'I switched from spreadsheets to InvoiceGen and never looked back. The templates are beautiful and clients love them.' },
  { name: 'Amit Kumar', role: 'Agency Founder', quote: 'The one-click emailing and client management are game changers. My invoices get paid much faster now.' },
];

const Landing = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const heroRef = useRef(null);
  const [faqIndex, setFaqIndex] = useState(0);

  useEffect(() => {
    const root = document.querySelector('.main-content');
    if (!root) return;
    const applyParallax = () => {
      const el = heroRef.current;
      if (!el) return;
      const offset = root.scrollTop;
      if (offset < root.clientHeight) {
        el.querySelectorAll('[data-parallax]').forEach((node) => {
          const speed = parseFloat(node.getAttribute('data-parallax')) || 0;
          node.style.transform = `translateY(${offset * speed}px)`;
        });
      }
    };
    let ticking = false;
    const onScroll = () => {
      if (!ticking) {
        window.requestAnimationFrame(() => { applyParallax(); ticking = false; });
        ticking = true;
      }
    };
    root.addEventListener('scroll', onScroll, { passive: true });
    applyParallax();
    return () => root.removeEventListener('scroll', onScroll);
  }, []);

  useEffect(() => {
    const id = setInterval(() => setFaqIndex(prev => (prev + 1) % FAQ_ITEMS.length), 5000);
    return () => clearInterval(id);
  }, []);

  return (
    <div className="landing-page">
      {/* ── Hero Section ── */}
      <section className="landing-hero" ref={heroRef}>
        <div className="hero-container">
          <div className="hero-badge" data-parallax="0.08">
            <span className="badge-pulse"></span>
            100% Free GST Compliant Invoicing Platform
          </div>

          <h1 className="hero-title" data-parallax="0.05">
            Smart Invoicing Built for <span className="gradient-text">Modern Businesses</span>
          </h1>

          <p className="hero-subtitle" data-parallax="0.03">
            Create, manage, and send professional GST invoices in seconds.
            Choose from 5 designer templates, calculate IGST/CGST automatically, and track payments seamlessly.
          </p>

          <div className="hero-ctas">
            {user ? (
              <button onClick={() => navigate('/dashboard')} className="btn btn-primary btn-lg">
                Go to Dashboard <FiArrowRight />
              </button>
            ) : (
              <>
                <Link to="/signup" className="btn btn-primary btn-lg">
                  Create Invoice Now — Free <FiArrowRight />
                </Link>
                <a href="#templates" className="btn btn-outline btn-lg">
                  Explore Templates
                </a>
              </>
            )}
          </div>

          <div className="hero-perks">
            <span><FiCheckCircle className="text-emerald" /> No credit card required</span>
            <span><FiCheckCircle className="text-emerald" /> Instant PDF download</span>
            <span><FiCheckCircle className="text-emerald" /> GST Tax Compliant</span>
          </div>

          {/* Hero Demo Mockup */}
          <div className="hero-mockup glassmorphism" data-parallax="0.02">
            <div className="mockup-header">
              <div className="mockup-dots">
                <span className="dot red"></span>
                <span className="dot yellow"></span>
                <span className="dot green"></span>
              </div>
              <span className="mockup-title">InvoiceGen Live Editor — Sample Invoice</span>
            </div>
            <div className="mockup-body">
              <div className="mockup-invoice-card">
                <div className="mockup-top">
                  <div>
                    <strong className="brand-tag">SUBHADIP TRADING</strong>
                    <p className="sub-tag">GSTIN: 6937725362GKGDUD1027</p>
                  </div>
                  <div className="mockup-right">
                    <span className="inv-tag">INVOICE #INV-2026-00001</span>
                    <span className="status-pill">PAID</span>
                  </div>
                </div>
                <div className="mockup-table">
                  <div className="mockup-row header">
                    <span>Item</span><span>Qty</span><span>Rate</span><span>Amount</span>
                  </div>
                  <div className="mockup-row">
                    <span>Web Development Services</span><span>1</span><span>₹45,000</span><span>₹45,000</span>
                  </div>
                  <div className="mockup-row">
                    <span>UI/UX Design Kit</span><span>1</span><span>₹15,000</span><span>₹15,000</span>
                  </div>
                </div>
                <div className="mockup-summary">
                  <div><span>Subtotal:</span> <strong>₹60,000.00</strong></div>
                  <div><span>CGST (9%) + SGST (9%):</span> <strong>₹10,800.00</strong></div>
                  <div className="total-row"><span>Grand Total:</span> <strong className="text-emerald">₹70,800.00</strong></div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── Features Section ── */}
      <section id="features" className="landing-section">
        <div className="section-container">
          <div className="section-header text-center">
            <span className="section-tag">POWERFUL FEATURES</span>
            <h2>Everything You Need to Get Paid Faster</h2>
            <p>Built ground-up to handle Indian GST compliance, multi-currency invoicing, and client tracking effortlessly.</p>
          </div>

          <div className="features-grid">
            <div className="feature-card glassmorphism">
              <div className="feature-icon"><FiZap /></div>
              <h3>Automated GST Calculations</h3>
              <p>Automatic detection of Intra-State (CGST + SGST) vs Inter-State (IGST) transactions based on state codes.</p>
            </div>

            <div className="feature-card glassmorphism">
              <div className="feature-icon"><FiLayout /></div>
              <h3>5 Designer PDF Templates</h3>
              <p>Pick from Classic, Modern, Elegant, Corporate, and Bold themes designed to match your brand style.</p>
            </div>

            <div className="feature-card glassmorphism">
              <div className="feature-icon"><FiSend /></div>
              <h3>1-Click Emailing via Resend</h3>
              <p>Send clean PDF invoices directly to client email addresses with custom note attachments.</p>
            </div>

            <div className="feature-card glassmorphism">
              <div className="feature-icon"><FiPieChart /></div>
              <h3>Business Analytics</h3>
              <p>Track total revenue, pending payments, overdue invoices, and monthly billing metrics visually.</p>
            </div>

            <div className="feature-card glassmorphism">
              <div className="feature-icon"><FiShield /></div>
              <h3>Secure Data & Auth</h3>
              <p>Protected API with JWT sessions, password encryption, and optional 1-click Google Sign-In.</p>
            </div>

            <div className="feature-card glassmorphism">
              <div className="feature-icon"><FiFileText /></div>
              <h3>Client & Profile Management</h3>
              <p>Save client billing addresses, GSTIN numbers, digital signature, and company logos once for reusable invoicing.</p>
            </div>
          </div>
        </div>
      </section>

      {/* ── Templates Showcase Section ── */}
      <section id="templates" className="landing-section bg-soft">
        <div className="section-container">
          <div className="section-header text-center">
            <span className="section-tag">CUSTOM DESIGNS</span>
            <h2>Choose Your Invoice Aesthetic</h2>
            <p>Switch between 5 handcrafted themes anytime without losing your invoice data.</p>
          </div>

          <div className="templates-showcase-grid">
            <div className="template-card glassmorphism">
              <div className="template-preview-swatch classic"></div>
              <div className="template-card-content">
                <h4>Classic</h4>
                <p>Timeless serif typography with deep navy accents. Ideal for formal consulting and law firms.</p>
              </div>
            </div>

            <div className="template-card glassmorphism">
              <div className="template-preview-swatch modern"></div>
              <div className="template-card-content">
                <h4>Modern</h4>
                <p>Clean sans-serif design with vibrant blue accents and clear visual hierarchy for tech companies.</p>
              </div>
            </div>

            <div className="template-card glassmorphism">
              <div className="template-preview-swatch elegant"></div>
              <div className="template-card-content">
                <h4>Elegant</h4>
                <p>Centered serif layout with warm gold accents. Perfect for luxury agencies and creative studios.</p>
              </div>
            </div>

            <div className="template-card glassmorphism">
              <div className="template-preview-swatch corporate"></div>
              <div className="template-card-content">
                <h4>Corporate</h4>
                <p>Structured slate-navy layout with sharp borders for enterprise and corporate businesses.</p>
              </div>
            </div>

            <div className="template-card glassmorphism">
              <div className="template-preview-swatch bold"></div>
              <div className="template-card-content">
                <h4>Bold</h4>
                <p>High-contrast black & amber theme with strong typography that commands attention.</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── How It Works ── */}
      <section id="how-it-works" className="landing-section">
        <div className="section-container">
          <div className="section-header text-center">
            <span className="section-tag">SIMPLE WORKFLOW</span>
            <h2>3 Steps to Your First Invoice</h2>
          </div>

          <div className="steps-grid">
            <div className="step-card">
              <div className="step-num">1</div>
              <h4>Add Client Details</h4>
              <p>Select an existing client or enter billing/shipping address and GSTIN number.</p>
            </div>
            <div className="step-card">
              <div className="step-num">2</div>
              <h4>Add Items & Taxes</h4>
              <p>Type line items, set GST %, add optional discounts, and preview in real-time.</p>
            </div>
            <div className="step-card">
              <div className="step-num">3</div>
              <h4>Export or Email</h4>
              <p>Download pristine vector PDF or email directly to your client with one click.</p>
            </div>
          </div>
        </div>
      </section>

      {/* ── Pricing Section ── */}
      <section id="pricing" className="landing-section bg-soft">
        <div className="section-container">
          <div className="section-header text-center">
            <span className="section-tag">100% FREE FOREVER</span>
            <h2>No Hidden Fees. No Limits.</h2>
            <p>Start billing your clients right now without any subscription.</p>
          </div>

          <div className="pricing-card-wrap">
            <div className="pricing-card glassmorphism featured">
              <span className="pricing-badge">Free Forever</span>
              <h3>Pro Plan</h3>
              <div className="price">₹0 <span>/ month</span></div>
              <p>Full access to all features with zero restrictions.</p>

              <ul className="pricing-list">
                <li><FiCheck className="text-emerald" /> Unlimited PDF Invoice Generation</li>
                <li><FiCheck className="text-emerald" /> Access to all 5 Designer Templates</li>
                <li><FiCheck className="text-emerald" /> Automatic GST & State Code Calculation</li>
                <li><FiCheck className="text-emerald" /> Email Invoices to Clients</li>
                <li><FiCheck className="text-emerald" /> Digital Signature & Logo Upload</li>
                <li><FiCheck className="text-emerald" /> Revenue Analytics Dashboard</li>
              </ul>

              {user ? (
                <button onClick={() => navigate('/dashboard')} className="btn btn-primary full-width">
                  Go to Dashboard
                </button>
              ) : (
                <Link to="/signup" className="btn btn-primary full-width">
                  Get Started Free Now
                </Link>
              )}
            </div>
          </div>
        </div>
      </section>

      {/* ── CTA Banner (parallax) ── */}
      <section className="landing-cta-banner parallax-band">
        <div className="section-container text-center">
          <h2>Ready to Create Professional Invoices?</h2>
          <p>Join thousands of businesses sending invoices effortlessly with InvoiceGen.</p>
          {user ? (
            <button onClick={() => navigate('/dashboard')} className="btn btn-primary btn-lg mt-4">
              Open Dashboard
            </button>
          ) : (
            <Link to="/signup" className="btn btn-primary btn-lg mt-4">
              Start Invoicing Free
            </Link>
          )}
        </div>
      </section>

      {/* ── Testimonials ── */}
      <section id="testimonials" className="landing-section">
        <div className="section-container">
          <div className="section-header text-center">
            <span className="section-tag">LOVED BY BUSINESSES</span>
            <h2>Trusted by Freelancers & Growing Businesses</h2>
            <p>Thousands of invoices created and paid faster with InvoiceGen.</p>
          </div>

          <div className="testimonials-grid">
            {TESTIMONIALS.map((t) => (
              <div key={t.name} className="testimonial-card glassmorphism">
                <div className="testimonial-stars" aria-label="5 out of 5 stars">★★★★★</div>
                <p className="testimonial-quote">"{t.quote}"</p>
                <div className="testimonial-author">
                  <Avatar name={t.name} size={38} />
                  <div>
                    <strong>{t.name}</strong>
                    <span>{t.role}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── FAQ Carousel ── */}
      <section id="faq" className="landing-section bg-soft">
        <div className="section-container">
          <div className="section-header text-center">
            <span className="section-tag">FAQ</span>
            <h2>Frequently Asked Questions</h2>
          </div>

          <div className="faq-carousel">
            <button
              className="faq-nav faq-prev"
              aria-label="Previous question"
              onClick={() => setFaqIndex((faqIndex - 1 + FAQ_ITEMS.length) % FAQ_ITEMS.length)}
            >
              <FiChevronLeft />
            </button>

            <div className="faq-viewport">
              <div className="faq-slide" key={faqIndex}>
                <span className="faq-count">{String(faqIndex + 1).padStart(2, '0')}</span>
                <h3>{FAQ_ITEMS[faqIndex].q}</h3>
                <p>{FAQ_ITEMS[faqIndex].a}</p>
              </div>
            </div>

            <button
              className="faq-nav faq-next"
              aria-label="Next question"
              onClick={() => setFaqIndex((faqIndex + 1) % FAQ_ITEMS.length)}
            >
              <FiChevronRight />
            </button>
          </div>

          <div className="faq-dots">
            {FAQ_ITEMS.map((item, i) => (
              <button
                key={item.q}
                className={`faq-dot${i === faqIndex ? ' active' : ''}`}
                aria-label={`Go to question ${i + 1}`}
                onClick={() => setFaqIndex(i)}
              />
            ))}
          </div>
        </div>
      </section>
    </div>
  );
};

export default Landing;
