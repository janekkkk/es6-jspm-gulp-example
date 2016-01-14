<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <title>ES6 + JSPM + Gulp</title>
  <link rel="stylesheet" href="css/app.css" charset="utf-8">
</head>
<body>
<?php
echo '<h1>Hello JSPM! This is the second page.php</h1>';
?>
<a href="index.php">index page</a>
<script src="lib/system.js"></script>
<script src="config.js"></script>
<!-- build:javascript -->
<script>System.import('./js/secondapp')</script>
<!-- endbuild -->
</body>
</html>
