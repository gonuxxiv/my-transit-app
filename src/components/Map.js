// import { Map, GoogleApiWrapper } from 'google-maps-react';
import React, {Component, useEffect} from 'react';
import dark from './GoogleMapStyles';
import {GoogleMap, useLoadScript, Marker, InfoWindow, DirectionsService, DirectionsRenderer} from '@react-google-maps/api';
// import usePlacesAutocomplete, {getGeoCode, getLatLng} from "use-places-autocomplete";
import axios from "axios";

// const translinkAPI = 'uR1LJ7QcIfeLZmaQ0oPs';

const NO_SERVICE_STOP = "There are currently no buses scheduled for this stop.";

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

// let animateTrigger = 1;

// let ref;

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

    const [direction, setDirection]  = React.useState(null);

    const directionsService = DirectionsService;

    const fetchLocationApiData = async () => {
        if (newPos !== undefined) {
            // console.log(newPos)
            let lat = newPos.lat.toString();
            let lng = newPos.lng.toString();
            lat = lat.slice(0, (lat.indexOf(".")) + 7);
            lng = lng.slice(0, (lng.indexOf(".")) + 7);

            await axios.get("https://api.translink.ca/rttiapi/v1/stops?apikey=uR1LJ7QcIfeLZmaQ0oPs&lat=" + lat + "&long=" + lng + "&radius=2000")
                .then((response) => setBusStopData(response.data));
            // console.log(busStopData);
        } 
    }

    async function fetchArrivalTimeApiData(stopNum, busNum, setNextBusEstimate) {
        busNum = busNum.replace(/\s+/g, '');
     
        await axios.get("https://api.translink.ca/rttiapi/v1/stops/" + stopNum + "/estimates?apikey=uR1LJ7QcIfeLZmaQ0oPs&routeNo=" + busNum)
            .then((response) => setNextBusEstimate(response.data));  
    }

    // useEffect(() => {
    //     fetchBusApiData();
    // }, []);
    
    function handleCenterChanged() {
        if (!mapRef.current) return;

        const position = mapRef.current.getCenter().toJSON();
        setNewPos(position);
        
        if (busData.length < 1) {
            fetchLocationApiData(); 
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
                                    setSelectedBus(bus);
                                    console.log(bus);
                                    console.log(selectedStop);
                                    // directionsService.route(
                                    //     {
                                    //         origin: selectedBus.Latitude + ',' + selectedBus.Longitude,
                                    //         destination: selectedStop.Latitude + ',' + selectedStop.Longitude,
                                    //         travelMode: "TRANSIT"
                                    //     },
                                    //     (result, status) => {
                                    //         if (status === window.google.maps.DirectionsStatus.OK) {
                                    //             setDirection(result);
                                    //           } else {
                                    //             console.log('error');
                                    //           }
                                    //     }
                                    // )
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
                        }}
                    >
                        <h1>{selectedBus.VehicleNo}</h1>
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
                            }}
                        >
                            <div>
                                {nextBusEstimate.length > 0 ? (
                                nextBusEstimate[0]["Schedules"].map((nextBus) => {
                                    return (
                                        <p>{nextBus.ExpectedLeaveTime}</p>
                                    )
                                })) : (console.log(nextBusEstimate))}
                                <button onClick={() => {
                                    setBusData([]);
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
                                            Promise.all(
                                                [fetchBusApiData(bus, selectedStop.StopNo, setBusData, busData),
                                                    fetchArrivalTimeApiData(selectedStop.StopNo, bus, setNextBusEstimate)])
                                            // fetchBusApiData(bus, selectedStop.StopNo, setBusData, busData)
                                            displayClickedBus(selectedStop, setSelectedStop, setBusStopData)
                                            // fetchArrivalTimeApiData(selectedStop.StopNo, bus, setNextBusEstimate)
                                        }}
                                    >
                                        {bus}
                                    </button>
                                )
                            })}
                        </div>
                    </InfoWindow>)
                )}

                {/* {direction && (
                    <DirectionsRenderer directions={direction} />
                )} */}
            </GoogleMap>
        </div>
    );
}

async function fetchBusApiData(bus, stopNo, setBusData, busData) {
    bus = bus.replace(/\s+/g, '');
   
    if (bus !== undefined && stopNo !== undefined) {
        await axios.get("https://api.translink.ca/rttiapi/v1/buses?apikey=uR1LJ7QcIfeLZmaQ0oPs&stopNo=" + stopNo + "&routeNo=" + bus)
            .then((response) => setBusData(response.data));        
    }
    console.log(busData)
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
