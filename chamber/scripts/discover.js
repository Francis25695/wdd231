import { places } from '../data/discover.mjs';

const gallery = document.querySelector('#gallery');
const visit = document.querySelector('#visit');
const visitText = document.querySelector('#visit-text');
const dialog = document.querySelector('#place-dialog');
const dialogBody = document.querySelector('#place-dialog-body');

const DAY = 24 * 60 * 60 * 1000;

/* ----- visitor message (local storage) ----- */
function showVisitMessage() {
  const now = Date.now();
  let lastVisit = null;

  try {
    lastVisit = Number(localStorage.getItem('chamber-last-visit')) || null;
  } catch (error) {
    /* storage blocked: treat as a first visit */
  }

  let message;
  if (!lastVisit) {
    message = 'Welcome! Let us know if you have any questions.';
  } else {
    const days = Math.floor((now - lastVisit) / DAY);
    if (days < 1) {
      message = 'Back so soon! Awesome!';
    } else {
      message = `You last visited ${days} ${days === 1 ? 'day' : 'days'} ago.`;
    }
  }

  visitText.textContent = message;

  try {
    localStorage.setItem('chamber-last-visit', String(now));
  } catch (error) {
    /* ignore */
  }
}

document.querySelector('#visit-close').addEventListener('click', () => {
  visit.hidden = true;
});

/* ----- cards ----- */
const cardHTML = (place, index) => `
  <article class="place c${index + 1}">
    <h2>${place.name}</h2>
    <figure>
      <img src="images/${place.image}" alt="${place.alt}" width="300" height="200" loading="lazy">
    </figure>
    <address>${place.address}</address>
    <p>${place.description}</p>
    <button type="button" data-id="${place.id}">Learn more</button>
  </article>`;

gallery.insertAdjacentHTML('beforeend', places.map(cardHTML).join(''));

/* ----- learn more modal ----- */
gallery.addEventListener('click', (event) => {
  const button = event.target.closest('button[data-id]');
  if (!button) return;

  const place = places.find((item) => item.id === button.dataset.id);
  dialogBody.innerHTML = `
    <h2 id="place-dialog-title">${place.name}</h2>
    <address>${place.address}</address>
    <p>${place.details}</p>
    <button type="button" class="close-modal">Close</button>`;
  dialog.showModal();
});

dialog.addEventListener('click', (event) => {
  if (event.target === dialog || event.target.closest('.close-modal')) {
    dialog.close();
  }
});

showVisitMessage();