import * as utmObj from "utm-latlng";

function ProfilePlotter(currentTutorial) {
  let utm = null;
  let polyline = null;
  let geoJson = null;

  if (currentTutorial.datum === "WGS_84") {
    utm = new utmObj("WGS 84");
  }
  if (currentTutorial.datum === "ED_50") {
    utm = new utmObj("ED50");
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
  }

  return {
    polyline: polyline,
    geoJson: geoJson,
  };
}
export { ProfilePlotter };
