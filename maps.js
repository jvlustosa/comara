let markers = [];
let map;

// Função principal para inicializar o mapa com os dados
function initMap(data) {
    fetch("./brasil.geojson")
        .then(response => {
            if (!response.ok) throw new Error('Erro ao carregar o GeoJSON');
            return response.json();
        })
        .then(geoJSON => {
            map = L.map("map", {
                zoom: 5,
                minZoom: 4,
                attributionControl: false,
            });

            // Carrega o mapa base do OpenStreetMap
            let tileUrl = "https://tile.openstreetmap.org/{z}/{x}/{y}.png";
            let osm = new L.TileLayer.BoundaryCanvas(tileUrl, {
                boundary: geoJSON
            });

            map.addLayer(osm);
            let geoLayer = L.geoJSON(geoJSON);
            map.fitBounds(geoLayer.getBounds());

            criarAeroportos(data, map);
            L.control.scale({ position: "bottomright", metric: true }).addTo(map);
        })
        .catch(error => console.error('Erro ao inicializar o mapa:', error));
}

// Função para criar os marcadores dos aeroportos
function criarAeroportos(data, map) {
    var airportIcon = L.icon({
        iconUrl: "./aeroporto.png",
        iconSize: [35, 35]
    });

    data.forEach(airport => {
        var customPopup = `<div class="map-popup-container">
            ${inserirImagem(airport.fotos)}
            <div class="popup-description-container">
                <h2>${airport.nome} - ${airport.estado}</h2>
                <p>${airport.icao} <a href="https://aisweb.decea.mil.br/?i=aerodromos&codigo=${airport.icao}" target="_blank" rel="noopener noreferrer"><i class="fa fa-external-link" aria-hidden="true"></i></a></p>
                <div class="popup-timeline-container">
                    <ul class="popup-timeline">
                        ${inserirObras(airport.atividades)}
                    </ul>
                </div>
            </div>
        </div>`;

        var customOptions = {
            maxWidth: 500,
            className: "customPopup"
        };

        document.getElementById('airport_count').innerText = data.length;
        createPin(airport, customPopup, customOptions);
    });
}

// Função para criar um marcador no mapa
function createPin(airport, customPopup, customOptions) {
    markers.push(L.marker([airport.lat, airport.long], { icon: airportIcon })
        .addTo(map)
        .bindPopup(customPopup, customOptions));
}

// Função para inserir imagens nas popups
function inserirImagem(fotos) {
    return fotos.length > 0 ? `<img src='${fotos[0]}' width='300px'/>` : "";
}

// Função para inserir obras na timeline das popups
function inserirObras(obras) {
    let html = "";
    obras.sort((a, b) => a.inicio > b.inicio ? 1 : -1);
    if (obras) {
        obras.forEach(obra => {
            html += `<li class="popup-timeline-obra" data="${obra.inicio}">
                <p>${obra.descricao}</p>
            </li>`;
        });
    }
    return html;
}

// Função para buscar dados do JSON e inicializar o mapa
function getData() {
    fetch("./data.json")
        .then(response => {
            if (!response.ok) throw new Error('Erro ao carregar os dados JSON');
            return response.json();
        })
        .then(data => {
            initMap(data);
        })
        .catch(error => console.error('Erro ao obter os dados:', error));
}
