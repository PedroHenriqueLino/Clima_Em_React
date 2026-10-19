
import { useEffect, useState } from "react";
import "./WeatherOverview.css";

//icons
import { IconMapPin } from "@tabler/icons-react";

type LocationData = {
    country: string;
    state: string;
    city: string;
};

type WeatherOverviewProps = {
    location: LocationData;
};

const WeatherOverview = ({ location }: WeatherOverviewProps) => {
    const [temperatura, setTemperatura] = useState<number | null>(null);
    const [sensacaoTermica, setSensacaoTermica] = useState<number | null>(null);

    useEffect(() => {
        const buscarTemperatura = async () => {
            const respostaCidade = await fetch(
                `https://geocoding-api.open-meteo.com/v1/search?name=${encodeURIComponent(location.city)}&count=10&language=en&format=json`
            );

            const dadosCidade = await respostaCidade.json();

            const cidade = dadosCidade.results?.find(
                (item: any) =>
                    item.country === location.country &&
                    item.admin1 === location.state
            ) ?? dadosCidade.results?.[0];

            if (!cidade) return;

            const respostaClima = await fetch(
                `https://api.open-meteo.com/v1/forecast?latitude=${cidade.latitude}&longitude=${cidade.longitude}&current=temperature_2m,apparent_temperature&timezone=auto`
            );

            const dadosClima = await respostaClima.json();

            setTemperatura(dadosClima.current.temperature_2m);
            setSensacaoTermica(dadosClima.current.apparent_temperature);
        };

        buscarTemperatura();

    }, [location.country, location.state, location.city]);

    return (
        <section className="weather-content">

            <div className="weather-date">
                <p>
                    {new Intl.DateTimeFormat("pt-BR", {
                        weekday: "long",
                        day: "numeric",
                        month: "long",
                        year: "numeric",
                    }).format(new Date())}
                </p>
            </div>

            <div className="weather-location">
                <span>
                    <IconMapPin stroke={1} />
                    {location.city}
                    <p>{location.state}, {location.country}</p>
                </span>

                {temperatura !== null && (
                    temperatura >= 30 ? (
                        <div> Céu limpo com poucas nuvens</div>
                    ) : temperatura >= 20 ? (
                        <div>Céu nublado</div>
                    ) : temperatura >= 15 ? (
                        <div>Tempo nublado</div>
                    ) : (
                        <div>Frio</div>
                    )
                )}

            </div>



            <div className="weather-current">
                <div className="weather-icon-container">
                    {temperatura !== null && (
                        temperatura >= 30 ? (
                            <img src="/sol.png" alt="Ensolarado" />
                        ) : temperatura >= 20 ? (
                            <img src="/numvem.png" alt="Parcialmente nublado" />
                        ) : (
                            <img src="/chuva.png" alt="Frio" />
                        )
                    )}
                </div>

                <div className="weather-temperature">
                    <h1>
                        {temperatura !== null ? (
                            <>
                                {temperatura} <span>°C</span>
                            </>
                        ) : (
                            "--°C"
                        )}
                    </h1>
                    <p>
                        Sensação térmica: {sensacaoTermica !== null ? `${sensacaoTermica}°C` : "--°C"}
                    </p>
                </div>
            </div>
        </section>
    );
};

export default WeatherOverview;
