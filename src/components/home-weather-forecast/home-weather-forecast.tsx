
import { useContext, useEffect, useState } from "react";
import { LocationContext } from "../../context/LocationContext";
import "./home-weather-forecast.css";

type PrevisaoDia = {
    data: string;
    temperaturaMaxima: number;
    temperaturaMinima: number;
    codigoClima: number;
};

type CidadeEncontrada = {
    name: string;
    country: string;
    admin1?: string;
    latitude: number;
    longitude: number;
};

function normalizar(texto: string) {
    return texto
        .normalize("NFD")
        .replace(/[\u0300-\u036f]/g, "")
        .toLowerCase()
        .trim();
}

function obterImagem(codigo: number) {
    if (codigo === 0) {
        return "/sol.png";
    }

    if (
        [1, 2, 3, 45, 48].includes(codigo) ||
        (codigo >= 71 && codigo <= 77) ||
        (codigo >= 85 && codigo <= 86)
    ) {
        return "/numvem.png";
    }

    return "/chuva.png";
}

export default function HomeWeatherForecast() {
    const contexto = useContext(LocationContext);
    const location = contexto?.location;

    const [previsoes, setPrevisoes] = useState<PrevisaoDia[]>([]);
    const [carregando, setCarregando] = useState(false);
    const [erro, setErro] = useState("");

    useEffect(() => {
        async function buscarPrevisao() {
            if (!location?.city || !location?.country) {
                setPrevisoes([]);
                return;
            }

            setCarregando(true);
            setErro("");

            try {
                const respostaCidade = await fetch(
                    `https://geocoding-api.open-meteo.com/v1/search?name=${encodeURIComponent(
                        location.city
                    )}&count=10&language=pt&format=json`
                );

                if (!respostaCidade.ok) {
                    throw new Error("Não foi possível buscar a cidade.");
                }

                const dadosCidade = await respostaCidade.json();

                const cidades: CidadeEncontrada[] =
                    dadosCidade.results ?? [];

                const cidade =
                    cidades.find(
                        (item) =>
                            normalizar(item.name) ===
                            normalizar(location.city) &&
                            normalizar(item.country) ===
                            normalizar(location.country) &&
                            (!location.state ||
                                normalizar(item.admin1 ?? "") ===
                                normalizar(location.state))
                    ) ??
                    cidades.find(
                        (item) =>
                            normalizar(item.name) ===
                            normalizar(location.city) &&
                            normalizar(item.country) ===
                            normalizar(location.country)
                    ) ??
                    cidades[0];

                if (!cidade) {
                    throw new Error("Cidade não encontrada.");
                }

                const respostaClima = await fetch(
                    `https://api.open-meteo.com/v1/forecast?latitude=${cidade.latitude}&longitude=${cidade.longitude}&daily=temperature_2m_max,temperature_2m_min,weather_code&forecast_days=6&timezone=auto`
                );

                if (!respostaClima.ok) {
                    throw new Error(
                        "Não foi possível buscar a previsão."
                    );
                }

                const dadosClima = await respostaClima.json();

                const resultado: PrevisaoDia[] =
                    dadosClima.daily.time.map(
                        (data: string, indice: number) => ({
                            data,
                            temperaturaMaxima: Math.round(
                                dadosClima.daily.temperature_2m_max[indice]
                            ),
                            temperaturaMinima: Math.round(
                                dadosClima.daily.temperature_2m_min[indice]
                            ),
                            codigoClima:
                                dadosClima.daily.weather_code[indice]
                        })
                    );

                setPrevisoes(resultado);
            } catch (erro) {
                console.error("Erro ao buscar previsão:", erro);
                setErro(
                    "Não foi possível carregar a previsão do tempo."
                );
                setPrevisoes([]);
            } finally {
                setCarregando(false);
            }
        }

        buscarPrevisao();
    }, [location?.city, location?.state, location?.country]);

    if (!location?.city) {
        return (
            <p className="forecast-message">
                Selecione uma cidade.
            </p>
        );
    }

    if (carregando) {
        return (
            <p className="forecast-message">
                Carregando previsão...
            </p>
        );
    }

    if (erro) {
        return (
            <p className="forecast-message">
                {erro}
            </p>
        );
    }

    return (
        <div className="weather-forecast-list">
            {previsoes.map((previsao, indice) => {
                const dataFormatada = new Date(
                    `${previsao.data}T12:00:00`
                );

                const nomeDia =
                    indice === 0
                        ? "Hoje"
                        : dataFormatada.toLocaleDateString("pt-BR", {
                            weekday: "long"
                        });

                const data = dataFormatada.toLocaleDateString(
                    "pt-BR",
                    {
                        day: "2-digit",
                        month: "2-digit"
                    }
                );

                return (
                    <div
                        className="weather-forecast-day"
                        key={previsao.data}
                    >
                        <h2>{nomeDia}</h2>

                        <span className="forecast-date">
                            {data}
                        </span>

                        <img
                            src={obterImagem(previsao.codigoClima)}
                            alt="Condição do tempo"
                        />

                        <p className="forecast-max">
                            {previsao.temperaturaMaxima}°
                        </p>

                        <p className="forecast-min">
                            {previsao.temperaturaMinima}°
                        </p>
                    </div>
                );
            })}
        </div>
    );
}
