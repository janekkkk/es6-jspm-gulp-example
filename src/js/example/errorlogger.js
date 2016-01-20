/*
 * This scripts sends Javascript errors that occur on the client to the server, so they can be logged. This is done so we can reveal errors that we could otherwise not know about.
 * The script should be included on all the pages that Javascript errors should be logged on.
 *
 * Notes:
 * - There's a limit to the total number of errors that will be logged by this script.
 * - An error is only logged once in this script, if the same error occurs again later there will be no logging.
 * - Doesn't work with Opera (tested 11.50). The onerror event is not supported). This does not cause errors, there just is no error logging in that case.
 *
 * Usefull links related to this script:
 * - Error logging example: http://www.the-art-of-web.com/javascript/ajax-onerror/, checked 4-8-2011.
 * - Documentation about the window.onerror handler, http://docstore.mik.ua/orelly/web/jscript/refp_449.html, checked 4-8-2011.
 */

// Put the whole code in try/catch statement, so even if some unsupported / unknown / ancient browser would cause errors it has no consequences for the rest of the page.
try {
  // Put all the functions in a local scope, so this script cannot interfere with any existing custom functions.
  ( function () {
    // Keep a list of all the Javascript errors that occured on this page.
    var occuredJavascriptErrorsList = new Array();

    // An object used to store Javascript error information in.
    function JavascriptError(message, fileName, lineNumber, column, error) {
      try {
        this.message = message;
        this.fileName = fileName;
        this.lineNumber = lineNumber;
        this.column = column;
        this.error = error;
      }
      catch (exception) {
      }

      this.getStack = function () {
        if ('stack' in this.error) {
          return this.error.stack
        }
      }
    }

    // Function that gets called when a Javascript error occures.
    function javascriptErrorCaught(message, fileName, lineNumber, column, error) {
      try {
        // Create error object.
        var javascriptError = new JavascriptError(message, fileName, lineNumber, column, error);

        // Check if this error has not occured previously.
        for (var i = 0; i < occuredJavascriptErrorsList.length; i++) {
          var occuredError = occuredJavascriptErrorsList[i];

          if (occuredError.message == message && occuredError.fileName == fileName && occuredError.lineNumber == lineNumber) {
            // Stop, this error has already been logged before.
            return;
          }
        }

        submitJavascriptError(javascriptError);

        occuredJavascriptErrorsList.push(javascriptError);

        // Only the first x number of javascript errors on the page should be logged.
        if (occuredJavascriptErrorsList.length >= 10) {
          // Unregister the onerror event so the next time an error occurs this function won't be called.
          window.onerror = null;
        }
      }
      catch (exception) {
      }
    }

    // Function that sends the error message, fileName, lineName, userAgent and OS-version to the server.
    function submitJavascriptError(error) {
      try {
        // Used to generate a timestamp which is sent with the AJAX-request to prevent caching.
        var date = new Date();

        // Generate the string used as GET-parameters
        // The message and antiCache perameter should always be present.
        var queryString = 'message=' + encodeURIComponent(error.message)
          + '&antiCache=' + date.getTime()
          + '&url=' + window.location.href;

        // in Safari only the message of an error is available, in other browsers it might be different, check for that here.
        if (error.fileName && error.fileName != 'undefined') // In Safari, an undefined fileName is noticed by a string value of literally "undefined"...
        {
          queryString += '&fileName=' + encodeURIComponent(error.fileName);
        }
        if (error.lineNumber) {
          queryString += '&lineNumber=' + encodeURIComponent(error.lineNumber);
        }
        if (error.getStack()) {
          queryString += '&stack=' + encodeURIComponent(error.getStack());
        }

        // The userAgent and oscpu properties may not be available on all clients.
        if (navigator && navigator.userAgent) {
          queryString += '&userAgent=' + encodeURIComponent(navigator.userAgent);
        }
        if (navigator && navigator.oscpu) {
          queryString += '&osVersion=' + encodeURIComponent(navigator.oscpu);
        }

        // Submit the data to the server
        var xhr;
        if (window.XMLHttpRequest) {
          xhr = new XMLHttpRequest;
        }
        else {
          xhr = new ActiveXObject('Microsoft.XMLHTTP');
        }
        xhr.open('GET', '/ajax/js_error_logger.php?' + queryString, true);
        xhr.send();

        // Returning false means the error was not handled by this function. The browser should continue the default error handling after this function was executed.
        return false;
      }
      catch (exception) {
      }
    }

    // Register the onerror event, but don't override it if it was already defined somewhere else.
    if (window.onerror == undefined) {
      window.onerror = javascriptErrorCaught;
    }
  }() );
}
catch (exception) {
  // This means the browser is failing at failing.
  // Ignore the exceptions, error logging won't work, but at least the rest of the page can continue to work properly.
}
console.log('Error logger loaded...');
