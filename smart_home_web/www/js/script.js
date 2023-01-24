let scenes_data;
let rooms_data;
let devices_data;

let room_title = document.getElementById("room_title");
let scene_title = document.getElementById("scene_title");
let cards = document.querySelector("cards[id='cards']");
let automations_holder = document.querySelector('list_holder[id="automations"]');
let scenes_holder = document.querySelector('linear_scroller[id="scenes"]');
let rooms_holder = document.querySelector('list_holder[id="rooms"]');

let current_room;


const update = () => {
	rooms_data.find(i => i.id == current_room).elements.forEach(el => {
		let dev = devices_data.find(f => f.name == el.to);
		
		console.log("id", el.id)
		
		let rm = cards.querySelector(`card[id="${el.id}"]`);
		console.log(rm)
		
		let asd = dev.buttons.find(a => a.id == el.button).status;
		asd = JSON.stringify(asd);
		console.log(asd);
		
		sends( {"to": el.to, "data": `${asd}` }, e => {
			console.log(e);
			rm.attributes.status.value = JSON.parse(e);
		} );
	})
}




var post_load = (datas) => {

	let scenes = datas["scenes"];
	
	scenes.forEach((item) => {
		let icons = item["icons"]
		.map(e => `<i class="${e}"></i>` ).join('');
		
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
	
	sends({"to": "root", "get_room": room_id}, (item) => {
		
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
		let d = devices_data.find(f => f.name == el.to);
		console.log(`set button ${el.id} > ${el.button} to ${d.name}`);
			cards.innerHTML += `
			<card id="${el.id}"
				normal="" status="off">
				<h1>${el.id}</h1>
			</card>`;
	});

	item.elements.forEach(el => {
		let d = devices_data.find(f => f.name == el.to);
		let els = cards.querySelector(`card[id="${el.id}"]`);
		els.onclick = (e) => {
			console.log(`push button ${el.id} > ${el.button} of ${d.name}`);
			
			let asd = d.buttons.find(a => a.id == el.button);
			asd = els.attributes.status.value == "on" ? asd.turn_off : asd.turn_on;
			asd = JSON.stringify(asd);
			console.log("types", asd);
			
			sends( {"to": el.to, "data": `${asd}` }, e => {
				console.log(e);
				els.attributes.status.value = JSON.parse(e);
			} );
		}	
	});
	
	});
}

const save_automation = (item_id) => {
	let item_name = document.getElementById(`card_auto_${item_id}_name`).value;
	let item_for = document.getElementById(`card_auto_${item_id}_for`).value;
	let item_trigger = document.getElementById(`card_auto_${item_id}_trigger`).value;
	let item_command = document.getElementById(`card_auto_${item_id}_command`).value;
	
	console.log(item_id, item_name, item_for, item_trigger, item_command);
	
	sends({"to": "root", "set_automation": 
											{ 
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
	sends({"to": "root", "get_automation": item_id}, (item) => {
		
		item = JSON.parse(item);
		console.log(item);
		
	cards.innerHTML = "";
	room_title.innerText = item.name;
	scene_title.innerText = `Automation Setup`;


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
		<input type="text" id="card_auto_${item.id}_command" value="${item.command || null}"><br>
		</input_box>
		
		<input type="submit" value="Save" onclick="event.preventDefault(); save_automation('${item_id}');">
		
		</formd>
	</block>`;
			
	});
}



document.addEventListener("DOMContentLoaded", async (e) => {

	$("#slider2").roundSlider({
	    sliderType: "min-range",
	    circleShape: "pie",
	    startAngle: "315",
	    lineCap: "round",
	    radius: 130,
	    width: 10,
	    min: 0,
	    max: 30,
	    svgMode: true,
		pathColor: "#292929",
		rangeColor: "#0071e3",
		tooltipColor: "#0071e3",
		borderWidth: 0,
		//startValue: 0,
	    valueChange: function (e) {
	    }
	});
	
	var sliderObj = $("#slider2").data("roundSlider");
	sliderObj.setValue(10);

	
	await fetch("http://192.168.1.66:8091/get_devices", {
	    "credentials": "omit",
	    "headers": {
	        "Sec-Fetch-Dest": "script",
	    },
	    "method": "GET",
	    "mode": "cors"
	})
	.then(resp => resp.json())
	.then(devices => devices_data = devices).then(r => console.log("fff", r));
	
	await fetch("http://192.168.1.66:8091/get_automations", {
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

		automations.forEach((item) => {
			console.log("auto", item);
			let icons = item["icons"];
			if (icons) icons = icons.map(e => `<i class="${e}"></i>` ).join('');
			
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
	
	
	await fetch("http://192.168.1.66:8091/get_scenes", {
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
		scenes.forEach((item) => {
			let icons = item["icons"]
			.map(e => `<i class="${e}"></i>` ).join('');
			
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
				sends( {"set_scene": {"room_id": current_room, "scene": item.id } },
				 e => console.log(e) );
			}
		})
	});
	
	await fetch("http://192.168.1.66:8091/get_rooms", {
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
			item["icons"].map(e => `<i class="${e}"></i>` ).join('');
			
			rooms_holder.innerHTML +=
			`<a button etc id="${item.id}">
				${icons}
			</i>${item.name}</a>`;
		});
		
		current_room = rooms[0].id;
		set_room(current_room);
		
		rooms.forEach((item) => {
			let t = document.getElementById(item.id);
			t.onclick = (e) => set_room(item.id);
			
		});
	});
	
	//setInterval(update, 5000);

	console.log("DOMContentLoaded");
});
