<?php

switch($_REQUEST['fun']) {
	case 'saveNewVisits':
		saveNewVisits($_REQUEST['visits'], $_REQUEST['action'], $_REQUEST['districtName']);
		break;
	default:
		break;
}

function saveNewVisits($visits, $action, $districtName) {
	$write = fopen($districtName.'Data.json', $action);
	$result = 'var '.$districtName.'Data = '.$visits;
	fwrite($write, $result);	
	fclose($write);	
}
?>

