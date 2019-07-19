import React, { Component } from 'react';
import PropTypes from 'prop-types';

class Filter extends Component {
	static propTypes = {
		id: PropTypes.string,
		label: PropTypes.string,
		checked: PropTypes.bool,
		onUpdateFilter: PropTypes.func,
	}

	onChange = () => {
		const checked = !this.props.checked;
		this.props.onUpdateFilter(this.props.id, checked);
	}

	render() {
		const id = `wtb-filter-${this.props.id}`;
		return (
			<div className="wtb-filter">
				<input className="small" id={id} type="checkbox" value="1" checked={this.props.checked} onChange={this.onChange} />
				<label htmlFor={id}>{this.props.label}</label>
			</div>
		);
	}
}

export default Filter;