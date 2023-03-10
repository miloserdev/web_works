(main = async () => {

	const fs = require("fs");
	const http = require("http");
	const https = require("https");
	const url = require("url");
	const qs = require("querystring");

	const WebSocket = require("ws");
	var websocket = null;

	const c = require("./colors.js");

	// MIGRATION TO LOWDB;
	const low = require('lowdb');
	const FileSync = require('lowdb/adapters/FileSync');
	const db = low(new FileSync('./data/db.json'));

	/*
	const db_auto = low(new FileSync('./data/db_auto.json'));
	const db_scen = low(new FileSync('./data/db_scenes.json'));
	const db_devs = low(new FileSync('./data/db_devices.json'));
	const db_room = low(new FileSync('./data/db_rooms.json'));

	const TinyDB = require("tinydb");
	var db_events;
	var db_automations;
	var db_scenes;
	var db_rooms;
	var db_devices;
	*/




	const host = "192.168.1.69";
	const port = "8092";



	// Trying a new version of JSON packets




	const get_devices = async () => db.get("devices").value();
	const get_device_by_name = async (name) =>
		db.get("devices").find({
			name: name
		}).value() || null;
	const get_device_by_name2 = (name) => {
		for (var i = 0; i < devices.length; i++) {
			if (devices[i].name == name) return devices[i];
		}
		return -1;
	}
	const set_device = () => {};



	const get_scenes = async () =>
		db.get("scenes").value() || {
			"error": "no scenes found"
		};
	const get_scene_by_id = async (scene_id) =>
		db.get("scenes").value().find({
			id: scene_id
		}, async (err, item) =>
			!err ? item[0] : {
				"error": err
			});
	const set_scene = async (room_id, scene_) => {

		if (!room_id || !scene_) {
			return {
				"error": "no room_id or scene args"
			};
		}

		let rm = db.get("rooms").find({
			id: room_id
		});


		//let rm = db_rooms._data["data"].find((el) => el.id == room_id);
		//let sce = db_scenes._data["data"].find((el) => el.id == scene);

		if (!rm) return {
			"error": "not found"
		};

		rm.assign({
			scene: scene_
		}).write();

		//rm.scene = scene_;
		//db_rooms.flush();

		return {
			command: "set_scene",
			room_id: room_id,
			scene: scene_
		};

	}



	const get_automations = async () =>
		db.get("automations").value() || {
			"error": "no automations found"
		};

	const get_automation_by_id = async (item_id) =>
		item_id ?
		db.get("automations").find({
			id: item_id
		}).value() || null :
		{
			error: "no item_id arg"
		};

	const set_automation = async (item_id, item_name,
						for_device, trigger, command) => {
		let resp;

		if (!item_id || !item_name ||
			!for_device || !trigger || !command) {
			return {
				"error": "no item_name || item_id || for_ || trigger_ || command_ parameter"
			};
		}

		let autos = db.get("automations");
		let item = autos.find({
			id: item_id
		});
		let datas = {
			id: item_id,
			name: item_name,
			for: for_device,
			trigger: trigger,
			command: command
		};

		if (!item) {

			autos.push(datas).write();

			resp = {
				"response": "OK",
				"misc": "not_exist_set"
			};
		} else {

			item.assign(datas).write();

			resp = {
				"response": "OK",
				"misc": "exist_set"
			};
		}
		//db_automations.flush();

		resp["command"] = "set_automation";

		return resp;
	}



	const get_rooms = async () =>
		db.get("rooms").value() || {
			"error": "no rooms found"
		};

	const get_room_by_id = async (room_id) =>
		room_id ?
		db.get("rooms").find({
			id: room_id
		}).value() || null :
		{
			error: "no room_id arg"
		};




	const process = async (data) => {
		// console.log("process", data);

		let device = await get_device_by_name(data.device);

		let _ret = {};
		_ret["device"] = data["device"];

		try {

			// IF DEVICE IS BRIDGE;
			if (!device || data["device"] == "root") {

				let command = data["command"];
				let args = data["args"];

				switch (command) {

					case "get_devices": {
						_ret = await get_devices();
						break;
					}

					case "get_automations": {
						_ret = await get_automations();
						break;
					}
					case "get_automation": {
						_ret = await get_automation_by_id(
							data["get_automation"]);
						break;
					}
					case "set_automation": {
						_ret = await set_automation(
							args["id"],
							args["name"],
							args["for"],
							args["trigger"],
							args["command"]);
						break;
					}

					case "get_scenes": {
						_ret = await get_scenes();
						break;
					}
					case "get_scene": {
						_ret = await get_scene_by_id(args["scene"]);
						break;
					}
					case "set_scene": {
						_ret = await set_scene(
								args["room_id"],
								args["scene"]);
						break;
					}


					case "get_room": {
						_ret = await get_room_by_id(args["room_id"]);
						break;
					}
					case "get_rooms": {
						_ret = await get_rooms();
						break;
					}
				}
				
				return _ret;

				// IF DEVICE IS OTHER FROM DEVICES LIST;
			} else {

				let command = data["command"];
				let args = data["args"];
				let item = args["item"] || 0;
				let items = device.items.find(el => el.id == item);
				let cmd = JSON.stringify(command ? items[command] : data);

				try {
					const response = await fetch('http://' +
						device.ip + ':' + device.port, {
							method: 'POST',
							headers: {
								'Accept': 'application/json',
								'Content-Type': 'application/json'
							},
							body: cmd
						});
	
					var body = await response.text();
					console.log("wi", body);
					
					try {
						body = JSON.parse(body);
						_ret = body;
					} catch (e) {
						_ret["value"] = body || "dead";
					}
					
					//_ret["command"] ? null : _ret["command"] = data["command"];
					_ret["device"] ? null : _ret["device"] = data["device"];
					_ret["item"] ? null : _ret["item"] =
						data["args"] ? data["args"]["item"] || null : null;;
					
					console.log("wi", _ret);
					broadcast(_ret);
					
					return _ret;				
					
					/*
					fetch('http://' +
						device.ip + ':' + device.port, {
							method: 'POST',
							headers: {
								'Accept': 'application/json',
								'Content-Type': 'application/json'
							},
							body: cmd
						}).then(async _ret => {
							_ret = await _ret.text();
					
							let _rets;
						})
					*/
				} catch (e) {
					console.log(e);
					_ret = {
						device: data.device,
						item: item,
						value: "dead",
						error: {
							errno: e.cause.errno,
							code: e.cause.code
						}
					};
					broadcast(_ret);
					return _ret;
				}
			}

		} catch (e) {
			console.log(e);
			_ret = {
				device: data.device,
				item: item,
				value: "dead",
				error: {
					errno: e.cause.errno,
					code: e.cause.code
				}
			};
			broadcast(_ret);
			return _ret;
		}

		return _ret;
	}
	

	const json_normalize = (data) => {
		try {
			data = JSON.parse(data);
		} catch (e) {
			console.log("already json, parse skipped");
		}
		return data;
	}



	const ws_handler = async (client) => {

		// console.log(`${client.host} connected`);

		broadcast({
			"log": "new client"
		})

		client.on("message", async (message) => {
			// console.log(`${client.host} -> ${message}`);

			var data = JSON.parse(await message);

			let _ret = await process(data);
			_ret["command"] ? null : _ret["command"] = data["command"];
			_ret["device"] ? null : _ret["device"] = data["device"];
			_ret["item"] ? null : _ret["item"] = data["item"];

			broadcast(_ret);
		});

		client.on("disconnect", async () => {
			// console.log(`${client.host} disconnected`);
		});

		client.on("close", async (client) => {
			// console.log(`${client.host} unhandled close`);
		});
	}




	const get_listener = async (req, res, query) => {
		
		// console.log(query.href)
		
		switch (query.href) {
			
			case "/video": {
				
    const range = req.headers.range;
    if (!range) {
        res.status(400).send("Requires Range header");
    }
    const videoPath = "/home/max/to_git/my_portfolio/www/img/18101513.mp4";
    const videoSize = fs.statSync(videoPath).size;
    const CHUNK_SIZE = 10 ** 6;
    const start = Number(range.replace(/\D/g, ""));
    const end = Math.min(start + CHUNK_SIZE, videoSize - 1);
    const contentLength = end - start + 1;
    const headers = {
        "Content-Range": `bytes ${start}-${end}/${videoSize}`,
        "Accept-Ranges": "bytes",
        "Content-Length": contentLength,
        "Content-Type": "video/mp4",
    };
    res.writeHead(206, headers);
    const videoStream = fs.createReadStream(videoPath, { start, end });

	videoStream.pipe(res);
    
    	break;
    
			}
			
			default: {
				
		href = query.href == "/" ? "index.html" : query.href;
		fs.readFile(__dirname + (req.domain == "v2" ?
			"/www2/" : "/www/") + href, async (err, fd) =>
			err ? await not_found(res) : res.writeHead(200).end(fd))
		}

				break;
			}
		}
		
		

	const not_found = async (res, json = false) =>
		json ? res.setHeader('Content-Type', 'application/json')
		.end(JSON.stringify({
			"error": "404"
		})) :
		res.writeHead(404).end("not found");



	const post_listener = async (req, res, query) => {

		try {
			var body = '';
			req.on('data', async (data) => {
				try {
					body += data;
					// 1e6 === 1 * Math.pow(10, 6) === 1 * 1000000 ~~~ 1MB
					if (body.length > 1e6) {
						// FLOOD ATTACK OR FAULTY CLIENT, NUKE REQUEST
						req.connection.destroy();
					}
				} catch (e) {
					// console.log(c.col_err("at req.on(data) "), e)
				}
			});

			req.on('end', async () => {
				try {
					//var POST = qs.parse(body);
					var obj = JSON.parse(body);

					res.setHeader('Content-Type', 'application/json');
					res.end(JSON.stringify(await process(obj)));
				} catch (e) {
					// console.log(c.col_err("at req.on(end) "), e);
				}
			});
		} catch (e) {
			// console.log(c.col_err("at post listener "), e);
		}
	};


	// JUST 4 FUN;
	const requestListener_arrow = async (req, res) =>
		await ((_ret = [
			req["domain"] = "",
			domain = req.headers.host.split("."),
			domain.pop(),
			req.domain = domain.join()
		], query = url.parse(req.url, true)) => (req.method == "GET" ?
			get_listener(req, res, query) :
			post_listener(req, res, query)
		))();

	const normaltime = (now = new Date(Date.now())) =>
		((h = now.getHours(),
				m = now.getMinutes(),
				s = now.getSeconds()) =>
			`${h >= 10 ? h 
				: "0" + h}:${m >= 10 ? m 
				: "0" + m}:${s >= 10 ?  s 
				: "0" + s}`)()



	const broadcast = (data) =>
		websocket ?
		websocket.clients.forEach(async (client) =>
			client.send(JSON.stringify(data))) : null;


	try {

		// WHEN HACKERS ATTACK JUST UNCOMMENT;
		/*
		db.defaults({
			rooms: [],
			scenes: [], 
			automations: [],
			devices:??[]
		}).write();
		*/
		
		setInterval(async () =>
			broadcast({ device: "root",
						item: "door2",
						command: "status", 
						value: `${Math.floor(Math.random() * 2)}` })
				,500000);
		
		setInterval(async () =>
			broadcast({ device: "root",
						item: "door1",
						command: "status", 
						value: `${Math.floor(Math.random() * 2)}` })
				,1000000);
		
		setInterval(async () =>
			broadcast({ device: "root",
						item: "humd1",
						command: "status", 
						value: `${Math.floor(Math.random() * 200)}` })
				,100000);
				
		

		setInterval(async () =>
			get_devices().then(async devices =>
				await devices.forEach(async device => {
					try {
						await fetch('http://' +
							device.ip + ':' + device.port + "/ping", {
								method: 'GET',
								headers: {
									'Accept': 'application/json',
									'Content-Type': 'application/json'
								},
								//body: device.
							}) //.then(response =>
							// console.log(`Device ${device.name} alive`));
					} catch (e) {
						// console.log(`Device ${device.name} dead`)
						broadcast({ device: device.name,
									command: "status", 
									value: "dead" });
					}
				})), 65535);

		setInterval(async () => {

			let autos = db.get("automations").value().forEach(async (el) => {

				if (el?.trigger?.startsWith("time")) {
					let now = normaltime();
					let time = el.trigger.split("time=")[1];

					//// console.log(time, normaltime());

					if (el.executed) return;

					if (now.startsWith(time) || el.exec_after_timeout) {
						el.executed = true;
						//db_automations.flush();

						setTimeout(async () => {
							el.executed = false;
							//db_automations.flush();
						}, ((60 * 60) * 1000) * 12 /* 12h */ );

						let devs = await get_device_by_name(el.for);

						if (!devs.error) {

							process(null, null, {
								to: el.for,
								data: JSON.stringify(devs.items[0][el.command])
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

		const server = http.createServer(options, requestListener_arrow);
		server.listen(port, host, () => {
			console.log(`Server is running on http://${host}:${port}`);
		});
		websocket = new WebSocket.Server({
			port: 8093
		}, () => websocket.on("connection", ws_handler));

	} catch (e) {
		console.log(c.col_err("error occured\n"), e);
		setTimeout(() => main(), 1000);
	}
})();