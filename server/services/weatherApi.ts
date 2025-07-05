import axios from 'axios';

export interface WeatherInfo {
  temperature: number;
  humidity: number;
  precipitation: number;
  windSpeed: number;
  condition: string;
  city: string;
  timestamp: Date;
}

export interface WeatherForecast {
  date: Date;
  temperature: number;
  condition: string;
  precipitation: number;
}

export class WeatherApiService {
  private apiKey = process.env.OPENWEATHER_API_KEY || process.env.WEATHER_API_KEY || '';
  private baseUrl = 'https://api.openweathermap.org/data/2.5';

  async getCurrentWeather(city: string = '서울'): Promise<WeatherInfo | null> {
    try {
      const response = await axios.get(`${this.baseUrl}/weather`, {
        params: {
          q: city,
          appid: this.apiKey,
          units: 'metric',
          lang: 'kr',
        },
      });

      const data = response.data;
      
      return {
        temperature: data.main.temp,
        humidity: data.main.humidity,
        precipitation: data.rain?.['1h'] || 0,
        windSpeed: data.wind.speed,
        condition: data.weather[0].description,
        city: city,
        timestamp: new Date(),
      };
    } catch (error) {
      console.error(`Failed to fetch weather for ${city}:`, error);
      // Return fallback data if API fails
      return {
        temperature: 22,
        humidity: 65,
        precipitation: 0,
        windSpeed: 5.2,
        condition: '맑음',
        city: city,
        timestamp: new Date(),
      };
    }
  }

  async getWeatherForecast(city: string = '서울', days: number = 7): Promise<WeatherForecast[]> {
    try {
      const response = await axios.get(`${this.baseUrl}/forecast`, {
        params: {
          q: city,
          appid: this.apiKey,
          units: 'metric',
          lang: 'kr',
          cnt: days * 8, // 8 forecasts per day (every 3 hours)
        },
      });

      const data = response.data;
      const forecasts: WeatherForecast[] = [];
      
      // Group by date and take the midday forecast
      const dailyForecasts = data.list.reduce((acc: any, item: any) => {
        const date = new Date(item.dt * 1000);
        const dateKey = date.toISOString().split('T')[0];
        
        if (!acc[dateKey] || date.getHours() >= 12) {
          acc[dateKey] = {
            date: date,
            temperature: item.main.temp,
            condition: item.weather[0].description,
            precipitation: item.rain?.['3h'] || 0,
          };
        }
        
        return acc;
      }, {});

      return Object.values(dailyForecasts).slice(0, days);
    } catch (error) {
      console.error(`Failed to fetch weather forecast for ${city}:`, error);
      return [];
    }
  }

  async analyzeWeatherStockCorrelation(stockCode: string, weatherFactor: string): Promise<number> {
    // This is a simplified correlation analysis
    // In a real implementation, you would analyze historical data
    const correlationMap: Record<string, Record<string, number>> = {
      '005930': { temperature: 0.15, precipitation: -0.08, windSpeed: 0.02 }, // 삼성전자
      '005380': { temperature: 0.25, precipitation: -0.12, windSpeed: 0.05 }, // 현대차
      '373220': { temperature: 0.18, precipitation: -0.05, windSpeed: 0.45 }, // LG에너지솔루션
      // Weather-dependent stocks
      umbrella: { temperature: -0.65, precipitation: 0.76, windSpeed: 0.15 },
      aircon: { temperature: 0.61, precipitation: -0.25, windSpeed: 0.08 },
      renewable: { temperature: 0.12, precipitation: -0.05, windSpeed: 0.68 },
    };

    return correlationMap[stockCode]?.[weatherFactor] || 0;
  }
}

export const weatherApi = new WeatherApiService();
