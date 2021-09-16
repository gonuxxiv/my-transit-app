// import { Map, GoogleApiWrapper } from 'google-maps-react';
import React, {Component} from 'react';
import dark from './GoogleMapStyles';
import {GoogleMap, useLoadScript, Marker, InfoWindow} from '@react-google-maps/api';
import usePlacesAutocomplete, {getGeoCode, getLatLng} from "use-places-autocomplete";


const libraries = ["places"]
const mapContainerStyle = {
    width: "100vw",
    height: "94vh"
}
const center = {
    lat: 49.2827,
    lng: -123.1207
}
const options = {
    styles: dark,
    disableDefaultUI: true,
    zoomControl: true,
}

export default function Map({value}) {
    const { isLoaded, loadError } = useLoadScript({
        googleMapsApiKey: 'AIzaSyAoYmRYMoQADvN5TEms7pnJxEcji7Fl-P8',
        libraries,
    })

    const [currentLocationMarker, setCurrentLocationMarker] = React.useState({
        lat: '',
        lng: '',
        time: ''
    });
    const [markers, setMarkers] = React.useState([]);

    const mapRef = React.useRef();
    const onMapLoad = React.useCallback((map) => {
        mapRef.current = map;
    }, []);

    const panTo = React.useCallback(({lat, lng}) => {
        mapRef.current.panTo({lat, lng});
        mapRef.current.setZoom(14);
    }, []);


    if(loadError) return "Error loading maps";
    if(!isLoaded) return "Loading Maps";
    
    return (
        <div style={value !== 0 ? {display: "none"} : {display: "block"}}>
            {currentLocation(panTo, setCurrentLocationMarker)}
            <GoogleMap 
                mapContainerStyle={mapContainerStyle}
                zoom={8}
                center={center}
                options={options}
                onClick={() => {}}
                onLoad={onMapLoad}>
                     <Marker 
                            position={{lat: currentLocationMarker.lat, lng: currentLocationMarker.lng}} 
                            icon={{
                                url: '/blue-dot.png',
                                scaledSize: new window.google.maps.Size(25, 25),
                            }}
                    />
                    {/* {currentLocationMarker(marker => 
                        <Marker 
                            key={marker.time.toISOString()} 
                            position={{lat: marker.lat, lng: marker.lng}} 
                            icon={{
                                url: '/blue-dot.png',
                                scaledSize: new window.google.maps.Size(25, 25),
                            }}
                        />
                    )} */}
            </GoogleMap>
        </div>
    );
}

function currentLocation(panTo, setCurrentLocationMarker) {
    return (
        <button className="locate" onClick={() => {
            navigator.geolocation.getCurrentPosition((position) => {
                console.log(position)
                panTo({
                    lat: position.coords.latitude,
                    lng: position.coords.longitude,
                })
                setCurrentLocationMarker({
                    lat: position.coords.latitude,
                    lng: position.coords.longitude,
                    time: new Date(),
                })
            }, () => null);
        }}>
            <img src="locate.svg" alt="locate me icon"/>
        </button>
    );
}



// export class MapContainer extends Component {
    
//     render() {
//         const value = this.props.value;
//         return (
//             <div style={value === 0 ? { width: "100%", height: "100%", display: "block"} : {display: "none"}}>
//                 <Map
//                     google={this.props.google}
//                     zoom={8}
//                     styles={dark}
//                     initialCenter={{ lat: 49.2827, lng: -123.1207}}
//                     options={options}
//                 />
//             </div>
//         );
//     }
// }


// export default GoogleApiWrapper({
//     apiKey: 'AIzaSyAoYmRYMoQADvN5TEms7pnJxEcji7Fl-P8'
// })(MapContainer);
