import React, { Component } from 'react';
import PropTypes from 'prop-types';

import GoogleApiWrapper from './GoogleApiWrapper';
import Marker from './Marker';
import InfoWindow from './InfoWindow';
import mapStyles from '../style/mapStyles';
import { MakeGoogleOverlayClass } from './GoogleOverlay'
import SidePanel from './SidePanel';
import Filter from './Filter';
import { getDistance } from './utils';
import { getJSON } from '../utils/getJSON';

function mapRecenter(latlng, offsetx, offsety, map, google) {
	const point1 = map.getProjection().fromLatLngToPoint(
		(latlng instanceof google.maps.LatLng) ? latlng : map.getCenter()
	);
	const point2 = new google.maps.Point(
		( (typeof(offsetx) === 'number' ? offsetx : 0) / Math.pow(2, map.getZoom()) ) || 0,
		( (typeof(offsety) === 'number' ? offsety : 0) / Math.pow(2, map.getZoom()) ) || 0
	);
	map.panTo(map.getProjection().fromPointToLatLng(new google.maps.Point(
		point1.x - point2.x,
		point1.y + point2.y
	)));
}

function defaultParseData(data) {
	return data;
}

class WhereToBuy extends Component {
	static defaultProps = {
		parseData: defaultParseData,
		mapOptions: {},
	}

	static propTypes = {
		placesUrl: PropTypes.string,
		filters: PropTypes.arrayOf(PropTypes.object),
		defaultFilters: PropTypes.arrayOf(PropTypes.func),
		parseData: PropTypes.func,
		afterFiltered: PropTypes.func,
		onUpdateFilter: PropTypes.func,
		mapOptions: PropTypes.object,
		tx: PropTypes.object,
	}

	constructor(props) {
		super(props);

		this.state = {
			places: [],
			countries: [],
			loadingData: false,
			selectedPlace: null,
			overlay: null,
			activeFilters: props.filters.map((filter) => filter.id),
			geoloc: {},
			country: null,
			isFetchingGeoloc: false,
		};
	}

	setupMap = () => {
		const { google, mapOptions } = this.props;
		const map = new google.maps.Map(this.mapCtn, {
			center: new google.maps.LatLng(39.936007, -39.461924),
			zoom: 3,
			styles: mapStyles,
			backgroundColor: '#fff',
			streetViewControl: false,
			fullscreenControl: false,
			mapTypeControl: false,
			...mapOptions,
		});

		const GoogleOverlay = MakeGoogleOverlayClass(google);

		this.setState({
			map,
			overlay: GoogleOverlay,
		});
	}

	componentDidMount() {
		if (!this.state.loadingData) {
			this.setState({
				loadingData: true,
			}, () => {
				getJSON(this.props.placesUrl).then(data => {
					this.setState({
						places: this.props.parseData(data, this.props.google),
					}, this.setupMap);
				});

				getJSON(this.props.countriesUrl).then(data => {
					this.setState({
						countries: data,
					}, this.setupMap);
				});
			});
		}

		this.props.onMounted(this);
	}
	
	onMarkerClick = (place) => {
		if (place) {
			this.setState({
				selectedPlace: place,
			});

			const offset = -this.wtbCtn.getBoundingClientRect().height / 3;
			mapRecenter(place.location, 0, offset, this.state.map, this.props.google);
		}
	}

	closeInfoWindow = () => {
		this.setState({
			selectedPlace: null,
		});
	}

	getCenter = () => {
		if (this.state.places.length === 0) return null;

		const def = this.state.places[0];

		return {
			lat: def.location.lat,
			lng: def.location.lng,
		};
	}

	applyFilters = (array, filters) => {
		return array.filter(place => {
			return filters.reduce((c, fn) => {
				return c || fn(place, this.state.geoloc);
			}, false);
		});
	}

	filterPlaces = (places) => {
		const filtered = this.applyFilters(places, this.props.defaultFilters);
		if (this.state.activeFilters.length === 0) {
			return this.props.filters.length > 0 ? [] : filtered;
		}

		const filters = this.state.activeFilters.map((filterId) => {
			return this.props.filters.find(filter => filter.id === filterId).func;
		});

		return this.applyFilters(filtered, filters);
	}

	sortPlaces = (places, filters) => {
		if (!this.props.sort) return places;
		return this.props.sort(places, this.state.geoloc, filters);
	}

	getMarkers = (places) => {
		return places.map(place => (
			<Marker
				key={`marker-${place.id}`}
				map={this.state.map}
				google={this.props.google}
				place={place}
				onClick={this.onMarkerClick}
			/>
		));
	}

	getLocation = () => {
		if(navigator.geolocation){
			this.setState({
				isFetchingGeoloc: true,
			});
			navigator.geolocation.getCurrentPosition(this.onGeolocation);
		}
	}

	onGeolocation = (position) => {
		this.setState({
			isFetchingGeoloc: false,
		});

		var coords = position && position.coords;
		if(!coords) return;
	
		// console.log(coords);
		const geocoder = new this.props.google.maps.Geocoder();
		const latlng = new this.props.google.maps.LatLng(coords.latitude, coords.longitude);
		geocoder.geocode({ location: latlng }, (results, status) => {
			this.onGeoloc(results[0]);
		});
		return;
	}

	onGeoloc = (geoloc) => {
		if (geoloc.geometry) {
			this.state.map.panTo(geoloc.geometry.location);
			this.sidePanel.changeValue(geoloc.formatted_address, true);
		}

		this.setState(prevState => {
			let country = null;
			if (geoloc.address_components) {
				country = geoloc.address_components.find(comp => comp.types.find(t => t === 'country')).short_name;
			}

			return {
				geoloc,
				country,
			}
		});
	}

	getInfoWindow = () => {
		if (!this.state.overlay) return null;
		const place = this.state.selectedPlace;
		return place && (
			<InfoWindow
				key={`infowindow-${place.id}`}
				map={this.state.map}
				google={this.props.google}
				place={place}
				overlay={this.state.overlay}
				onClose={this.closeInfoWindow}
				infoWindowTemplate={this.props.infoWindowTemplate(place)}
			/>
		);
	}

	calculateDistance = (places) => {
		// return places;
		if (!this.state.geoloc || !this.state.geoloc.geometry) {
			return places;
		}
		const { lat, lng } = this.state.geoloc.geometry.location;
		return places.map(place => {
			return {
				...place,
				distance: getDistance(place.location.lat, place.location.lng, lat(), lng()),
			};
		});
	}

	getFilters = () => {
		return this.props.filters && 
				this.props.filters.map(filter => {
					const checked = Boolean(this.state.activeFilters.find(x => x === filter.id));
					return <Filter key={filter.id} checked={checked} onUpdateFilter={this.onUpdateFilter} {...filter} />
				});
	}

	onUpdateFilter = (id, active) => {
		this.setState((state) => {
			let activeFilters = state.activeFilters;

			if (active) {
				activeFilters = Array.from(new Set([...activeFilters, id]));
			} else {
				activeFilters = activeFilters.filter(filter => {
					return filter !== id;
				});
			}

			this.props.onUpdateFilter(activeFilters);

			return {
				activeFilters,
			}
		});
	}

	setFilters = (filters, isExclusive = true) => {
		this.setState(prevState => ({
				activeFilters: isExclusive ? filters : [...new Set([...prevState.activeFilters, ...filters])],
			})
		);
	}

	setLocation = (value) => {
		const geocoder = new this.props.google.maps.Geocoder();
		geocoder.geocode({ address: value }, (result) => {
			this.onGeoloc(result[0]);
		});
	}

	mapRef = x => this.mapCtn = x;

	render() {
		let filteredPlaces = this.filterPlaces(this.state.places);
		if (this.props.afterFiltered) filteredPlaces = this.props.afterFiltered(filteredPlaces, this.state.places);

		let distancePlaces = this.calculateDistance(filteredPlaces);

		let sortedPlaces = this.sortPlaces(distancePlaces, this.state.activeFilters);
		const sidebarActive = Boolean(this.state.country) && filteredPlaces.length > 0;

		return (
			<div className="wtb-where-to-buy" ref={x => this.wtbCtn = x}>
				<SidePanel
					fetching={this.state.isFetchingGeoloc}
					ref={x => this.sidePanel = x}
					isActive={sidebarActive}
					onGeoloc={this.onGeoloc}
					google={this.props.google}
					tx={this.props.tx}
					places={sortedPlaces}
					onClickGeoloc={this.getLocation}
					infoWindowTemplate={this.props.infoWindowTemplate}
				>
				</SidePanel>
				<div className="wtb-filters">
					<div className="button">

					</div>
					<div className="ctn">
						{this.getFilters()}
					</div>
				</div>
				<div className={`wtb-map-ctn ${sidebarActive && 'active'}`}>
					<div className="wtb-map" ref={this.mapRef}></div>
				</div>
				{this.getInfoWindow()}
				{this.getMarkers(filteredPlaces)}
			</div>
		);
	}
}



export default GoogleApiWrapper(
	(props) => ({
		apiKey: props.apiKey,
		language: props.lang || 'en',
		tx: props.tx,
		onMounted: props.onMounted,
	}
))(WhereToBuy);