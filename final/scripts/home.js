import { initUI, escapeHTML } from './ui.js';
import { getData, getSavedResidents } from './data.js';
import { getCategories, categoryLabels } from './categories.js';

initUI();

const phoneLink = (phone) => `tel:${phone.replace(/\s/g, '')}`;

function renderTotals(cell, leaders, households, residents) {
  const subVillages = cell.villages.flatMap((village) => village.subVillages);
  const items = [
    { value: residents.length, label: 'Residents' },
    { value: households.length, label: 'Households' },
    { value: subVillages.length, label: 'Sub-villages' },
    { value: leaders.length, label: 'Leaders' }
  ];
  document.querySelector('#totals').innerHTML = items
    .map((item) => `<li><span class="total-value">${item.value}</span><span class="total-label">${item.label}</span></li>`)
    .join('');
}

function renderCategories(residents) {
  // reduce: tally every category each resident belongs to
  const counts = residents.reduce((tally, resident) => {
    getCategories(resident).forEach((category) => {
      tally[category] = (tally[category] || 0) + 1;
    });
    return tally;
  }, {});

  const order = ['child', 'youth', 'woman', 'man', 'elderly', 'pwd', 'widow', 'orphan', 'child-headed', 'young-mother', 'vsla'];

  document.querySelector('#categories').innerHTML = order
    .map((key) => {
      const count = counts[key] || 0;
      const percent = residents.length ? Math.round((count / residents.length) * 100) : 0;
      return `
        <li>
          <a class="cat-card" href="directory.html?category=${key}">
            <span class="cat-count">${count}</span>
            <span class="cat-label">${categoryLabels[key]}</span>
            <span class="cat-percent">${percent}% of residents</span>
            <span class="bar" style="--pct:${percent}%"></span>
          </a>
        </li>`;
    })
    .join('');
}

function renderAreas(cell, leaders, households, residents) {
  document.querySelector('#areas').innerHTML = cell.villages
    .map((village) => `
      <article class="village">
        <h3>${escapeHTML(village.name)} village</h3>
        <ul>
          ${village.subVillages
            .map((subVillage) => {
              const houseCount = households.filter((h) => h.subVillage === subVillage).length;
              const peopleCount = residents.filter((r) => r.subVillage === subVillage).length;
              const chief = leaders.find((l) => l.level === 'sub-village' && l.area === subVillage);
              return `
                <li>
                  <strong>${escapeHTML(subVillage)}</strong>
                  <span>${houseCount} households · ${peopleCount} residents</span>
                  <span>Village chief: ${chief ? escapeHTML(chief.name) : 'Not assigned'}</span>
                </li>`;
            })
            .join('')}
        </ul>
      </article>`)
    .join('');
}

function renderAttention(households, residents) {
  const flagged = households
    .map((household) => {
      const reasons = [];
      if (!household.latrine) reasons.push('No latrine');
      if (household.water === 'Unprotected well') reasons.push('Unprotected water source');
      return { household, reasons };
    })
    .filter((item) => item.reasons.length > 0);

  const list = document.querySelector('#attention');
  if (flagged.length === 0) {
    list.innerHTML = '<li>No households currently need attention.</li>';
    return;
  }

  list.innerHTML = flagged
    .map(({ household, reasons }) => {
      const head = residents.find((r) => r.id === household.headId);
      return `
        <li>
          <a href="directory.html?household=${household.id}">
            <strong>${head ? escapeHTML(head.name) : 'Unknown'} household</strong>
            <span>${escapeHTML(household.subVillage)}</span>
            <span class="reasons">${reasons.map((r) => `<span class="tag">${r}</span>`).join('')}</span>
          </a>
        </li>`;
    })
    .join('');
}

const leaderCard = (leader, featured = false) => `
  <li class="leader${featured ? ' featured' : ''}">
    <h3>${escapeHTML(leader.name)}</h3>
    <p class="leader-title">${escapeHTML(leader.title)}</p>
    <p>${escapeHTML(leader.area)}</p>
    <a href="${phoneLink(leader.phone)}">${escapeHTML(leader.phone)}</a>
  </li>`;

function renderLeadership(leaders) {
  const lc1 = leaders.find((l) => l.title === 'LC I Chairperson');
  const committee = leaders.filter((l) => l.level === 'cell' && l !== lc1);
  const chiefs = leaders.filter((l) => l.level === 'sub-village');

  document.querySelector('#leadership').innerHTML = [
    lc1 ? leaderCard(lc1, true) : '',
    ...chiefs.map((l) => leaderCard(l)),
    ...committee.map((l) => leaderCard(l))
  ].join('');
}

async function init() {
  try {
    const [cell, leaderData, householdData, residentData] = await Promise.all([
      getData('cell.json'),
      getData('leaders.json'),
      getData('households.json'),
      getData('residents.json')
    ]);

    const leaders = leaderData.leaders;
    const households = householdData.households;
    const residents = [...residentData.residents, ...getSavedResidents()];

    renderTotals(cell, leaders, households, residents);
    renderCategories(residents);
    renderAreas(cell, leaders, households, residents);
    renderAttention(households, residents);
    renderLeadership(leaders);
  } catch (error) {
    console.error(error);
    document.querySelector('#load-error').hidden = false;
  }
}

init();