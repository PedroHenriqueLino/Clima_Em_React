
import { useEffect, useState, useContext } from "react";
import type { ChangeEvent, FormEvent } from "react";
import "./style/Location.css";

// Icons
import {
    IconWorld,
    IconMapPin,
    IconBuilding,
    IconSearch,
    IconArrowRight
} from "@tabler/icons-react";

// Context
import { LocationContext } from "../context/LocationContext";

//navigate
import { useNavigate } from "react-router-dom";

const API = "https://countriesnow.space/api/v0.1";

type Country = {
    name: string;
    Iso2: string;
    Iso3: string;
};

type StateItem = {
    name: string;
    state_code?: string;
};

const Location = () => {
    const context = useContext(LocationContext);

    if (!context) {
        throw new Error("Location precisa estar dentro de LocationProvider.");
    }

    const { setLocation } = context;

    const [countries, setCountries] = useState<Country[]>([]);
    const [states, setStates] = useState<StateItem[]>([]);
    const [cities, setCities] = useState<string[]>([]);

    const [country, setCountry] = useState("");
    const [state, setState] = useState("");
    const [city, setCity] = useState("");

    const [loadingCountries, setLoadingCountries] = useState(true);
    const [loadingStates, setLoadingStates] = useState(false);
    const [loadingCities, setLoadingCities] = useState(false);
    const [error, setError] = useState("");

    const navigate = useNavigate();

    // Buscar países
    useEffect(() => {
        const getCountries = async () => {
            try {
                const response = await fetch(`${API}/countries/iso`);

                if (!response.ok) {
                    throw new Error("Não foi possível buscar os países.");
                }

                const result = await response.json();

                if (result.error) {
                    throw new Error(result.msg || "Erro ao buscar países.");
                }

                setCountries(result.data);
            } catch (error) {
                console.error(error);
                setError("Erro ao carregar países. Tente novamente.");
            } finally {
                setLoadingCountries(false);
            }
        };

        getCountries();
    }, []);

    // Buscar estados do país selecionado
    useEffect(() => {
        if (!country) return;

        let cancelled = false;

        const getStates = async () => {
            setLoadingStates(true);
            setStates([]);
            setState("");
            setCities([]);
            setCity("");
            setError("");

            try {
                const response = await fetch(
                    `${API}/countries/states/q?country=${encodeURIComponent(country)}`
                );

                if (!response.ok) {
                    throw new Error("Não foi possível buscar os estados.");
                }

                const result = await response.json();

                if (result.error) {
                    throw new Error(result.msg || "Erro ao buscar estados.");
                }

                if (!cancelled) {
                    setStates(result.data.states);
                }
            } catch (error) {
                console.error(error);

                if (!cancelled) {
                    setError("Erro ao carregar estados.");
                }
            } finally {
                if (!cancelled) {
                    setLoadingStates(false);
                }
            }
        };

        getStates();

        return () => {
            cancelled = true;
        };
    }, [country]);

    // Buscar cidades do estado selecionado
    useEffect(() => {
        if (!country || !state) return;

        let cancelled = false;

        const getCities = async () => {
            setLoadingCities(true);
            setCities([]);
            setCity("");
            setError("");

            try {
                const response = await fetch(
                    `${API}/countries/state/cities`,
                    {
                        method: "POST",
                        headers: {
                            "Content-Type": "application/json"
                        },
                        body: JSON.stringify({
                            country,
                            state
                        })
                    }
                );

                if (!response.ok) {
                    throw new Error("Não foi possível buscar as cidades.");
                }

                const result = await response.json();

                if (result.error) {
                    throw new Error(result.msg || "Erro ao buscar cidades.");
                }

                if (!cancelled) {
                    setCities(result.data);
                }
            } catch (error) {
                console.error(error);

                if (!cancelled) {
                    setError("Erro ao carregar cidades.");
                }
            } finally {
                if (!cancelled) {
                    setLoadingCities(false);
                }
            }
        };

        getCities();

        return () => {
            cancelled = true;
        };
    }, [country, state]);

    // Alterar país
    const handleCountryChange = (
        event: ChangeEvent<HTMLSelectElement>
    ) => {
        setCountry(event.target.value);
        setState("");
        setCity("");
        setStates([]);
        setCities([]);
    };

    // Alterar estado
    const handleStateChange = (
        event: ChangeEvent<HTMLSelectElement>
    ) => {
        setState(event.target.value);
        setCity("");
        setCities([]);
    };

    // Salvar localização no Context
    const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
        event.preventDefault();

        if (!country || !state || !city) {
            setError("Selecione o país, o estado e a cidade.");
            return;
        }

        setError("");

        setLocation({
            country,
            state,
            city
        });

        navigate("/clima")
    };

    return (
        <div className="location-content">
            <main>
                <div className="location-intro">
                    <img
                        src="/Logo-removebg-preview.png"
                        alt="Logo"
                    />

                    <h1>Escolha sua Localização</h1>

                    <p>
                        Tenha acesso à previsão do tempo,
                        qualidade do ar, qualidade da água
                        e alertas da sua cidade.
                    </p>
                </div>

                <section className="location-form">
                    <form onSubmit={handleSubmit}>
                        {/* País */}
                        <div className="input-control">
                            <label htmlFor="pais">
                                <IconWorld stroke={1.5} />
                                País
                            </label>

                            <select
                                id="pais"
                                name="pais"
                                value={country}
                                onChange={handleCountryChange}
                                disabled={loadingCountries}
                                required
                            >
                                <option value="" disabled>
                                    {loadingCountries
                                        ? "Carregando países..."
                                        : "Selecione seu país..."}
                                </option>

                                {countries.map((item) => (
                                    <option
                                        key={item.Iso2}
                                        value={item.name}
                                    >
                                        {item.name}
                                    </option>
                                ))}
                            </select>
                        </div>

                        {/* Estado */}
                        <div className="input-control">
                            <label htmlFor="estado">
                                <IconMapPin stroke={1.5} />
                                Estado
                            </label>

                            <select
                                id="estado"
                                name="estado"
                                value={state}
                                onChange={handleStateChange}
                                disabled={!country || loadingStates}
                                required
                            >
                                <option value="" disabled>
                                    {!country
                                        ? "Selecione primeiro um país..."
                                        : loadingStates
                                            ? "Carregando estados..."
                                            : "Selecione seu estado..."}
                                </option>

                                {states.map((item) => (
                                    <option
                                        key={item.state_code || item.name}
                                        value={item.name}
                                    >
                                        {item.name}
                                    </option>
                                ))}
                            </select>
                        </div>

                        {/* Cidade */}
                        <div className="input-control">
                            <label htmlFor="cidade">
                                <IconBuilding stroke={1.5} />
                                Cidade
                            </label>

                            <select
                                id="cidade"
                                name="cidade"
                                value={city}
                                onChange={(event) =>
                                    setCity(event.target.value)
                                }
                                disabled={!state || loadingCities}
                                required
                            >
                                <option value="" disabled>
                                    {!state
                                        ? "Selecione primeiro um estado..."
                                        : loadingCities
                                            ? "Carregando cidades..."
                                            : "Selecione sua cidade..."}
                                </option>

                                {cities.map((item) => (
                                    <option key={item} value={item}>
                                        {item}
                                    </option>
                                ))}
                            </select>
                        </div>

                        {error && (
                            <p role="alert" className="form-error">
                                {error}
                            </p>
                        )}

                        <button id="form-btn" type="submit">
                            <IconSearch />
                            Consultar previsão
                            <IconArrowRight />
                        </button>
                    </form>
                </section>
            </main>

            <footer>
                <p>
                    ClimaSky · Dados confiáveis para um futuro melhor
                </p>
            </footer>
        </div>
    );
};

export default Location;
