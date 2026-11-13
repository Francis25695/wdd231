// Hidden timestamp: when the form was loaded
document.querySelector('#timestamp').value = new Date().toISOString();

// Modals
document.querySelectorAll('[data-modal]').forEach((button) => {
  button.addEventListener('click', () => {
    document.getElementById(button.dataset.modal).showModal();
  });
});

document.querySelectorAll('dialog').forEach((dialog) => {
  dialog.querySelector('.close-modal').addEventListener('click', () => dialog.close());
  // Clicking the dark backdrop (outside the content) also closes it
  dialog.addEventListener('click', (event) => {
    if (event.target === dialog) dialog.close();
  });
});