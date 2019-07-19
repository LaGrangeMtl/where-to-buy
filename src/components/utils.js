export function getDistance(lat1, lon1, lat2, lon2) {
	var φ1 = toRad(lat1), φ2 = toRad(lat2), Δλ = toRad(lon2-lon1), R = 6371000; // gives d in metres
	return Math.acos( Math.sin(φ1)*Math.sin(φ2) + Math.cos(φ1)*Math.cos(φ2) * Math.cos(Δλ) ) * R / 1000;
}

export function toRad(degrees) {
	return degrees * Math.PI / 180;
}