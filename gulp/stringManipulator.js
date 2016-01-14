'use strict';

// Remove path and extension leaving only the file name.
exports.getFilenameFromPath = function (file) {
  var index = file.lastIndexOf('/');
  if (index != -1) {
    file = file.substring(index + 1).split('.js').join('');
  }
  return file;
};

exports.getStringBetweenTwoStrings = function (content, start, end, offsetStart, offsetEnd) {
  offsetStart = typeof offsetStart !== 'undefined' ? offsetStart : 0;
  offsetEnd = typeof offsetEnd !== 'undefined' ? offsetEnd : 0;
  return content.substring(content.indexOf(start) + start.length + offsetStart, content.indexOf(end) - offsetEnd);
};

exports.replaceAll = function (str, find, replace) {
  return str.replace(new RegExp(find, 'g'), replace);
}
