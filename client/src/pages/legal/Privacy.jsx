import React from 'react';
import { Link } from 'react-router-dom';
import { FiShield, FiLock, FiDatabase, FiEye, FiShare2, FiTrash2, FiHelpCircle, FiCheckCircle } from 'react-icons/fi';
import LegalLayout from './LegalLayout';

const Privacy = () => (
  <LegalLayout
    icon={<FiShield />}
    title="Privacy Policy"
    subtitle="Your privacy matters. Here's exactly what data we collect, why, and how we keep it safe."
    updated="August 13, 2026"
  >
    <div className="legal-highlights">
      <div className="legal-highlight">
        <FiCheckCircle />
        <strong>We never sell your data</strong>
        <span>Your information is used only to run InvoiceGen for you.</span>
      </div>
      <div className="legal-highlight">
        <FiLock />
        <strong>Encrypted & protected</strong>
        <span>Passwords are hashed and sessions use secure JWT tokens.</span>
      </div>
      <div className="legal-highlight">
        <FiTrash2 />
        <strong>You control it</strong>
        <span>Export or permanently delete your data whenever you want.</span>
      </div>
    </div>

    <section className="legal-card">
      <div className="legal-card-icon"><FiDatabase /></div>
      <div>
        <h2>1. Information We Collect</h2>
        <p>We collect the information you provide directly when you use InvoiceGen:</p>
        <ul>
          <li><strong>Account details</strong> — name, email address, phone number.</li>
          <li><strong>Business profile</strong> — business name, GSTIN, address, state, logo, and digital signature.</li>
          <li><strong>Client data</strong> — billing/shipping addresses and GSTINs you store for invoicing.</li>
          <li><strong>Invoice data</strong> — line items, amounts, taxes, and payment statuses you create.</li>
        </ul>
      </div>
    </section>

    <section className="legal-card">
      <div className="legal-card-icon"><FiEye /></div>
      <div>
        <h2>2. How We Use Your Information</h2>
        <ul>
          <li>Generate, store, and email your GST-compliant invoices.</li>
          <li>Authenticate your account, including Google Sign-In.</li>
          <li>Send transactional emails such as invoice delivery and password resets.</li>
          <li>Keep the platform secure and improve its performance.</li>
        </ul>
      </div>
    </section>

    <section className="legal-card">
      <div className="legal-card-icon"><FiLock /></div>
      <div>
        <h2>3. Data Storage & Security</h2>
        <p>Your data is stored on secure MongoDB infrastructure with encryption in transit. Access is protected by JWT-based authentication, and passwords are stored as secure hashes. Invoice and client records are visible only to your account.</p>
      </div>
    </section>

    <section className="legal-card">
      <div className="legal-card-icon"><FiShare2 /></div>
      <div>
        <h2>4. Data Sharing</h2>
        <p>We do not sell your personal data. We share it only with service providers that help operate the platform — such as email delivery (Resend), database hosting (MongoDB), and PDF rendering — under strict confidentiality agreements.</p>
      </div>
    </section>

    <section className="legal-card">
      <div className="legal-card-icon"><FiTrash2 /></div>
      <div>
        <h2>5. Your Rights</h2>
        <p>You may access, correct, export, or delete your account and its data at any time. To request a full deletion, contact us through the <Link to="/contact">Contact page</Link> and we&apos;ll process it promptly.</p>
      </div>
    </section>

    <section className="legal-card">
      <div className="legal-card-icon"><FiHelpCircle /></div>
      <div>
        <h2>6. Questions?</h2>
        <p>Have a question about this policy? Reach out any time via the <Link to="/contact">Contact page</Link> and our team will get back to you.</p>
      </div>
    </section>
  </LegalLayout>
);

export default Privacy;