

var data = getData();
let markers = [];
let map;
function initMap(data){
    fetch("./brasil.geojson").then(function (response) {
        map = L.map("map", {
            zoom: 5,
            minZoom: 4,
            attributionControl: false
        });
        return response.json().then(function (geoJSON) {
            let tile =
                "https://stamen-tiles-{s}.a.ssl.fastly.net/terrain/{z}/{x}/{y}.png";
                tile = "https://tile.openstreetmap.org/{z}/{x}/{y}.png"
            var osm = new L.TileLayer.BoundaryCanvas(tile, {
                boundary: geoJSON
            });
            map.addLayer(osm);
            var ukLayer = L.geoJSON(geoJSON);
            map.fitBounds(ukLayer.getBounds());
            criarAeroportos(data, map);
            L.control.scale({ position: "bottomright", metric: true }).addTo(map);
        });
    });
}


function criarAeroportos(data, map) {
    var airportIcon = L.icon({
        iconUrl: "aeroporto.png",
        iconSize: [35, 35] // size of the icon
    });

    data.forEach((airport) => {
        var customPopup = `<div class="map-popup-container"> 
            ${inserirImagem(airport.fotos)}
        <div class="popup-description-container">   
        <h2>${airport.nome} - ${airport.estado}</h2>
        <p>${airport.icao} <a href="https://aisweb.decea.mil.br/?i=aerodromos&codigo=${airport.icao}" target="_blank" rel="noopener noreferrer"><i class="fa fa-external-link" aria-hidden="true"></i></a><p>
            <div class="popup-timeline-container">
            <ul class="popup-timeline">
                ${inserirObras(airport.atividades)}
            </ul>
            </div>
            </div>
            </div>`;
        var customOptions = {
            widtt: "auto",
            maxWidth: "500",
            className: "customPopup"
        };
        document.getElementById('airport_count').innerText = data.length;
        createPin(airport, customPopup, customOptions);
    });

    function createPin(airport, customPopup, customOptions) {
        markers.push(L.marker([airport.lat, airport.long], { icon: airportIcon })
            .addTo(map)
            .bindPopup(customPopup, customOptions));
    }

    function inserirObras(obras) {
        let html = "";
        obras.sort((a, b) => (a.inicio > b.inicio) ? 1 : -1);
        if (obras != null) {
            obras.forEach((obra) => {
                html += `
      <li class="popup-timeline-obra" data="${obra.inicio}">
        <p>${obra.descricao}</p>
      </li>
      `;
            });
        }
        return html;
    }
}
function inserirImagem(fotos) {
    if (fotos.length > 0) {
        return `<img src='${fotos[0]}' width='300px'/>`
    } else
        return ""
}


function getData() {
   fetch("./data.json")
        .then(response => {return response.json();})
        .then(data => {
            initMap(data)
        });
}


function renderMap(){
    const input = document.getElementById('map-input').value;
    let data = filterData(input,getData())

    for(var i = 0; i < markers.length; i++){
        map.removeLayer(markers[i]);
    }
    markers = [];
    data.forEach(aer => {
        markers.push(aer);
    })
    criarAeroportos(data, map);
}

function filterData(input,data) {
    let filtered_data = [];
    filter = input.toUpperCase();
    data.forEach(aer => {
        if (input.toUpperCase().indexOf(filter) > -1) {
            filtered_data.push(aer)
          } 
    })

    return filtered_data;
}

