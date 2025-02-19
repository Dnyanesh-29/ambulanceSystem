let map, directionsService, directionsRenderer, currentMarker;

async function initMap() {
    directionsService = new google.maps.DirectionsService();
    directionsRenderer = new google.maps.DirectionsRenderer();

    map = new google.maps.Map(document.getElementById("map"), {
        center: { lat: -34.397, lng: 150.644 },
        zoom: 14,
        disableDefaultUI: true,
        mapId: "AIzaSyCWMuj3kbeCY9t3n0szATJW92asgh8j21c", // Replace with your actual map ID
    });

    directionsRenderer.setMap(map);

    // Use HTML5 Geolocation API to get the current position
    if (navigator.geolocation) {
        navigator.geolocation.getCurrentPosition(
            (position) => {
                const pos = {
                    lat: position.coords.latitude,
                    lng: position.coords.longitude,
                };
                updateMapCenter(pos);
                currentMarker = new google.maps.Marker({
                    position: pos,
                    map: map,
                    title: "Your Location",
                });
            },
            () => {
                handleLocationError(true, map.getCenter());
            }
        );
    } else {
        // Browser doesn't support Geolocation
        handleLocationError(false, map.getCenter());
    }
}

function updateMapCenter(pos) {
    if (map && pos) {
        map.setCenter(pos);
    } else {
        console.error("Map is not initialized or position is undefined.");
    }
}

function handleLocationError(browserHasGeolocation, pos) {
    updateMapCenter(pos);
}

function calculateRoute() {
    const endLocation = document.getElementById("end-location").value;
    if (endLocation && currentMarker) {
        const start = currentMarker.getPosition();
        const request = {
            origin: start,
            destination: endLocation,
            travelMode: 'DRIVING'
        };

        directionsService.route(request, function(result, status) {
            if (status == 'OK') {
                directionsRenderer.setDirections(result);

                // Send route data to the server
                const routeData = {
                    latitude: start.lat(),
                    longitude: start.lng(),
                    route: {
                        start: start.toJSON(),
                        end: endLocation
                    }
                };
                sendLocationData(routeData);
            }
        });
    } else {
        alert("Please provide a destination.");
    }
}

// Ensure that these functions are available globally
window.initMap = initMap;
window.calculateRoute = calculateRoute;

// WebSocket connection setup
const socket = new WebSocket('wss://ambulancesystem.onrender.com/location-updates');

socket.onopen = () => {
    console.log('WebSocket connection opened');
};

function sendLocationData(data) {
    if (socket.readyState === WebSocket.OPEN) {
        socket.send(JSON.stringify(data));
    } else {
        console.error('WebSocket is not open yet.');
    }
}

setInterval(() => {
    if (navigator.geolocation) {
        navigator.geolocation.getCurrentPosition(
            (position) => {
                const pos = {
                    lat: position.coords.latitude,
                    lng: position.coords.longitude,
                };

                if (currentMarker) {
                    currentMarker.setPosition(pos);
                    updateMapCenter(pos);
                } else {
                    currentMarker = new google.maps.Marker({
                        position: pos,
                        map: map,
                        title: "Your Location",
                    });
                    updateMapCenter(pos);
                }

                // Send location data to the server
                sendLocationData(pos);
            }
        );
    }
}, 2000); // Update every 2 seconds
