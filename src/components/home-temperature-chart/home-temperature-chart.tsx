
import { useContext, useEffect, useState } from "react";
import { LocationContext } from "../../context/LocationContext";
import {
    ResponsiveContainer,
    AreaChart,
    Area,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip
} from "recharts";
import "./home-temperature-chart.css";

type TemperatureData = {
    horario: string;
    temperatura: number;
};

type CidadeEncontrada = {
    name: string;
    country: string;
    admin1?: string;
    latitude: number;
    longitude: number;
};

const amostra: TemperatureData[] = [
    { horario: "06:00", temperatura: 17 },
    { horario: "08:00", temperatura: 20 },
    { horario: "10:00", temperatura: 25 },
    { horario: "12:00", temperatura: 30 },
    { horario: "14:00", temperatura: 32 },
    { horario: "16:00", temperatura: 29 },
    { horario: "18:00", temperatura: 25 },
    { horario: "20:00", temperatura: 22 },
    { horario: "22:00", temperatura: 19 }
];

function normalizar(texto: string) {
    return texto
        .normalize("NFD")
        .replace(/[\u0300-\u036f]/g, "")
        .toLowerCase()
        .trim();
}

export default function HomeTemperatureChart() {
    const contexto = useContext(LocationContext);
    const location = contexto?.location;

    const [temperaturas, setTemperaturas] =
        useState<TemperatureData[]>(amostra);

    useEffect(() => {
        async function buscarTemperaturas() {
            if (!location?.city || !location?.country) return;

            try {
                const respostaCidade = await fetch(
                    `https://geocoding-api.open-meteo.com/v1/search?name=${encodeURIComponent(
                        location.city
                    )}&count=10&language=pt&format=json`
                );

                if (!respostaCidade.ok) {
                    throw new Error("Erro ao buscar a cidade.");
                }

                const dadosCidade = await respostaCidade.json();
                const cidades: CidadeEncontrada[] = dadosCidade.results ?? [];

                const cidade =
                    cidades.find(
                        (item) =>
                            normalizar(item.name) === normalizar(location.city) &&
                            normalizar(item.country) === normalizar(location.country) &&
                            (!location.state ||
                                normalizar(item.admin1 ?? "") ===
                                normalizar(location.state))
                    ) ??
                    cidades.find(
                        (item) =>
                            normalizar(item.name) === normalizar(location.city) &&
                            normalizar(item.country) === normalizar(location.country)
                    ) ??
                    cidades[0];

                if (!cidade) {
                    throw new Error("Cidade não encontrada.");
                }

                const respostaClima = await fetch(
                    `https://api.open-meteo.com/v1/forecast?latitude=${cidade.latitude}&longitude=${cidade.longitude}&hourly=temperature_2m&forecast_days=1&timezone=auto`
                );

                if (!respostaClima.ok) {
                    throw new Error("Erro ao buscar as temperaturas.");
                }

                const dadosClima = await respostaClima.json();

                const dados: TemperatureData[] = dadosClima.hourly.time.map(
                    (hora: string, indice: number) => ({
                        horario: hora.slice(11, 16),
                        temperatura: dadosClima.hourly.temperature_2m[indice]
                    })
                );

                setTemperaturas(dados);
            } catch (erro) {
                console.error("Erro ao carregar o gráfico:", erro);
            }
        }

        buscarTemperaturas();
    }, [location?.city, location?.state, location?.country]);

    return (
        <div className="temperature-chart">
            <ResponsiveContainer width="100%" height="100%">
                <AreaChart
                    data={temperaturas}
                    margin={{ top: 15, right: 15, left: 5, bottom: 5 }}
                >
                    <defs>
                        <linearGradient
                            id="temperaturaDegrade"
                            x1="0"
                            y1="0"
                            x2="0"
                            y2="1"
                        >
                            <stop
                                offset="0%"
                                stopColor="#e5c252"
                                stopOpacity={0.45}
                            />
                            <stop
                                offset="95%"
                                stopColor="#e5c252"
                                stopOpacity={0.02}
                            />
                        </linearGradient>
                    </defs>

                    <CartesianGrid
                        strokeDasharray="3 3"
                        stroke="rgba(255,255,255,0.12)"
                    />

                    <XAxis
                        dataKey="horario"
                        tick={{ fill: "#ffffff", fontSize: 12 }}
                        axisLine={{ stroke: "rgba(255,255,255,0.25)" }}
                        tickLine={{ stroke: "rgba(255,255,255,0.25)" }}
                        interval="preserveStartEnd"
                    />

                    <YAxis
                        unit="°C"
                        tick={{ fill: "#ffffff", fontSize: 12 }}
                        axisLine={false}
                        tickLine={false}
                        width={55}
                    />

                    <Tooltip
                        contentStyle={{
                            backgroundColor: "#001a36",
                            border: "1px solid #e5c252",
                            borderRadius: "8px",
                            color: "#ffffff"
                        }}
                        labelStyle={{ color: "#ffffff" }}
                        itemStyle={{ color: "#ffffff" }}
                        formatter={(value) => [`${value}°C`, "Temperatura"]}
                        labelFormatter={(label) => `Horário: ${label}`}
                    />

                    <Area
                        type="monotone"
                        dataKey="temperatura"
                        stroke="#e5c252"
                        strokeWidth={3}
                        fill="url(#temperaturaDegrade)"
                        dot={{
                            r: 4,
                            fill: "#e5c252",
                            stroke: "#ffffff",
                            strokeWidth: 2
                        }}
                        activeDot={{
                            r: 7,
                            fill: "#e5c252",
                            stroke: "#ffffff",
                            strokeWidth: 2
                        }}
                    />
                </AreaChart>
            </ResponsiveContainer>
        </div>
    );
}
