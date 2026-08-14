import React from 'react';
import { Link } from 'react-router-dom';
import { FiGlobe, FiLock, FiSettings, FiUserCheck, FiClock, FiHelpCircle, FiXCircle } from 'react-icons/fi';
import LegalLayout from './LegalLayout';

const COOKIES = [
  {
    icon: <FiLock />,
    name: 'Authentication',
    purpose: 'Keeps you signed in across sessions and secures your account.',
    required: 'Yes',
    duration: 'Session'
  },
  {
    icon: <FiSettings />,
    name: 'Preferences',
    purpose: 'Remembers theme choices (light/dark) and default template settings.',
    required: 'No',
    duration: '1 year'
  },
  {
    icon: <FiUserCheck />,
    name: 'Essential',
    purpose: 'Required for core functionality such as login and account security.',
    required: 'Yes',
    duration: 'Session'
  }
];

const Cookies = () => (
  <LegalLayout
    icon={<FiGlobe />}
    title="Cookie Policy"
    subtitle="Cookies help InvoiceGen remember you and keep the app working — here's the full breakdown."
    updated="August 13, 2026"
  >
    <section className="legal-card">
      <div className="legal-card-icon"><FiGlobe /></div>
      <div>
        <h2>1. What Are Cookies?</h2>
        <p>Cookies are small text files stored on your device when you visit a website. They help the site remember your preferences, keep you signed in, and understand how you use it.</p>
      </div>
    </section>

    <section className="legal-card">
      <div className="legal-card-icon"><FiClock /></div>
      <div>
        <h2>2. Cookies We Use</h2>
        <div className="cookie-table-wrap">
          <table className="cookie-table">
            <thead>
              <tr>
                <th>Cookie</th>
                <th>Purpose</th>
                <th>Required</th>
                <th>Duration</th>
              </tr>
            </thead>
            <tbody>
              {COOKIES.map((c) => (
                <tr key={c.name}>
                  <td>
                    <span className="cookie-name"><span className="cookie-icon">{c.icon}</span>{c.name}</span>
                  </td>
                  <td>{c.purpose}</td>
                  <td>{c.required}</td>
                  <td>{c.duration}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </section>

    <section className="legal-card">
      <div className="legal-card-icon"><FiSettings /></div>
      <div>
        <h2>3. Managing Cookies</h2>
        <p>You can control and delete cookies through your browser settings at any time. Note that disabling essential cookies may prevent you from signing in or using core features like invoice creation.</p>
      </div>
    </section>

    <section className="legal-card">
      <div className="legal-card-icon"><FiXCircle /></div>
      <div>
        <h2>4. Third-Party Cookies</h2>
        <p>We use Google authentication (OAuth), which may set cookies as part of the sign-in flow. We do not use advertising or tracking cookies.</p>
      </div>
    </section>

    <section className="legal-card">
      <div className="legal-card-icon"><FiHelpCircle /></div>
      <div>
        <h2>5. Contact</h2>
        <p>Questions about cookies? Reach out via the <Link to="/contact">Contact page</Link>.</p>
      </div>
    </section>
  </LegalLayout>
);

export default Cookies;