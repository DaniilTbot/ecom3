import { useEffect, useState } from "react";
import { fetchCityCoordinates, fetchWeatherByCoords } from "../api/weather";

function WeatherWidget() {
  const [isVisible, setIsVisible] = useState(true);
  const [isLoading, setIsLoading] = useState(true);
  const [cityInput, setCityInput] = useState("");
  const [weatherData, setWeatherData] = useState(null);
  const [cityError, setCityError] = useState("");
  const [weatherError, setWeatherError] = useState("");

  useEffect(() => {
    async function loadDefaultWeather() {
      setIsLoading(true);
      setCityError("");
      setWeatherError("");

      try {
        const coordinates = await fetchCityCoordinates("Тюмень");

        if (!coordinates) {
          setCityInput("");
          setWeatherData(null);
          setCityError("Не удалось получить данные для города Тюмень");
          return;
        }

        try {
          const weather = await fetchWeatherByCoords(
            coordinates.lat,
            coordinates.lon
          );

          setWeatherData(weather);
          setCityInput(coordinates.name);
        } catch (error) {
          setWeatherData(null);
          setCityInput(coordinates.name);
          setWeatherError("Не удалось получить данные");
        }
      } catch (error) {
        setCityInput("");
        setWeatherData(null);
        setCityError("Не удалось получить данные для города Тюмень");
      } finally {
        setIsLoading(false);
      }
    }

    loadDefaultWeather();
  }, []);

  function handleChange(event) {
    setCityInput(event.target.value);
    setCityError("");
  }

  if (!isVisible) {
    return null;
  }

  return (
    <section className="weather-widget">
      <button
        className="weather-close-button"
        onClick={() => setIsVisible(false)}
        type="button"
      >
        ×
      </button>

      <h2 className="weather-title">Погода</h2>

      {isLoading ? (
        <div className="weather-loading">Загрузка...</div>
      ) : (
        <>
          <div className="weather-info">
            {weatherData ? (
              <>
                <p className="weather-city">{weatherData.city}</p>
                <p className="weather-temp">{weatherData.temperature}°C</p>
                <p className="weather-description">{weatherData.description}</p>
              </>
            ) : (
              <p className="weather-empty">Данные о погоде пока не загружены</p>
            )}
          </div>

          {weatherError && <p className="weather-error">{weatherError}</p>}

          <div className="weather-controls">
            <input
              type="text"
              value={cityInput}
              onChange={handleChange}
              placeholder="Введите город"
              disabled={isLoading}
            />
            <button type="button" disabled={isLoading}>
              Получить погоду
            </button>
          </div>

          {cityError && <p className="weather-error">{cityError}</p>}
        </>
      )}
    </section>
  );
}

export default WeatherWidget;
