// import { Map, GoogleApiWrapper } from 'google-maps-react';
import React from 'react';
import dark from './GoogleMapStyles';
import {GoogleMap, useLoadScript, Marker, InfoWindow, DirectionsRenderer} from '@react-google-maps/api';
// import usePlacesAutocomplete, {getGeoCode, getLatLng} from "use-places-autocomplete";
import axios from "axios";
import dotenv from 'dotenv';

dotenv.config();


const GOOGLE_MAP_API = process.env.REACT_APP_GOOGLE_MAP_API;
const TRANSLINK_API = process.env.REACT_APP_TRANSLINK_API;

const NO_SERVICE_STOP = "There are currently no buses scheduled for this stop.";

const DIRECTIONS_OPTIONS = { suppressMarkers: true, preserveViewport: true }

const libraries = ["places"]
const mapContainerStyle = {
    width: "100vw",
    height: "94vh"
}
const center = {
    lat: 49.2827,
    lng: -123.1207
}

// let currentCenter = center;

const options = {
    styles: dark,
    disableDefaultUI: true,
    zoomControl: true,
    clickableIcons: false,
}

export default function Map({value}) {
    const { isLoaded, loadError } = useLoadScript({
        googleMapsApiKey: GOOGLE_MAP_API,
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

    // const [currentPositon, setCurrentPosition] = React.useState();

    const [busStopData, setBusStopData] = React.useState([]);
    
    // const [stopMarkers, setStopMarkers] = React.useState([]);

    const [newPos, setNewPos] = React.useState();

    // const [clickedLocation, setClickedLocation] = React.useState(false);

    const [selectedStop, setSelectedStop] = React.useState(null);

    const [selectedBus, setSelectedBus] = React.useState(null);

    // list of bus routes for the specific stop
    const [busList, setBusList] = React.useState([]);

    // The buses of the specific route
    const [busData, setBusData] = React.useState([]);

    const [nextBusEstimate, setNextBusEstimate] = React.useState([]);

    const [directions, setDirections]  = React.useState();

    const directionsService = new window.google.maps.DirectionsService();

    const fetchLocationApiData = async () => {
        if (newPos !== undefined) {
            // console.log(newPos)
            let lat = newPos.lat.toString();
            let lng = newPos.lng.toString();
            lat = lat.slice(0, (lat.indexOf(".")) + 7);
            lng = lng.slice(0, (lng.indexOf(".")) + 7);

            await axios.get("https://api.translink.ca/rttiapi/v1/stops?apikey=" + TRANSLINK_API + "&lat=" + lat + "&long=" + lng + "&radius=2000")
                .then((response) => setBusStopData(response.data));
        } 
    }

    async function fetchArrivalTimeApiData(stopNum, busNum, setNextBusEstimate) {
        busNum = busNum.replace(/\s+/g, '');
        
        await axios.get("https://api.translink.ca/rttiapi/v1/stops/" + stopNum + "/estimates?apikey=" + TRANSLINK_API + "&routeNo=" + busNum)
            .then((response) => setNextBusEstimate(response.data))    
    }

    // useEffect(() => {
    //     fetchBusApiData();
    // }, []);
    
    function handleCenterChanged() {
        if (!mapRef.current) return;

        const position = mapRef.current.getCenter().toJSON();
        setNewPos(position);
        
        if (busData.length < 1 && busStopData.length !== 1) {
            if (selectedStop == null) {
                fetchLocationApiData(); 
            }  
        }
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
                    busStopData.map((stop) => {
                        // console.log(stop);
                        return <Marker 
                            key={stop.StopNo}
                            position={{lat: stop.Latitude, lng: stop.Longitude}}
                            pixelOffset={new window.google.maps.Size(0, 20)}
                            icon={{
                                url: '/bus-stop2.png',
                                scaledSize: new window.google.maps.Size(45, 45),
                            }}
                            onClick={() => {
                                setSelectedStop(stop);
                                storeBusList(stop, setBusList);
                                setBusStopData([stop]);
                            }}
                        />
                    })
                }
                {
                    busData.map((bus) => {
                        return (
                            <Marker 
                                key={bus.BusNo}
                                position={{lat: bus.Latitude, lng: bus.Longitude}}
                                icon={{
                                    url: '/bus.png',
                                    scaledSize: new window.google.maps.Size(35, 35),
                                }}
                                onClick={() => {
                                    if (selectedBus === null) {
                                        setSelectedBus(bus);

                                        directionsService.route(
                                            {
                                                origin: new window.google.maps.LatLng(bus.Latitude, bus.Longitude),
                                                destination: new window.google.maps.LatLng(selectedStop.Latitude, selectedStop.Longitude),
                                                travelMode: "TRANSIT"
                                            },
                                            (result, status) => {
                                                if (status === window.google.maps.DirectionsStatus.OK) {
                                                    setDirections(result);
                                                } else {
                                                    console.log('error');
                                                }
                                            }
                                        )
                                    }
                                    // directionsRequest(DirectionsService, bus, selectedStop)
                                    // console.log(bus);
                                    // console.log(selectedStop);
                                }}
                            />
                        )
                    })
                   
                }
                {selectedBus && (
                    <InfoWindow
                        position={{
                            lat: selectedBus.Latitude,
                            lng: selectedBus.Longitude
                        }}
                        onCloseClick={() => {
                            setSelectedBus(null);
                            setDirections(null);
                        }}
                        options={{
                            pixelOffset: new window.google.maps.Size(0, -35)
                        }}
                    >
                        <p>{directions && directions["routes"][0]["legs"][0]["duration"]["text"]}</p>
                    </InfoWindow>
                )}
    
                {selectedStop && (
                    busData.length > 0 ? (
                        <InfoWindow
                            position={{
                                lat: selectedStop.Latitude, 
                                lng: selectedStop.Longitude
                            }}
                            onCloseClick={() => {
                                setSelectedStop(null);
                                setBusData([]);
                                fetchLocationApiData();
                                setDirections(null);
                                setSelectedBus(null);
                            }}
                        >
                            <div>
                                {sortArray(nextBusEstimate)}
                                {nextBusEstimate && (
                                nextBusEstimate[0]["Schedules"].map((nextBus) => {
                                    return (
                                        <div>
                                        <p>{nextBus.ExpectedLeaveTime}</p>
                                        <p>{nextBus.Destination}</p>
                                        </div>
                                    )
                                }))}
                                <button onClick={() => {
                                    setBusData([]);
                                    setDirections(null);
                                    setSelectedBus(null);
                                }}>Go Back</button>
                            </div>
                        </InfoWindow>
                    ) : (
                    <InfoWindow 
                        position={{
                            lat: selectedStop.Latitude, 
                            lng: selectedStop.Longitude
                        }}
                        onCloseClick={() => {
                            setSelectedStop(null);
                            fetchLocationApiData();
                        }}
                        options={{
                            pixelOffset: new window.google.maps.Size(0, -35)
                        }}
                    >
                        <div>
                            <div>
                                <h3>{selectedStop.StopNo} {selectedStop.Name}</h3> 
                                <strong>{selectedStop.AtStreet} {"&"} {selectedStop.OnStreet}</strong>
                            </div>
                            {busList.map((bus) => {
                                if (bus === NO_SERVICE_STOP) {
                                    return (
                                        <p>There are currently no buses scheduled for this stop.</p>
                                    )
                                }
                                return (
                                    <button
                                        key={bus}
                                        onClick={() => {
                                            fetchArrivalTimeApiData(selectedStop.StopNo, bus, setNextBusEstimate)
                                                .then(() => {
                                                    fetchBusApiData(bus, selectedStop.StopNo, setBusData, busData)
                                                    displayClickedBus(selectedStop, setSelectedStop, setBusStopData)
                                                })
                                            // setTimeout(() => {
                                            //     fetchBusApiData(bus, selectedStop.StopNo, setBusData, busData)
                                            // }, 300)
                                            // displayClickedBus(selectedStop, setSelectedStop, setBusStopData)
                                        }}
                                    >
                                        {bus}
                                    </button>
                                )
                            })}
                        </div>
                    </InfoWindow>)
                )}

                {directions && (
                    <DirectionsRenderer 
                        directions={directions} 
                        options={DIRECTIONS_OPTIONS}
                    />
                )}
            </GoogleMap>
        </div>
    );
}

function sortArray(nextBusEstimate) {
    setTimeout(() => {
        nextBusEstimate[0]["Schedules"].sort(function(a, b) {
            return a.ExpectedCountdown - b.ExpectedCountdown;
        })
        // console.log(nextBusEstimate);
    }, 2000)
 
}

async function fetchBusApiData(bus, stopNo, setBusData, busData) {
    bus = bus.replace(/\s+/g, '');
   
    if (bus !== undefined && stopNo !== undefined) {
        await axios.get("https://api.translink.ca/rttiapi/v1/buses?apikey=" + TRANSLINK_API + "&stopNo=" + stopNo + "&routeNo=" + bus)
            .then((response) => setBusData(response.data));        
    }
    // console.log(busData)
}

function displayClickedBus(selectedStop, setSelectedStop, setBusStopData) {
    setBusStopData([selectedStop]);
    // setSelectedStop(null);
}

function storeBusList(busStop, setBusList) {
    // store buses to a variable
    let buses = busStop.Routes.split(',');
    if (buses[0] === '') {
        buses = [NO_SERVICE_STOP];
    }

    setBusList(buses);
}

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
        <button className="locate" onClick={ async () => {
            
            await navigator.geolocation.getCurrentPosition( (position) => {
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
