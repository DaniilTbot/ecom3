const apiKey = import.meta.env.VITE_OPENWEATHER_API_KEY;

export async function fetchCityCoordinates(cityName, signal) {
  const response = await fetch(
    `https://api.openweathermap.org/geo/1.0/direct?q=${encodeURIComponent(cityName)}&limit=1&appid=${apiKey}`,
    { signal }
  );

  if (!response.ok) {
    throw new Error("Не удалось получить координаты");
  }

  const data = await response.json();

  if (!data.length) {
    return null;
  }

  return {
    name: data[0].name,
    lat: data[0].lat,
    lon: data[0].lon,
  };
}

export async function fetchWeatherByCoords(lat, lon, signal) {
  const response = await fetch(
    `https://api.openweathermap.org/data/2.5/weather?lat=${lat}&lon=${lon}&appid=${apiKey}&units=metric&lang=ru`,
    { signal }
  );

  if (!response.ok) {
    throw new Error("Не удалось получить погоду");
  }

  const data = await response.json();

  return {
    city: data.name,
    temperature: Math.round(data.main.temp),
    description: data.weather[0].description,
  };
}
