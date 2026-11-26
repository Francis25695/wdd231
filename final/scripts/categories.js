export function getAge(dob, today = new Date()) {
  const birth = new Date(dob);
  const age = today.getFullYear() - birth.getFullYear();
  const hadBirthday =
    today.getMonth() > birth.getMonth() ||
    (today.getMonth() === birth.getMonth() && today.getDate() >= birth.getDate());
  return hadBirthday ? age : age - 1;
}

export function getCategories(resident) {
  const age = getAge(resident.dob);
  const categories = [];

  if (age < 18) categories.push('child');
  else if (age <= 30) categories.push('youth');
  if (age >= 60) categories.push('elderly');
  if (age >= 18) categories.push(resident.sex === 'F' ? 'woman' : 'man');

  resident.flags.forEach((flag) => categories.push(flag));
  return categories;
}

export const categoryLabels = {
  child: 'Children',
  youth: 'Youth',
  woman: 'Women',
  man: 'Men',
  elderly: 'Elderly',
  pwd: 'Persons with disabilities',
  widow: 'Widows',
  orphan: 'Orphans and vulnerable children',
  'child-headed': 'Child-headed households',
  'young-mother': 'Young mothers',
  vsla: 'VSLA members'
};