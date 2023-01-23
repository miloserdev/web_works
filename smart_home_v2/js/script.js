document.addEventListener("DOMContentLoaded", (e) => {


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
    
//	  startValue: 0,
    
    valueChange: function (e) {
    }
});

var sliderObj = $("#slider2").data("roundSlider");
sliderObj.setValue(10);



	console.log("DOMContentLoaded");
});
