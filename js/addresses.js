$(document).ready(function(){
	
	//$.ajaxSetup({async: false});
	//checkForChangedAddresses(currentDistrict)
	//var visits = getNewDawaData();
	//writeToFile(visits, 'w', currentDistrict[0].name);
	//loadOriginalFromCSV();
	//drawDistricts()
	
	document.getElementById("search").addEventListener("keydown", function(e) {
		if (e.keyCode == 13) {
			searchAddress();
		}
	});
});

function {
	var visits = Array();
	var dawaPath = "https://dawa.aws.dk/adresser?polygon=[[";
	currentDistrict.forEach(function(element) {
		dawaPath = dawaPath+"["+element.lng+","+element.lat+"],"
	});
	
	dawaPath = dawaPath+"["+currentDistrict[0].lng+","+currentDistrict[0].lat+"],"
	dawaPath = dawaPath.slice(0, -1);
	dawaPath = dawaPath+"]]&format=json";
	//document.write(dawaPath);
		
	$.getJSON(dawaPath, function(data) {
		
		var tempVisits = Array();
		var includedZips = Array();
		d = new Date();
		var date = d.getFullYear() + "-" + ("0"+(d.getMonth()+1)).slice(-2) + "-"+("0" + d.getDate()).slice(-2) + "T" + ("0" + d.getHours()).slice(-2) + ":" + ("0" + d.getMinutes()).slice(-2);
		
		visits.push(date);
	
		data.forEach(function(element) {
			var visit = {id:element.id, accessId:element.adgangsadresse.id, street:element.adgangsadresse.vejstykke.navn, number:element.adgangsadresse.husnr, floor:element.etage, door:element.dør, zip:element.adgangsadresse.postnummer.nr, district:null, coordinates:element.adgangsadresse.adgangspunkt.koordinater}
			tempVisits.push(visit);
			
			if ($.inArray(element.adgangsadresse.postnummer.nr, includedZips) == -1) {
				includedZips.push(element.adgangsadresse.postnummer.nr);
			}
		})
		
		visits.push(includedZips);
		visits.push(tempVisits);
	});
	return visits;
}

function checkForChangedAddresses() {
	var visitsUpdated = false;
	var visitsRemoved = false;
	var newVisits = Array();
	var deletedVisits = Array();
	var addedVisits = Array();
	var removedVisits = Array();
	var dawaPath = "https://dawa.aws.dk/replikering/haendelser?entitet=adgangsadresse&tidspunktfra="+currentData[0];

	includedZips = currentData[1];
	
	$.getJSON(dawaPath, function(data) {
		data.forEach(function(element) {
			if ($.inArray(element.data.postnr, includedZips) != -1) {
				if (element.operation == "insert" || element.operation == "update") {
					if (visitsUpdated == false) {
						visitsUpdated = true;
					}
					newVisits.push(element);
					document.write("New Visit");
				}
				
				if (element.operation == "delete") {
					if (visitsRemoved == false) {
						visitsRemoved = true;
					}
					deletedVisits.push(element);
					document.write("Removed Visit");
				}
			}
		})
	})
		
	if (visitsUpdated) {
		var visits = getNewDawaData(currentDistrict);
		var id = Array();
		newVisits.forEach(function(element) {
			id.push(element.data.id);
		})
		
		visits[2].forEach(function(element) {
			
			if ($.inArray(element.accessId, id) != -1) {
				addedVisits.push(element);
			}
		})
	
		addedVisits.forEach(function(element, index, object) {
			if ($.inArray(element, currentData[2]) == -1) {
				object.splice(index, 1);
			}
		})
	
		if (visitsRemoved) {
			var id = Array();
			deletedVisits.forEach(function(element) {
				id.push(element.data.id);
			})
	
			currentData[2].forEach(function(element) {
					
				
				//document.write(element.id);
				if ($.inArray(element.accessId, id) != -1) {
					removedVisits.push(element);
				}
			})
		}

		addedVisits.forEach(function(element) {
			document.write("<br> Added:" + element.address);
		})
		
		removedVisits.forEach(function(element) {
			document.write("<br> Removed:" + element.address);
		})
	}
}

function writeToFile(visits, action, districtName) {
	$.ajax({
		url: "data/data.php",
		type: "post",
		data: {fun: "saveNewVisits", visits:JSON.stringify(visits), action:action, districtName:districtName},
		error: function(jqXHR, textStatus, errorThrown) {
			console.dir(textStatus);
			console.dir(errorThrown);
		},
		success: function(response) {
			console.dir(response);
		}
	});
}

//This function is written as a one-time script to load the existing districtdata into the system
function loadOriginalFromCSV() {
	$.ajax({
		type: "GET",
		url: "data.txt",
		dataType: "text",
		success: function(allText) {
			var allTextLines = allText.split(/\r\n|\n/);
			var headers = allTextLines[0].split(';');

			for (var i=1; i<allTextLines.length; i++) {
				var data = allTextLines[i].split(';');
				
				if (data.length == headers.length) {

					brondbyVestData[2].forEach(function(element) {
						if (data[2].replace(/[^a-zA-Z ]/g, "") == element.street.replace(/[^a-zA-Z ]/g, "")
						&& Number(data[5].replace(/[^\d]/g, '') == Number(element.number.replace(/[^\d]/g, '')))
						&& Number(element.floor) >= Number(data[6])
						&& Number(element.floor) <= Number(data[7])
						|| data[2].replace(/[^a-zA-Z ]/g, "") == element.street.replace(/[^a-zA-Z ]/g, "")
						&& data[3]=="hele"
						&& data[4]=="vejen"
						|| data[2].replace(/[^a-zA-Z ]/g, "") == element.street.replace(/[^a-zA-Z ]/g, "")
						&& Number(element.number.replace(/[^\d]/g, '')) >= Number(data[3].replace(/[^\d]/g, ''))
						&& Number(element.number.replace(/[^\d]/g, '')) <= Number(data[4].replace(/[^\d]/g, ''))
						&& element.number.replace(/[^\d]/g, '')%2 == data[3].replace(/[^\d]/g, '')%2
						){
							//document.write("Found match: "+element.address+"<br>");
							element.district = data[0];
						}
					})
				}
			}
		}
	});
	writeToFile(brondbyVestData, "w", "brondbyVest");
}

function drawDistricts() {
	var districts = Array();
	var address = "";
	var inDist = {
		yes:0,
		no:Array()
		};
	console.dir(currentData);
	currentData[2].forEach(function(element) {
		if (element.district != null) {
			address = element.street+" "+element.number;
			
			if (element.floor != null || element.door != null) {
				address = address+",";
			}
			if (element.floor != null) {
				address = address+" "+element.floor+".";
			}
			if (element.door != null) {
				address = address+" "+element.door+".";
			}
			
			var visit = {
				lat: element.coordinates[1],
				lng: element.coordinates[0],
				address: address
			}
			if (districts[eval(element.district)] == undefined) {
				districts[eval(element.district)] = [];
				districts[eval(element.district)][1] = eval(element.district);
				districts[eval(element.district)][2] = [];
			}
			districts[eval(element.district)][2].push(visit);
			inDist.yes++;
		}
		else {
			inDist.no.push(element);
		}
	})
	writeToFile(districts, 'w', currentDistrict[0].name+"District");
	
	console.dir(districts);
	console.dir(inDist);
}

function searchAddress() {
	$("html").addClass("wait");
	setTimeout(function(){
	if (document.documentElement.clientWidth >=600) {
		var t = "<thead><tr><th>Adresse</th><th class='number'>Postnummer</th><th class='number'>Distrikt</th><th class='no-sort'>Kort</th></tr></thead><tbody>";
	} else {
		var t = "<thead><tr><th>Adresse</th><th>Post<br>nummer</th><th>Distrikt</th><th>Kort</th></tr></thead><tbody>";
	}
	document.getElementById("addressTable").innerHTML = t;
	var result = document.getElementById('search').value;
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
		if (document.getElementById("address").checked && address.toLowerCase().includes(result.toLowerCase()) || document.getElementById("zip").checked && currentData[2][i].zip == result || document.getElementById("district").checked && currentData[2][i].district == result) {
			var tr = "<tr>";
			tr += "<td>"+address+"</td>";
			tr += "<td>"+currentData[2][i].zip+"</td>";
			if (currentData[2][i].district == null) {
				var zeroIfNull = 0;
			} else {
				var zeroIfNull = currentData[2][i].district;
			}
			tr += '<td style="font-size:0px">'+zeroIfNull+'<input id="txt'+currentData[2][i].id+'" type="text" value="'+currentData[2][i].district+'"></input> <div class="buttonAddresses" id="'+currentData[2][i].id+'" onclick="saveChange(this.id)"> Gem </div></td>';
			tr += '<td><a href="https://www.google.dk/maps?q=loc:'+currentData[2][i].coordinates[1]+','+currentData[2][i].coordinates[0]+'" target="_blank">Google Maps</a><br><br><a href="/kort.html?adresse='+address+'&koordinater='+currentData[2][i].coordinates[1]+','+currentData[2][i].coordinates[0]+'&distrikt='+currentData[2][i].district+'" target="_blank">Distriktskort</a></td>';
			tr += "</tr>";
			t += tr;
		}
	}
	t += "</tbody>";
	document.getElementById("addressTable").innerHTML = t;
	$('table').tablesort();
	$('thead th.number').data('sortBy', function(th, td, sorter) {
		return parseInt(td.text(), 10);
	});
	$("html").removeClass("wait");
	}, 100);
}

function saveChange(id) {
	var result = document.getElementById("txt"+id).value;
	console.dir(result);
	
	for (var i = 0; i < currentData[2].length; i++){
		if (id == currentData[2][i].id) {
			currentData[2][i].district = result;
		}
	}
	writeToFile(currentData, "w", currentDistrict[0].name);
	drawDistricts(currentDistrict);
}