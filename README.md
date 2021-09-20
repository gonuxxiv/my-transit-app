# My-Transit-App

    Tools used for this project:
        - React.js
        - Node.js
        - Google Map API
        - Translink API

# Schedule

## Next Step

    - Enable onclick to bus stops and show their details (styling later).
    - After clicking one of the bus buttons, the InfoWindow would automatically close, hide all 
    bus stop markers, and display nearest bus (using lat, lng) and its arrival time (in countdown) shown above the bus icon. Also, its path will get highlighted. (pan if needed to)
    - Retrieve bus location in real-time
    - Use directionService and DirectionRenderer to show direction from where the bus is to the stop

## Problems

    - Not able to load markers as the map pans to the current location.
    - The bus stops show up a bit slow.
    - Not able to load all bus stops at once


## Available Scripts

In the project directory, you can run:

### `npm start`

Runs the app in the development mode.\
Open [http://localhost:3000](http://localhost:3000) to view it in the browser.

The page will reload if you make edits.\
You will also see any lint errors in the console.

### `npm test`

Launches the test runner in the interactive watch mode.\
See the section about [running tests](https://facebook.github.io/create-react-app/docs/running-tests) for more information.

### `npm run build`

Builds the app for production to the `build` folder.\
It correctly bundles React in production mode and optimizes the build for the best performance.

The build is minified and the filenames include the hashes.\
Your app is ready to be deployed!

See the section about [deployment](https://facebook.github.io/create-react-app/docs/deployment) for more information.

### `npm run eject`

**Note: this is a one-way operation. Once you `eject`, you can’t go back!**

If you aren’t satisfied with the build tool and configuration choices, you can `eject` at any time. This command will remove the single build dependency from your project.

Instead, it will copy all the configuration files and the transitive dependencies (webpack, Babel, ESLint, etc) right into your project so you have full control over them. All of the commands except `eject` will still work, but they will point to the copied scripts so you can tweak them. At this point you’re on your own.

You don’t have to ever use `eject`. The curated feature set is suitable for small and middle deployments, and you shouldn’t feel obligated to use this feature. However we understand that this tool wouldn’t be useful if you couldn’t customize it when you are ready for it.
