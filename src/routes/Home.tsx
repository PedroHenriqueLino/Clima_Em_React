import './style/Home.css'

//icons
import { IconTemperatureSun, IconCalendar } from "@tabler/icons-react";
//Context
import { useContext } from 'react'
import { LocationContext } from '../context/LocationContext'

//Components
import WeatherOverview from '../components/Nav_Header/WeatherOverview/WeatherOverview'
import HomeTemperatureChart from '../components/home-temperature-chart/home-temperature-chart';
import HomeWeatherForecast from '../components/home-weather-forecast/home-weather-forecast';

const Home = () => {
    const { location } = useContext(LocationContext)
    return (
        <div className='home-content'>
            <div className="weather-info">
                <WeatherOverview location={location} />
            </div>
            <div className="home-grafic-content">

                <div className="home-temperature-chart">

                    <div className="title-home-temperature">
                        <IconTemperatureSun stroke={1.} />
                        <h1>Temperatura ao longo do dia</h1>
                    </div>

                    <div className="grafic-home-temperature">
                        <HomeTemperatureChart />
                    </div>

                </div>

                <div className="home-weather-forecast">

                    <div className="title-home-temperature ">
                        <IconCalendar stroke={1} />
                        <h1>Previsão para os proximos dias</h1>
                    </div>

                    <div className="grafic-home-weather">
                        <HomeWeatherForecast />
                    </div>

                </div>
            </div>
        </div>
    )
}

export default Home