export function getJSON(url) {
	return new Promise((resolve, reject) => {
		if (!url) {
			console.error('No url specified');
			reject();
			return;
		}

		const request = new XMLHttpRequest();
		request.open('GET', url, true);
		request.onerror = function(e) {
			console.error(e);
		};
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