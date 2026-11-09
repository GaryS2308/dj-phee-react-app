import { readFileSync } from 'node:fs';
import { test } from 'node:test';
import assert from 'node:assert/strict';
const source = readFileSync(new URL('../lib/siteAnalytics.js', import.meta.url), 'utf8');
const { track, eventCategory, isPrivateRoute, trackLinkClick } = await import(`data:text/javascript;base64,${Buffer.from(source).toString('base64')}`);

test('consent, private route and PII protections', () => {
  const calls = [];
  global.window = {
    location: { pathname: '/booking', origin: 'https://phee.co.za', search: '?ga_debug=1&email=secret' },
    localStorage: { getItem: () => 'denied' }, gtag: (...args) => calls.push(args)
  };
  track('generate_lead', { form_id: 'booking-form' });
  assert.equal(calls.length, 0);
  window.localStorage.getItem = () => 'granted';
  track('generate_lead', { form_id: 'booking-form', event_type: eventCategory('Jane wedding'), email: 'private@example.com', details: 'secret' });
  assert.deepEqual(calls[0], ['event', 'generate_lead', { form_id: 'booking-form', event_type: 'other', page_location: 'https://phee.co.za/booking', debug_mode: true }]);
  window.location.pathname = '/admin/bookings';
  track('generate_lead');
  assert.equal(calls.length, 1);
  assert.ok(isPrivateRoute('/response'));
  assert.equal(eventCategory('Wedding'), 'wedding');
  delete global.window;
  assert.doesNotThrow(() => track('generate_lead'));
});

test('delegated clicks classify links without sending contact values', () => {
  const calls = [];
  global.window = { location: { pathname: '/', origin: 'https://phee.co.za', search: '' }, localStorage: { getItem: () => 'granted' }, gtag: (...args) => calls.push(args) };
  for (const [href, expected] of [['mailto:private@example.com', 'email_click'], ['tel:+27123456789', 'phone_click'], ['https://wa.me/27123456789', 'whatsapp_click'], ['https://instagram.com/__phee__', 'social_click'], ['https://phee.co.za/booking?email=secret#booking', 'cta_click']]) {
    trackLinkClick({ target: { closest: () => ({ href, textContent: 'Book now', closest: () => null }) } });
    assert.equal(calls.at(-1)[1], expected);
    assert.doesNotMatch(JSON.stringify(calls.at(-1)), /private@example|27123456789|secret/);
  }
  delete global.window;
});
