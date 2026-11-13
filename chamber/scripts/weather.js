const apiKey = 'b7c9eb193f2234d28695ff4f1a250109';
const lat = 0.3476;
const lon = 32.5825;
const base = 'https://api.openweathermap.org/data/2.5';
const weatherBox = document.querySelector('#weather');

const capitalize = (text) => text.charAt(0).toUpperCase() + text.slice(1);

async function getWeather() {
  try {
    const query = `lat=${lat}&lon=${lon}&units=metric&appid=${apiKey}`;
    const [currentRes, forecastRes] = await Promise.all([
      fetch(`${base}/weather?${query}`),
      fetch(`${base}/forecast?${query}`)
    ]);
    if (!currentRes.ok || !forecastRes.ok) {
      throw new Error(`Weather request failed (${currentRes.status}/${forecastRes.status})`);
    }
    const current = await currentRes.json();
    const forecast = await forecastRes.json();
    displayWeather(current, forecast);
  } catch (error) {
    console.error(error);
    weatherBox.textContent = 'Weather is unavailable right now.';
  }
}

// Picks one reading per day (closest to midday) for the next 3 local days
function getThreeDays(forecast) {
  const offset = forecast.city.timezone; // seconds from UTC
  const localDate = (dt) => new Date((dt + offset) * 1000);
  const dayKey = (dt) => localDate(dt).toISOString().slice(0, 10);
  const today = dayKey(Math.floor(Date.now() / 1000));

  const days = {};
  forecast.list.forEach((item) => {
    const key = dayKey(item.dt);
    if (key === today) return;
    const hour = localDate(item.dt).getUTCHours();
    const distance = Math.abs(hour - 12);
    if (!days[key] || distance < days[key].distance) {
      days[key] = { distance, item };
    }
  });

  return Object.keys(days).sort().slice(0, 3).map((key) => ({
    label: new Date(`${key}T12:00:00Z`).toLocaleDateString('en-GB', { weekday: 'long', timeZone: 'UTC' }),
    temp: Math.round(days[key].item.main.temp)
  }));
}

function displayWeather(current, forecast) {
  weatherBox.innerHTML = '';

  const now = document.createElement('div');
  now.classList.add('weather-now');

  const icon = document.createElement('img');
  icon.src = `https://openweathermap.org/img/wn/${current.weather[0].icon}@2x.png`;
  icon.alt = '';
  icon.width = 80;
  icon.height = 80;

  const text = document.createElement('div');
  const temp = document.createElement('p');
  temp.classList.add('temp');
  temp.textContent = `${Math.round(current.main.temp)}°C`;
  const desc = document.createElement('p');
  desc.textContent = capitalize(current.weather[0].description);
  text.append(temp, desc);
  now.append(icon, text);

  const forecastTitle = document.createElement('h3');
  forecastTitle.textContent = '3-Day Forecast';

  const list = document.createElement('ul');
  list.classList.add('forecast');
  getThreeDays(forecast).forEach((day) => {
    const li = document.createElement('li');
    const name = document.createElement('span');
    name.textContent = day.label;
    const value = document.createElement('strong');
    value.textContent = `${day.temp}°C`;
    li.append(name, value);
    list.appendChild(li);
  });

  weatherBox.append(now, forecastTitle, list);
}

getWeather();