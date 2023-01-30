var origin = location.host;

let scenes_data;
let rooms_data;
let devices_data;

let room_title = document.getElementById("room_title");
let scene_title = document.getElementById("scene_title");
let cards = document.querySelector("cards[id='cards']");
let automations_holder = document.querySelector('list_holder[id="automations"]');
let scenes_holder = document.querySelector('linear_scroller[id="scenes"]');
let rooms_holder = document.querySelector('linear_scroller[id="rooms_holder"]');

let current_room;


const update = () => {
	rooms_data.find(i => i.id == current_room).elements.forEach(el => {
		let dev = devices_data.find(f => f.name == el["device"]);

		console.log("id", el.id)

		let rm = cards.querySelector(`card[id="${el.id}"]`);
		console.log(rm)

		//let asd = dev.buttons.find(a => a.id == el.button).status;
		//asd = JSON.stringify(asd);
		//console.log(asd);

		sends({
			"device": el["device"],
			/*"data": `${asd}`*/
			"command": "status",
			"args": { "pin": el.button }
		}, e => {
			console.log(e);
			let json = JSON.parse(e);
			console.log("========", json)
			//rm.attributes.status.value = json.value
		});
	})
}




var post_load = (datas) => {

	let scenes = datas["scenes"];

	scenes.forEach((item) => {
		let icons = item["icons"]
			.map(e => `<i class="${e}"></i>`).join('');

		scenes_holder.innerHTML +=
			`<scene_holder>
				<scene_push>
					<a button ${item["button"]}>
						${icons}
					</a>
				</scene_push>
				<h4>${item.name}</h4>
			</scene_holder>`;
	});

	let rooms = datas["rooms"];

};


const print_error = (response) => {
	let errs = response["error"]["cause"];
	if (errs) {
		handler.innerHTML = `<a>code: ${errs.code}</a>
						<a>errno: ${errs.errno}</a>
						<a>syscall: ${errs.syscall}</a>`;
		setTimeout(() => handler.innerHTML = "", 10000);
	}
}


const sends = (data, cb) => {

	console.log(data);

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
			var result = JSON.stringify(response);
			if (response["error"] != undefined) {
				//	print_error(response);
			}
			if (cb) /*console.log(cb);*/ cb(result);
		});
};


const set_room = (room_id) => {

	sends({
		"device": "root",
		"command": "get_room",
		"args": {
			room_id
		}
	}, (item) => {

		item = JSON.parse(item);
		console.log(item);

		current_room = item.id;

		cards.innerHTML = "";
		room_title.innerText = item.name;
		let scen = scenes_data.find(i => i.id == item.scene);
		scen = scen ? scen.name : "None";
		scene_title.innerText = `Scene: ${ scen }`;

		/*
					let s = document.getElementById(item.scene).querySelector("a[button]");
					
					 if (s.classList.contains("active")) {
				    	s.classList.remove("active");
				  	} else s.classList.add("active");
					*/

		item.elements.forEach(el => {
			let d = devices_data.find(f => f.name == el["device"]);
			console.log(`set button ${el.id} > ${el.button} to ${d.name}`);
			cards.innerHTML += `
				<card _button=${el.device}_${el.button}
					  id="${el.id}"
					normal="" status="">
					<h1>${el.id}</h1>
				</card>`;
		});

		item.elements.forEach(el => {
			let d = devices_data.find(f => f.name == el["device"]);
			let els = cards.querySelector(`card[id="${el.id}"]`);
			els.onclick = (e) => {
				console.log(`push button ${el.id} > ${el.button} of ${d.name}`);

				//let asd = d.buttons.find(a => a.id == el.button);
				//asd = els.attributes.status.value == "on" ? asd.turn_off : asd.turn_on;
				//asd = JSON.stringify(asd);

				let asd = els.attributes.status.value == "on" ? "turn_off" : "turn_on";
				console.log("types", asd);

				sends({
					"device": el["device"],
					/*"data": `${asd}`*/ "command": asd,
					args: { pin: el.button }
				}, e => {
					console.log("ignore", e);
					//els.attributes.status.value = JSON.parse(e);
				});
			}
		});

		update();

	});
}


const save_automation = (item_id) => {
	let item_name = document.getElementById(`card_auto_${item_id}_name`).value;
	let item_for = document.getElementById(`card_auto_${item_id}_for`).value;
	let item_trigger = document.getElementById(`card_auto_${item_id}_trigger`).value;
	let item_command = document.getElementById(`card_auto_${item_id}_command`).value;

	console.log(item_id, item_name, item_for, item_trigger, item_command);

	sends({
		"device": "root",
		"command": "set_automation",
		"args": {
			id: item_id,
			name: item_name,
			for: item_for,
			trigger: item_trigger,
			command: item_command
		}
	}, (item) => {
		console.log(item);
	});
}

const open_automation = (item_id) => {
	sends({
		"device": "root",
		"command": "get_automation",
		"args": {
			item_id
		}
	}, (item) => {

		item = JSON.parse(item);
		console.log(item);

		cards.innerHTML = "";
		room_title.innerText = item.name;
		scene_title.innerText = `Automation Setup`;

		console.log(item.command)


		cards.innerHTML += `
	<block id="card_auto_${item.id}" style="width: fit-content; height: fit-content;" large>
		<h1>${item.id}</h1>
		<formd style="display: grid;" id="card_auto_${item.id}_form" onsubmit="event.preventDefault(); save_automation('${item_id}');">
		
		<input_box>
		<label for="card_auto_${item.id}_name">Name</label>
		<input type="text" id="card_auto_${item.id}_name" value="${item.name || null}"><br>
		</input_box>
		
		<input_box>
		<label for="card_auto_${item.id}_for">For</label>
		<input type="text" id="card_auto_${item.id}_for" value="${item.for || null}"><br>
		</input_box>
		
		<input_box>
		<label for="card_auto_${item.id}_trigger">Trigger</label>
		<input type="text" id="card_auto_${item.id}_trigger" value="${item.trigger || null}"><br>
		</input_box>
		
		<input_box>
		<label for="card_auto_${item.id}_command">Command</label>
		<input type="text" id="card_auto_${item.id}_command" value="${ new String(item.command) || null}"><br>
		</input_box>
		
		<input type="submit" value="Save" onclick="event.preventDefault(); save_automation('${item_id}');">
		
		</formd>
	</block>`;

	});
}



const require_install = () => {
	window.addEventListener("beforeinstallprompt", (e) => {
		// Prevent Chrome 67 and earlier from automatically showing the prompt
		e.preventDefault();
		// Stash the event so it can be triggered later.
		deferredPrompt = e;
		// Update UI to notify the user they can add to home screen
		addBtn.style.display = "block";

		addBtn.addEventListener("click", (e) => {
			// hide our user interface that shows our A2HS button
			addBtn.style.display = "none";
			// Show the prompt
			deferredPrompt.prompt();
			// Wait for the user to respond to the prompt
			deferredPrompt.userChoice.then((choiceResult) => {
				if (choiceResult.outcome === "accepted") {
					console.log("User accepted the A2HS prompt");
				} else {
					console.log("User dismissed the A2HS prompt");
				}
				deferredPrompt = null;
			});
		});
	});
}



document.addEventListener("DOMContentLoaded", async (e) => {


	var websock = new WebSocket(`ws://${location.hostname}:8093`);
	
	websock.onopen = function () {
	  console.log('websocket connected');
	};
	
	websock.onmessage = function (message) {
		console.log("from websocket ->");
		console.log( JSON.parse(message.data) );
		let json =  JSON.parse(message.data);
		
		let d = devices_data.find(f => f.name == json["from"]);
		d = d["buttons"].find(el => el.id == json.pin);
		
		console.log(`card[_button="${json.from}_${json.pin}"]`);
		
		document.querySelectorAll(`card[_button="${json.from}_${json.pin}"]`).forEach(e => {
			console.log('naiden 2', e);
			e.attributes.status.value = json.value;
		});
		
		console.log("naiden", d)
	};
	
	websock.onclose = function (message) {
	  console.log("websocket closed, reconnecting");
	  websock = new WebSocket('ws://localhost:8093');
	};


	require_install();


	await fetch("http://" + origin + "/get_devices", {
			"credentials": "omit",
			"headers": {
				"Sec-Fetch-Dest": "script",
			},
			"method": "GET",
			"mode": "cors"
		})
		.then(resp => resp.json())
		.then(devices => devices_data = devices).then(r => console.log("fff", r));

	await fetch("http://" + origin + "/get_automations", {
			"credentials": "omit",
			"headers": {
				"Sec-Fetch-Dest": "script",
			},
			"method": "GET",
			"mode": "cors"
		})
		.then(resp => resp.json())
		.then(automations => {

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


	await fetch("http://" + origin + "/get_scenes", {
			"credentials": "omit",
			"headers": {
				"Sec-Fetch-Dest": "script",
			},
			"method": "GET",
			"mode": "cors"
		})
		.then(resp => resp.json())
		//.then(data => JSON.parse(data))
		.then(scenes => {
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

	await fetch("http://" + origin + "/get_rooms", {
			"credentials": "omit",
			"headers": {
				"Sec-Fetch-Dest": "script",
			},
			"method": "GET",
			"mode": "cors"
		})
		.then(resp => resp.json())
		.then(rooms => {
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

	// setInterval(update, 5000);

	console.log("DOMContentLoaded");
});