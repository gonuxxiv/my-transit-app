// import React from 'react';
// import { Tabs, Tab, AppBar } from '@material-ui/core';
// import { MapContainer } from './Map';

// const Home = () => {
//     const [selectedTab, setSelectedTab] = React.useState(0);

//     const handleChange = (event, newValue) => {
//         setSelectedTab(newValue);
//     };

//     return (
//         <>
//             <AppBar position="static">
//                 <Tabs value={selectedTab} onChange={handleChange} centered>
//                     <Tab label="Map" />
//                     <Tab label="Note" />
//                 </Tabs>
//             </AppBar>
//             {selectedTab === 0 && <MapContainer />}
//             {selectedTab === 1 && "note"}
//         </>
//     )
// }

// export default Home;