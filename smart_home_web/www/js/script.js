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

*/




const update = () => {
	rooms_data.find(i => i.id == current_room).elements.forEach(el => {
		let dev = devices_data.find(f => f.name == el["device"]);

		let rm = cards.querySelector(`card[id="${el.id}"]`);

		//let asd = dev.buttons.find(a => a.id == el.button).status;
		//asd = JSON.stringify(asd);
		//console.log(asd);

		sends({
			"device": el["device"],
			/*"data": `${asd}`*/
			"command": "status",
			"args": {
				"button": el.button
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
			let d = devices_data.find(f => f.name == el["device"]);
			console.log(`set button ${el.id} > ${el.button} to ${d.name}`);
			cards.innerHTML += `
				<card _button=${el.device}_${el.button}
					  id="${el.id}"
					normal="" status="">
					<i class="fa fa-lamp"></i>
					<h1>${el.id}</h1>
					<h3>${el.device}</h3>
				</card>`;
		});

		item.elements.forEach(el => {
			let d = devices_data.find(f => f.name == el["device"]);
			let els = cards.querySelector(`card[id="${el.id}"]`);
			els.onclick = (e) => {
				console.log(`push button ${el.id} > ${el.button} of ${d.name}`);

				let asd = els.attributes.status.value == "on" ? "turn_off" : "turn_on";
				console.log("types", asd);

				sends({
					"device": el["device"],
					/*"data": `${asd}`*/
					"command": asd,
					args: {
						"button": el["button"]
					}
				}, e => {
					console.log("card click", e, "value", e.value);
					els.attributes.status.value = e.value;
				});
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
		.then(response => response.json())
		.then(response => {
			console.log("sends response", response);

			var result = json_normalize(response);
			result._data = data;
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

	console[json["error"] ? "error" : "log"]
		("from websocket ->", json);

	// Now hardcoded, sorry
	let rm = cards.querySelector(`card[_button="${json.device}_${json.pin}"]`);
	if (rm) {
		console.log(`========${json.device}_${json.pin}`, rm)
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

	document.querySelectorAll(`card[_button="${json.from}_${json.pin}"]`).forEach(e => {
		console.log('naiden 2', e);
		e.attributes.status.value = json.value;
	});

}


const init_websock = () => {

	websock = new WebSocket(`ws://${location.hostname}:8093`);

	websock.onopen = () => {
		console.log('websocket connected');
		clearInterval(reconnect_timer);
	};

	websock.onmessage = process;

	websock.onclose = () => {
		console.log("websocket closed, reconnecting");
		reconnect_timer = setInterval(() =>
			websock.CONNECTED ?
			clearInterval(reconnect_timer) :
			/*init_websock() */ null, 5000);
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

		automations.forEach((item) => {
			console.log("auto", item);
			let icons = item["icons"];
			if (icons) icons = icons.map(e => `<i class="${e}"></i>`).join('');

			automations_holder.innerHTML +=
				`<round_holder flat id="automation_${item.id}">
						<round_push flat>
							<a button ${item["button"]}>
								${item.name}
							</a>
							<h4>${item.for}</h4><h4 style="color: #6c757d">${item.trigger}</h4>
						</round_push>
					</round_holder>`;
		});

		automations.forEach((item) => {
			let t = document.getElementById("automation_" + item.id);
			t.onclick = (e) => open_automation(item.id);

		});
	});


	sends({
		"command": "get_scenes"
	}, (scenes) => {
		scenes_data = scenes;
		console.log("scenes", scenes);

		if (!scenes_holder) return;

		scenes.forEach((item) => {
			let icons = item["icons"]
				.map(e => `<i class="${e}"></i>`).join('');

			scenes_holder.innerHTML +=
				`<round_holder id="${item.id}">
						<round_push>
							<a button ${item["button"]}>
								${icons}
							</a>
						</round_push>
						<h4>${item.name}</h4>
					</round_holder>`;
		});

		scenes.forEach((item) => {
			console.log(item);
			let s = document.getElementById(item.id);
			s.onclick = (e) => {
				scene_title.innerText = `Scene: ${item.name}`;
				sends({
					"command": "set_scene",
					"args": {
						"room_id": current_room,
						"scene": item.id
					}
				}, (e) => console.log(e));
			}
		})
	});

	sends({
		"command": "get_rooms"
	}, (rooms) => {
		rooms_data = rooms;

		rooms.forEach((item) => {
			let icons =
				item["icons"].map(e => `<i class="${e}"></i>`).join('');

			rooms_holder.innerHTML +=
				`<a button etc id="${item.id}">
						${icons}
					</i>${item.name}</a>`;
		});

		current_room = rooms[0].id;
		set_room(current_room);

		rooms.forEach((item) => {
			let t = document.getElementById(item.id);
			t.onclick = (e) => current_room != item.id ? set_room(item.id) : null;

		});
	});
}




document.addEventListener("DOMContentLoaded", async (e) => {


	init_websock();

	await init_app();

	console.log("DOMContentLoaded");
});