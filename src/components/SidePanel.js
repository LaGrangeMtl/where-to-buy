import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { raw } from '../utils/TextUtils';

var selectFirstOnEnter = function (input) {
	// store the original event binding function
	var _addEventListener = (input.addEventListener) ? input.addEventListener : input.attachEvent;

	// Simulate a 'down arrow' keypress on hitting 'return' when no pac suggestion is selected, and then trigger the original listener.
	function addEventListenerWrapper(type, listener) {
		if (type === "keydown") {
			var orig_listener = listener;
			listener = function (event) {
				var suggestion_selected = document.querySelectorAll(".pac-item-selected").length > 0;
				if (event.which === 13 && !suggestion_selected) {
					var simulated_downarrow = new KeyboardEvent("keydown", { keyCode: 40, which: 40 });
					orig_listener.apply(input, [simulated_downarrow]);
				}
				orig_listener.apply(input, [event]);
			};
		}
		// add the modified listener
		_addEventListener.apply(input, [type, listener]);
	}
	if (input.addEventListener) {
		input.addEventListener = addEventListenerWrapper;
	} else if (input.attachEvent) {
		input.attachEvent = addEventListenerWrapper;
	}
}

class SidePanel extends Component {
	state = {
		city: '',
		query: '',
		searchValue: '',
	};

	static propTypes = {
		onGeoloc: PropTypes.func,
		places: PropTypes.array,
		onClickGeoloc: PropTypes.func,
		infoWindowTemplate: PropTypes.func,
		isActive: PropTypes.bool,
		tx: PropTypes.object,
	}

	componentDidMount() {
		this.autocomplete = new this.props.google.maps.places.Autocomplete(this.searchInput);
		this.autocomplete.addListener('place_changed', this.onPlaceSelect);
		selectFirstOnEnter(this.searchInput);
	}

	onPlaceSelect = () => {
		let addressObject = this.autocomplete.getPlace();
		this.props.onGeoloc(addressObject);
		this.changeValue(addressObject.formatted_address || '');
	}

	getPlaces = () => {
		return this.props.places.map(place => <div key={place.id} {...raw(this.props.infoWindowTemplate(place))} />);
	}

	changeValue = (value, select = false) => {
		this.setState({
			searchValue: value
		});
	}

	onChange = (e) => {
		this.changeValue(e.currentTarget.value);
	}

	searchInputRef = x => this.searchInput = x;

	getGeolocButton = () => {
		if (this.props.fetching) return <div className="fetching blue-btn"></div>
		return <button type="button" className="location blue-btn" onClick={this.props.onClickGeoloc} ></button>;
	}

	render() {
		return (
			<div className="wtb-side-panel">
				<div className="wtb-search">
					<input
						ref={this.searchInputRef}
						className="wtb-search-field"
						type="text"
						placeholder={this.props.tx.my_location}
						autoComplete="off"
						value={this.state.searchValue}
						onChange={this.onChange}
					/>
					{this.getGeolocButton()}
				</div>
				<div className={`wtb-places-ctn ${this.props.isActive && 'active'}`}>
					{this.props.isActive && this.getPlaces()}
				</div>
				{this.props.children}
			</div>
		);
	}
}

export default SidePanel;