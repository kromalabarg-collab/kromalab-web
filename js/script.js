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
