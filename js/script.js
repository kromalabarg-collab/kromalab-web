const title = document.querySelector('[data-putty]');
const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

// Se reproduce la mecánica de Putty: cada carácter conserva su posición,
// tiene una capa visual independiente y rebota al pasar sobre él.
if (title && !reduceMotion) {
  const letters = [];
  const colors = ['#26b054', '#e93323', '#007cf3', '#ffba24'];

  [...title.children].forEach((line) => {
    line.classList.add('putty-line');
    const fragment = document.createDocumentFragment();

    [...line.textContent].forEach((character, index) => {
      const glyph = document.createElement('span');
      const drift = document.createElement('span');
      const face = document.createElement('span');
      glyph.className = 'putty-letter';
      drift.className = 'putty-drift';
      face.className = 'putty-face';
      glyph.textContent = character;
      face.textContent = character;
      drift.append(face);
      glyph.append(drift);
      glyph.style.setProperty('--putty-color', colors[letters.length % colors.length]);
      glyph.style.setProperty('--putty-rotation', `${index % 2 ? -12 : 12}deg`);
      if (character.toUpperCase() === 'T' || character.toUpperCase() === 'P') glyph.classList.add('is-special');
      glyph.addEventListener('mouseenter', () => glyph.classList.add('is-active'));
      glyph.addEventListener('mouseleave', () => glyph.classList.remove('is-active'));
      fragment.append(glyph);
      letters.push({ drift, x: 0, y: 0 });
    });

    line.replaceChildren(fragment);
  });

  let touchLetterTimer;
  title.addEventListener('pointerdown', (event) => {
    if (event.pointerType !== 'touch') return;
    const glyph = event.target.closest('.putty-letter');
    if (!glyph) return;

    letters.forEach(({ drift }) => drift.parentElement.classList.remove('is-active'));
    glyph.classList.add('is-active');
    clearTimeout(touchLetterTimer);
    touchLetterTimer = window.setTimeout(() => glyph.classList.remove('is-active'), 750);
  }, { passive: true });

  let rawX = 0;
  let rawY = 0;
  let frame;
  const settle = (current, target, speed) => current + (target - current) * speed;

  const trackPointer = ({ clientX, clientY }) => {
    rawX = (clientX / window.innerWidth - .5) * 40;
    rawY = (clientY / window.innerHeight - .5) * 40;
  };

  const render = () => {
    letters.forEach((letter) => {
      letter.x = settle(letter.x, rawX * .15, .12);
      letter.y = settle(letter.y, rawY * .3, .12);
      letter.drift.style.transform = `translate3d(${letter.x}px, ${letter.y}px, 0)`;
    });
    frame = requestAnimationFrame(render);
  };

  window.addEventListener('mousemove', trackPointer, { passive: true });
  frame = requestAnimationFrame(render);
  window.addEventListener('pagehide', () => {
    window.removeEventListener('mousemove', trackPointer);
    cancelAnimationFrame(frame);
  }, { once: true });
}

const projectsButtons = document.querySelectorAll('.projects-button');
if (projectsButtons.length && !reduceMotion) {
  const buttonColors = ['#26b054', '#007cf3', '#e93323', '#ffba24'];
  projectsButtons.forEach((button) => {
    button.addEventListener('mouseenter', () => {
      const nextColor = buttonColors[Math.floor(Math.random() * buttonColors.length)];
      button.style.setProperty('--button-color', nextColor);
    });
    button.addEventListener('mouseleave', () => {
      button.style.setProperty('--button-color', '#26b054');
    });
  });
}

const sectionTwo = document.querySelector('.section-two');
const revealItems = document.querySelectorAll('.scroll-reveal');
if (revealItems.length && 'IntersectionObserver' in window) {
  document.body.classList.add('motion-ready');

  const revealObserver = new IntersectionObserver((entries, observer) => {
    entries.forEach((entry) => {
      if (!entry.isIntersecting) return;
      entry.target.classList.add('is-visible');
      observer.unobserve(entry.target);
    });
  }, { threshold: .14 });
  revealItems.forEach((item) => revealObserver.observe(item));
}

if (sectionTwo && 'IntersectionObserver' in window) {
  const sectionObserver = new IntersectionObserver((entries, observer) => {
    if (!entries[0].isIntersecting) return;
    sectionTwo.classList.add('is-visible');
    observer.disconnect();
  }, { threshold: .08 });

  sectionObserver.observe(sectionTwo);
}

const kromMotion = document.querySelector('.krom-motion');
if (kromMotion && !reduceMotion) {
  const motionObserver = new IntersectionObserver((entries, observer) => {
    if (!entries[0].isIntersecting) return;
    kromMotion.classList.add('is-visible');
    observer.disconnect();
  }, { threshold: .28 });

  motionObserver.observe(kromMotion);
} else if (kromMotion) {
  kromMotion.classList.add('is-visible');
}

const serviceExplorer = document.querySelector('[data-service-explorer]');
if (serviceExplorer) {
  const services = {
    app: {
      label: 'Kroma App',
      title: 'Una app completa,<br>con todo conectado.',
      description: 'Para convertir una idea en un producto digital útil, claro y listo para crecer.',
      features: [
        'Flujos y pantallas pensados de punta a punta.',
        'Desarrollo de webapps y productos completos.',
        'Una experiencia que se ve bien y funciona mejor.',
      ],
      badge: 'APP',
      cta: 'Quiero crear mi app',
      href: 'https://wa.me/5491172370403?text=Hola%20Kroma%2C%20quiero%20crear%20una%20app.',
      tabId: 'kroma-app-tab',
    },
    design: {
      label: 'Kroma Design',
      title: 'Una web que se siente<br>como tu marca.',
      description: 'Para crear una presencia digital distinta, desde la idea visual hasta la página lista para mostrar.',
      features: [
        'Dirección visual y UX/UI con identidad propia.',
        'Páginas web pensadas para comunicar y convertir.',
        'Diseño y desarrollo frontend en una sola experiencia.',
      ],
      badge: 'WEB',
      cta: 'Quiero crear mi web',
      href: 'https://wa.me/5491172370403?text=Hola%20Kroma%2C%20quiero%20crear%20una%20web.',
      tabId: 'kroma-design-tab',
    },
  };

  const selectors = serviceExplorer.querySelectorAll('button[data-service]');
  const tabs = serviceExplorer.querySelectorAll('.service-switch');
  const panel = serviceExplorer.querySelector('.service-preview');
  const label = serviceExplorer.querySelector('[data-service-label]');
  const title = serviceExplorer.querySelector('[data-service-title]');
  const description = serviceExplorer.querySelector('[data-service-description]');
  const features = serviceExplorer.querySelector('[data-service-features]');
  const badge = serviceExplorer.querySelector('[data-service-badge]');
  const cta = serviceExplorer.querySelector('[data-service-cta]');
  const ctaLabel = serviceExplorer.querySelector('[data-service-cta-label]');

  const selectService = (serviceName) => {
    const service = services[serviceName];
    if (!service) return;

    selectors.forEach((control) => control.classList.toggle('is-active', control.dataset.service === serviceName));
    tabs.forEach((tab) => tab.setAttribute('aria-selected', String(tab.dataset.service === serviceName)));
    panel.setAttribute('aria-labelledby', service.tabId);
    panel.dataset.service = serviceName;
    label.textContent = service.label;
    title.innerHTML = service.title;
    description.textContent = service.description;
    badge.textContent = service.badge;
    cta.href = service.href;
    ctaLabel.textContent = service.cta;
    features.replaceChildren(...service.features.map((feature) => {
      const item = document.createElement('li');
      item.textContent = feature;
      return item;
    }));
  };

  selectors.forEach((control) => control.addEventListener('click', () => selectService(control.dataset.service)));
  tabs.forEach((tab, index) => tab.addEventListener('keydown', (event) => {
    if (!['ArrowLeft', 'ArrowRight'].includes(event.key)) return;
    event.preventDefault();
    const nextTab = tabs[(index + (event.key === 'ArrowRight' ? 1 : tabs.length - 1)) % tabs.length];
    nextTab.focus();
    selectService(nextTab.dataset.service);
  }));
}

const kromContact = document.querySelector('.krom-contact');
if (kromContact) {
  const contactTrigger = kromContact.querySelector('.krom-contact-trigger');
  const contactPanel = kromContact.querySelector('.krom-contact-panel');
  let contrastFrame;

  const updateKromContrast = () => {
    contrastFrame = undefined;
    const bounds = contactTrigger.getBoundingClientRect();
    const elements = document.elementsFromPoint(bounds.left + bounds.width / 2, bounds.top + bounds.height / 2);
    const isOverDark = elements.some((element) => element !== contactTrigger && !contactTrigger.contains(element) && element.closest?.('.section-two'));
    kromContact.classList.toggle('is-over-dark', isOverDark);
  };
  const requestKromContrast = () => {
    if (!contrastFrame) contrastFrame = requestAnimationFrame(updateKromContrast);
  };
  const closeKromContact = () => {
    kromContact.classList.remove('is-open');
    contactTrigger.setAttribute('aria-expanded', 'false');
    contactPanel.setAttribute('aria-hidden', 'true');
  };

  contactTrigger.addEventListener('click', () => {
    const isOpen = kromContact.classList.toggle('is-open');
    contactTrigger.setAttribute('aria-expanded', String(isOpen));
    contactPanel.setAttribute('aria-hidden', String(!isOpen));
  });

  document.addEventListener('click', (event) => {
    if (!kromContact.contains(event.target)) closeKromContact();
  });
  document.addEventListener('keydown', (event) => {
    if (event.key === 'Escape') closeKromContact();
  });
  window.addEventListener('scroll', requestKromContrast, { passive: true });
  window.addEventListener('resize', requestKromContrast, { passive: true });
  requestKromContrast();
}

document.querySelectorAll('[data-project-menu]').forEach((menu) => {
  const trigger = menu.querySelector('.projects-menu-trigger');
  const panel = menu.querySelector('.projects-menu-panel');
  if (!trigger || !panel) return;

  const closeMenu = () => {
    menu.classList.remove('is-open');
    trigger.setAttribute('aria-expanded', 'false');
    panel.setAttribute('aria-hidden', 'true');
  };

  trigger.addEventListener('click', () => {
    const isOpen = menu.classList.toggle('is-open');
    trigger.setAttribute('aria-expanded', String(isOpen));
    panel.setAttribute('aria-hidden', String(!isOpen));
  });

  document.addEventListener('click', (event) => {
    if (!menu.contains(event.target)) closeMenu();
  });
  document.addEventListener('keydown', (event) => {
    if (event.key === 'Escape') closeMenu();
  });
});

document.querySelectorAll('[data-mobile-menu-toggle]').forEach((toggle) => {
  const header = toggle.closest('header');
  const navigation = header?.querySelector('.site-navigation');
  if (!header || !navigation) return;

  const closeMobileMenu = () => {
    header.classList.remove('is-mobile-menu-open');
    toggle.setAttribute('aria-expanded', 'false');
    toggle.setAttribute('aria-label', 'Abrir menú');
    navigation.querySelectorAll('[data-project-menu]').forEach((menu) => {
      menu.classList.remove('is-open');
      menu.querySelector('.projects-menu-trigger')?.setAttribute('aria-expanded', 'false');
      menu.querySelector('.projects-menu-panel')?.setAttribute('aria-hidden', 'true');
    });
  };

  toggle.addEventListener('click', () => {
    const isOpen = header.classList.toggle('is-mobile-menu-open');
    toggle.setAttribute('aria-expanded', String(isOpen));
    toggle.setAttribute('aria-label', isOpen ? 'Cerrar menú' : 'Abrir menú');
  });

  navigation.querySelectorAll('a').forEach((link) => link.addEventListener('click', closeMobileMenu));
  document.addEventListener('keydown', (event) => {
    if (event.key === 'Escape') closeMobileMenu();
  });
});
