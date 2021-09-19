// import { Map, GoogleApiWrapper } from 'google-maps-react';
import React, {Component, useEffect} from 'react';
import dark from './GoogleMapStyles';
import {GoogleMap, useLoadScript, Marker, InfoWindow} from '@react-google-maps/api';
import usePlacesAutocomplete, {getGeoCode, getLatLng} from "use-places-autocomplete";
import axios from "axios";

const translinkAPI = 'uR1LJ7QcIfeLZmaQ0oPs';

const libraries = ["places"]
const mapContainerStyle = {
    width: "100vw",
    height: "94vh"
}
const center = {
    lat: 49.2827,
    lng: -123.1207
}

let currentCenter = center;

const options = {
    styles: dark,
    disableDefaultUI: true,
    zoomControl: true,
}

let animateTrigger = 1;

let ref;

export default function Map({value}) {
    const { isLoaded, loadError } = useLoadScript({
        googleMapsApiKey: 'AIzaSyAoYmRYMoQADvN5TEms7pnJxEcji7Fl-P8',
        libraries,
    })

    // Map Reference
    const mapRef = React.useRef();
    const onMapLoad = React.useCallback((map) => {
        mapRef.current = map;
    }, []);

    // Pan to set location
    const panTo = React.useCallback(({lat, lng}) => {
        mapRef.current.panTo({lat, lng});
        mapRef.current.setZoom(14);
        setNewPos({lat, lng});
    }, []);

    const [currentLocationMarker, setCurrentLocationMarker] = React.useState({
        lat: '',
        lng: '',
        time: ''
    });

    const [currentPositon, setCurrentPosition] = React.useState();

    const [data, setData] = React.useState([]);
    
    const [stopMarkers, setStopMarkers] = React.useState([]);

    const [newPos, setNewPos] = React.useState();

    const [clickedLocation, setClickedLocation] = React.useState(false);

    const fetchApiData = () => {
        if (newPos !== undefined) {
            // console.log(newPos)
            let lat = newPos.lat.toString();
            let lng = newPos.lng.toString();
            lat = lat.slice(0, (lat.indexOf(".")) + 7);
            lng = lng.slice(0, (lng.indexOf(".")) + 7);

            axios.get("https://api.translink.ca/rttiapi/v1/stops?apikey=uR1LJ7QcIfeLZmaQ0oPs&lat=" + lat + "&long=" + lng + "&radius=2000")
            .then((response) => setData(response.data));
        } 
    }

    // useEffect(() => {
    //     fetchApiData();
    // }, []);
    
      function handleCenterChanged() {
        if (!mapRef.current) return;

        const position = mapRef.current.getCenter().toJSON();
        setNewPos(position);
        
        
        // console.log(newPos);
        fetchApiData();
    }

    if(loadError) return "Error loading maps";
    if(!isLoaded) return "Loading Maps";
    
    return (
        <div style={value !== 0 ? {display: "none"} : {display: "block"}}>
            {currentLocation(panTo, setCurrentLocationMarker, handleCenterChanged)}
            <GoogleMap 
                onCenterChanged={handleCenterChanged}
                mapContainerStyle={mapContainerStyle}
                zoom={11}
                center={center}
                options={options}
                onClick={() => {}}
                onLoad={onMapLoad}
            >
                {markCurrentLocation(currentLocationMarker)}
                {
                    data.map((stop) => {
                        // console.log(stop);
                        return <Marker 
                            key={stop.StopNo}
                            position={{lat: stop.Latitude, lng: stop.Longitude}}
                            icon={{
                                url: '/bus-stop2.png',
                                scaledSize: new window.google.maps.Size(45, 45),
                            }}
                        />
                    })
                }
                {/* {placeBusStopMarkers(newPos, setData, data, moved, setMoved)} */}
                
                    {
                        // placeBusStopMarkers(panTo, setStopMarkers)
                    }
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

// function placeBusStopMarkers(newPos, setData, data, moved, setMoved) {
//     if (newPos != null && moved) {
//         console.log(newPos);
//         axios.get(`https://api.translink.ca/rttiapi/v1/stops?apikey=uR1LJ7QcIfeLZmaQ0oPs&lat=49.2827&long=-123.1207&radius=500`)
//             .then((response) => setData(response.data));
//         console.log(data);
//         setMoved(false)
//         return (
//             <div></div>
//         )
//     }
// }

function markCurrentLocation(currentLocationMarker) {
    if (currentLocationMarker.lat !== '') {
        return (
            <Marker 
            position={{lat: currentLocationMarker.lat, lng: currentLocationMarker.lng}} 
            icon={{
                url: '/blue-dot.png',
                scaledSize: new window.google.maps.Size(25, 25),
            }}
        />
        )
    }
}

function currentLocation(panTo, setCurrentLocationMarker, handleCenterChanged) {
    return (
        <button className="locate" onClick={() => {
            
            navigator.geolocation.getCurrentPosition((position) => {
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
            handleCenterChanged();
        }}>
            <img src="locate.svg" alt="locate me icon"/>
        </button>
    );
}

// function loadAllBusStops() {
//     fetch('https://api.translink.ca/rttiapi/v1/stops?apikey=uR1LJ7QcIfeLZmaQ0oPs&lat=49.248523&long=-123.108800&radius=2000')
//         .then(response => response.json())
//         .then(data => console.log(data));
// }



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
