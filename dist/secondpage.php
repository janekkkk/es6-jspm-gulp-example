<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <title>ES6 + JSPM + Gulp</title>
  <link rel="stylesheet" href="app.min.css" charset="utf-8">
</head>
<body>
<?php
echo '<h1>Hello JSPM! This is the second page.php</h1>';
?>
<a href="index.php">index page</a>
<script src="app.min.js"></script>

<script>System.import( './js/secondapp' )</script>
<script>console.log( "test2" );</script>
</body>
</html>
