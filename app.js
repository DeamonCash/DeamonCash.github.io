const toggles = [...document.querySelectorAll('.project-toggle')];
for (const button of toggles) {
  button.addEventListener('click', () => {
    const shouldOpen = button.getAttribute('aria-expanded') !== 'true';
    for (const other of toggles) {
      const active = other === button && shouldOpen;
      other.setAttribute('aria-expanded', String(active));
      const panel = document.getElementById(other.getAttribute('aria-controls'));
      panel.classList.toggle('is-open', active);
      panel.setAttribute('aria-hidden', String(!active));
    }
  });
}

// Keep only one planned certification preview open at a time.
const certToggles = [...document.querySelectorAll('.cert-toggle')];
for (const button of certToggles) {
  button.addEventListener('click', () => {
    const shouldOpen = button.getAttribute('aria-expanded') !== 'true';
    for (const other of certToggles) {
      const active = other === button && shouldOpen;
      other.setAttribute('aria-expanded', String(active));
      const panel = document.getElementById(other.getAttribute('aria-controls'));
      panel.classList.toggle('is-open', active);
      panel.setAttribute('aria-hidden', String(!active));
    }
  });
}

// Preserve the existing contact section as a no-JavaScript fallback.
const contactDialog = document.getElementById('contact-dialog');
const contactTriggers = document.querySelectorAll('.contact-trigger');
if (contactDialog && typeof contactDialog.showModal === 'function') {
  for (const trigger of contactTriggers) {
    trigger.addEventListener('click', (event) => {
      event.preventDefault();
      for (const image of contactDialog.querySelectorAll('img[data-src]')) {
        image.src = image.dataset.src;
        delete image.dataset.src;
      }
      contactDialog.showModal();
      document.documentElement.classList.add('contact-open');
      contactDialog.querySelector('.drawer-close').focus();
    });
  }
  contactDialog.querySelector('.drawer-close').addEventListener('click', () => contactDialog.close());
  contactDialog.addEventListener('click', (event) => {
    if (event.target !== contactDialog) return;
    const rect = contactDialog.getBoundingClientRect();
    if (event.clientX < rect.left || event.clientX > rect.right || event.clientY < rect.top || event.clientY > rect.bottom) contactDialog.close();
  });
  contactDialog.addEventListener('close', () => document.documentElement.classList.remove('contact-open'));
}
