import { WeatherAtLocation } from "@/interfaces/weather.interface";

export const getCurrentWeatherService = async (
  latitude: number,
  longitude: number
): Promise<WeatherAtLocation> => {
  const res = await fetch(
    `https://api.open-meteo.com/v1/forecast?latitude=${latitude}&longitude=${longitude}&current_weather=true`
  );
  const data = await res.json();

  return data;
};
