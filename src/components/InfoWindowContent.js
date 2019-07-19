import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { raw } from '../utils/TextUtils';

class InfoWindowContent extends Component {
	static propTypes = {
		id: PropTypes.number,
		name: PropTypes.string,
		logo: PropTypes.string,
		address: PropTypes.string,
		country: PropTypes.string,
		location: PropTypes.shape({
			lat: PropTypes.number,
			lng: PropTypes.number,
		}),
		contact: PropTypes.shape({
			spokeperson: PropTypes.arrayOf(PropTypes.string),
			phone: PropTypes.arrayOf(PropTypes.string),
			fax: PropTypes.arrayOf(PropTypes.string),
			email: PropTypes.arrayOf(PropTypes.string),
			website: PropTypes.string,
		}),
		social: PropTypes.shape({
			facebook: PropTypes.string,
			twitter: PropTypes.string,
			googleplus: PropTypes.string,
			youtube: PropTypes.string,
			linkedin: PropTypes.string,
		})
	}

	render() {
		const socials = Object.keys(this.props.social).map((name, i) => {
			name = name === 'googleplus' ? 'google-plus' : name;
			const href = this.props.social[name];
			return <a href={href} key={name} className="wn-social-icon" target="_blank" rel="noopener noreferrer"><i className={`fa fa-${name}`}></i></a>
		});

		return (
			<div className="wn-iw-container" data-id={this.props.id}>
				<div className="wn-iw-header">
					<div className="wn-iw-logo"><img src={this.props.logo} alt={this.props.name} /></div>
					<div className={`wn-iw-title ${this.props.name.length > 20 && 'smaller'}`}>{this.props.name}</div>
				</div>
				<div className="wn-iw-content">
					<div className="wn-row">
						<div className="wn-col-left">
							<div className="wn-section-title">Address</div>
							<div {...raw(this.props.address)} />
						</div>
						<div className="wn-col-right">
							<div className="wn-section-title">Contact</div>
							<div className="phone" {...raw(this.props.contact.phone.map(x => 'T: ' + x).join('<br/>'))}></div>
							<div className="fax" {...raw(this.props.contact.fax.map(x => 'F: ' + x).join('<br/>'))}></div>
							{this.props.contact.email.map(email => <a key={email} href={`mailto:${email}`}>{email}</a>)}
						</div>
					</div>
					<div className="wn-row">
						<div className="wn-col-left">
							<a target="_blank" rel="noopener noreferrer" href={this.props.contact.website}>{this.props.contact.website}</a>
						</div>
						<div className="wn-col-right">
							{socials}
						</div>
					</div>
				</div>
			</div>
		);
	}
}
export default InfoWindowContent;