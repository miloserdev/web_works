class M_Event {
	constructor (type, to, from, data, text, status, time) {
		this.type = type;
		this.to = to;
		this.from = from;
		this.data = data;
		this.text = text;
		this.status = status;
		this.time = time;
	}
}

class Room {
	constructor (id, name, icons, devices) {
		this.id = id;
		this.name = name;
		this.icons = icons;
		this.devices = devices;
	}
}

class Device {
	constructor (id, name, type, buttons, ip, port) {
		this.id = id;
		this.name = name;
		this.type = type;
		this.buttons = buttons;
		this.ip = ip;
		this.port = port;
	}
}

function unixtime (date = Date.now()) {  
  return Math.floor(date / 1000)
}

module.exports = { M_Event, Room, Device, unixtime };