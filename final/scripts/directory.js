import { initUI, escapeHTML } from './ui.js';
import { getData, getSavedResidents } from './data.js';
import { getAge, getCategories, categoryLabels } from './categories.js';

initUI();

const els = {
  form: document.querySelector('#filters'),
  search: document.querySelector('#search'),
  category: document.querySelector('#category'),
  subVillage: document.querySelector('#subvillage'),
  reset: document.querySelector('#reset'),
  count: document.querySelector('#result-count'),
  results: document.querySelector('#results'),
  banner: document.querySelector('#household-banner'),
  error: document.querySelector('#load-error'),
  dialog: document.querySelector('#profile'),
  profileBody: document.querySelector('#profile-body')
};

const FILTER_KEY = 'ivms-filters';
const FOLLOW_KEY = 'ivms-followups';
const defaults = { category: 'all', subVillage: 'all', search: '' };

const shortLabels = {
  child: 'Child', youth: 'Youth', woman: 'Woman', man: 'Man', elderly: 'Elderly',
  pwd: 'PWD', widow: 'Widow', orphan: 'Orphan', 'child-headed': 'Child-headed',
  'young-mother': 'Young mother', vsla: 'VSLA'
};

let residents = [];
let households = [];
let leaders = [];

/* ---------- local storage helpers ---------- */
function readStorage(key, fallback) {
  try {
    return JSON.parse(localStorage.getItem(key)) ?? fallback;
  } catch (error) {
    return fallback;
  }
}

function writeStorage(key, value) {
  try {
    localStorage.setItem(key, JSON.stringify(value));
  } catch (error) {
    /* storage blocked: ignore */
  }
}

let filters = { ...defaults, ...readStorage(FILTER_KEY, {}) };
let followUps = readStorage(FOLLOW_KEY, []);

// Links from the dashboard (?category=child or ?household=hh-02) win over saved filters
const params = new URLSearchParams(window.location.search);
if (params.get('category')) filters.category = params.get('category');
const householdFilter = params.get('household');

/* ---------- filters ---------- */
function fillSelects(cell) {
  const categoryOptions = [
    ['all', 'All groups'],
    ...Object.entries(categoryLabels),
    ['followup', 'Marked for follow-up']
  ];
  els.category.innerHTML = categoryOptions
    .map(([value, label]) => `<option value="${value}">${escapeHTML(label)}</option>`)
    .join('');

  const subVillages = cell.villages.flatMap((village) => village.subVillages);
  els.subVillage.innerHTML =
    '<option value="all">All sub-villages</option>' +
    subVillages.map((name) => `<option value="${escapeHTML(name)}">${escapeHTML(name)}</option>`).join('');

  // Fall back to "all" if a saved or linked value no longer exists
  if (!categoryOptions.some(([value]) => value === filters.category)) filters.category = 'all';
  if (filters.subVillage !== 'all' && !subVillages.includes(filters.subVillage)) filters.subVillage = 'all';

  els.category.value = filters.category;
  els.subVillage.value = filters.subVillage;
  els.search.value = filters.search;
}

const matches = (resident) => {
  if (householdFilter && resident.householdId !== householdFilter) return false;

  if (filters.category === 'followup') {
    if (!followUps.includes(resident.id)) return false;
  } else if (filters.category !== 'all' && !getCategories(resident).includes(filters.category)) {
    return false;
  }

  if (filters.subVillage !== 'all' && resident.subVillage !== filters.subVillage) return false;

  const term = filters.search.trim().toLowerCase();
  if (term) {
    const haystack = `${resident.name} ${resident.occupation} ${resident.subVillage}`.toLowerCase();
    if (!haystack.includes(term)) return false;
  }
  return true;
};

/* ---------- cards ---------- */
const initials = (name) =>
  name.split(' ').map((word) => word[0]).slice(0, 2).join('').toUpperCase();

const residentCard = (resident) => {
  const chips = getCategories(resident)
    .map((category) => `<span class="chip">${escapeHTML(shortLabels[category] ?? category)}</span>`)
    .join('');
  const flagged = followUps.includes(resident.id)
    ? ' <span class="flag" title="Marked for follow-up" aria-label="Marked for follow-up">⚑</span>'
    : '';

  return `
    <li class="resident">
      <div class="avatar" aria-hidden="true">${escapeHTML(initials(resident.name))}</div>
      <div class="resident-main">
        <h3>${escapeHTML(resident.name)}${flagged}</h3>
        <p>${getAge(resident.dob)} years · ${resident.sex === 'F' ? 'Female' : 'Male'}</p>
        <p>${escapeHTML(resident.occupation)} · ${escapeHTML(resident.subVillage)}</p>
        <p class="chips">${chips}</p>
        <button type="button" data-id="${escapeHTML(resident.id)}"
          aria-label="View profile of ${escapeHTML(resident.name)}">View profile</button>
      </div>
    </li>`;
};

function render() {
  const list = residents
    .filter(matches)
    .sort((a, b) => a.name.localeCompare(b.name));

  els.count.textContent = `Showing ${list.length} of ${residents.length} residents`;
  els.results.innerHTML = list.length
    ? list.map(residentCard).join('')
    : '<li class="empty">No residents match these filters.</li>';
}

/* ---------- profile modal ---------- */
function openProfile(id) {
  const resident = residents.find((item) => item.id === id);
  if (!resident) return;

  const household = households.find((item) => item.id === resident.householdId);
  const members = residents.filter((item) => item.householdId === resident.householdId);
  const head = household ? residents.find((item) => item.id === household.headId) : null;
  const chief = leaders.find((l) => l.level === 'sub-village' && l.area === resident.subVillage);

  const groups = getCategories(resident)
    .map((category) => categoryLabels[category] ?? category)
    .join(', ');

  const householdHTML = household
    ? `
      <h3>Household</h3>
      <dl class="profile-list">
        <dt>Head</dt><dd>${head ? escapeHTML(head.name) : 'Not recorded'}</dd>
        <dt>Members</dt><dd>${members.length}: ${members.map((m) => escapeHTML(m.name)).join(', ')}</dd>
        <dt>Roof</dt><dd>${escapeHTML(household.roof)}</dd>
        <dt>Water</dt><dd>${escapeHTML(household.water)}</dd>
        <dt>Latrine</dt><dd>${household.latrine ? 'Yes' : 'No'}</dd>
        <dt>Income</dt><dd>${escapeHTML(household.income)}</dd>
      </dl>`
    : '<p>No household details recorded yet.</p>';

  els.profileBody.innerHTML = `
    <h2 id="profile-title">${escapeHTML(resident.name)}</h2>
    <dl class="profile-list">
      <dt>Age</dt><dd>${getAge(resident.dob)} years</dd>
      <dt>Sex</dt><dd>${resident.sex === 'F' ? 'Female' : 'Male'}</dd>
      <dt>Role</dt><dd>${escapeHTML(resident.role ?? 'Not recorded')}</dd>
      <dt>Occupation</dt><dd>${escapeHTML(resident.occupation)}</dd>
      <dt>Sub-village</dt><dd>${escapeHTML(resident.subVillage)}</dd>
      <dt>Groups</dt><dd>${escapeHTML(groups)}</dd>
      ${resident.disability ? `<dt>Disability</dt><dd>${escapeHTML(resident.disability)}</dd>` : ''}
      <dt>Village chief</dt>
      <dd>${chief ? `${escapeHTML(chief.name)} (<a href="tel:${chief.phone.replace(/\s/g, '')}">${escapeHTML(chief.phone)}</a>)` : 'Not assigned'}</dd>
    </dl>
    ${householdHTML}
    <label class="follow">
      <input type="checkbox" id="followup-toggle" ${followUps.includes(resident.id) ? 'checked' : ''}>
      Mark for follow-up
    </label>
    <button type="button" class="close-modal">Close</button>`;

  els.profileBody.querySelector('#followup-toggle').addEventListener('change', (event) => {
    followUps = event.target.checked
      ? [...followUps, resident.id]
      : followUps.filter((savedId) => savedId !== resident.id);
    writeStorage(FOLLOW_KEY, followUps);
    render();
  });

  els.dialog.showModal();
}

/* ---------- events ---------- */
els.form.addEventListener('submit', (event) => event.preventDefault());

els.search.addEventListener('input', () => {
  filters.search = els.search.value;
  writeStorage(FILTER_KEY, filters);
  render();
});

els.category.addEventListener('change', () => {
  filters.category = els.category.value;
  writeStorage(FILTER_KEY, filters);
  render();
});

els.subVillage.addEventListener('change', () => {
  filters.subVillage = els.subVillage.value;
  writeStorage(FILTER_KEY, filters);
  render();
});

els.reset.addEventListener('click', () => {
  filters = { ...defaults };
  els.category.value = 'all';
  els.subVillage.value = 'all';
  els.search.value = '';
  writeStorage(FILTER_KEY, filters);
  render();
});

els.results.addEventListener('click', (event) => {
  const button = event.target.closest('button[data-id]');
  if (button) openProfile(button.dataset.id);
});

els.dialog.addEventListener('click', (event) => {
  // Close button, or a click on the dark backdrop
  if (event.target === els.dialog || event.target.closest('.close-modal')) {
    els.dialog.close();
  }
});

/* ---------- start ---------- */
async function init() {
  try {
    const [cell, leaderData, householdData, residentData] = await Promise.all([
      getData('cell.json'),
      getData('leaders.json'),
      getData('households.json'),
      getData('residents.json')
    ]);

    leaders = leaderData.leaders;
    households = householdData.households;
    residents = [...residentData.residents, ...getSavedResidents()];

    fillSelects(cell);

    if (householdFilter) {
      els.banner.innerHTML =
        'Showing the members of one household. <a href="directory.html">Show everyone</a>';
      els.banner.hidden = false;
    }

    render();
  } catch (error) {
    console.error(error);
    els.error.hidden = false;
  }
}

init();