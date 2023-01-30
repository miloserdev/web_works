var alls = [];

class View {
	constructor (id, name, html) {
		this.id = id;
		this.name = name;
		this.html = html;
		alls.push({id: this.id, name: this.name, html: this.html});
	}
	
	name = () => this.name;
	setName = (data) => this.name = data;
	
	html = () => this.html;
	setHtml = (data) => this.html = data;
}

const home_page = new View("/home", "HTML", `
	<h1>Home View</h1>
	<a link="/scenes">Scenes</a>
	<a link="/automation">Automation</a>
	<a link="/settings">Settings</a>
`);

const scenes_page = new View("/scenes", "Scenes Page", `
	<h1>Scenes</h1>
	<a link="/home">Home</a>
	<a link="/automation">Automation</a>
	<a link="/settings">Settings</a>
`);

const automation_page = new View("/automation", "Automation Page", `
	<h1>Automation</h1>
	<a link="/home">Home</a>
	<a link="/scenes">Scenes</a>
	<a link="/settings">Settings</a>
`);

const settings_page = new View("/settings", "Settings Page", `
	<h1>Settings</h1>
	<a link="/home">Home</a>
	<a link="/scenes">Scenes</a>
	<a link="/automation">Automation</a>
`);



const navigation = (page) => {
	page = page == "/" ? "/home" : page;
	console.log(page);
	//history.pushState(null, null, window.location.pathname);
	document.getElementById("content").innerHTML = alls.find(el => {
		console.log(el.id, page);
		return el.id == page;
	}).html;
	
	Array.from(document.getElementsByTagName("navigation")[0]
	.getElementsByTagName("nav_button") ).forEach(el => {
		if (!el.matches("[link]")) return;
		if (el.attributes["link"].value == page) {
			el.attributes["sel"].value = "true";
		}
		else {
			el.attributes["sel"].value = "false";
			//el.removeAttribute("sel");
		}
	})
};




document.addEventListener("DOMContentLoaded", (e) => {
	
	document.body.addEventListener("click", (e) => {
		if (e.target.matches("[link]")) {
			e.preventDefault();
			history.pushState(null, null, e.target.attributes["link"].value);
			navigation(e.target.attributes["link"].value)
		}
	});
	
	window.history.pushState({page: "/"}, "/", "");
	
	window.addEventListener('popstate', function(event) {
		
		console.log(event);
		
		navigation(location.pathname)
	
		//history.back();
	    //history.pushState(null, null, window.location.pathname);
	    
	
	}, false);
	
	console.log("start"); 
	navigation(location.pathname);
	//console.log(empty_view.html);
	//document.getElementById("content").innerHTML = empty_view.html;
});