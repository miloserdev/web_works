const fs = require("fs");
const http = require("http");
const url = require("url");
const qs = require("querystring");

const c = require("./colors.js");

const { M_Event, Room, Device, unixtime } = require("./consts.js");

const TinyDB = require("tinydb");
var db_events;
var db_automations;
var db_scenes;
var db_rooms;
var db_devices;

//const devices = require("./devices.json");

const host = "192.168.1.69";
const port = "8091";


const set_scene = async (room_id, scene) => {
	let sce = db_rooms._data["data"].find((el) => el.id == room_id);
	if (!sce) return { "error": "not found" };
	sce.scene = scene;
	db_rooms.flush();
	return { "response": "OK" };
}


const get_automations = async () => db_automations._data["data"];

const get_automation_by_id = async (item_id) =>
	db_automations.find({id: item_id}, async (err, item) =>
		!err ? item[0] : {"error": err} );

const set_automation = async (item_id, item_name, for_device, trigger, command) => {
	let ret;
	let item = db_automations._data["data"].find((el) => el.id == item_id);
	console.log(item)
	if (!item) {
		db_automations.appendItem( 
			{ 
				id: item_id,
				name: item_name,
				for:  for_device, 
				trigger: trigger,
				command: command
			}
		);
		ret = { "response": "OK", "misc": "not_exist_set" };
	} else {
		item.name = item_name || item.name;
		item.for = for_device || item.for;
		item.trigger = trigger || item.trigger;
		item.command = command || item.command;
		ret = { "response": "OK", "misc": "exist_set" }; 
	}
	db_automations.flush();
	return ret;
}

const get_scenes = async () => db_scenes._data["data"];

const get_rooms = async () => db_rooms._data["data"];

const get_room_by_id = async (room_id) =>
	db_rooms.find({id: room_id}, async (err, item) =>
		!err ? item[0] : {"error": err} );

const get_devices = async () => db_devices._data["data"];


const get_device_by_name2 = (name) => {
	for (var i = 0; i < devices.length; i++) {
		if (devices[i].name == name) return devices[i];
	}
	return -1;
}

const get_device_by_name = async (name) =>
	db_devices.find({name: name}, async (err, item) =>
		!err ? item[0] : {"error": err} );


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


const exec_event = (data) => {
	console.log("==========");
	console.log(data);
	console.log("==========");
	
	get_automations().then(autos => {
		let a = autos.filter(el => el.trigger == data.from);
		a.forEach(a => console.log("eventing", a.command) );
	});
}


const process = async (req, res, data) => {
	
	
	let ret;
	
	try {
	
	let to = data.to;
	let ev = new M_Event(null, null, "root", data.data, null, null, unixtime());
	
	if (!to || to == "root") {
		ev.to = "root";
		
		let data_ = !data.data ? data : data.data;
		
		if (data.set_automation) {
			let resp;
			let item_id = data.set_automation.id;
			let name_ = data.set_automation.name;
			let for_ = data.set_automation.for;
			let trigger_ = data.set_automation.trigger;
			let command_ = data.set_automation.command;
			
			if ( !item_id || !name_ || !for_ || !trigger_ || !command_) {
				resp = { "error": "no item_name || item_id || for_ || trigger_ || command_ parameter" };
			}
			
			resp = await set_automation(item_id, name_, for_, trigger_, command_);
			return resp;
		}
		
		if (data.set_scene) {
			let resp;
			let room_id = data.set_scene.room_id;
			let scene = data.set_scene.scene;
			if ( !room_id || !scene) {
				resp = { "error": "no room_id or scene parameter" };
			}
			
			resp = await set_scene(room_id, scene);
			res.setHeader('Content-Type', 'application/json');
			res.end( JSON.stringify(resp) );
			return;
		}
		
		else if (data.get_rooms) {
			let resp;
			resp = await get_rooms();
			if ( !resp) {
				resp = { "error": "no rooms found" };
			}
			return resp;
		}
				
		else if (data.get_room) {
			let resp;
			let room_id = data.get_room;
			if ( !room_id) {
				resp = { "error": "no room_id parameter" };
			}
			
			resp = await get_room_by_id(room_id);
			return resp;
		}
				
		else if (data.get_automation) {
			let resp;
			let item_id = data.get_automation;
			if ( !item_id) {
				resp = { "error": "no item_id parameter" };
			}
			
			resp = await get_automation_by_id(item_id);
			return resp;
		}
		
	} else {

		ev.to = data.to;
		var dev = await get_device_by_name(data.to);
		if (dev < 0) return await not_found(res, true);
		
		//exec_event(ev);
		console.log(data);
		console.log(dev);
	
		try {
			
			ev = new M_Event(null, "root", data.to, null, null, null, unixtime());
			let data_ = !data.data ? data : data.data;
			let command = data.command
			
			let cmccc = JSON.stringify( command ? dev.buttons[0][command] : JSON.parse(data_)  );
			
			console.log("command blyat", cmccc );
			
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
			console.log("resp body", body);
			
			ev.data = body;
			//console.log("asd", body);
			
			ev.status = response.status;
			ev.text = response.statusText;
			
			exec_event(ev);
			
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
		console.log( c.col_err("at parser "), e);
	}
	
	return "i don't know"

}


const get_listener = async (req, res, query) => {
	
	if (query.href == "/devices") {
		res.writeHead(200);
		res.end( JSON.stringify( await get_devices() ) );
	}
	/*
	else if (query.href == "/data") {
		fs.readFile(__dirname + "/data.json", async (err, fd) => {

			if (err) await not_found(res);
	
			res.writeHead(200);
			res.end(fd);
		});
		return;
	}
	*/
	else if (query.href == "/get_automations") {
		res.writeHead(200);
		res.end( JSON.stringify( await get_automations() ) );
	}
	else if (query.href == "/get_scenes") {
		res.writeHead(200);
		res.end( JSON.stringify( await get_scenes() ) );
	}
	else if (query.href == "/get_rooms") {
		res.writeHead(200);
		res.end( JSON.stringify( await get_rooms() ) );
	}
	else if (query.href == "/get_devices") {
		res.writeHead(200);
		res.end( JSON.stringify( await get_devices() ) );
	}

	query.href = query.href == "/" ? "index.html" : query.href;
	fs.readFile(__dirname + (req.domain == "v2" ? "/www2/" : "/www/") + query.href, async (err, fd) => {

		if (err) await not_found(res);

		res.writeHead(200);
		res.end(fd);
	});
};


const post_listener = async (req, res, query) => {
	
	console.log("queries", req.query, "\n");
	
	try {
		var body = '';
		req.on('data', async function (data) {
			try {
				body += data;
				// 1e6 === 1 * Math.pow(10, 6) === 1 * 1000000 ~~~ 1MB
				if (body.length > 1e6) {
					// FLOOD ATTACK OR FAULTY CLIENT, NUKE REQUEST
					req.connection.destroy();
				}
			} catch (e) {
				console.log( c.col_err("at req.on(data) "), e)
			}
		});
	
		req.on('end', async function () {
			try {
				var POST = qs.parse(body);
				var obj = JSON.parse(body);
				
				res.setHeader('Content-Type', 'application/json');
				res.end( JSON.stringify(await process(req, res, obj)) );
			} catch (e) {
				console.log( c.col_err("at req.on(end) "), e);
			}
		});
	} catch (e) {
		console.log( c.col_err("at post listener "), e);
	}
};


const requestListener = async (req, res) => {
	
	req.domain = "";
	
	let domain = req.headers.host.split(".");
	domain.pop();
	domain = domain.join('.');
	
	console.log( { domain: domain } );
	
	req.domain = domain;
	
	let starts = performance.now();
	
	const query = url.parse(req.url, true);
	let x = await (req.method == "GET"
					? get_listener(req, res, query)
					: post_listener(req, res, query) );
	
	let ends = performance.now();
	console.log(`${req.socket.remoteAddress}:${req.socket.remotePort} -> ${req.method} '${req.url}' | time ${ends-starts}`);	
	return x;
};



function normaltime (time) {
	let now = new Date(Date.now());
	let h = now.getHours()
	let m = now.getMinutes();
	let s = now.getSeconds();
	return `${h >= 10 ? h : "0" + h }:${m >= 10 ? m : "0" + m}:${s >= 10 ? s : "0" + s}`
	return now;
}


(main = async () => {
	try {
		
		db_events = new TinyDB("./data/events.json");
		db_events.onReady  = () => {
			console.log("db_events is ready");
			db_events.appendItem( new M_Event("status", "root", "run", 0, unixtime()) );
			db_events.flush();	
		}
		
		// const asd = require("./data.json");
	
		db_automations = new TinyDB("./data/automations.json");
		db_automations.onReady  = () =>
		{
			console.log("db_automations is ready");
			console.log(
				set_automation("second", "Activity Simulation", "root", null, "LOG 1" ),
				set_automation("boiler_on", "Boiler turn on", "root", "time=20:10", { to: "esp01_relay", data: "[{\"relay\":0}]" } ),
				set_automation("boiler_off", "Boiler turn off", "root", "time=6:10", { to: "esp01_relay", data: "[{\"relay\":1}]" } ),
			)
			
			db_automations._data["data"].forEach(el => el.executed = false);
			db_automations.flush();
		}
		
		db_scenes = new TinyDB("./data/scenes.json");
		db_scenes.onReady  = () =>
		{
			console.log("db_scenes is ready");
		}

		db_rooms = new TinyDB("./data/rooms.json");
		db_rooms.onReady  = () =>
		{
			console.log("db_rooms is ready");
		}

		db_devices = new TinyDB("./data/devices.json");
		db_devices.onReady  = () =>
		{
			console.log("db_events is ready");
		}
		
		setInterval(async () => {
			//check for updates;
			
			let autos = db_automations._data["data"].forEach(async (el) =>
			{
				
				if ( el?.trigger?.startsWith("time") )
				{
					let now = normaltime();
					let time = el.trigger.split("time=")[1];
					
					//console.log(time, normaltime());
					
					if (el.executed) return;
					
					if ( now.startsWith(time) || el.exec_after_timeout )
					{
						el.executed = true;
						db_automations.flush();
						
						setTimeout(async () =>
						{
							el.executed = false;
							db_automations.flush();
						}, ((60 * 60) * 1000) * 12 /* 12h */ );
						
						let devs = await get_device_by_name(el.for);
						console.log("device is", el.for, devs)
						if (!devs.error) {							
							
							process(null, null, {
								to: el.for,
								data: JSON.stringify( devs.buttons[0][el.command] )
							});
						}
						
					}
				}
			});
			
		}, 1000);
		
		//setTimeout(() => change_scene("room_2", "asd"), 1000);
		
		const server = http.createServer(requestListener);
		server.listen(port, host, () =>
		{
			console.log(`Server is running on http://${host}:${port}`);
		});
	} catch (e)
	{
		console.log( c.col_err("error occured\n"), e);
		setTimeout(() => main(), 1000);
	}
})();






