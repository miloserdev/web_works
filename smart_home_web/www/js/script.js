const board = document.querySelector("board");

const rooms = [{
    "id": "boiler_room",
    "name": "Boiler Room",
    "devices": [

        {
            "id": "boiler_1",
            "name": "Boiler 1",
            "params": "big",
            "onclick": (ev) => {
                sends({
                        "to": "boiler_1",
                        "data": `[{ "digitalWrite": { "pin": 32,
                                 "value":  ${ev.target.attributes.status.value == "on" ? 1 : 0} } }]`
                    },
                    (res) => ev.target.attributes.status.value = JSON.parse(res))
            },
            "onload": (el) => {
                sends({
                        "to": "boiler_1",
                        "data": `[{ "digitalRead": { "pin": 32 } }]`
                    },
                    (res) => {
                        console.log(el);
                        el.attributes.status.value = JSON.parse(res)
                    })
            },
            "ip": "192.168.1.69",
            "port": 8081
        },


        {
            "id": "boiler_2",
            "name": "Boiler 2",
            "params": "normal",
            "onclick": (ev) => {
                sends({
                        "to": "boiler_1",
                        "data": `[{ "digitalWrite": { "pin": 33,
                                 "value":  ${ev.target.attributes.status.value == "on" ? 1 : 0} } }]`
                    },
                    (res) => ev.target.attributes.status.value = JSON.parse(res))
            },
            "onload": (el) => {
                sends({
                        "to": "boiler_1",
                        "data": `[{ "digitalRead": { "pin": 33 } }]`
                    },
                    (res) => {
                        console.log(el);
                        el.attributes.status.value = JSON.parse(res)
                    })
            },
            "ip": "192.168.1.61",
            "port": 8081
        },

        {
            "id": "pump_1",
            "name": "Pump 1",
            "params": "normal",
            "ip": "192.168.1.62",
            "port": 8081
        }
    ]
}];

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


const sends = (data, cb) => {

	fetch('http://localhost:8091/', {
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
		console.log(result)
		if (cb) console.log(cb); cb(result);
	});
};


addEventListener("DOMContentLoaded", load);