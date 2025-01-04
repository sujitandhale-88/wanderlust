mapboxgl.accessToken = mapToken;

const map = new mapboxgl.Map({
    container: 'map',
    center: listing.geometry.coordinates, // Use the coordinates from the listing
    zoom: 9
});

const marker = new mapboxgl.Marker({color: "red"})
    .setLngLat(listing.geometry.coordinates)
    .setPopup(new mapboxgl.Popup({offset: 25})
    .setHTML(`<h4>${listing.title}</h4><p>Exact Location will be provided after booking</p>`))
    .addTo(map);

// Update map function
function updateMap(location) {
    geocodingClient.forwardGeocode({
        query: location,
        limit: 1,
    }).send()
    .then(response => {
        const newCoords = response.body.features[0].geometry.coordinates;
        map.setCenter(newCoords); // Move the map
        marker.setLngLat(newCoords); // Move the marker
    });
}

// Automatically update the map if the location input is changed
const locationInput = document.getElementById('location');
if (locationInput) {
    locationInput.addEventListener('change', function () {
        const newLocation = locationInput.value;
        updateMap(newLocation); // Call updateMap on location change
    });
}

// If you want to update the map immediately after the page reload (when editing), you can call updateMap(location)
// For example, you can get the location from the rendered data:
updateMap(listing.location); // Assuming `listing.location` is available in your view.
