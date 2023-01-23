var socket = io("http://socket.donationalerts.ru");

socket.emit('add-user', {token: "your_token", type: "minor"});
socket.on('donation', function(msg) {
	msg = JSON.parse(msg);
	var html = 
		'<div class="container">' +
		'<div class="name side">' + msg["username"] + '</div>' +
		'<div class="amount side">' + msg["amount"] + ' ' + msg["currency"]+ '</div>' +
		'<div class="back side"></div>' +
		'<div class="left side"></div>' +
		'<div class="right side"></div>' +
		'<div class="top side"></div>' +
		'<div class="bottom side"></div>' +
		'<div class="coins aside"></div>' +
		'<div class="front side"></div>' +
		'</div>';

	setTimeout(function() { msg["message"]); }, 5000);
	//var a = new Audio('https://www.donationalerts.ru/api/getvoice?text=%D1%84&language=ru_RU&voice=male_1&rate=medium&alert_id=40345839&alert_type=1');
	//a.play();

	document.body.innerHTML = html;
	console.log(msg);
});

function playSound(url) {

}
myspeak('');
setTimeout(function() { myspeak('Синтетический голос загружен, скрипт подключён'); }, 1000);

function myspeak(text){
	var utterThis = new window.SpeechSynthesisUtterance(text);
	var synth = window.speechSynthesis;
	voices = synth.getVoices();
	utterThis.voice = voices[18];
	synth.speak(utterThis);
}
