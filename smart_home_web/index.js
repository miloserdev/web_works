const fs = require("fs");
const http = require("http");
const https = require("https");
const url = require("url");
const qs = require("querystring");

const WebSocket = require("ws");
var websocket = null;

const c = require("./colors.js");

const {
	M_Event,
	Room,
	Device,
	unixtime
} = require("./consts.js");

const TinyDB = require("tinydb");
var db_events;
var db_automations;
var db_scenes;
var db_rooms;
var db_devices;

//const devices = require("./devices.json");

const host = "192.168.1.69";
const port = "8092";


const set_scene = async (room_id, scene) => {

	if (!room_id || !scene) {
		return {
			"error": "no room_id or scene parameter"
		};
	}

	let sce = db_rooms._data["data"].find((el) => el.id == room_id);

	if (!sce) return {
		"error": "not found"
	};

	sce.scene = scene;
	db_rooms.flush();

	return {
		"response": "OK"
	};

}


const get_automations = async () => db_automations._data["data"];

const get_automation_by_id = async (item_id) =>
	item_id ?
	db_automations.find({
		id: item_id
	}, async (err, item) =>
		!err ? item[0] : {
			"error": err
		}) : {
		"error": "no item_id parameter"
	};

const set_automation = async (item_id, item_name, for_device, trigger, command) => {
	let resp;

	if (!item_id || !item_name || !for_device || !trigger || !command) {
		return {
			"error": "no item_name || item_id || for_ || trigger_ || command_ parameter"
		};
	}
	let item = db_automations._data["data"].find((el) => el.id == item_id);
	if (!item) {
		db_automations.appendItem({
			id: item_id,
			name: item_name,
			for: for_device,
			trigger: trigger,
			command: command
		});
		resp = {
			"response": "OK",
			"misc": "not_exist_set"
		};
	} else {
		item.name = item_name || item.name;
		item.for = for_device || item.for;
		item.trigger = trigger || item.trigger;
		item.command = command || item.command;
		resp = {
			"response": "OK",
			"misc": "exist_set"
		};
	}
	db_automations.flush();

	return resp;
}

const get_scenes = async () =>
	db_scenes._data["data"] || {
		"error": "no scenes found"
	};

const get_rooms = async () =>
	db_rooms._data["data"] || {
		"error": "no rooms found"
	};

const get_room_by_id = async (room_id) =>
	room_id ?
	db_rooms.find({
		id: room_id
	}, async (err, item) =>
		!err ? item[0] : {
			"error": err
		}) : {
		"error": "no room_id parameter"
	};

const get_devices = async () => db_devices._data["data"];


const get_device_by_name2 = (name) => {
	for (var i = 0; i < devices.length; i++) {
		if (devices[i].name == name) return devices[i];
	}
	return -1;
}

const get_device_by_name = async (name) =>
	db_devices.find({
		name: name
	}, async (err, item) =>
		!err ? item[0] : {
			"error": err
		});


const not_found = async (res, json = false) => {

	if (json) {
		res.setHeader('Content-Type', 'application/json');
		res.end(JSON.stringify({
			"error": "404"
		}));
	} else {
		res.writeHead(404);
		res.end("not found");
	}

	console.log("not found");
};


const exec_event = (data) => {
	///console.log("==========");
	///console.log(data);
	///console.log("==========");

	get_automations().then(autos => {
		let a = autos.filter(el => el.trigger == data.from);
		a.forEach(a => console.log("eventing", a.command));
	});
}


const process = async (req, res, data) => {
	let resp;

	try {

		let ev = new M_Event(null, null, "root", data.data, null, null, unixtime());

		if (!data.device || data.device == "root") {
			ev.device = "root";

			console.log(data);

			//let data_ = !data.data ? data : data.data;

			switch (data.command) {
				case "set_automation": {
					return await
					set_automation(data.args.id,
						data.args.name,
						data.args.for,
						data.args.trigger,
						data.args.command);
					break;
				}
				case "set_scene": {
					return await
					set_scene(data.args.room_id,
						data.args.scene);
					break;
				}
				case "get_room": {
					return await get_room_by_id(data.args.room_id);
					break;
				}
				case "get_automation": {
					return await get_automation_by_id(data.get_automation);
					break;
				}
			}

			/*

			if (data.set_automation) {
				return await set_automation(data.set_automation.id,
				data.set_automation.name, data.set_automation.for,
				data.set_automation.trigger, data.set_automation.command);
				
			} else if (data.set_scene) {
				return await set_scene(data.set_scene.room_id,
				data.data.set_scene.scene);
				
			} else if (data.get_rooms) {
				return await get_rooms();

			} else if (data.get_room) {
				return await get_room_by_id(data.get_room);
				
			} else if (data.get_automation) {
				return await get_automation_by_id(data.get_automation);
			}
			*/

		} else {

			ev.device = data.device;
			var dev = await get_device_by_name(data.device);
			if (dev < 0) return await not_found(res, true);

			//exec_event(ev);
			console.log(data);
			console.log(dev);

			try {

				ev = new M_Event(null, "root", data.device, null, null, null, unixtime());
				let data_ = !data.data ? data : data.data;
				let command = data.command;
				let pin = data.args.pin || 0;

				let cmccc = JSON.stringify(command ?
						dev.buttons.find(el => el.id == pin)
						[command] : JSON.parse(data_));

				const response = await fetch('http://' +
					dev.ip + ':' + dev.port, {
						method: 'POST',
						headers: {
							'Accept': 'application/json',
							'Content-Type': 'application/json'
						},
						body: cmccc
					});

				const body = await response.text();
				var json_ret = JSON.parse(body);
				json_ret["from"] = data["device"];
				
				console.log("resp body", body);

				ev.data = body;
				//console.log("asd", body);

				ev.status = response.status;
				ev.text = response.statusText;

				exec_event(ev);
				
				broadcast( json_ret );

				return body;

			} catch (e) {
				//console.log(e);
				return "unknown";
				//res.end( JSON.stringify( {"error": e} ) );
			}

		}

		ev.time = unixtime();
		db_events.appendItem(ev);
		db_events.flush();

	} catch (e) {
		console.log(c.col_err("at parser "), e);
	}

	return "i don't know"

}


const get_listener = async (req, res, query) => {

	switch (query.href) {
		case "/devices": {
			res.writeHead(200);
			res.end(JSON.stringify(await get_devices()));
			break;
		}
		case "/get_automations": {
			res.writeHead(200);
			res.end(JSON.stringify(await get_automations()));
			break;
		}
		case "/get_scenes": {
			res.writeHead(200);
			res.end(JSON.stringify(await get_scenes()));
			break;
		}
		case "/get_rooms": {
			res.writeHead(200);
			res.end(JSON.stringify(await get_rooms()));
			break;
		}
		case "/get_devices": {
			res.writeHead(200);
			res.end(JSON.stringify(await get_devices()));
			break;
		}
		default: {
			query.href = query.href == "/" ? "index.html" : query.href;
			fs.readFile(__dirname + (req.domain == "v2" ? "/www2/" : "/www/") + query.href, async (err, fd) => {

				if (err) await not_found(res);

				res.writeHead(200);
				res.end(fd);
			});
			break;
		}
	}

	/*
		if (query.href == "/devices") {
			res.writeHead(200);
			res.end(JSON.stringify(await get_devices()));
		}
		else if (query.href == "/get_automations") {
			res.writeHead(200);
			res.end(JSON.stringify(await get_automations()));
		} else if (query.href == "/get_scenes") {
			res.writeHead(200);
			res.end(JSON.stringify(await get_scenes()));
		} else if (query.href == "/get_rooms") {
			res.writeHead(200);
			res.end(JSON.stringify(await get_rooms()));
		} else if (query.href == "/get_devices") {
			res.writeHead(200);
			res.end(JSON.stringify(await get_devices()));
		}
	*/

};


const post_listener = async (req, res, query) => {

	try {
		var body = '';
		req.on('data', async function(data) {
			try {
				body += data;
				// 1e6 === 1 * Math.pow(10, 6) === 1 * 1000000 ~~~ 1MB
				if (body.length > 1e6) {
					// FLOOD ATTACK OR FAULTY CLIENT, NUKE REQUEST
					req.connection.destroy();
				}
			} catch (e) {
				console.log(c.col_err("at req.on(data) "), e)
			}
		});

		req.on('end', async function() {
			try {
				var POST = qs.parse(body);
				var obj = JSON.parse(body);

				res.setHeader('Content-Type', 'application/json');
				res.end(JSON.stringify(await process(req, res, obj)));
			} catch (e) {
				console.log(c.col_err("at req.on(end) "), e);
			}
		});
	} catch (e) {
		console.log(c.col_err("at post listener "), e);
	}
};


const requestListener = async (req, res) => {

	req.domain = "";

	let domain = req.headers.host.split(".");
	domain.pop();
	domain = domain.join('.');

	console.log({
		domain: domain
	});

	req.domain = domain;

	let starts = performance.now();

	const query = url.parse(req.url, true);
	let x = await (req.method == "GET" ?
		get_listener(req, res, query) :
		post_listener(req, res, query));

	let ends = performance.now();
	console.log(`${req.socket.remoteAddress}:${req.socket.remotePort} -> ${req.method} '${req.url}' | time ${ends-starts}`);
	return x;
};

const ws_handler = async (client) => {
	
	console.log(`${client.host} connected`);
	
	client.on("message", async (message) => {
		console.log(`${client.host} -> ${message}`);
	});
	
	client.on("disconnect", async () => {
		console.log(`${client.host} disconnected`);
	});
	
	client.on("close", async (client) => {
		console.log(`${client.host} unhandled close`);
	});
}



function normaltime(time) {
	let now = new Date(Date.now());
	let h = now.getHours()
	let m = now.getMinutes();
	let s = now.getSeconds();
	return `${h >= 10 ? h : "0" + h }:${m >= 10 ? m : "0" + m}:${s >= 10 ? s : "0" + s}`
	return now;
}


const broadcast = (data) => {
	websocket.clients.forEach( async (client) => {
		client.send(JSON.stringify(data));
	});
			
}


(main = async () => {
	try {

		db_events = new TinyDB("./data/events.json");
		db_events.onReady = () => {
			console.log("db_events is ready");
			db_events.appendItem(new M_Event("status", "root", "run", 0, unixtime()));
			db_events.flush();
		}

		// const asd = require("./data.json");

		db_automations = new TinyDB("./data/automations.json");
		db_automations.onReady = () => {
			console.log("db_automations is ready");
			console.log(
				set_automation("second", "Activity Simulation", "root", null, "LOG 1"),
				set_automation("boiler_on", "Boiler turn on", "root", "time=20:10", {
					to: "esp01_relay",
					data: "[{\"relay\":0}]"
				}),
				set_automation("boiler_off", "Boiler turn off", "root", "time=6:10", {
					to: "esp01_relay",
					data: "[{\"relay\":1}]"
				}),
			)

			db_automations._data["data"].forEach(el => el.executed = false);
			db_automations.flush();
		}

		db_scenes = new TinyDB("./data/scenes.json");
		db_scenes.onReady = () => {
			console.log("db_scenes is ready");
		}

		db_rooms = new TinyDB("./data/rooms.json");
		db_rooms.onReady = () => {
			console.log("db_rooms is ready");
		}

		db_devices = new TinyDB("./data/devices.json");
		db_devices.onReady = () => {
			console.log("db_events is ready");
		}

		setInterval(async () => {
		
		/*
		   websocket.clients.forEach( async (client) => {
		       const data = JSON.stringify(
						{'type': 'time',
		       			'time': new Date().toTimeString()
		       			});
		       client.send(data);
		   });
		*/
			//check for updates;

			let autos = db_automations._data["data"].forEach(async (el) => {

				if (el?.trigger?.startsWith("time")) {
					let now = normaltime();
					let time = el.trigger.split("time=")[1];

					//console.log(time, normaltime());

					if (el.executed) return;

					if (now.startsWith(time) || el.exec_after_timeout) {
						el.executed = true;
						db_automations.flush();

						setTimeout(async () => {
							el.executed = false;
							db_automations.flush();
						}, ((60 * 60) * 1000) * 12 /* 12h */ );

						let devs = await get_device_by_name(el.for);

						if (!devs.error) {

							process(null, null, {
								to: el.for,
								data: JSON.stringify(devs.buttons[0][el.command])
							});
						}

					}
				}
			});

		}, 1000);

		//setTimeout(() => change_scene("room_2", "asd"), 1000);

		var options = {
			key: fs.readFileSync('./keys/cert.csr'),
			cert: fs.readFileSync('./keys/privkey.pem')
		};

		const server = http.createServer(options, requestListener);
		server.listen(port, host, () => {
			console.log(`Server is running on http://${host}:${port}`);
		});
		websocket = new WebSocket.Server({ port: 8093});
		websocket.on("connection", ws_handler);
	} catch (e) {
		console.log(c.col_err("error occured\n"), e);
		setTimeout(() => main(), 1000);
	}
})();