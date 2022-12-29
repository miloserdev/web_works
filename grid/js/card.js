var card = $('.card');
var shine = $('.shine');
var maxTilt = 15;

$(document).ready( function() {
	card.css('transition', 'all 0.2s ease-out'); //Edge от Microsoft хуйня и не может склеивать анимации и трансформы!
	card.css('transform-style', 'preserve-3d');
	card.append('<canvas class="shine" style="position: absolute;  pointer-events: none; z-index: 999999; overflow: hidden; border-radius: ' + $('.card').css('border-radius') + '; width: ' + $('.card').outerWidth() + 'px; height: ' + $('.card').outerHeight() + 'px""></canvas>');


	card.on('mousemove', function (e) {
		var width = $(this).outerWidth();
		var height = $(this).outerHeight();
		var left = $(this).offset().left;
		var top = $(this).offset().top;
		var ax = (e.pageX - left) / width;
		var ay = (e.pageY - top) / height;
		var tiltX = (maxTilt / 2 - ax * maxTilt);
		var tiltY = (ay * maxTilt - maxTilt / 2);
		var arad = Math.atan2(tiltX, tiltY);
		var angle = arad * 180 / Math.PI - 90;
		

		if (angle < 0) {
			angle = angle + 360;
		}

		$(this).children('.shine').css('background', 'linear-gradient(' + angle + 'deg, rgba(255,255,255,0) 0%,rgba(255,255,255,0.1) 100%)');
		$(this).css('transform', 'perspective(300px) rotateY(' + tiltX + 'deg) rotateX(' + tiltY + 'deg) scale(1.1)');
		//$(this).children('.shine').css('transform', 'translate(-50%, -50%)')

	});

	card.on('mouseenter', function (e) {
		$(this).css('box-shadow', '0px 10px 50px white');
		$(this).css('z-index', '99999');
		
	});

	card.on('mouseleave', function (e) {
		$(this).css('transform', 'rotateY(' + 0 + 'deg) rotateX(' + 0 + 'deg)');
		$(this).css('z-index', '');
		$(this).css('box-shadow', '');

		$(this).children('.shine').css('background', '');
	});
});