<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <title>ES6 + JSPM + Gulp</title>
  <link rel="stylesheet" href="css/app.css" charset="utf-8">
</head>
<body>
<?php
echo '<h1>Hello JSPM! This is index.php</h1>';
?>
<a href="secondpage.php">second page</a>
<script src="lib/system.js"></script>
<script src="config.js"></script>
<script>System.import( './js/app' )</script>
<script>console.log( "test" );</script>
</body>
</html>
