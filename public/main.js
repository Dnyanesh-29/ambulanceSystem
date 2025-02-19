let map, directionsService, directionsRenderer, currentMarker;
const socket = new WebSocket('wss://ambulancesystem.onrender.com/location-updates');

// Ensure WebSocket connection is established
socket.onopen = () => {
    console.log('WebSocket connection opened');
};

// Initialize Google Maps
window.initMap = function () {
    directionsService = new google.maps.DirectionsService();
    directionsRenderer = new google.maps.DirectionsRenderer();

    map = new google.maps.Map(document.getElementById("map"), {
        center: { lat: -34.397, lng: 150.644 },
        zoom: 14,
        disableDefaultUI: true,
        mapId: "YOUR_MAP_ID", // Replace with your actual map ID
    });

    directionsRenderer.setMap(map);
    startLocationUpdates(); // Start tracking user location
};

// Function to update the map center
function updateMapCenter(pos) {
    if (map && pos && typeof pos.lat === "number" && typeof pos.lng === "number") {
        map.setCenter(pos);
    } else {
        console.warn("Skipping update: Map is not initialized or position is invalid.");
    }
}

// Function to handle location errors
function handleLocationError(browserHasGeolocation, pos) {
    updateMapCenter(pos);
}

// Function to calculate and display route
function calculateRoute() {
    const endLocation = document.getElementById("end-location").value;

    if (endLocation && currentMarker) {
        const start = currentMarker.getPosition();
        const request = {
            origin: start,
            destination: endLocation,
            travelMode: 'DRIVING'
        };

        directionsService.route(request, function (result, status) {
            if (status === 'OK') {
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
            } else {
                console.error("Route calculation failed:", status);
            }
        });
    } else {
        alert("Please provide a destination.");
    }
}

// Function to send location data via WebSocket
function sendLocationData(data) {
    if (socket.readyState === WebSocket.OPEN) {
        socket.send(JSON.stringify(data));
    } else {
        console.error("WebSocket is not open yet.");
    }
}

// Function to start tracking location updates
function startLocationUpdates() {
    if (!navigator.geolocation) {
        console.error("Geolocation is not supported.");
        return;
    }

    setInterval(() => {
        if (!map) {
            console.warn("Skipping location update: Map not initialized.");
            return;
        }

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
            },
            (error) => {
                console.error("Geolocation update error:", error);
            }
        );
    }, 2000);
}

// Ensure global function access
window.calculateRoute = calculateRoute;

