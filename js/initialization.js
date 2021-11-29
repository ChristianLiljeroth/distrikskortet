var currentDistrict;
var currentData;
var currentDistrictData;

if (sessionStorage.district != undefined) {
	$(document).ready(function(){
		chooseDistrict(JSON.parse(sessionStorage.getItem("district")))
	});
}

function chooseDistrict(district) {
	if (document.getElementById("intro") != null) {
		document.getElementById("intro").style.display = "none";
		document.getElementById("ActionChooser").style.display = "block";
		if (district[0].name == "brondbyVest") {
			document.getElementById("item2").style.display = "inline-block";
			document.getElementById("item3").style.display = "inline-block";
		}
		document.getElementById("distText").innerHTML = district[0].name;
	}
	sessionStorage.setItem("district", JSON.stringify(district));
	currentDistrict = district;
	loadDistricts(currentDistrict);
}

function loadDistricts(district) {
	$.ajax({
		url: 'data/'+district[0].name+'Data.json',
		dataType: "script",
		success: function() {
			currentData = eval(district[0].name+("Data"));
		}
	});
		
	$.ajax({
		url: 'data/'+district[0].name+'DistrictData.json',
		dataType: "script",
		success: function() {
			currentDistrictData = eval(district[0].name+("DistrictData"));
		}
	});
}

function unsetDistrict() {
	sessionStorage.district = undefined;
	location.reload();
}