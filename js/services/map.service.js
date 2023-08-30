import { utilService } from './util.service.js'


export const mapService = {
  initMap,
  addMarker,
  panTo,
  removePlace
};

// Var that is used throughout this Module (not global)
var gMap;
let gPlaces = []
let gMarkers = []

function initMap(lat = 51.505591765464914, lng = -0.09048158007556373) {
  console.log("InitMap");
  getWeather(lat, lng).then(res => rentWeather(res))
  return _connectGoogleApi().then(() => {
    console.log("google available");
    gMap = new google.maps.Map(document.querySelector("#map"), {
      center: { lat, lng },
      zoom: 15,
    });
    gMap.addListener('click', ev => {
      const name = prompt('Place name?', 'Place 1')
      if (!name) return
      const lat = ev.latLng.lat()
      const lng = ev.latLng.lng()
      addPlace(name, lat, lng, gMap.getZoom())
      getWeather(lat, lng).then(res => rentWeather(res))
    })
    console.log("Map!", gMap);
  });
  
}

function getWeather(lat, lng) {
  return fetch(`http://api.openweathermap.org/geo/1.0/reverse?lat=${lat}&lon=${lng}&limit5&appid=307b1a8173ac11cf753e139fe19fa56e`)
    .then(res => res.json())
    .then(lok => {
      const city = lok[0].name
      const country = lok[0].country
      return fetch(`https://api.openweathermap.org/data/2.5/weather?lat=${lat}&lon=${lng}&appid=307b1a8173ac11cf753e139fe19fa56e`)
        .then(res => res.json())
        .then(weather => {
          return {
            city, 
            country,
            temp: weather.main.temp,
            tempMin: weather.main.temp_min,
            tempMax: weather.main.temp_max,
            weather: weather.weather[0].main,
            wind: weather.wind.speed,
          }
        })
    })

    
}

function addMarker(loc) {
  var marker = new google.maps.Marker({
    position: loc,
    map: gMap,
    title: "Hello World!",
  });
  return marker;
}

function panTo(lat, lng) {
  var laLatLng = new google.maps.LatLng(lat, lng);
  gMap.panTo(laLatLng);
  getWeather(lat, lng).then(res => rentWeather(res))
}

function removePlace(placeId) {
  const deleteIndex = gPlaces.findIndex(Place => Place.id === placeId)
  gPlaces.splice(deleteIndex, 1)
  // saveToStorage('placesDB', gPlaces)
  renderPlaces(gPlaces)
  renderMarkers(gPlaces)
  if(gPlaces[0])getWeather(gPlaces[0].lat, gPlaces[0].lng).then(res => rentWeather(res))
}

function _connectGoogleApi() {
  if (window.google) return Promise.resolve();
  const API_KEY = "AIzaSyCF_57rzx339nMeHxVEJqQ_fyh43L2Sxlc";
  var elGoogleApi = document.createElement("script");
  elGoogleApi.src = `https://maps.googleapis.com/maps/api/js?key=${API_KEY}`;
  elGoogleApi.async = true;
  document.body.append(elGoogleApi);
  console.log(elGoogleApi);

  return new Promise((resolve, reject) => {
    elGoogleApi.onload = resolve;
    elGoogleApi.onerror = () => reject("Google script failed to load");
  });
}


function addPlace(name, lat, lng, zoom) {
  gPlaces.push(_createPlace(name, lat, lng, zoom))
  renderPlaces(gPlaces)
  renderMarkers(gPlaces)
  // saveToStorage('placesDB', gPlaces)
}

function _createPlace(name, lat, lng, zoom) {
  return {
    id: utilService.makeId(),
    name,
    lat,
    lng,
    zoom
  }
}

function renderPlaces(places) {
  const placesHtml = places.map(place => `
      <li>
          <span>${place.name}:</span>
          <button onclick="onPanTo(${place.lat}, ${place.lng})"class="btn-pan btn"><i class="fa-solid fa-location-dot"></i></button>
          <button onclick="OnRemove('${place.id}')" class="btn"><i class="fa-solid fa-trash"></i></button>
      </li>
  `).join('')
  document.querySelector('.places').innerHTML = placesHtml
}

function renderMarkers(places) {
  if (gMarkers) gMarkers.forEach(marker => marker.setMap(null))
  gMarkers = places.map(place => {
    return new google.maps.Marker({
      position: place,
      map: gMap,
      title: place.name
    })
  })
}

function rentWeather({city, country, temp, tempMin, tempMax, weather, wind}){
  document.querySelector('.weather').innerHTML = `
  <h3>weather today</h3>
  <p>${city}, ${country} <span>${weather}</span></p>
  <p>${Math.trunc(temp- 273.15)}C temperature from ${Math.trunc(tempMin- 273.15)} to ${Math.trunc(tempMax- 273.15)}C, wind ${wind}m/s</p>
  `
}