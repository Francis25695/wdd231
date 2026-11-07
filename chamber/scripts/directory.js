const url = 'data/members.json';
const container = document.querySelector('#members');
const gridBtn = document.querySelector('#grid-btn');
const listBtn = document.querySelector('#list-btn');

const levels = { 1: 'Member', 2: 'Silver', 3: 'Gold' };

async function getMembers() {
  try {
    const response = await fetch(url);
    if (!response.ok) {
      throw new Error(`Request failed with status ${response.status}`);
    }
    const data = await response.json();
    displayMembers(data.members);
  } catch (error) {
    console.error(error);
    container.textContent = 'Sorry, the business directory could not be loaded.';
  }
}

// Builds one "LABEL: value" line; value is plain text or a link
function infoLine(label, text, href) {
  const p = document.createElement('p');
  const strong = document.createElement('strong');
  strong.textContent = `${label}: `;
  p.appendChild(strong);
  if (href) {
    const a = document.createElement('a');
    a.href = href;
    a.textContent = text;
    if (href.startsWith('http')) {
      a.target = '_blank';
      a.rel = 'noopener noreferrer';
    }
    p.appendChild(a);
  } else {
    p.appendChild(document.createTextNode(text));
  }
  return p;
}

const displayMembers = (members) => {
  container.innerHTML = '';
  members.forEach((member) => {
    const card = document.createElement('section');
    card.classList.add('member-card');

    const head = document.createElement('div');
    head.classList.add('card-head');
    const name = document.createElement('h2');
    name.textContent = member.name;
    const tagline = document.createElement('p');
    tagline.classList.add('tagline');
    tagline.textContent = member.tagline;
    head.append(name, tagline);

    const body = document.createElement('div');
    body.classList.add('card-body');

    const image = document.createElement('img');
    image.setAttribute('src', `images/${member.image}`);
    image.setAttribute('alt', `${member.name} logo`);
    image.setAttribute('loading', 'lazy');
    image.setAttribute('width', '120');
    image.setAttribute('height', '120');

    const info = document.createElement('div');
    info.classList.add('info');
    info.append(
      infoLine('EMAIL', member.email, `mailto:${member.email}`),
      infoLine('PHONE', member.phone, `tel:${member.phone.replace(/\s/g, '')}`),
      infoLine('URL', member.website.replace(/^https?:\/\//, ''), member.website),
      infoLine('ADDRESS', member.address),
      infoLine('LEVEL', levels[member.membership])
    );

    body.append(image, info);
    card.append(head, body);
    container.appendChild(card);
  });
};

function setView(view) {
  container.classList.remove('grid', 'list');
  container.classList.add(view);
  gridBtn.setAttribute('aria-pressed', view === 'grid');
  listBtn.setAttribute('aria-pressed', view === 'list');
}

gridBtn.addEventListener('click', () => setView('grid'));
listBtn.addEventListener('click', () => setView('list'));

getMembers();