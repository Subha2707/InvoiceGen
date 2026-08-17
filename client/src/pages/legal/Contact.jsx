import React, { useState } from 'react';
import { FiMail, FiPhone, FiMapPin, FiGithub, FiSend, FiClock, FiUser, FiMessageSquare } from 'react-icons/fi';
import { FaGithub, FaLinkedinIn, FaInstagram, FaFacebookF } from 'react-icons/fa';
import LegalLayout from './LegalLayout';
import { useToast } from '../../components/ui/Toast';

const CARDS = [
  { icon: <FiMail />, title: 'Email', value: 'support@invoicegen.app', href: 'mailto:support@invoicegen.app', hint: 'Replies within 48 hours' },
  { icon: <FiPhone />, title: 'Phone', value: '+91 98765 43210', href: 'tel:+919876543210', hint: 'Mon–Fri, 9am–6pm IST' },
  { icon: <FiMapPin />, title: 'Address', value: 'Kolkata, West Bengal, India', href: null, hint: 'Remote-first team' },
  { icon: <FiGithub />, title: 'GitHub', value: 'View our repositories', href: 'https://github.com/', hint: 'Open-source contributions' },
];

const SOCIALS = [
  { icon: <FaGithub />, label: 'GitHub', href: 'https://github.com/' },
  { icon: <FaLinkedinIn />, label: 'LinkedIn', href: 'https://linkedin.com/' },
  { icon: <FaInstagram />, label: 'Instagram', href: 'https://instagram.com/' },
  { icon: <FaFacebookF />, label: 'Facebook', href: 'https://facebook.com/' },
];

const Contact = () => {
  const [form, setForm] = useState({ name: '', email: '', subject: '', message: '' });
  const toast = useToast();

  const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  const handleSubmit = (e) => {
    e.preventDefault();
    toast.success(`Thanks ${form.name || 'there'} — we've received your message and will reply within 48 hours.`);
    setForm({ name: '', email: '', subject: '', message: '' });
  };

  return (
    <LegalLayout
      icon={<FiMail />}
      title="Contact Us"
      subtitle="We'd love to hear from you. Pick the channel that works best — we're quick to respond."
      containerClass="contact-container"
    >
      <div className="contact-grid">
        {CARDS.map((c) => (
          <div key={c.title} className="contact-card">
            <div className="contact-card-icon">{c.icon}</div>
            <h3>{c.title}</h3>
            {c.href ? (
              <a href={c.href} target="_blank" rel="noopener noreferrer">{c.value}</a>
            ) : (
              <p>{c.value}</p>
            )}
            <span className="contact-hint">{c.hint}</span>
          </div>
        ))}
      </div>

      <div className="contact-wrap">
        <section className="legal-card contact-form-card">
          <div className="legal-card-icon"><FiMessageSquare /></div>
          <div style={{ width: '100%' }}>
            <h2>Send Us a Message</h2>
            <form className="contact-form" onSubmit={handleSubmit}>
              <div className="form-group">
                <label htmlFor="c-name">Your Name</label>
                <input id="c-name" name="name" value={form.name} onChange={handleChange} required placeholder="e.g. Rahul Sharma" />
              </div>
              <div className="form-group">
                <label htmlFor="c-email">Email Address</label>
                <input id="c-email" type="email" name="email" value={form.email} onChange={handleChange} required placeholder="you@example.com" />
              </div>
              <div className="form-group">
                <label htmlFor="c-subject">Subject</label>
                <input id="c-subject" name="subject" value={form.subject} onChange={handleChange} required placeholder="How can we help?" />
              </div>
              <div className="form-group">
                <label htmlFor="c-message">Message</label>
                <textarea id="c-message" name="message" value={form.message} onChange={handleChange} required rows="5" placeholder="Tell us what's on your mind..." />
              </div>
              <button type="submit" className="btn btn-primary">
                <FiSend /> Send Message
              </button>
            </form>
          </div>
        </section>

        <aside className="contact-info-card">
          <h3>Other Ways to Reach Us</h3>
          <div className="contact-info-row"><FiClock /><span>Response time: within 48 hours</span></div>
          <div className="contact-info-row"><FiUser /><span>Sales & partnerships: hello@invoicegen.app</span></div>
          <div className="contact-info-row"><FiMail /><span>Support: support@invoicegen.app</span></div>

          <div className="footer-social contact-social">
            {SOCIALS.map((s) => (
              <a key={s.label} href={s.href} target="_blank" rel="noopener noreferrer" aria-label={s.label} title={s.label}>
                {s.icon}
              </a>
            ))}
          </div>
        </aside>
      </div>
    </LegalLayout>
  );
};

export default Contact;