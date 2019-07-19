
export function nl2br(str, is_xhtml) {
	const breakTag = (is_xhtml || typeof is_xhtml === 'undefined') ? '<br />' : '<br>';
	return (str + '').replace(/([^>\r\n]?)(\r\n|\n\r|\r|\n)/g, '$1' + breakTag + '$2');
}

export function raw(key) {
	return {
		dangerouslySetInnerHTML: {
			__html: key,
		},
	};
}

const numberSplit = (x) => {
	return x.toString().replace(/\B(?=(\d{3})+(?!\d))/g, '\xa0');
};

export function price(amt, l) {
	const n = amt ? numberSplit(amt) : '0';
	return l === 'fr' ? `${n}$` : `$${n}`;
}

export function trimNum(num) {
	if (num >= 1000000000) return `${(num / 1000000000).toFixed(1)}B`;
	if (num >= 1000000) return `${(num / 1000000).toFixed(1)}M`;
	if (num >= 1000) return `${(num / 1000).toFixed(1)}K`;
	return num;
}

export function elipsis(string, maxWords) {
	const words = string.split(' ');
	let result = words.reduce((carry, word) => {
		if (carry.count + word.length <= maxWords) {
			carry.words.push(word);
			carry.count += word.length;
		}
		return carry;
	}, { count: 0, words: [] }).words.join(' ');

	if (result.length < string.length) {
		result = `${result}...`;
	}

	return result;
}
