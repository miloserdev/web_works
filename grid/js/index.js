//url(https://picsum.photos/201/200)
$('.img').each(function( index ) {
	  $(this).css('background', 'url(https://picsum.photos/' + parseInt(200 + index) + '/200) no-repeat center center' );
});