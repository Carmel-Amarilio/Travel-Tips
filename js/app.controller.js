import { locService } from "./services/loc.service.js";
import { mapService } from "./services/map.service.js";

window.onload = onInit;
window.onAddMarker = onAddMarker;
window.onPanTo = onPanTo;
window.onGetLocs = onGetLocs;
window.onGetUserPos = onGetUserPos;
window.OnRemove = OnRemove;
window.onSearch = onSearch;

function onInit() {
    mapService
        .initMap()
        .then(() => {
            console.log("Map is ready");
        })
        .catch(() => console.log("Error: cannot init map"));
}

// This function provides a Promise API to the callback-based-api of getCurrentPosition
function getPosition() {
    console.log("Getting Pos");
    return new Promise((resolve, reject) => {
        navigator.geolocation.getCurrentPosition(resolve, reject);
    });
}

function onAddMarker() {
    console.log("Adding a marker");
    mapService.addMarker({ lat: 32.0749831, lng: 34.9120554 });
}

function onGetLocs() {
    locService.getLocs().then((locs) => {
        console.log("Locations:", locs);
        document.querySelector(".places").innerText = JSON.stringify(locs, null, 2);
    });
}

function onGetUserPos() {
    getPosition()
        .then((pos) => {
            console.log(pos);
            document.querySelector(
                ".user-pos"
            ).innerText = `Latitude: ${pos.coords.latitude} - Longitude: ${pos.coords.longitude}`;
            mapService.panTo(pos.coords.latitude, pos.coords.longitude);
            mapService.addMarker(pos.coords.latitude, pos.coords.longitude);
            mapService.addPlace('Home',pos.coords.latitude, pos.coords.longitude,15);
        })
        .catch((err) => {
            console.log("err!!!", err);
        });
}
function onPanTo(lat, lng) {
    mapService.panTo(lat, lng);
}

function OnRemove(placeId) {
    mapService.removePlace(placeId);
}

function onSearch() {
    const value = document.querySelector(".search-input").value;
    mapService.searchLocation(value);
}
