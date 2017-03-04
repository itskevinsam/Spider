const http = require('http');
const url = require('url');
const htmlparser = require('htmlparser');

const SUCESS_STATUS_CODES=[200];

function parseData(htmlText) {
	const dataParser = new Promise((resolve, reject)=>{
		const htmlParserHandler = new htmlparser.DefaultHandler((err, dom)=>{
			if (err) reject(new Error(err));
		});
		const parser = new htmlparser.Parser(htmlParserHandler);	
		parser.parseComplete(htmlText);
		resolve(htmlParserHandler.dom);			
	});
	return dataParser;

}

function inspectChildren(attribs) {
	if (attribs.type=='tag') {
		console.log(attribs);
	}	
}

function parseTreeNavigator(parseElements) {
	if (Array.isArray(parseElements)) {
		for(let each_ele of parseElements) {
			if (Array.isArray(each_ele)) parseTreeNavigator(each_ele);
			else {
				inspectChildren(each_ele);
				if (Object.keys(each_ele).indexOf('children') > -1) {
					parseTreeNavigator(each_ele.children);
				}
			}	
		}
	} else  {
		inspectChildren(parseElements);
		if (Object.keys(parseElements).indexOf('children') > -1) {
			parseTreeNavigator(parseElements.children);
		}
	}	
} 
function an(params) {
	console.log(params);
}

function fetchData(url_) {
	const dataFetcher = new Promise((resolve, reject)=>{
		http.request(url.parse(url_), (res)=>{
			let bufferedBody = [];
			if (SUCESS_STATUS_CODES.indexOf(res.statusCode) > -1) {
				res.setEncoding('utf8');
				res.on('data', (chunk)=>{
					bufferedBody.push(chunk);
				}).on('end', () => resolve(bufferedBody.join('')));
			} else {
				res.resume();
				reject(new Error('Invalid Response'));
			}
		}).on('error', (e) => console.log(e));
	});

	return dataFetcher;
}
fetchData('https://tc39.github.io/ecma262/').then((htmlText) => { 
	//console.log(htmlText);

	return parseData(htmlText);
}, (err) => {
	console.log(err);
}).then((...params) => {
	//let [[,,children]] = params;
	parseTreeNavigator(params);
}, (err)=> {
	console.log(err);
});
