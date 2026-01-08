import React from 'react';
import { Helmet } from 'react-helmet-async';
import Footer from '../../buttons/footer/footer';
import './legal.css';

const LegalPage = ({ title, description, children }) => (
  <main className="legal-page">
    <Helmet>
      <title>{title} | PHEE</title>
      {description ? <meta name="description" content={description} /> : null}
    </Helmet>
    <div className="legal-page__inner">
      <h1>{title}</h1>
      {description ? <p className="legal-page__intro">{description}</p> : null}
      <div className="legal-page__content">{children}</div>
    </div>
    <Footer />
  </main>
);

export default LegalPage;
