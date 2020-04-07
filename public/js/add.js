const placeForm = document.getElementById('place-form');
const placeId = document.getElementById('place-id');
const placeAddress = document.getElementById('place-address');

// Send POST to API to add place
async function addPlace(e) {
  e.preventDefault();

  if (placeId.value === '' || placeAddress.value === '') {
   return alert('Please fill in fields');
  }

  const sendBody = {
    placeId: placeId.value,
    address: placeAddress.value
  };

  try {
    const res = await fetch('/api/v1/places', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(sendBody)
    });

    if (res.status === 400) {
      throw Error('Place already exists!');
    }

    alert('Place added!');
    window.location.href = '/index.html';
  } catch (err) {
    alert(err);
    return;
  }
}

placeForm.addEventListener('submit', addPlace);

//back ground

mapboxgl.accessToken = 'pk.eyJ1IjoiYmVlcHRjIiwiYSI6ImNpaDZzeTl6czA3cm11MWtpcmZjODhsMHAifQ.oZ9PBLwvwcMX7fBaHGDnAg';
var map = new mapboxgl.Map({
    container: 'map',
    style: 'mapbox://styles/mapbox/satellite-hybrid-v8',
    center: [-86.155231, 39.768458],
    zoom: 6
});

var direction = 0, manual = false, speed = 0.1;

// create a GeoJSON point to serve as a starting point
var point = {
  "type": "Point",
  "coordinates": [-86.155231, 39.768458]
};

// add the GeoJSON above to a new vector tile source
var source = new mapboxgl.GeoJSONSource({
    data: point,
});

function setPosition() {
    point.coordinates[0] += speed * Math.sin(direction) / 100;
    point.coordinates[1] += speed * Math.cos(direction) / 100;
    source.setData(point);

    map.setLayoutProperty('drone', 'icon', direction * (180 / Math.PI));

    if (!manual && Math.random() > 0.95) {
        direction += (Math.random() - 0.5) / 2;
    }

    map.setCenter(point.coordinates);
}

map.on('style.load', function () {
    map.addSource('drone', source);
    
    map.addLayer({
        "id": "drone-glow-strong",
        "type": "circle",
        "source": "drone",
        "paint": {
            "circle-radius": 18,
            "circle-color": "#00e673",
            "circle-opacity": .8
        }
    });

    map.addLayer({
        "id": "drone-glow",
        "type": "circle",
        "source": "drone",
        "paint": {
            "circle-radius": 40,
            "circle-color": "#99ffcc",
            "circle-opacity": 0.4
        }
    });
  
    // Full icon list: https://www.mapbox.com/maki
    map.addLayer({
        "id": "drone",
        "type": "symbol",
        "source": "drone",
        "layout": {
            "icon-image": "car-24",  // try: 'car-24', 'airport-24', 'zoo-24'
        }
    });
    
    window.setInterval(setPosition, 10);
});

// Add manual control of the airplane with left and right arrow keys, just because
document.body.addEventListener('keydown', function (e) {
    if (e.which == 37) { // left
        direction -= 0.1;
        manual = true;
    }
    if (e.which == 39) { // right
        direction += 0.1;
        manual = true;
    }
    if (e.which == 38) { // faster
        speed = Math.min(speed + 0.1, 10);
        manual = true;
        e.preventDefault();
    }
    if (e.which == 40) { // slower
        speed = Math.max(speed - 0.1, 0);
        manual = true;
        e.preventDefault();
    }
}, true);