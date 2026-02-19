import React from 'react';
const LegalPage = ({ title, description, children }) => (
  <main className="legal-page">
    <div className="legal-page__inner">
      <h1>{title}</h1>
      {description ? <p className="legal-page__intro">{description}</p> : null}
      <div className="legal-page__content">{children}</div>
    </div>
  </main>
);

export default LegalPage;
