import React from 'react';
import { Link } from 'react-router-dom';
import { FiFileText, FiCheckCircle, FiUser, FiShield, FiAlertTriangle, FiRefreshCw, FiHelpCircle, FiZap } from 'react-icons/fi';
import LegalLayout from './LegalLayout';

const SECTIONS = [
  {
    icon: <FiCheckCircle />,
    title: '1. Acceptance of Terms',
    body: 'By accessing or using InvoiceGen, you agree to be bound by these Terms of Service. If you do not agree with any part of these terms, please do not use the platform.'
  },
  {
    icon: <FiZap />,
    title: '2. Use of the Service',
    body: 'InvoiceGen provides GST-compliant invoice creation, PDF generation, client management, and invoice emailing. You agree to use the service only for lawful business purposes and to provide accurate information.'
  },
  {
    icon: <FiUser />,
    title: '3. Account Responsibilities',
    body: 'You are responsible for safeguarding your login credentials and for all activity that occurs under your account. Notify us immediately of any unauthorized access.'
  },
  {
    icon: <FiShield />,
    title: '4. Intellectual Property',
    body: 'All templates, software, logos, and content comprising InvoiceGen are the property of InvoiceGen and are protected by applicable copyright and trademark laws.'
  },
  {
    icon: <FiAlertTriangle />,
    title: '5. Limitation of Liability',
    body: 'InvoiceGen is provided "as is" without warranties of any kind. We are not liable for any indirect, incidental, or consequential damages arising from your use of the service.'
  },
  {
    icon: <FiRefreshCw />,
    title: '6. Changes to Terms',
    body: 'We may update these terms from time to time. Continued use of the service after changes constitutes acceptance of the revised terms.'
  }
];

const Terms = () => (
  <LegalLayout
    icon={<FiFileText />}
    title="Terms of Service"
    subtitle="The simple, fair rules that keep InvoiceGen running smoothly for everyone."
    updated="August 13, 2026"
  >
    <div className="legal-stack">
      {SECTIONS.map((s) => (
        <section key={s.title} className="legal-card">
          <div className="legal-card-icon">{s.icon}</div>
          <div>
            <h2>{s.title}</h2>
            <p>{s.body}</p>
          </div>
        </section>
      ))}

      <section className="legal-card">
        <div className="legal-card-icon"><FiHelpCircle /></div>
        <div>
          <h2>7. Contact</h2>
          <p>For questions about these terms, visit the <Link to="/contact">Contact page</Link>.</p>
        </div>
      </section>
    </div>
  </LegalLayout>
);

export default Terms;