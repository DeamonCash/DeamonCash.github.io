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

// Respect the system theme until the visitor chooses a preference.
const themeButton = document.querySelector('.theme-toggle');
const systemTheme = window.matchMedia('(prefers-color-scheme: dark)');
let themeChoice = null;
try { themeChoice = localStorage.getItem('portfolio-theme'); } catch {}
function applyTheme(dark) {
  document.documentElement.dataset.theme = dark ? 'dark' : 'light';
  themeButton.setAttribute('aria-pressed', String(dark));
  themeButton.setAttribute('aria-label', dark ? 'Switch to light mode' : 'Switch to dark mode');
  themeButton.querySelector('[aria-hidden]').textContent = dark ? '☀' : '☾';
  themeButton.querySelector('.theme-label').textContent = dark ? 'Light' : 'Dark';
}
applyTheme(themeChoice ? themeChoice === 'dark' : systemTheme.matches);
themeButton.addEventListener('click', () => {
  const dark = document.documentElement.dataset.theme !== 'dark';
  themeChoice = dark ? 'dark' : 'light';
  try { localStorage.setItem('portfolio-theme', themeChoice); } catch {}
  applyTheme(dark);
});
systemTheme.addEventListener('change', event => { if (!themeChoice) applyTheme(event.matches); });

// Highlight the section currently under the fixed navigation.
const railLinks = Array.from(document.querySelectorAll('.section-rail a'));
const railSections = railLinks.map(link => document.querySelector(link.getAttribute('href')));
let railScheduled = false;
function updateRail(){
  railScheduled = false;
  const position = window.innerHeight * .38;
  let active = -1;
  railSections.forEach((section,index) => { if(section && section.getBoundingClientRect().top <= position) active=index; });
  if(window.innerHeight + window.scrollY >= document.documentElement.scrollHeight - 3) active=railSections.length-1;
  railLinks.forEach((link,index)=> {if(index===active) link.setAttribute('aria-current','location'); else link.removeAttribute('aria-current');});
}
function scheduleRail(){if(!railScheduled){railScheduled=true;requestAnimationFrame(updateRail);}}
window.addEventListener('scroll',scheduleRail,{passive:true});window.addEventListener('resize',scheduleRail);updateRail();

const resumeViewer = document.getElementById('resume-viewer');
const resumeExpand = document.querySelector('.resume-expand');
if (resumeViewer && resumeExpand && typeof resumeViewer.showModal === 'function') {
  resumeExpand.hidden = false;
  resumeExpand.addEventListener('click', () => {
    resumeViewer.showModal();
    resumeViewer.scrollTop = 0;
  });
  for (const link of resumeViewer.querySelectorAll('.resume-credential-link')) {
    link.addEventListener('click', () => resumeViewer.close(link.hash.slice(1)));
  }
  resumeViewer.addEventListener('close', () => {
    const target = document.getElementById(resumeViewer.returnValue) || resumeExpand;
    target.focus({ preventScroll: true });
    resumeViewer.returnValue = '';
  });
}

// Switch between the NOVA prototype image and its recorded app demo.
const novaViews = document.querySelectorAll('.nova-media-button');
const novaOverview = document.querySelector('.nova-overview');
const novaVideoView = document.querySelector('.nova-video-view');
const novaDemo = document.querySelector('.nova-demo');
for (const button of novaViews) {
  button.addEventListener('click', () => {
    const showVideo = button.dataset.novaView === 'video';
    novaViews.forEach(item => item.setAttribute('aria-pressed', String(item === button)));
    novaOverview.hidden = showVideo;
    novaVideoView.hidden = !showVideo;
    if (showVideo) {
      novaDemo.muted = true;
      novaDemo.play().catch(() => {});
    } else {
      novaDemo.pause();
    }
  });
}
document.querySelector('[aria-controls="project-02"]').addEventListener('click', event => {
  if (event.currentTarget.getAttribute('aria-expanded') !== 'true') novaDemo.pause();
});
for (const button of toggles) {
  if (button.getAttribute('aria-controls') !== 'project-02') {
    button.addEventListener('click', () => novaDemo.pause());
  }
}


for (const credential of document.querySelectorAll('.credential')) {
  const buttons = credential.querySelectorAll('.credential-switch button');
  for (const selected of buttons) {
    selected.addEventListener('click', () => {
      for (const button of buttons) {
        const active = button === selected;
        button.setAttribute('aria-pressed', String(active));
        document.getElementById(button.getAttribute('aria-controls')).hidden = !active;
      }
    });
  }
}
