var card = document.getElementsByClassName("card")[0];

card.addEventListener("mousemove", function (e) {
console.log("move");

	var ax = ($(window).innerWidth() / 2 - e.pageX) / 20;
	var ay = -($(window).innerHeight() / 2 - e.pageY) / 20;

	card.style.transform = "rotateY(" + ax + "deg) rotateX(" + ay + "deg) scale3d(1.07,1.07,1.07)";
});

card.addEventListener("mouseleave", function (e) {
	card.style.transform = "rotateY(" + 0 + "deg) rotateX(" + 0 + "deg)";
});
