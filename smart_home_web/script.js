
function init() {

	Array.from(document.querySelectorAll("card[status]")).forEach(el => el.onclick = (ev) => {
	        console.log(ev)
	        let state = ev.target.attributes["status"].value == "on" ? true : false;
	        if (state) {
	                ev.target.attributes["status"].value = "off";
	        } else {
	                ev.target.attributes["status"].value = "on";
	        }
	});

	Array.from(document.querySelectorAll("card[toggle]")).forEach(el => el.onclick = (ev) => {
	        console.log(ev)
	        let state = ev.target.attributes["toggle"].value == "on" ? true : false;
	        if (state) {
	                ev.target.attributes["toggle"].value = "off";
	        } else {
	                ev.target.attributes["toggle"].value = "on";
	        }
	});

}

addEventListener("load", init);
