import { initUI } from './ui.js';
import { saveResident } from './data.js';
import { getAge, getCategories, categoryLabels } from './categories.js';

initUI();

const params = new URLSearchParams(window.location.search);
const required = ['surname', 'given', 'sex', 'dob', 'subvillage', 'occupation'];
const complete = required.every((key) => params.get(key));

const summary = document.querySelector('#summary');
const noData = document.querySelector('#no-data');
const thanks = document.querySelector('#thanks-message');

if (!complete) {
  noData.hidden = false;
  thanks.hidden = true;
} else {
  const timestamp = params.get('timestamp');
  const stamp = new Date(timestamp).getTime() || Date.now();
  const flags = params.getAll('flags');

  const resident = {
    id: `rs-new-${stamp}`,
    name: `${params.get('surname')} ${params.get('given')}`,
    sex: params.get('sex'),
    dob: params.get('dob'),
    householdId: params.get('household') || 'hh-new',
    subVillage: params.get('subvillage'),
    occupation: params.get('occupation'),
    role: params.get('role') || 'Not specified',
    flags
  };
  if (flags.includes('pwd') && params.get('disability')) {
    resident.disability = params.get('disability');
  }

  const groups = getCategories(resident)
    .map((category) => categoryLabels[category] ?? category)
    .join(', ');

  const put = (id, text) => { document.querySelector(id).textContent = text; };
  put('#out-name', resident.name);
  put('#out-sex', resident.sex === 'F' ? 'Female' : 'Male');
  put('#out-dob', new Date(`${resident.dob}T00:00:00`).toLocaleDateString('en-GB', { dateStyle: 'long' }));
  put('#out-age', `${getAge(resident.dob)} years`);
  put('#out-occupation', resident.occupation);
  put('#out-subvillage', resident.subVillage);
  put('#out-household', resident.householdId === 'hh-new' ? 'New household (not yet recorded)' : resident.householdId);
  put('#out-groups', groups || 'None');
  put('#out-timestamp', timestamp ? new Date(timestamp).toLocaleString() : 'Not recorded');

  summary.hidden = false;

  // Save once; reloading this page will not create a duplicate
  const result = saveResident(resident);
  const messages = {
    saved: 'This record is now stored in this browser and will appear in the directory.',
    exists: 'This record was already saved in this browser.',
    failed: 'Your browser blocked local storage, so this record could not be saved.'
  };
  put('#save-status', messages[result]);
}