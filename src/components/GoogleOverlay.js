export const MakeGoogleOverlayClass = (google) => {
	return class GoogleOverlay extends google.maps.OverlayView {
		constructor(opts = {}, map) {
			super();

			this.opts = opts;
			this.map = map;

			this.div = opts.div;
			this.setMap(map);
		}

		onAdd() {
			var panes = this.getPanes();
			if (this.opts.onAdd) this.opts.onAdd(panes.overlayMouseTarget);
		}
		
		draw() {
			var projection = this.getProjection();
			if (this.opts.draw) this.opts.draw(projection);
		}
	}
};
