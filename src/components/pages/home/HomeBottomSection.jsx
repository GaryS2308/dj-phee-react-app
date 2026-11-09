import './HomeBottomSection.css';

import { HOME_FAQS as faqs } from '../../shared/homeFaqData';

const HomeBottomSection = () => {
  return (
    <section id="home-faq" className="home-faq reveal-scope">
      <div className="home-faq__inner">
        <h2 className="home-faq__heading" data-reveal data-reveal-order="0">COMMON QUESTIONS</h2>
        <div className="home-faq__list" data-reveal data-reveal-order="1">
          {faqs.map(({ q, a }) => (
            <details key={q} className="home-faq__item">
              <summary className="home-faq__question">
                <span>{q}</span>
                <span className="home-faq__icon" aria-hidden="true" />
              </summary>
              <p className="home-faq__answer">{a}</p>
            </details>
          ))}
        </div>
      </div>
    </section>
  );
};

export default HomeBottomSection;
