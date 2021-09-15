import { Map, GoogleApiWrapper } from 'google-maps-react';
import React, {Component} from 'react';
import dark from './GoogleMapStyles';
import GoogleMap from 'react-google-maps';

const mapStyles = {
    width: '100%',
    height: '100%',
};


export class MapContainer extends Component {

    render() {
        return (
            <div style={{ width: "100%", height: "100%"}}>
                <Map
                    google={this.props.google}
                    zoom={8}
                    styles={dark}
                    initialCenter={{ lat: 49.2827, lng: -123.1207}}
                />
            </div>
        );
    }
}


export default GoogleApiWrapper({
    apiKey: 'AIzaSyAoYmRYMoQADvN5TEms7pnJxEcji7Fl-P8'
})(MapContainer);