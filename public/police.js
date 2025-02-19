let map, policeMarker, directionsService, directionsRenderer;

function initMap() {
    directionsService = new google.maps.DirectionsService();
    directionsRenderer = new google.maps.DirectionsRenderer();

    map = new google.maps.Map(document.getElementById("map"), {
        center: { lat: -34.397, lng: 150.644 },
        zoom: 14,
        disableDefaultUI: true,
    });

    directionsRenderer.setMap(map);

    setTimeout(() => {
        const socket = new WebSocket('ws://localhost:8080/location-updates');
        
        socket.onmessage = function(event) {
            const data = event.data;

            if (typeof data === 'string') {
                try {
                    const jsonData = JSON.parse(data);
                    handleLocationData(jsonData);
                } catch (error) {
                    console.error('Error parsing JSON:', error);
                }
            } else if (data instanceof Blob) {
                const reader = new FileReader();
                reader.onload = function() {
                    try {
                        const jsonData = JSON.parse(reader.result);
                        handleLocationData(jsonData);
                    } catch (error) {
                        console.error('Error parsing JSON:', error);
                    }
                };
                reader.readAsText(data);
            } else {
                console.error('Received data is not a valid JSON string or Blob.');
            }
        };
    }, 1000); // Add a delay of 1 second to ensure map is ready
}

function handleLocationData(data) {
    console.log("Received data:", data);  // Log the received data

    // Adjust to handle both 'lat'/'lng' and 'latitude'/'longitude' formats
    const latitude = data.latitude !== undefined ? data.latitude : data.lat;
    const longitude = data.longitude !== undefined ? data.longitude : data.lng;

    if (Number.isFinite(latitude) && Number.isFinite(longitude)) {
        const pos = {
            lat: latitude,
            lng: longitude,
        };

        if (!policeMarker) {
            policeMarker = new google.maps.Marker({
                position: pos,
                map: map,
                title: "Vehicle Location",
            });
        } else {
            policeMarker.setPosition(pos);
        }

        if (data.route) {
            const request = {
                origin: data.route.start,
                destination: data.route.end,
                travelMode: 'DRIVING'
            };

            directionsService.route(request, function(result, status) {
                if (status == 'OK') {
                    directionsRenderer.setDirections(result);
                }
            });
        }

        map.setCenter(pos);
    } else {
        console.error("Invalid data format:", data);
    }
}


window.initMap = initMap;
