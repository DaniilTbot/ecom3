import { useEffect, useRef, useState } from "react";
import { fetchCityCoordinates, fetchWeatherByCoords } from "../api/weather";

const DEFAULT_CITY = "Тюмень";

function getUserPosition() {
  return new Promise((resolve, reject) => {
    if (!navigator.geolocation) {
      reject(new Error("Геолокация недоступна"));
      return;
    }

    navigator.geolocation.getCurrentPosition(resolve, reject, {
      timeout: 8000,
    });
  });
}

function WeatherWidget() {
  const [isVisible, setIsVisible] = useState(true);
  const [isLoading, setIsLoading] = useState(true);
  const [cityInput, setCityInput] = useState("");
  const [weatherData, setWeatherData] = useState(null);
  const [cityError, setCityError] = useState("");
  const [weatherError, setWeatherError] = useState("");
  const [failedCities, setFailedCities] = useState([]);

  const abortControllerRef = useRef(null);

  function abortActiveRequest() {
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
    }
  }

  function createController() {
    abortActiveRequest();

    const controller = new AbortController();
    abortControllerRef.current = controller;

    return controller;
  }

  function isAbortError(error) {
    return error?.name === "AbortError";
  }

  async function loadWeatherForCity(cityName, controller) {
    const coordinates = await fetchCityCoordinates(cityName, controller.signal);

    if (!coordinates) {
      return null;
    }

    const weather = await fetchWeatherByCoords(
      coordinates.lat,
      coordinates.lon,
      controller.signal
    );

    return {
      weather,
      cityName: coordinates.name,
    };
  }

  useEffect(() => {
    let isMounted = true;

    async function loadInitialWeather() {
      setIsLoading(true);
      setCityError("");
      setWeatherError("");

      try {
        const position = await getUserPosition();

        if (!isMounted) {
          return;
        }

        const controller = createController();

        const weather = await fetchWeatherByCoords(
          position.coords.latitude,
          position.coords.longitude,
          controller.signal
        );

        if (!isMounted || controller.signal.aborted) {
          return;
        }

        setWeatherData(weather);
        setCityInput(weather.city);
      } catch (error) {
        if (isAbortError(error) || !isMounted) {
          return;
        }

        const controller = createController();

        try {
          const result = await loadWeatherForCity(DEFAULT_CITY, controller);

          if (!isMounted || controller.signal.aborted) {
            return;
          }

          if (!result) {
            setCityInput("");
            setWeatherData(null);
            setCityError(`Не удалось получить данные для города ${DEFAULT_CITY}`);
            return;
          }

          setWeatherData(result.weather);
          setCityInput(result.cityName);
        } catch (defaultCityError) {
          if (isAbortError(defaultCityError) || !isMounted) {
            return;
          }

          console.error(defaultCityError);
          setCityInput("");
          setWeatherData(null);
          setCityError(`Не удалось получить данные для города ${DEFAULT_CITY}`);
        }
      } finally {
        if (isMounted) {
          setIsLoading(false);
        }
      }
    }

    loadInitialWeather();

    return () => {
      isMounted = false;
      abortActiveRequest();
    };
  }, []);

  function handleChange(event) {
    setCityInput(event.target.value);
    setCityError("");
  }

  async function handleSubmit() {
    const trimmedCity = cityInput.trim();

    if (!trimmedCity) {
      return;
    }

    if (failedCities.includes(trimmedCity.toLowerCase())) {
      setCityError(`Не удалось получить данные для города ${trimmedCity}`);
      return;
    }

    const controller = createController();

    setIsLoading(true);
    setCityError("");
    setWeatherError("");

    try {
      const result = await loadWeatherForCity(trimmedCity, controller);

      if (!result) {
        setFailedCities((prev) => {
          const normalizedCity = trimmedCity.toLowerCase();

          if (prev.includes(normalizedCity)) {
            return prev;
          }

          return [...prev, normalizedCity];
        });

        setCityInput("");
        setCityError(`Не удалось получить данные для города ${trimmedCity}`);
        return;
      }

      setWeatherData(result.weather);
      setCityInput(result.cityName);
      setWeatherError("");
    } catch (error) {
      if (isAbortError(error)) {
        return;
      }

      console.error(error);
      setWeatherData(null);
      setWeatherError("Не удалось получить данные");
    } finally {
      if (!controller.signal.aborted) {
        setIsLoading(false);
      }
    }
  }

  function handleClose() {
    abortActiveRequest();
    setIsVisible(false);
  }

  if (!isVisible) {
    return null;
  }

  return (
    <section className="weather-widget">
      <button
        className="weather-close-button"
        onClick={handleClose}
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
            <button onClick={handleSubmit} type="button" disabled={isLoading}>
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
