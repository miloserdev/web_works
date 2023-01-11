const board = document.querySelector("board");
const handler = document.querySelector("handler");

const rooms = [{
    "id": "boiler_room",
    "name": "Boiler Room",
    "switches": [
        {
            "id": "esp01_relay",
            "name": "Gas Boiler",
            "params": "big",
            "type": "button",
            "device": "esp01_relay",
            "connect_to": "0"
            
        },
        
        {
            "id": "pump_1",
            "name": "Pump Status",
            "params": "normal",
            "type": "stater",
            "device": "esp01_relay",
            "connect_to": "0"
        },
	]
},
{
    "id": "boiler_room_2",
    "name": "Boiler Room",
    "switches": [
        {
            "id": "esp01_relay_2",
            "name": "Gas Boiler",
            "params": "big",
            "type": "button",
            "device": "esp01_relay",
            "connect_to": "0"
            
        },
        
        {
            "id": "pump_2",
            "name": "Pump Status",
            "params": "normal",
            "type": "stater",
            "device": "esp01_relay",
            "connect_to": "0"
        },
	]
}
];

let devices = [];


const load = () => {
	
	fetch(location.origin + "/devices", {
	    method: 'GET',
	    headers: {
	        'Accept': 'application/json',
	        'Content-Type': 'application/json'
	    }
	})
	.then(response => response.json())
	.then(response => {
		
		devices = response;

		for (let i = 0; i < rooms.length; i++) {
			let room = rooms[i];
			console.log(room.id, room.name);
			append_section(room.id, room.name);
	
			for (let c = 0; c < room.switches.length; c++) {
								// :)
				let device = room.switches[c];
				console.log(device.id, device.name);
				append_card(room.id, device.id, device.name, device.params, null);
			}
		}
	
		post_load();
		
		setTimeout(() => update(), 1000);
		document.addEventListener("click", () => update());
		setInterval(() => update(), 13500);
		
	});

};

const post_load = () => {

	for (let i = 0; i < rooms.length; i++) {
		let room = rooms[i];
		for (let c = 0; c < room.switches.length; c++) {
							// :)
			let switch_ = room.switches[c];

			if (switch_.type == "button") {
				let dev = board.querySelector("card[id=" + switch_.id  + "");
				console.log("onclick", switch_.onclick);
				//dev.onclick = switch_.onclick;
				
				let st = devices.find(el => el.name == switch_.device );
				let btn = Array.from(st["buttons"]).find(el => el.id == switch_.connect_to);
				
				dev.addEventListener("click", () => {
					dev.attributes.status.value == "on"
					? 
					sends({ "to": switch_.device, "data": JSON.stringify(btn.turn_off) },
                    (res) => dev.attributes.status.value = JSON.parse(res))
                    :
                    sends({ "to": switch_.device, "data": JSON.stringify(btn.turn_on) },
                    (res) => dev.attributes.status.value = JSON.parse(res))
				});
			}
			if (switch_.onload) {
				let dev = board.querySelector("card[id=" + switch_.id  + "");
				console.log("onload", switch_.onload);
				switch_.onload(dev);
				dev.addEventListener("click", switch_.onclick, false);
			}

		}
	}

};

const update = (what=undefined) => {

	for (let i = 0; i < rooms.length; i++) {
		let room = rooms[i];
	//	console.log(room.id, room.name);

		for (let c = 0; c < room.switches.length; c++) {
							// :)
			let switch_ = room.switches[c];
			console.log(switch_.id, switch_.name);
			
			let dev = board.querySelector("card[id=" + switch_.id  + "");
			let st = devices.find(el => el.name == switch_.device );
			if (st) {
				console.log(st);
				let btn = Array.from(st["buttons"]).find(el => el.id == switch_.connect_to);
				console.log(btn);
				if (btn) {
 						sends({ "to": switch_.device, "data": JSON.stringify(btn.status) },
                    (res) => dev.attributes.status.value = JSON.parse(res))
				}
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
	
	console.log("______SENDS______", data);

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
		console.log(response);
		if (response["error"] != undefined) {
			print_error(response);
		}
		if (cb) console.log(cb); cb(result);
	});
};


addEventListener("DOMContentLoaded", load);
