import { latLng } from "leaflet";
import * as utmObj from "utm-latlng";
import centerofmass from "@turf/center-of-mass";

function ProfilePlotter(currentTutorial) {
  let utm = null;
  let center = null;
  let currentCenter = null;
  let markerLatlong = null;
  let polyline = null;
  let id = null;
  let text = null;
  let yontem = null;
  let altyontem = null;
  let geoJson = null;
  let centerOfMass = null;

  id = currentTutorial.id;
  text = currentTutorial.nokta_adi;
  yontem = currentTutorial.yontem;
  altyontem = currentTutorial.alt_yontem;

  if (currentTutorial.datum === "WGS_84") {
    utm = new utmObj("WGS 84");
  }
  if (currentTutorial.datum === "ED_50") {
    utm = new utmObj("ED50");
  }
  if (
    (currentTutorial.x !== null && currentTutorial.y !== null) ||
    (currentTutorial.x !== 0 && currentTutorial.y !== 0)
  ) {
    var pointIcon = utm.convertUtmToLatLng(
      currentTutorial.x,
      currentTutorial.y,
      currentTutorial.zone,
      "N"
    );
    center = latLng(pointIcon.lat, pointIcon.lng);
    markerLatlong = latLng(pointIcon.lat, pointIcon.lng);
    currentCenter = center;
  }
  if (
    currentTutorial.profil_baslangic_x !== null &&
    currentTutorial.profil_baslangic_y !== null &&
    currentTutorial.profil_bitis_x !== null &&
    currentTutorial.profil_bitis_y !== null
  ) {
    var polyLineStart = utm.convertUtmToLatLng(
      currentTutorial.profil_baslangic_x,
      currentTutorial.profil_baslangic_y,
      currentTutorial.zone,
      "N"
    );
    var polyLineEnd = utm.convertUtmToLatLng(
      currentTutorial.profil_bitis_x,
      currentTutorial.profil_bitis_y,
      currentTutorial.zone,
      "N"
    );

    /*
     * Find midpoint between two coordinates points
     * Source : http://www.movable-type.co.uk/scripts/latlong.html
     */

    //-- Define radius function
    if (typeof Number.prototype.toRad === "undefined") {
      Number.prototype.toRad = function () {
        return (this * Math.PI) / 180;
      };
    }

    //-- Define degrees function
    if (typeof Number.prototype.toDeg === "undefined") {
      Number.prototype.toDeg = function () {
        return this * (180 / Math.PI);
      };
    }

    //-- Define middle point function

    //-- Longitude difference
    var dLng = (polyLineEnd.lng - polyLineStart.lng).toRad();

    //-- Convert to radians
    var lat1 = polyLineStart.lat.toRad();
    var lat2 = polyLineEnd.lat.toRad();
    var lng1 = polyLineStart.lng.toRad();

    var bX = Math.cos(lat2) * Math.cos(dLng);
    var bY = Math.cos(lat2) * Math.sin(dLng);
    var lat3 = Math.atan2(
      Math.sin(lat1) + Math.sin(lat2),
      Math.sqrt((Math.cos(lat1) + bX) * (Math.cos(lat1) + bX) + bY * bY)
    );
    var lng3 = lng1 + Math.atan2(bY, Math.cos(lat1) + bX);

    //-- Return result
    // return [lng3.toDeg(), lat3.toDeg()];

    center = [lat3.toDeg(), lng3.toDeg()];
    console.log(center);
    currentCenter = center;
    polyline = {
      latlngs: [
        [polyLineStart.lat, polyLineStart.lng],
        [polyLineEnd.lat, polyLineEnd.lng],
      ],
      color: "red",
    };
  }
  if (
    currentTutorial.a_1 !== null &&
    currentTutorial.a_2 !== null &&
    currentTutorial.a_3 !== null &&
    currentTutorial.a_4 !== null
  ) {
    var corners = [
      currentTutorial.a_1,
      currentTutorial.a_2,
      currentTutorial.a_3,
      currentTutorial.a_4,
    ]; //typeof string
    var coordinates = [];
    var zone = currentTutorial.zone;
    //need to convert string to number then convert utm to latlng
    for (let i = 0; i < corners.length; i++) {
      var corner = corners[i];
      var cornerCoordinates = corner.split(",");
      var x = parseInt(cornerCoordinates[0]);
      var y = parseInt(cornerCoordinates[1]);

      var cornerPoint = utm.convertUtmToLatLng(x, y, zone, "N");
      coordinates.push([cornerPoint.lng, cornerPoint.lat]);
    }
    var close = utm.convertUtmToLatLng(
      parseInt(corners[0].split(",")[0]),
      parseInt(corners[0].split(",")[1]),
      zone,
      "N"
    );
    coordinates.push([close.lng, close.lat]);
    geoJson = {
      type: "FeatureCollection",
      features: [
        {
          type: "Feature",
          properties: {
            mytag: "datdat",
            name: "datdat",
            tessellate: true,
          },
          geometry: {
            type: "Polygon",
            coordinates: [coordinates],
          },
        },
      ],
    };
    centerOfMass = centerofmass(geoJson);
    center = [
      centerOfMass.geometry.coordinates[1],
      centerOfMass.geometry.coordinates[0],
    ];
    currentCenter = center;
    markerLatlong = center;
  }
  return {
    center: center,
    currentCenter: currentCenter,
    markerLatlong: markerLatlong,
    polyline: polyline,
    id: id,
    text: text,
    yontem: yontem,
    altyontem: altyontem,
    geoJson: geoJson,
    centerOfMass: centerOfMass,
  };
}
export { ProfilePlotter };
