/**
 * Google Encoded Polyline Decoder
 * Mengonversi string polyline terkompresi dari backend menjadi array koordinat { lat, lng }
 */
export function decodePolyline(
  encoded: string,
  precision: number = 5
): { lat: number; lng: number }[] {
  if (!encoded) return [];

  let index = 0;
  let lat = 0;
  let lng = 0;
  const coordinates: { lat: number; lng: number }[] = [];
  const factor = Math.pow(10, precision);

  while (index < encoded.length) {
    let byte: number | null = null;
    let shift = 0;
    let result = 0;

    do {
      byte = encoded.charCodeAt(index++) - 63;
      result |= (byte & 0x1f) << shift;
      shift += 5;
    } while (byte >= 0x20);

    const latitudeChange = result & 1 ? ~(result >> 1) : result >> 1;
    shift = 0;
    result = 0;

    do {
      byte = encoded.charCodeAt(index++) - 63;
      result |= (byte & 0x1f) << shift;
      shift += 5;
    } while (byte >= 0x20);

    const longitudeChange = result & 1 ? ~(result >> 1) : result >> 1;

    lat += latitudeChange;
    lng += longitudeChange;

    coordinates.push({
      lat: Number((lat / factor).toFixed(6)),
      lng: Number((lng / factor).toFixed(6)),
    });
  }

  return coordinates;
}
