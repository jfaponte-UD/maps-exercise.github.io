let geojson;
// ... our listeners
geojson = L.geoJson();

let info = L.control();

let legend = L.control({position: 'bottomright'});


function getColor(d) {
    return d > 15000000 ? '#800026' :
        d > 5500000 ? '#BD0026' :
            d > 2500000 ? '#E31A1C' :
                d > 1500000 ? '#FC4E2A' :
                    d > 550000 ? '#FD8D3C' :
                        d > 250000 ? '#FEB24C' :
                            d > 100000 ? '#FED976' :
                                '#FFEDA0';
}

function style(feature) {
    return {
        fillColor: getColor(feature.properties.HECTARES),
        weight: 2,
        opacity: 1,
        color: 'white',
        dashArray: '3',
        fillOpacity: 0.7
    };
}

function highlightFeature(e) {
    let layer = e.target;

    layer.setStyle({
        weight: 5,
        color: '#666',
        dashArray: '',
        fillOpacity: 0.7
    });

    layer.bringToFront();

    info.update(layer.feature.properties);
}

function resetHighlight(e) {
    geojson.resetStyle(e.target);
    info.update();

}


function zoomToFeature(e) {
    map.fitBounds(e.target.getBounds());
}

function onEachFeature(feature, layer) {
    layer.on({
        mouseover: highlightFeature,
        mouseout: resetHighlight,
        click: zoomToFeature
    });
}

document.addEventListener('DOMContentLoaded', function () {
    const map = L.map('map').setView([4, -78], 5);

    const tiles = L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        maxZoom: 19,
        attribution: '&copy; <a href="http://www.openstreetmap.org/copyright">OpenStreetMap</a>'
    }).addTo(map);

    fetch('/src/colombia-data.json')
        .then(response => {
            if (!response.ok) {
                throw new Error('Network response was not ok');
            }
            return response.json();
        })
        .then(data => {

            geojson = L.geoJson(data, {
                style: style,
                onEachFeature: onEachFeature
            }).addTo(map);


            info.onAdd = function (map) {
                this._div = L.DomUtil.create('div', 'info');
                this.update();
                return this._div;
            };

            info.update = function (props) {
                this._div.innerHTML = '<h4>HECTARES</h4>' + (props ?
                    '<b>' + (props.NOMBRE_DPT ? props.NOMBRE_DPT : "Unknown") + '</b><br />' + (props.HECTARES ? parseInt(props.HECTARES) + ' ha' : "Unknown")
                    : 'Hover over a state');
            };


            info.addTo(map);

            legend.onAdd = function (map) {

                var div = L.DomUtil.create('div', 'info legend'),

                    grades = [0, 100000, 250000, 550000, 1500000, 2500000, 5500000, 15000000],
                    labels = [];

                for (var i = 0; i < grades.length; i++) {
                    div.innerHTML +=
                        '<i style="background:' + getColor(grades[i] + 1) + '"></i> ' +
                        grades[i] + (grades[i + 1] ? '&ndash;' + grades[i + 1] + '<br>' : '+');
                }

                return div;
            };

            legend.addTo(map);

        })
        .catch(error => {
            console.error('Error fetching or parsing data:', error);
        });
});
