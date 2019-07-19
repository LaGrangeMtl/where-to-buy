import { Component } from 'react';
import PropTypes from 'prop-types';

class Marker extends Component {
	static propTypes = {
		map: PropTypes.object,
		place: PropTypes.object,
		onClick: PropTypes.func,
	}

	componentWillUnmount() {
		this.marker.setMap(null);
		if (this.clickListener) this.clickListener.remove();
	}

	componentDidUpdate() {
		this.marker.setMap(this.props.map);
	}

	componentWillMount() {
		const opts = {
			position: this.props.place.location,
			map: this.props.map,
		};

		if (this.props.place.icon) {
			opts.icon = this.props.place.icon;
		}

		this.marker = new this.props.google.maps.Marker(opts);

		this.clickListener = this.marker.addListener('click', this.onClick);
	}

	onClick = () => {
		this.props.map.panTo(this.props.place.location);
		this.props.onClick(this.props.place);
	}

	render() {
		return null;
	}
}

export default Marker;