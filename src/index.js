import React from 'react';
import ReactDOM from 'react-dom';
import WhereToBuy from './components/WhereToBuy';

const defaultOptions = {
	apiKey: '',
	lang: 'en',
	tx: {
		'my_location': 'My Location',
	},
	filters: [

	],
	onUpdateFilter: () => {},
};

export function makeWhereToBuy(options = defaultOptions, root = document.getElementById('root')) {
	return new Promise(
		(resolve) => {
			const ref = (comp) => {
				resolve(comp);
			};

			ReactDOM.render(<WhereToBuy onMounted={ref} {...options} />, root);
		}
	);
}

window.makeWhereToBuy = makeWhereToBuy;