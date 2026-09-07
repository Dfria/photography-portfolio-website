import { esc } from './lib.js';
import { initLayout, CONTACT_EMAIL } from './layout.js';

initLayout('contact');

// -------------------------------------------------------------------------
// HOW THE CONTACT FORM SENDS EMAIL
//
// A static site (GitHub Pages) has no server, so it can't send email itself.
// This form uses Formspree (https://formspree.io), a free service that emails
// submissions to you.
//
// TO ENABLE REAL BACKGROUND SUBMISSIONS:
//   1. Create a free account at https://formspree.io
//   2. Add a new form; point it at your email (jordandallasfrias@gmail.com).
//   3. Copy the form's endpoint. It looks like:
//        https://formspree.io/f/abcdwxyz
//   4. Paste just the ID part ("abcdwxyz") into FORMSPREE_ID below.
//
// UNTIL YOU DO THAT:
//   The form falls back to opening the visitor's own email app (mailto:)
//   pre-filled with their message, so it still works out of the box.
// -------------------------------------------------------------------------
const FORMSPREE_ID = ''; // e.g. 'abcdwxyz'

const form = document.getElementById('contact-form');
const statusEl = document.getElementById('form-status');
const submitBtn = document.getElementById('submit-btn');

function setStatus(message, kind) {
  statusEl.textContent = message;
  statusEl.className = `form-status${kind ? ' ' + kind : ''}`;
}

function validate(data) {
  if (!data.name.trim()) return 'Please enter your name.';
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(data.email)) return 'Please enter a valid email.';
  if (!data.message.trim()) return 'Please enter a message.';
  return null;
}

function sendViaMailto(data) {
  const subject = data.subject?.trim() || `Portfolio inquiry from ${data.name}`;
  const body =
    `Name: ${data.name}\n` +
    `Email: ${data.email}\n\n` +
    `${data.message}`;
  const href =
    `mailto:${CONTACT_EMAIL}` +
    `?subject=${encodeURIComponent(subject)}` +
    `&body=${encodeURIComponent(body)}`;
  window.location.href = href;
  setStatus(
    "Your email app should open with the message ready to send. If it didn't, " +
      `email me directly at ${CONTACT_EMAIL}.`,
    'ok'
  );
}

async function sendViaFormspree(data) {
  const res = await fetch(`https://formspree.io/f/${FORMSPREE_ID}`, {
    method: 'POST',
    headers: { Accept: 'application/json', 'Content-Type': 'application/json' },
    body: JSON.stringify(data),
  });
  if (!res.ok) {
    let detail = '';
    try {
      const json = await res.json();
      detail = (json.errors || []).map((e) => e.message).join(', ');
    } catch {
      /* ignore */
    }
    throw new Error(detail || `Submission failed (${res.status})`);
  }
}

form.addEventListener('submit', async (e) => {
  e.preventDefault();
  const data = {
    name: form.name.value,
    email: form.email.value,
    subject: form.subject.value,
    message: form.message.value,
  };

  const error = validate(data);
  if (error) {
    setStatus(error, 'err');
    return;
  }

  // No Formspree configured yet → use the mailto fallback.
  if (!FORMSPREE_ID) {
    sendViaMailto(data);
    return;
  }

  submitBtn.disabled = true;
  setStatus('Sending…', '');
  try {
    await sendViaFormspree(data);
    form.reset();
    setStatus("Thanks! Your message was sent. I'll be in touch soon.", 'ok');
  } catch (err) {
    setStatus(
      `Sorry, something went wrong: ${esc(err.message)}. ` +
        `You can also email me directly at ${CONTACT_EMAIL}.`,
      'err'
    );
  } finally {
    submitBtn.disabled = false;
  }
});
