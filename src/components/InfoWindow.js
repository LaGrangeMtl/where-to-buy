import React, { Component } from 'react';
import ReactDOM from 'react-dom';
import PropTypes from 'prop-types';
import { raw } from '../utils/TextUtils';

class InfoWindow extends Component {
	static propTypes = {
		map: PropTypes.object,
		place: PropTypes.object,
		overlay: PropTypes.func,
		onClose: PropTypes.func,
	}

	componentWillUnmount() {
		this.div.parentNode.removeChild(this.div);
	}

	onClickClose = () => {
		this.props.onClose();
	}

	onAdd = (overlayLayer) => {
		const content = (
			<div className="wn-infobox">
				<img src="http://www.google.com/intl/en_us/mapfiles/close.gif" onClick={this.onClickClose} align="right" style={{ position: 'relative', cursor: 'pointer', margin: '2px'}} alt="close" />
				<div {...raw(this.props.infoWindowTemplate)}></div>
			</div>
		);

		this.latLng = new this.props.google.maps.LatLng(this.props.place.location.lat, this.props.place.location.lng);

		overlayLayer.appendChild(this.div);

		ReactDOM.render(content, this.div);
	}

	draw = (projection) => {
		const point = projection.fromLatLngToDivPixel(this.latLng);

		Object.assign(this.div.style, {
			position: 'absolute',
			top: point.y + 'px',
			left: point.x + 'px',
			transform: 'translate(-50%, calc(-100% - 30px))',
		});
	}

	componentDidMount() {
		this.div = document.createElement('div');

		this.infowindow = new this.props.overlay({
			div: this.div,
			onAdd: this.onAdd,
			draw: this.draw,
		},this.props.map);
	}

	render() {
		return null;
	}
}

export default (InfoWindow);