var origin = location.host;
var websock;
let reconnect_timer;

let devices_data;
let rooms_data;
let scenes_data;
let automations_data;

let room_title = document.getElementById("room_title");
let scene_title = document.getElementById("scene_title");
let cards = document.querySelector("cards[id='cards']");
let automations_holder = document.querySelector('list_holder[id="automations"]');
let scenes_holder = document.querySelector('linear_scroller[id="scenes"]');
let rooms_holder = document.querySelector('linear_scroller[id="rooms_holder"]');

let current_room;



// Trying a new version of JSON packets
/*

"commands": [
	{"name": "on","type": "command"},
	{"name": "off","type": "command"},
	{"name": "status","type": "command"}
]

// device map;

{
	id: 0,
	ip: "127.0.0.1",
	status: 1,			// {0: "dead", 1: "alive"}
	port: 8081
	name: "name",
	items: [
		{
			id: 1,
			type: "0",		// { 0: "normal", 1: "reverse" }
			values: "0",	// { 0: { 0: 0, 1: 1 } 1: { 0: false, 1: true }, 2: { 0: "off", 1: "on" } }
		}
	],
}

*/




const update = () => {
	rooms_data.find(i => i.id == current_room).elements.forEach(el => {
		let dev = devices_data.find(f => f.name == el["device"]);

		let rm = cards.querySelector(`card[id="${el.id}"]`);

		//let asd = dev.items.find(a => a.id == el.button).status;
		//asd = JSON.stringify(asd);
		//console.log(asd);

		sends({
			"device": el["device"],
			/*"data": `${asd}`*/
			"command": "status",
			"args": {
				"item": el.item
			}
		}, e => {
			console.log("updater", e);
			//let json = JSON.parse(e);
			//rm.attributes.status.value = json.value

			// Now using WebSocket to notify about changes | deprecated (maybe)
		});
	})
}




const set_room = (room_id) => {

	sends({
		"device": "root",
		"command": "get_room",
		"args": {
			room_id
		}
	}, (item) => {

		current_room = item.id;
		cards.innerHTML = "";
		room_title.innerText = item.name;
		let scen = scenes_data.find(i => i.id == item.scene);
		scen = scen ? scen.name : "None";
		scene_title.innerText = `Scene: ${ scen }`;

		item.elements.forEach(el => {
			let d = devices_data.find(f => f.name == el["device"]) || "root???";
			if (d || !d) {
				console.log(`set item ${el.id} > ${el.item} to ${d.name}`);
				cards.innerHTML += `
					<card id="${el.id}" _type="${el.type}"
							status=""
							_device="${el.device}"
							_item="${el.item}">
						<i class="${ el.icons?.[0] || "fa fa-light-switch" }"></i>
						${ el.type.includes("sensor") ?
						`<h2></h2>`
						: `` }
						<h1>${el.id}</h1>
						<h3>${el.device}</h3>
					</card>`;
			} else {
				console.error("element not found");
			}
		});

		item.elements.forEach(el => {
			let d = devices_data.find(f => f.name == el["device"]);
			if (d || !d) {
				let els = cards.querySelector(`card[id="${el.id}"][_type*="button"]`);
				//cards.querySelector(`card[id="button_1"][class*="button"]`)
				els ? els.onclick = (e) => {
					console.log(`push item ${el.id} > ${el.item} of ${d.name}`);
	
					let cmd = (els.attributes.status.value == "on" ? "turn_off" : "turn_on") || "turn_off";
	
					sends({
						"device": el["device"],
						/*"data": `${cmd}`*/
						"command": cmd,
						args: {
							"item": el["item"]
						}
					}, e => {
						els.attributes.status.value = e.value;
					});
				} : null;
			} else {
				console.error("element not found");
			}
		});

		update();

	});
}




const sends = (data, cb) => {

	console.log("sends data", data);

	fetch(location.origin + "", {
			method: 'POST',
			headers: {
				'Accept': 'application/json',
				'Content-Type': 'application/json'
			},
			body: JSON.stringify(data)
		})
		.then(async response => {
			//response = await response.text();
			//console.log("sends response", response);
			//response = json_normalize(response);
			response = await response.json();
			console.log("sends response", response);

			var result = json_normalize(response);
			//result._data = data;
			if (response["error"] != undefined) {
				console.error(response);
			}
			if (cb) cb(result);
		});
};


const json_normalize = (data) => {
	try {
		data = JSON.parse(data);
	} catch (e) {
		console.log("already json, parse skipped");
	}
	return data;
}


const process = (message) => {
	let json = JSON.parse(message.data);
	let command = json["command"];

	json.error ? console.log("websocket ->", json.error) : null;
		
	// json["command"] ? null : json["command"] = "status";

	// Now hardcoded, sorry
	json.item = json.item ? json.item : json.pin || 0;
	let rm = cards.querySelector(`card[_device="${json.device}"][_item="${json.item}"]`);
	if (rm) {
		rm.attributes.status.value = json.value;
	}
	
	switch (command) {

		/*
		case "status": {
			let rm = cards.querySelector(`card[_button="${json.device}_${json.pin}"]`);
			console.log(`========${json.device}_${json.pin}`, rm)
			rm.attributes.status.value = json.value;
		}
		*/
		
		case "status": {
			let room = rooms_data.find(f => f.id == current_room);
			let dev = room.elements ?
						room.elements.find(f =>
							f.device == json.device && 
							f.item == json.item)
						|| null
					: null;
				/*
				let dev =
					room.elements ?
						room.elements.find(f =>
							f.id == device.attributes.id.value)
						|| null
					: null;
				*/
				
			cards.querySelectorAll(`card[_type*="button"][_device="${json.device}"][_item="${json.item}"]`).forEach(device => {
				device.attributes.status.value = json.value;
			});
			cards.querySelectorAll(`card[_type*="sensor"][_device="${json.device}"][_item="${json.item}"]`).forEach(device => {
				//device.children[1].innerText = json.value;

				dev ? [
					device.children[0].attributes.class.value =
						dev.icons ?
							dev.icons[json.value] || dev.icons[0]
						: null,
					device.children[1].innerText = 
						dev.type.includes("binary") ?
							dev.values?.[json.value] || json.value
						: `${json.value} ${dev?.unit}`
				] : null;
			});
			break;
		}

		case "get_devices": {
			devices_data = json;
			break;
		}

		case "get_automations": {
			automations_data = json;
			break;
		}
		/*
		case "get_automation": {
			devices_data = json;
			break;
		}
		
		case "set_automation": {
			break;
		}
		
			
		case "get_scene": {
			break;
		}
		*/
		case "get_scenes": {
			scenes_data = json;
			break;
		}

		case "set_scene": {
			if (current_room != json["room_id"]) return;
			sends({
					"device": "root",
					"command": "get_scene",
					"args": {
						"scene": json["scene"]
					}
				}, (data) =>
				scene_title.innerHTML =
				`Scene: ${data.name}`);

			break;
		}
		/*	
		case "get_room": {
			break;
		}
		*/
		case "get_rooms": {
			rooms_data = json;
			break;
		}
	}

	//document.querySelectorAll(`card[_device="${json.device}"][_item="${json.item}"]`).forEach(e => {
	//	e.attributes.status.value = json.value;
	//});

}


const init_websock = () => {

	websock = new WebSocket(`ws://${location.hostname}:8093`);

	websock.onopen = () => {
		console.log('websocket connected');
	};
	
	websock.onerror = () => websock.close();

	websock.onmessage = process;

	websock.onclose = () => {
		console.log("websocket closed, reconnecting");
		setTimeout(() => init_websock(), 2000);
	}
}




const init_app = async () => {
	sends({
		"command": "get_devices"
	}, (devices) => devices_data = devices)

	sends({
		"command": "get_automations"
	}, (automations) => {

		automations_data = automations;
		console.log("automations", automations);

		if (!automations_holder) return;

		automations.forEach((auto) => {
			console.log("auto", auto);
			let icons = auto["icons"];
			if (icons) icons = icons.map(e => `<i class="${e}"></i>`).join('');

			automations_holder.innerHTML +=
				`<round_holder flat id="automation_${auto.id}">
						<round_push flat>
							<a button ${auto["item"]}>
								${auto.name}
							</a>
							<h4>${auto.for}</h4><h4 style="color: #6c757d">${auto.trigger}</h4>
						</round_push>
					</round_holder>`;
		});

		automations.forEach((auto) => {
			let t = document.getElementById("automation_" + auto.id);
			t.onclick = (e) => open_automation(auto.id);

		});
	});


	sends({
		"command": "get_scenes"
	}, (scenes) => {
		scenes_data = scenes;
		console.log("scenes", scenes);

		if (!scenes_holder) return;

		scenes.forEach((scene) => {
			let icons = scene["icons"]
				.map(e => `<i class="${e}"></i>`).join('');

			scenes_holder.innerHTML +=
				`<round_holder id="${scene.id}">
						<round_push>
							<a button ${scene["button"]}>
								${icons}
							</a>
						</round_push>
						<h4>${scene.name}</h4>
					</round_holder>`;
		});

		scenes.forEach((scene) => {
			console.log(scene);
			let s = document.getElementById(scene.id);
			s.onclick = (e) => {
				scene_title.innerText = `Scene: ${scene.name}`;
				sends({
					"command": "set_scene",
					"args": {
						"room_id": current_room,
						"scene": scene.id
					}
				}, (e) => console.log(e));
			}
		})
	});

	sends({
		"command": "get_rooms"
	}, (rooms) => {
		rooms_data = rooms;

		rooms.forEach((room) => {
			let icons =
				room["icons"].map(e => `<i class="${e}"></i>`).join('');

			rooms_holder.innerHTML +=
				`<a button etc id="${room.id}">
						${icons}
					</i>${room.name}</a>`;
		});

		current_room = rooms[0].id;
		set_room(current_room);

		rooms.forEach((room) => {
			let t = document.getElementById(room.id);
			t.onclick = (e) => current_room != room.id ? set_room(room.id) : null;

		});
	});
}




document.addEventListener("DOMContentLoaded", async (e) => {


	init_websock();

	await init_app();

	console.log("DOMContentLoaded");
});