export async function getData(file) {
  const response = await fetch(`data/${file}`);
  if (!response.ok) {
    throw new Error(`Could not load ${file} (status ${response.status})`);
  }
  return response.json();
}

// Residents added through the registration form are kept in local storage
export function getSavedResidents() {
  try {
    return JSON.parse(localStorage.getItem('ivms-residents')) || [];
  } catch (error) {
    return [];
  }
}

// Returns 'saved', 'exists' or 'failed'
export function saveResident(resident) {
  const saved = getSavedResidents();
  if (saved.some((item) => item.id === resident.id)) return 'exists';
  try {
    localStorage.setItem('ivms-residents', JSON.stringify([...saved, resident]));
    return 'saved';
  } catch (error) {
    return 'failed';
  }
}