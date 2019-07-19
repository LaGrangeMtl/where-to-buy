export function getJSON(url) {
	return new Promise((resolve, reject) => {
		const request = new XMLHttpRequest();
		request.open('GET', url, true);
		request.onload = function() {
			if (this.status >= 200 && this.status < 400) {
				resolve(JSON.parse(request.responseText));
			} else {
				reject();
			}
		};
		request.onerror = reject;
		request.send();
	});
}