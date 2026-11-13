const params = new URLSearchParams(window.location.search);

const fields = ['fname', 'lname', 'email', 'phone', 'organization'];
fields.forEach((field) => {
  document.querySelector(`#out-${field}`).textContent = params.get(field) || '';
});

const timestamp = params.get('timestamp');
document.querySelector('#out-timestamp').textContent = timestamp
  ? new Date(timestamp).toLocaleString()
  : '';