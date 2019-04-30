<?php
	$_POSTDATA = json_decode(file_get_contents("php://input"), true);
	file_put_contents("test.txt", json_encode($_POSTDATA));
?>