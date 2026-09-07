// Shared header (navbar) and footer, injected on every page so there's a
// single source of truth. Each page calls initLayout('<active-nav>').

import { pageLink } from './lib.js';

const CONTACT_EMAIL = 'jordandallasfrias@gmail.com';

// Optional social links. Fill in the URLs you want shown in the footer;
// leave a value empty ('') to hide that link.
const SOCIAL = {
  instagram: '', // e.g. 'https://instagram.com/yourhandle'
  website: '',
};

function navbar(active) {
  const home = pageLink('index.html');
  const contact = pageLink('contact.html');

  const link = (href, label, key) =>
    `<a href="${href}" class="nav-link${active === key ? ' active' : ''}">${label}</a>`;

  return `
    <header class="site-header">
      <div class="container nav">
        <a class="brand" href="${home}">Dallas Frias<span>.</span></a>
        <nav class="nav-links" aria-label="Primary">
          ${link(home, 'Albums', 'albums')}
          ${link(contact, 'Contact', 'contact')}
        </nav>
      </div>
    </header>`;
}

function footer() {
  const year = new Date().getFullYear();

  const socialLinks = Object.entries(SOCIAL)
    .filter(([, url]) => url)
    .map(
      ([name, url]) =>
        `<a href="${url}" target="_blank" rel="noopener noreferrer">${
          name.charAt(0).toUpperCase() + name.slice(1)
        }</a>`
    )
    .join('');

  return `
    <footer class="site-footer">
      <div class="container footer-inner">
        <div class="footer-brand">Dallas Frias — Photography &amp; Video</div>
        <div class="footer-links">
          <a href="${pageLink('index.html')}">Albums</a>
          <a href="${pageLink('contact.html')}">Contact</a>
          <a href="mailto:${CONTACT_EMAIL}">${CONTACT_EMAIL}</a>
          ${socialLinks}
        </div>
        <div class="footer-copy">© ${year} Jordan Dallas Frias. All rights reserved.</div>
      </div>
    </footer>`;
}

/**
 * Inject navbar and footer into placeholders on the page.
 * Expects <div id="site-header"></div> and <div id="site-footer"></div>.
 */
export function initLayout(active = '') {
  const headerMount = document.getElementById('site-header');
  const footerMount = document.getElementById('site-footer');
  if (headerMount) headerMount.outerHTML = navbar(active);
  if (footerMount) footerMount.outerHTML = footer();
}

export { CONTACT_EMAIL };
