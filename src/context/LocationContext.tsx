
import {
    createContext,
    useContext,
    useState,
    type ReactNode
} from "react";

type LocationData = {
    country: string;
    state: string;
    city: string;
};

type LocationContextType = {
    location: LocationData;
    setLocation: (data: LocationData) => void;
};

export const LocationContext = createContext<LocationContextType | null>(null);

type LocationProviderProps = {
    children: ReactNode;
};

export const LocationProvider = ({ children }: LocationProviderProps) => {
    const [location, setLocation] = useState<LocationData>({
        country: "",
        state: "",
        city: ""
    });

    return (
        <LocationContext.Provider value={{ location, setLocation }}>
            {children}
        </LocationContext.Provider>
    );
};

