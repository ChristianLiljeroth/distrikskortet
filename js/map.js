var map;
var addingNewDistrict = false;
var newCoordinates = Array();
var markers = Array();
var districtDrawn = false;
var singleDist = Array();
var singleInfo = Array();
var singleVisit = Array();

$(document).ready(function(){
	map = new google.maps.Map(document.getElementById('map'), {
		zoom: 11,
		center: {lat:55.658008, lng:12.301009},
		mapTypeId: 'roadmap'
	});
	drawMap();
	toggleFullScreen();
	createElement('link')
	createElement('search')
			
	document.getElementById("search").addEventListener("keydown", function(e) {
		if (e.keyCode == 13) {
			drawDistrict(document.getElementById('search').value);
		}
	});
});

setTimeout(function(){
	var params = getParameters(window.location.href);
	if (params.distrikt != undefined && params.distrikt != "null") {
		$.ajaxSetup({async: false});
		drawDistrict(params.distrikt);
	}
	if (params.adresse != undefined && params.koordinater != undefined) {
		var coords = {
			lat: Number(params.koordinater.split(",")[0]),
			lng: Number(params.koordinater.split(",")[1])
		};
		console.dir(coords);
		$(document).ready(function(){
			addressInfo = new google.maps.InfoWindow({
				content: params.adresse,
				position: coords
			});
			addressInfo.setMap(map);
		});
	}
}, 1000);

function getParameters(url) {
	var params = {};
	var parser = document.createElement('a');
	parser.href = url;
	var query = parser.search.substring(1);
	var vars = query.split('&');
	for (var i = 0; i < vars.length; i++) {
		var pair = vars[i].split('=');
		params[pair[0]] = decodeURIComponent(pair[1]);
	}
	return params;
};

function drawMap() {
	if (currentDistrict == undefined) {
		var Polygon = new google.maps.Polygon({
			paths: hundige,
			strokeColor: '#FF0000',
			strokeOpacity: 0.8,
			strokeWeight: 2,
			fillOpacity: 0
		});
		Polygon.setMap(map);
	
		var mapLabel = new MapLabel({
          text: 'Hundige',
          position: targetCenter(hundige),
          map: map,
          fontSize: 20,
          align: 'center'
        });
        mapLabel.set('position', new google.maps.LatLng(55.652925, 12.238840));
			
		Polygon = new google.maps.Polygon({
			paths: brondbyVest,
			strokeColor: '#FF0000',
			strokeOpacity: 0.8,
			strokeWeight: 2,
			fillOpacity: 0
		});
		Polygon.setMap(map);
		
		 var mapLabel = new MapLabel({
          text: 'Brøndby Vest',
          position: targetCenter(brondbyVest),
          map: map,
          fontSize: 20,
          align: 'center'
        });
        mapLabel.set('position', new google.maps.LatLng(55.654665, 12.393591));
			
		var Polygon = new google.maps.Polygon({
			paths: tranegilde,
			strokeColor: '#FF0000',
			strokeOpacity: 0.8,
			strokeWeight: 2,
			fillOpacity: 0
		});
		Polygon.setMap(map);
		
		 var mapLabel = new MapLabel({
          text: 'Tranegilde',
          position: targetCenter(tranegilde),
          map: map,
          fontSize: 20,
          align: 'center'
        });
        mapLabel.set('position', new google.maps.LatLng(55.625856, 12.362034));
			
	} else {
		var Polygon = new google.maps.Polygon({
			paths: currentDistrict,
			strokeColor: '#FF0000',
			strokeOpacity: 0.8,
			strokeWeight: 2,
			fillOpacity: 0,
			clickable: false
		});
		Polygon.setMap(map);
	
	}
}

function createElement(id) {
	var element = document.getElementById(id);
	element.style.display = 'block';
	element.style.margin = '10px';
	map.controls[google.maps.ControlPosition.TOP_CENTER].push(element);
}	
	
function toggleFullScreen() {
	var el = document.documentElement
	, rfs = // for newer Webkit and Firefox
	el.requestFullScreen
	|| el.webkitRequestFullScreen
	|| el.mozRequestFullScreen
	|| el.msRequestFullScreen
	;
	if(typeof rfs!="undefined" && rfs){
		rfs.call(el);
	} else if(typeof window.ActiveXObject!="undefined"){
		// for Internet Explorer
		var wscript = new ActiveXObject("WScript.Shell");
		if (wscript!=null) {
			wscript.SendKeys("{F11}");
		}
	}
}

function drawDistrict(result) {
	$("html").addClass("wait");
	setTimeout(function(){
	var distsToDraw = Array();
	var drawDist = Array();
	var center = Array();
	var multipleDists = result.split(",");
	var sequencedDists = result.split("-");
	var addressInfo;
	
	if (districtDrawn == true) {
		singleDist.forEach(function(element) {
			element.setMap(null);
		})
		singleInfo.forEach(function(element) {
			element.setMap(null);
		})
		for (var i = 0; i < singleInfo.length; i++){
			singleVisit[i].forEach(function(element) {
				element.setMap(null);
			})
		}
	}
	for (var i = 0; i < currentData[2].length; i++){
		var address = currentData[2][i].street+" "+currentData[2][i].number;
		if (currentData[2][i].floor != null || currentData[2][i].door != null) {
			address = address+",";
		}
		if (currentData[2][i].floor != null) {
			address = address+" "+currentData[2][i].floor+".";
		}
		if (currentData[2][i].door != null) {
			address = address+" "+currentData[2][i].door+".";
		}
		if ($.isNumeric(sequencedDists[0]) && $.isNumeric(sequencedDists[1]) && Number(currentData[2][i].district) >= Number(sequencedDists[0]) && Number(currentData[2][i].district) <= Number(sequencedDists[1])) {
			if ($.inArray(currentData[2][i].district, drawDist) == -1) {
				drawDist.push(currentData[2][i].district);
			}
		} else if ($.isNumeric(multipleDists[0]) && $.isNumeric(multipleDists[1])) {
			multipleDists.forEach(function(element) {
				if (currentData[2][i].district == element) {
					if ($.inArray(currentData[2][i].district, drawDist) == -1) {
						drawDist.push(currentData[2][i].district);
					}
				}
			})
		} else if (currentData[2][i].district == result || currentData[2][i].district != null && $.isNumeric(result) == false && address.toLowerCase().includes(result.toLowerCase())) {
			if ($.inArray(currentData[2][i].district, drawDist) == -1) {
				drawDist.push(currentData[2][i].district);
			}
		}
	}
	
	drawDist.forEach(function(element) {
		var coordinates = Array();
		currentDistrictData[element][2].forEach(function(elementt) {
			var coordinate = {
				num: element,
				lat: elementt.lat,
				lng: elementt.lng,
				address: elementt.address
			};
			coordinates.push(coordinate);
		})
		distsToDraw.push(coordinates);
	})
	
	for (var i = 0; i < distsToDraw.length; i++){
		var newMap = hull(distsToDraw[i], 0.01, ['.lng', '.lat']);
		var center = targetCenter(newMap);
		newMap = grantMargin(newMap);
	
		singleDist[i] = new google.maps.Polygon({
			paths: newMap,
			strokeColor: '#000000',
			strokeOpacity: 0.8,
			strokeWeight: 2,
			fillOpacity: 0,
			clickable: false
		});

		singleInfo[i] = new google.maps.InfoWindow({
			content: distsToDraw[i][0].num.toString(),
			position: targetTopLeft(newMap)
		});
		
		singleVisit[i] = Array();
		for (var j = 0; j < distsToDraw[i].length; j++){
			singleVisit[i][j] = new google.maps.Circle({
				address: distsToDraw[i][j].address.split(",")[0],
				strokeOpacity: 1,
				strokeWeight: 0.5,
				fillColor: '#FF0000',
				fillOpacity: 0.35,
				map: map,
				radius: 5,
				center: distsToDraw[i][j]
			});
			singleVisit[i][j].setMap(map);
			google.maps.event.addListener(singleVisit[i][j], 'click', function (event) {
				var name = this.address;
				var position = this.center;
				addressInfo = new google.maps.InfoWindow({
					content: name,
					position: position
				});
				addressInfo.setMap(map);
			});  
		}
		
		singleDist[i].setMap(map);
		singleInfo[i].setMap(map);
	
		map.setZoom(16);
		map.panTo(center);
	
		districtDrawn = true;
	}
	$("html").removeClass("wait");
	}, 100);
}

function targetCenter(coordinates) {
	var highestLat = 0;
	var highestLng = 0;
	var lowestLat = 100;
	var lowestLng = 100;
	coordinates.forEach(function(element) {
		if (element.lat > highestLat) {
			highestLat = element.lat;
		}
		if (element.lng > highestLng) {
			highestLng = element.lng;
		}
		if (element.lat < lowestLat) {
			lowestLat = element.lat;
		}
		if (element.lng < lowestLng) {
			lowestLng = element.lng;
		}
	})
	
	var center = {
		lat: ((highestLat-lowestLat)/2)+lowestLat,
		lng: ((highestLng-lowestLng)/2)+lowestLng
	};
	return center;
}

function targetTopLeft(coordinates) {
	var highestLat = 0;
	var lowestLng = 100;
	var topLeft;
	coordinates.forEach(function(element) {
		if (element.lat > highestLat) {
			highestLat = element.lat;
			topLeft = element;
		}
		if (element.lat == highestLat && element.lng < lowestLng) {
			lowestLng = element.lng;
			topLeft = element;
		}
	})
	return topLeft;
}

function grantMargin(coordinates) {
	
	if (coordinates.length == 1) {
		var coordinate = coordinates[0];
		coordinates = Array();
		var coord = {
			lat: coordinate.lat + 0.0002,
			lng: coordinate.lng + 0.0002
		}
		coordinates.push(coord);
		
		coord = {
			lat: coordinate.lat - 0.0002,
			lng: coordinate.lng + 0.0002
		}
		coordinates.push(coord);
		
		coord = {
			lat: coordinate.lat - 0.0002,
			lng: coordinate.lng - 0.0002
		}
		coordinates.push(coord);
		
		coord = {
			lat: coordinate.lat + 0.0002,
			lng: coordinate.lng - 0.0002
		}
		coordinates.push(coord);
	}
	
	return coordinates;
}