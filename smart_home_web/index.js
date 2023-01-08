const fs = require("fs");
const http = require("http");
const url = require("url");
const qs = require("querystring");

const devices = require("./devices.json");

const host = "192.168.1.66";
const port = "8091";

const get_device_by_name = (name) => {
	for (var i = 0; i < devices.length; i++) {
		if (devices[i].name == name) return devices[i];
	}
	return -1;
}


const not_found = async (res, json = false) => {

	if (json) {
		res.setHeader('Content-Type', 'application/json');
		res.end( JSON.stringify({ "error": "404" }) );
	} else {
		res.writeHead(404);
		res.end("not found");
	}

	console.log("not found");
};


const process = async (req, res, data) => {

	var dev = get_device_by_name(data.to);
	if (dev < 0) return await not_found(res, true);

	try {
		const response = await fetch('http://' + dev.ip + ':' + dev.port, {
		    method: 'POST',
		    headers: {
		        'Accept': 'application/json',
		        'Content-Type': 'application/json'
		    },
		    body: JSON.stringify( JSON.parse(data.data) )
		});
		
		const body = await response.text();
		res.setHeader('Content-Type', 'application/json');
		res.end( JSON.stringify(body) );
		
	} catch (e) {
		console.log(e);
		res.setHeader('Content-Type', 'application/json');
		res.end( JSON.stringify( {"error": e} ) );
	}

}


const get_listener = async (req, res, query) => {

	query.href = query.href == "/" ? "index.html" : query.href;
	fs.readFile(__dirname + "/www/" + query.href, async (err, fd) => {

		if (err) await not_found(res);

		res.writeHead(200);
		res.end(fd);
	});
};


const post_listener = async (req, res, query) => {

	var body = '';
	req.on('data', async function (data) {
		body += data;
		// 1e6 === 1 * Math.pow(10, 6) === 1 * 1000000 ~~~ 1MB
		if (body.length > 1e6) {
			// FLOOD ATTACK OR FAULTY CLIENT, NUKE REQUEST
			req.connection.destroy();
		}
	});

	req.on('end', async function () {
		var POST = qs.parse(body);
		var obj = JSON.parse(body);
		await process(req, res, obj);
	});
};


const requestListener = async (req, res) => {
	let starts = performance.now();
	
	const query = url.parse(req.url, true);
	let x = await (req.method == "GET"
					? get_listener(req, res, query)
					: post_listener(req, res, query) );
	
	let ends = performance.now();
	console.log(`${req.socket.remoteAddress} -> ${req.method} '${req.url}' | time ${ends-starts}`);	
	return x;
};



(main = async () => {
	try {
		const server = http.createServer(requestListener);
		server.listen(port, host, () => {
			console.log(`Server is running on http://${host}:${port}`);
		});
	} catch (e) {
		console.log("error occured\n", e);
		setTimeout(() => main(), 1000);
	}
})();






