$(document).ready(function(){
	document.getElementById("search").addEventListener("keydown", function(e) {
		if (e.keyCode == 13) {
			searchDistricts();
		}
	});
});

function searchDistricts() {
	$("html").addClass("wait");
	setTimeout(function(){
	var t = "<thead><tr><th class='number'>Distrikt</th><th>Navn</th><th class='number'>Antal Besøg</th><th>Kort</th></tr></thead><tbody>";
	document.getElementById("addressTable").innerHTML = t;
	var result = document.getElementById('search').value;

	for (var i = 0; i < 1000; i++){
		if (currentDistrictData[i] != null) {
			var addressMatch = false;
			for (var j = 0; j < currentDistrictData[i][2].length; j++){
				if (currentDistrictData[i][2][j].address.toLowerCase().includes(result.toLowerCase())) {
					addressMatch = true;
					j = 1000;
				}	
			}
			if (document.getElementById("number").checked && currentDistrictData[i][1] == result || document.getElementById("name").checked && currentDistrictData[i][0] == result || document.getElementById("addresses").checked && addressMatch == true) {
				var tr = "<tr>";
				tr += "<td>"+currentDistrictData[i][1]+"</td>";
				tr += "<td>"+currentDistrictData[i][0]+"</td>";
				tr += '<td>'+currentDistrictData[i][2].length+'</td>';
				tr += '<td><a href="/kort.html?distrikt='+currentDistrictData[i][1]+'" target="_blank">'+'Distriktskort'+'</a></td>';
				tr += "</tr>";
				t += tr;
			}
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