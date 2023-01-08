const board = document.querySelector("board");
const handler = document.querySelector("handler");

const rooms = [{
    "id": "boiler_room",
    "name": "Boiler Room",
    "devices": [

        {
            "id": "gas_boiler_1",
            "name": "Gas Boiler",
            "params": "big",
            "onclick": (ev) => {
                sends({
                        "to": "gas_boiler_1",
                        "data": `[{ "relay": ${ev.target.attributes.status.value == "on" ? 1 : 0} }]`
                    },
                    (res) => ev.target.attributes.status.value = JSON.parse(res))
            },
			"update": (el) => {
                sends({
                        "to": "gas_boiler_1",
                        "data": `[{ "relay": "state" }]`
                    },
                    (res) => {
                        console.log(el);
                        el.attributes.status.value = JSON.parse(res)
                    })
            }
        },

        {
            "id": "relay_array_1",
            "name": "relay_array_1",
            "params": "normal",
            "onclick": (ev) => {
                sends({
                        "to": "relay_array_1",
                        "data": `[{ "digitalWrite": { "pin": 33,
                                 "value":  ${ev.target.attributes.status.value == "on" ? 1 : 0} } }]`
                    },
                    (res) => ev.target.attributes.status.value = JSON.parse(res))
            },
			"update": (el) => {
                sends({
                        "to": "relay_array_1",
                        "data": `[{ "digitalRead": { "pin": 33 } }]`
                    },
                    (res) => {
                        console.log(el);
                        el.attributes.status.value = JSON.parse(res)
                    })
            }
        },

        {
            "id": "relay_array_1",
            "name": "relay_array_1",
            "params": "normal",
            "onclick": (ev) => {
                sends({
                        "to": "relay_array_1",
                        "data": `[{ "digitalWrite": { "pin": 33,
                                 "value":  ${ev.target.attributes.status.value == "on" ? 1 : 0} } }]`
                    },
                    (res) => ev.target.attributes.status.value = JSON.parse(res))
            },
			"update": (el) => {
                sends({
                        "to": "relay_array_1",
                        "data": `[{ "digitalRead": { "pin": 33 } }]`
                    },
                    (res) => {
                        console.log(el);
                        el.attributes.status.value = JSON.parse(res)
                    })
            }
        },

        {
            "id": "pump_1",
            "name": "Pump Status",
            "params": "normal",
			"update": (el) => {
                sends({
                        "to": "relay_array_1",
                        "data": `[{ "digitalRead": { "pin": 32 } }]`
                    },
                    (res) => {
                        console.log(el);
                        el.attributes.status.value = JSON.parse(res)
                    })
            }
        },
    ]
},

{
    "id": "boiler_room2",
    "name": "Boiler Room 2",
    "devices": [

        {
            "id": "light_1",
            "name": "Light 1",
            "params": "normal",
            "onclick": (ev) => {
                sends({
                        "to": "boiler_1",
                        "data": `[{ "digitalWrite": { "pin": 32,
                                 "value":  ${ev.target.attributes.status.value == "on" ? 1 : 0} } }]`
                    },
                    (res) => ev.target.attributes.status.value = JSON.parse(res))
            },
			"update": (el) => {
                sends({
                        "to": "boiler_1",
                        "data": `[{ "digitalRead": { "pin": 32 } }]`
                    },
                    (res) => {
                        console.log(el);
                        el.attributes.status.value = JSON.parse(res)
                    })
            }
        },


        {
            "id": "light_2",
            "name": "Light 2",
            "params": "normal",
            "onclick": (ev) => {
                sends({
                        "to": "boiler_1",
                        "data": `[{ "digitalWrite": { "pin": 33,
                                 "value":  ${ev.target.attributes.status.value == "on" ? 1 : 0} } }]`
                    },
                    (res) => ev.target.attributes.status.value = JSON.parse(res))
            },
			"update": (el) => {
                sends({
                        "to": "boiler_1",
                        "data": `[{ "digitalRead": { "pin": 33 } }]`
                    },
                    (res) => {
                        console.log(el);
                        el.attributes.status.value = JSON.parse(res)
                    })
            }
        },

        {
            "id": "tv_1",
            "name": "TV status",
            "params": "normal",
			"update": (el) => {
                sends({
                        "to": "boiler_1",
                        "data": `[{ "digitalRead": { "pin": 32 } }]`
                    },
                    (res) => {
                        console.log(el);
                        el.attributes.status.value = JSON.parse(res)
                    })
            }
        },
        
        {id: "dummy1", name: "Dummy 1", params: "normal" },
        {id: "dummy1", name: "Dummy 1", params: "big" },
    ]
}
];

const load = () => {

	for (let i = 0; i < rooms.length; i++) {
		let room = rooms[i];
		console.log(room.id, room.name);
		append_section(room.id, room.name);

		for (let c = 0; c < room.devices.length; c++) {
							// :)
			let device = room.devices[c];
			console.log(device.id, device.name);
			append_card(room.id, device.id, device.name, device.params, null);
		}
	}

	post_load();
	
	setTimeout(() => update(), 1000);
	document.addEventListener("click", () => update());
	setInterval(() => update(), 3500);

};

const post_load = () => {

	for (let i = 0; i < rooms.length; i++) {
		let room = rooms[i];
		for (let c = 0; c < room.devices.length; c++) {
							// :)
			let device = room.devices[c];

			if (device.onclick) {
				let dev = board.querySelector("card[id=" + device.id  + "");
				console.log("onclick", device.onclick);
				dev.onclick = device.onclick;
				dev.addEventListener("click", device.onclick);
			}
			if (device.onload) {
				let dev = board.querySelector("card[id=" + device.id  + "");
				console.log("onload", device.onload);
				device.onload(dev);
				dev.addEventListener("click", device.onclick, false);
			}

		}
	}

};

const update = () => {

	for (let i = 0; i < rooms.length; i++) {
		let room = rooms[i];
	//	console.log(room.id, room.name);

		for (let c = 0; c < room.devices.length; c++) {
							// :)
			let device = room.devices[c];
		//	console.log(device.id, device.name);
			let dev = board.querySelector("card[id=" + device.id  + "");
			if (device.update) {
				device.update(dev);
			}
		}
	}

};


function append_card(section_id, device_id, name, params, onclick) {

	let section = board.querySelector("section[id=" + section_id +"]");
	let cards = section.querySelector("cards");

	cards.innerHTML += `<card id="${device_id}" ${params} status="">
				<h1>${name}</h1>
			</card>`;
}


function append_section (id, name) {

	board.innerHTML += `<section id="${id}">
				<h1>${name}</h1>
		                <cards>
		                
		                </cards>
		        </section>`;

}

const print_error = (response) => {
	let errs = response["error"]["cause"];
	handler.innerHTML = `<a>code: ${errs.code}</a>
						<a>errno: ${errs.errno}</a>
						<a>syscall: ${errs.syscall}</a>`;
	setTimeout(() => handler.innerHTML = "", 10000);
}


const sends = (data, cb) => {

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
			print_error(response);
		}
		if (cb) console.log(cb); cb(result);
	});
};


addEventListener("DOMContentLoaded", load);
