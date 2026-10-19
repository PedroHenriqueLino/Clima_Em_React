import './NavHeader.css'

//icons
import { IconMenu2, IconMapPin } from "@tabler/icons-react";

//Context
import { LocationContext } from '../../context/LocationContext';
import { useContext } from 'react';

const NavHeader = () => {

    const { location } = useContext(LocationContext)

    return (
        <div className='navheader-content'>

            <div className="title-navheader">
                <img src="/Logo-removebg-preview.png" alt="" />
                <h1>
                    ClimaSky
                    <span>.app</span>
                </h1>
            </div>


            <div className="end-navheader">

                {location?.city && (
                    <div className="location">
                        <IconMapPin size={24} stroke={1.5} />
                        <h3>{location.city}</h3>
                    </div>
                )}


                <p>Previsão do tempo, qualidade do ar e muito mais</p>

                <div id="icon-menu">
                    <IconMenu2 size={24} />
                </div>

            </div>
        </div>
    )
}

export default NavHeader