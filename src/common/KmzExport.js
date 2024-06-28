import JSZip from "jszip";

function convertToKML(geoJson) {
  let kml = `<?xml version="1.0" encoding="UTF-8"?>
  <kml xmlns="http://www.opengis.net/kml/2.2">
  <Document>
  <name>ProjectHub KMZ Results</name>
  `;

  // Process GeoJSON features
  geoJson.features.forEach((feature) => {
    const name = feature.properties.nokta_adi
      ? feature.properties.nokta_adi
      : "";
    const projectCode = feature.properties.proje_kodu
      ? feature.properties.proje_kodu
      : "";
    const yontem = feature.properties.yontem ? feature.properties.yontem : "";
    const altYontem = feature.properties.alt_yontem
      ? feature.properties.alt_yontem
      : "";
    const calismaAmaci = feature.properties.calisma_amaci
      ? feature.properties.calisma_amaci
      : "";
    const calismaTarihi = feature.properties.calisma_tarihi
      ? feature.properties.calisma_tarihi
      : "";

    // Construct the description content
    const description = `
        <table border="1">
          <tr>
            <td><b>Nokta adı:</b></td>
            <td>${name}</td>
          </tr>
          <tr>
            <td><b>Yöntem:</b></td>
            <td>${yontem}</td>
          </tr>
          <tr>
            <td><b>Alt Yöntem:</b></td>
            <td>${altYontem}</td>
          </tr>
          <tr>
            <td><b>Çalışma Amacı:</b></td>
            <td>${calismaAmaci}</td>
          </tr>
          <tr>
            <td><b>Proje Kodu:</b></td>
            <td>${projectCode}</td>
          </tr>
          <tr>
            <td><b>Çalışma Tarihi:</b></td>
            <td>${calismaTarihi}</td>
          </tr>
        </table>
      `;

    if (feature.geometry.type === "Point") {
      const coordinates = feature.geometry.coordinates;

      kml += `<Placemark><name>${name} - ${projectCode}</name>
          <description><![CDATA[${description}]]></description> <!-- Popup description -->           
          <Point><coordinates>${coordinates[0]},${coordinates[1]},0</coordinates></Point></Placemark>`;
    } else if (feature.geometry.type === "LineString") {
      const coordinates = extractCoordinates(feature.geometry.coordinates);
      // Define a style for LineStrings (change the color and width as needed)
      kml += `
          <Style id="lineStyle">
              <LineStyle>
                  <color>ff0000ff</color> <!-- Red color (AABBGGRR format) -->
                  <width>5</width> <!-- Increase line width for bold appearance -->
              </LineStyle>
          </Style>
          <Placemark>
            <description><![CDATA[${description}]]></description> <!-- Popup description --> 
            <name>${name} - ${projectCode}</name> <!-- Include project code in the LineString name -->
              <styleUrl>#lineStyle</styleUrl>
              <LineString>
                  <coordinates>${coordinates}</coordinates>
              </LineString>
          </Placemark>
      `;
    } else if (feature.geometry.type === "Polygon") {
      const coordinates = extractCoordinates(feature.geometry.coordinates[0]);
      kml += `<Placemark><description><![CDATA[${description}]]></description> <!-- Popup description --> <Polygon><outerBoundaryIs><LinearRing><coordinates>${coordinates}</coordinates></LinearRing></outerBoundaryIs></Polygon></Placemark>`;
    }
  });

  kml += `</Document></kml>`;

  return kml;
}
function convertAndDownload(resPoints) {
  const zip = new JSZip();

  // Assuming 'geoJsonResponse' contains your GeoJSON object
  const geoJsonResponse = resPoints; // Replace this with your actual GeoJSON response

  // Convert GeoJSON to KML
  const kmlData = convertToKML(geoJsonResponse);

  // Add the KML content to the ZIP archive
  zip.file("data.kml", kmlData);

  // Generate the KMZ file
  return zip.generateAsync({ type: "blob" }).then((blob) => {
    // Trigger download
    const link = document.createElement("a");
    link.href = URL.createObjectURL(blob);
    link.download = "sonuclar" + new Date().toLocaleDateString() + ".kmz"; // Set the filename for the downloaded file
    link.click();
  });
}
function extractCoordinates(coordinates) {
  return coordinates.map((coord) => coord.reverse().join(",")).join(" ");
}
function addLinestoCollection(res) {
  res.resLines.forEach((lineObject) => {
    const lineCoordinates = lineObject.line;

    const lineStringFeature = {
      type: "Feature",
      geometry: {
        type: "LineString",
        coordinates: lineCoordinates,
      },
      properties: {
        nokta_adi: lineObject.nokta_adi,
        yontem: lineObject.yontem,
        alt_yontem: lineObject.alt_yontem,
        proje_kodu: lineObject.proje_kodu,
        calisma_amaci: lineObject.calisma_amaci,
        calisma_tarihi: lineObject.calisma_tarihi,
      },
    };

    res.resPoints.features.push(lineStringFeature);
  });
  convertAndDownload(res.resPoints);
}

export {
  convertToKML,
  convertAndDownload,
  extractCoordinates,
  addLinestoCollection,
};
