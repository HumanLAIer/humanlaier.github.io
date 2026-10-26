/** Human LAIer contact form: prepares a user-sent email, not a server submission. */
(() => {
  'use strict';
  const form = document.getElementById('sales-inquiry');
  if (!form) return;
  const prepared = document.getElementById('contact-prepared');
  const preparedText = document.getElementById('contact-prepared-message');
  const status = document.getElementById('contact-feedback');
  const copy = document.getElementById('contact-copy');
  const clean = (value) => String(value ?? '').replace(/[\r\n]+/g, ' ').trim();

  form.addEventListener('submit', (event) => {
    event.preventDefault();
    if (!form.reportValidity()) return;
    const data = new FormData(form);
    const field = (key) => clean(data.get(key));
    const organization = field('organization');
    const subject = 'Human LAIer inquiry — ' + organization.slice(0, 100);
    const message = [
      'Human LAIer website inquiry',
      '',
      'Name: ' + field('name'),
      'Work email: ' + field('email'),
      'Organization: ' + organization,
      'Role/title: ' + (field('role') || 'Not provided'),
      'Workforce size: ' + field('workforce'),
      'Reason for contacting: ' + field('interest'),
      '',
      'What we would like to discuss:',
      String(data.get('message') || '').trim(),
      '',
      '---',
      'Prepared by the visitor using the Human LAIer website. This email is sent only when the visitor presses Send in their email application.'
    ].join('\n');
    preparedText.value = 'To: sales@humanlaier.com\nSubject: ' + subject + '\n\n' + message;
    prepared.hidden = false;
    status.textContent = 'Your email app should open now. Please review the drafted message and press Send there. Nothing has been sent by this website.';
    const mailto = 'mailto:sales@humanlaier.com?subject=' + encodeURIComponent(subject) + '&body=' + encodeURIComponent(message);
    window.location.href = mailto;
  });

  copy.addEventListener('click', async () => {
    try {
      if (!navigator.clipboard || !navigator.clipboard.writeText) throw new Error('Clipboard API not available');
      await navigator.clipboard.writeText(preparedText.value);
      status.textContent = 'Message copied. Please paste it into an email to sales@humanlaier.com and press Send.';
    } catch (_) {
      preparedText.focus();
      preparedText.select();
      status.textContent = 'Select and copy the message above, then paste it into an email to sales@humanlaier.com.';
    }
  });
})();
