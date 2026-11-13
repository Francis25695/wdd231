const url = 'data/members.json';
const spotlights = document.querySelector('#spotlights');
const levels = { 1: 'Member', 2: 'Silver', 3: 'Gold' };

async function getSpotlights() {
  try {
    const response = await fetch(url);
    if (!response.ok) {
      throw new Error(`Request failed with status ${response.status}`);
    }
    const data = await response.json();
    // Only silver (2) and gold (3) members qualify
    const eligible = data.members.filter((member) => member.membership >= 2);
    displaySpotlights(shuffle(eligible).slice(0, 3));
  } catch (error) {
    console.error(error);
    spotlights.textContent = 'Member spotlights are unavailable right now.';
  }
}

// Fisher-Yates shuffle on a copy of the array
function shuffle(array) {
  const copy = [...array];
  for (let i = copy.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [copy[i], copy[j]] = [copy[j], copy[i]];
  }
  return copy;
}

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

const displaySpotlights = (members) => {
  spotlights.innerHTML = '';
  members.forEach((member) => {
    const card = document.createElement('section');
    card.classList.add('member-card');

    const head = document.createElement('div');
    head.classList.add('card-head');
    const name = document.createElement('h3');
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
      infoLine('PHONE', member.phone, `tel:${member.phone.replace(/\s/g, '')}`),
      infoLine('ADDRESS', member.address),
      infoLine('URL', member.website.replace(/^https?:\/\//, ''), member.website),
      infoLine('LEVEL', levels[member.membership])
    );

    body.append(image, info);
    card.append(head, body);
    spotlights.appendChild(card);
  });
};

getSpotlights();