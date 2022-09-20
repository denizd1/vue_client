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

  return {
    polyline: polyline,
    geoJson: geoJson,
  };
}
export { ProfilePlotter };
