let map;
let lat = "";
let lon = "";
let list = []
mapboxgl.accessToken =
  'pk.eyJ1IjoieW9nZXNobmlzaGFkIiwiYSI6ImNrOG85ZHQ1NDAwcXMzbG5zd3YwbGlxZ3YifQ.H0dNSfwjRxTl2kBBIPV1zg';
if (navigator.geolocation) {
  navigator.geolocation.getCurrentPosition(function (position) {
    lat = position.coords.latitude;
    lon = position.coords.longitude;
    initMap(lon, lat)
  })
}

function initMap(longitude = -71.157895, latitude = 42.707741) {
  map = new mapboxgl.Map({
    container: 'map',
    style: 'mapbox://styles/mapbox/streets-v11',
    zoom: 12,
    center: [longitude, latitude]
  });
  getPlaces();
}

// initMap()

// Fetch places from API
async function getPlaces() {
  const res = await fetch('/api/v1/places');
  const data = await res.json();
  renderMap(data.data)
  mapListRender(data.data);
}

// Fetch near by places from API
async function getNearBy() {
  const res = await fetch(`/api/v1/places/near-me?longitude=${lon}&latitude=${lat}`);
  const data = await res.json();
  renderMap(data.data)
  mapListRender(data.data);
}

function renderMap(data) {
  const places = data.map(place => {
    return {
      type: 'Feature',
      geometry: {
        type: 'Point',
        coordinates: [
          place.location.coordinates[0],
          place.location.coordinates[1]
        ]
      },
      properties: {
        placeId: place.placeId,
        icon: 'shop'
      }
    };
  });
  loadMap(places);
}

// Load map with places
function loadMap(places) {
  map.on('load', function () {
    map.addLayer({
      id: 'points',
      type: 'symbol',
      source: {
        type: 'geojson',
        data: {
          type: 'FeatureCollection',
          features: places
        }
      },
      layout: {
        'icon-image': '{icon}-15',
        'icon-size': 1.5,
        'text-field': '{placeId}',
        'text-font': ['Open Sans Semibold', 'Arial Unicode MS Bold'],
        'text-offset': [0, 0.9],
        'text-anchor': 'top'
      }
    });
  });
}

function mapListRender(data) {
  list = data
  const listCard = document.getElementById("list");
  let places = `<li class="list-group-item text-center">NO Data</li>`
  if (data.length) {
    places = data.map((place, index) => `
      <li class="list-group-item d-flex justify-content-between align-items-center" id="${place._id}"  style="cursor: pointer;" onClick=dragToPointer('${(index)}')>
          <div >${place.placeId}</div>  
          <button onclick="deleteLocation('${(index)}')" type="button" class="close" aria-label="Close">
            <span aria-hidden="true">&times;</span>
          </button>
      </li>`).join("");

  }
  lastSelectId = ""
  listCard.innerHTML = "";
  listCard.innerHTML = places;
}


document.getElementById('search-form').addEventListener('submit', function (evt) {
  evt.preventDefault();
  debugger
  const searchInput = document.getElementById("search-input");
  findPlace(searchInput.value.trim());
  searchInput.value = "";
})

// document.getElementById('search-input').addEventListener('change', function(evt){
//   evt.preventDefault();
//   debugger
//   findPlace(evt.target.value.trim());
// })

async function findPlace(value) {
  try {

    const res = await fetch(`/api/v1/places?q=${value}`);

    if (res.status === 400) {
      throw Error('Place already exists!');
    }

    const data = await res.json();

    mapListRender(data.data);

  } catch (err) {
    alert(err);
    return;
  }
}
let lastSelectId = ""
function dragToPointer(index) {
  if (lastSelectId) {
    const preSelectedItem = document.getElementById(lastSelectId);
    preSelectedItem.classList.remove("active");
    preSelectedItem.classList.remove("bg-info");
  }
  const place = list[Number(index)];
  const selectedItem = document.getElementById(place._id);
  selectedItem.classList.add("active");
  selectedItem.classList.add("bg-info");
  lastSelectId = place._id;
  map.flyTo({
    center: [
      place.location.coordinates[0],
      place.location.coordinates[1]
    ],
    zoom: 12,
    essential: true // this animation is considered essential with respect to prefers-reduced-motion
  });
}

async function deleteLocation(index) {

  if (index == undefined) {
    alert("Invalid id")
  }
  const place = list[Number(index)];

  console.log(place._id)

  try {
    const res = await fetch(`/api/v1/places/${place._id}`, {
      method: 'DELETE',
      headers: {
        'Content-Type': 'application/json'
      },
    });
    debugger
    if (res.status === 400) {
      throw Error('Place not exists!');
    }

    const data = await res.json();

    mapListRender(data.data);

    alert('Place removed!');
    window.location.href = '/index.html';
  } catch (err) {
    alert(err);
    return;
  }

}
