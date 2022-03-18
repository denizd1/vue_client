import {
    latLng
} from "leaflet";
import * as utmObj from "utm-latlng";




function ProfilePlotter(currentTutorial) {
    var utm = null;
    var center = null
    var currentCenter = null
    var markerLatlong = null
    var polyline = null
    var id = null
    var text = null
    var yontem=null
    var altyontem=null

    id = currentTutorial.id
    text = currentTutorial.nokta_adi
    yontem = currentTutorial.yontem
    altyontem = currentTutorial.alt_yontem


    if (currentTutorial.datum === "WGS_84") {
        utm = new utmObj("WGS 84");
    }
    if (currentTutorial.datum === "ED_50") {
        utm = new utmObj("ED50");
    }
    if (currentTutorial.x !== null && currentTutorial.y !== null) {
        var pointIcon = utm.convertUtmToLatLng(
            currentTutorial.x,
            currentTutorial.y,
            currentTutorial.zone,
            "N"
        );
        center = latLng(pointIcon.lat, pointIcon.lng)
        markerLatlong = latLng(pointIcon.lat, pointIcon.lng)
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

        center = latLng(
            (polyLineStart.lat + polyLineEnd.lat) / 2,
            (polyLineStart.lng + polyLineEnd.lng) / 2
        )
        currentCenter = center;
        polyline = {
            latlngs: [
                [polyLineStart.lat, polyLineStart.lng],
                [polyLineEnd.lat, polyLineEnd.lng],
            ],
            color: "red",
        };
    }
    return {
        center: center,
        currentCenter: currentCenter,
        markerLatlong: markerLatlong,
        polyline: polyline,
        id: id,
        text: text,
        yontem:yontem,
        altyontem:altyontem
    }
}
export {
    ProfilePlotter
};