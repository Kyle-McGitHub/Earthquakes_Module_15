// Initialize the map and set its view to Coffeyville, Kansas with a zoom level that shows the entire continental US
var map = L.map('map').setView([37.037, -95.6161], 4);

// Add a TileLayer to the map
L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
    attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
}).addTo(map);

// Define the URL to the GeoJSON data
var geojsonUrl = 'https://earthquake.usgs.gov/earthquakes/feed/v1.0/summary/all_week.geojson';

// Function to set the style for each feature
function style(feature) {
    return {
        radius: feature.properties.mag * 2, // Radius based on magnitude
        fillColor: getColor(feature.geometry.coordinates[2]), // Color based on depth
        color: "#000", // Border color
        weight: 1,
        opacity: 1,
        fillOpacity: 0.8
    };
}

// Function to set the color based on depth
function getColor(depth) {
    return depth > 90 ? '#800026' :
           depth > 70 ? '#BD0026' :
           depth > 50 ? '#E31A1C' :
           depth > 30 ? '#FC4E2A' :
           depth > 10 ? '#FD8D3C' :
                        '#FEB24C';
}

// Function to create circle markers and bind popups
function pointToLayer(feature, latlng) {
    var popupContent = `<b>Magnitude:</b> ${feature.properties.mag}<br>` +
                       `<b>Significance:</b> ${feature.properties.sig}<br>` +
                       `<b>Tsunami:</b> ${feature.properties.tsunami === 1 ? 'Yes' : 'No'}`;

    var geojsonMarkerOptions = {
        radius: style(feature).radius,
        fillColor: style(feature).fillColor,
        color: style(feature).color,
        weight: style(feature).weight,
        opacity: style(feature).opacity,
        fillOpacity: style(feature).fillOpacity
    };

    var marker = L.circleMarker(latlng, geojsonMarkerOptions);

    marker.bindPopup(popupContent);

    return marker;
}

// Create a legend control
var legend = L.control({ position: 'bottomright' });

// Function to generate legend content
legend.onAdd = function(map) {
    var div = L.DomUtil.create('div', 'info legend');
    var grades = [0, 10, 30, 50, 70, 90];
    var labels = ['<strong>Depth (km)</strong>'];

    // Loop through depths to generate a label with a colored square for each interval
    for (var i = 0; i < grades.length; i++) {
        var colorClass = 'legend-color-' + (i + 1);
        labels.push(
            '<div class="legend-item">' +
                '<div class="' + colorClass + '"></div>' +
                '<div class="legend-label">' +
                    (grades[i] + (grades[i + 1] ? '&ndash;' + (grades[i + 1] - 1) : '+')) +
                '</div>' +
            '</div>'
        );
    }

    div.innerHTML = labels.join('');
    return div;
};


// Add legend to map
legend.addTo(map);

// Fetch the GeoJSON data using D3.js
d3.json(geojsonUrl).then(function(data) {
    // Add the GeoJSON data to the Leaflet map with custom marker style and popups
    L.geoJSON(data, {
        pointToLayer: pointToLayer
    }).addTo(map);
}).catch(function(error) {
    console.error('Error fetching GeoJSON data:', error);
});


