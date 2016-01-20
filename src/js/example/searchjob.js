module.exports.SearchJob = ( function( $ )
{
  'use strict';

  /**
   * Private variables
   */
  // The search parameters, these are exposed through methods
  var baseUrl = location.protocol + '//' + location.host + location.pathname;
  var ajaxBaseUrl = location.protocol + '//' + location.host + '/ajax' + location.pathname;
  var ot = '';
  var days = '';
  var hours = [];
  var c = [];
  var edu = [];
  var s = '';
  var p = '';
  var rad = '';
  var r = '';
  var branchId = '';
  var page = '';

  // Helper variables
  var daysSelectorId = '';
  var eraseFiltersId = '';
  var daysOptions = [];
  var changes = false;
  var currentRequest = null;
  var erroredRequests = 0;
  var itemsInCollapsedBlock = 4;
  // The History.js library. Note: it uses a capital H instead of HTML5s lower h
  var History = window.History;
  var noHistorySearch = false;

  /**
   * This function fixes a bug. Without this code, the following could happen:
   * 1. Go to a landing page, e.g. /amsterdam
   * 2. Click a category in the refinements list. You'll be directed to the usual search results.
   * 3. Press the back button of your browser.
   * 4. You see that the category you clicked on is checked, because the browser remembered the user input.
   *
   * This function unchecks all checkboxes in the refinement list that do not have a gray background when the page loads.
   */
  $( document ).ready( function()
  {
    $( '.searchRefinements .refinement' )
      .find( '.checkbox:not( .checked )' )
      .find( 'input:checked' )
      .prop( 'checked', false );
  });

  /*
   * Attach default event listeners
   */
  // Make it possible to open/close the refinements
  $( document ).on( 'click', '.refinement .header', function()
  {
    $( this )
      .parent()
      .toggleClass( 'open closed' );
  } );
  // Make it possible to show more info
  $( document ).on( 'click', '.refinement .more', function()
  {
    var strMore = '+ meer';
    var strLess = '- minder';
    var currentText = $( this ).text();
    if( currentText.toLowerCase().indexOf( strMore.toLowerCase() ) >= 0 )
    {
      $( this )
        .parents( '.refinement' )
        .find( '.content > div' )
        .slideDown();
      $( this ).text( currentText.replace( strMore, strLess ) );
    }
    else
    {
      $( this )
        .parents( '.refinement' )
        .find( '.content .collapsed' )
        .slideUp();
      $( this ).text( currentText.replace( strLess, strMore ) );
    }
  });
  $( document ).on( 'click', '#toggleSearchForm', function()
  {
    jQuery( '.searchRefinements' ).hide();
    jQuery( '.searchJobFormAboveResults' ).toggle();

    switchActive( this );
  } );
  $( document ).on( 'click', '#toggleSearchRefinements', function()
  {
    jQuery( '.searchJobFormAboveResults' ).hide();
    jQuery( '.searchRefinements' ).toggle();

    switchActive( this );
  } );
  $( document ).on( 'click', '.job-result:not(.job-result--archived):not(.job-result--ad)', function( e )
  {
    // When a job result is clicked, we change the current location to the url described in .job-result__title
    window.location.href = $( this ).find( '.job-result__title' ).attr( 'href' );
  } );
  $( document ).on( 'click', 'a.job-result__title', function( e )
  {
    e.stopPropagation();
  } );

  /**
   * Remembers the active toggle
   * @type @exp;
   */
  var $activeToggle;

  /**
   * Function to switch the active toggle.
   * Deactivates the old toggle, and remembers the new toggle
   * @param HTMLElement toggle The toggle that will be the new active toggle
   */
  var switchActive = function( toggle )
  {
    if( $activeToggle && !$activeToggle.is( toggle ) )
    {
      $activeToggle.removeClass( 'active' );
    }

    $activeToggle = jQuery( toggle ).toggleClass( 'active' );
  };

  /**
   * To make sure a JobSeeker can go back to his search results from a job detail page,
   * we log all the search queries and insert them into the history.
   * This way, the JobSeeker can use his browsers back button and get to the correct page
   * We use a library for this called History.js
   *
   * Logging searches in the browsers history is not always required,
   * so we have to make sure we constantly check if the History object is available
   */
  if( History && History.enabled && History.Adapter )
  {
    // Bind to State Change
    // Note: We are using statechange instead of HTML5s popstate
    History.Adapter.bind( window, 'statechange', function()
    {
      // Note: We are using History.getState() instead of HTML5s event.state
      var State = History.getState();

      // Sometimes a History state is pushed, which should not trigger a new search, this prevents this
      if( noHistorySearch )
      {
        // Parse the data which belongs to the current state
        if( State.data && State.data.checked )
        {
          State.data.checked.c = State.data.checked.c ? State.data.checked.c : [];
          State.data.checked.education = State.data.checked.education ? State.data.checked.education : [];
          State.data.checked.hours = State.data.checked.hours ? State.data.checked.hours : [];
          State.data.checked.recruiter = State.data.checked.recruiter ? [ State.data.checked.recruiter ] : [];
          State.data.checked.branch = State.data.checked.branch ? [ State.data.checked.branch ] : [];

          // Make sure the correct refinements are selected & shown
          setRefinements( State.data.checked );
        }

        noHistorySearch = false;
        return;
      }

      // If there is an URL to load, load the new content
      if( typeof State.data.url !== 'undefined' )
      {
        loadContent( State.data.url, State.data.ajax );
      }

      // Parse the data which belongs to the current state
      if( State.data && State.data.checked )
      {
        State.data.checked.c = State.data.checked.c ? State.data.checked.c : [];
        State.data.checked.education = State.data.checked.education ? State.data.checked.education : [];
        State.data.checked.hours = State.data.checked.hours ? State.data.checked.hours : [];
        State.data.checked.recruiter = State.data.checked.recruiter ? [ State.data.checked.recruiter ] : [];
        State.data.checked.branch = State.data.checked.branch ? [ State.data.checked.branch ] : [];

        // Make sure the correct refinements are selected & shown
        setRefinements( State.data.checked );
      }
    });
  }

  /**
   * Resets all variables
   * @return this For fluent interface
   */
  var reset = function()
  {
    s = '';
    p = '';
    rad = '';
    return clear();
  };
  /**
   * Clears the refinements
   * @return this For fluent interface
   */
  var clear = function()
  {
    ot = '';
    days = '';
    hours = [];
    c = [];
    edu = [];
    r = '';
    branchId = '';
    page = '';
    changed();

    $( '.searchRefinements input' )
      .prop( 'checked', false )
      .closest( '.checkbox' )
      .removeClass( 'checked' );

    $( '#' + daysSelectorId ).val( daysOptions.length - 1 ).change();

    return this;
  };
  /**
   * Checks if there are refinements active
   * @return bool
   */
  var hasActiveRefinements = function()
  {
    return ( days != '' && parseInt( days ) >= 0 ) || hours.length > 0 || c.length > 0 || edu.length > 0 || r != '' || branchId != '';
  };
  /**
   * Logs the change. Hides/Shows the remove active refinements button
   */
  var changed = function()
  {
    changes = true;
    var filterButton = $( '#' + eraseFiltersId );
    if( filterButton.length )
    {
      // Also animate the image, for IE
      filterButton = filterButton.add( '#' + eraseFiltersId + ' img' );
      if( hasActiveRefinements() )
      {
        filterButton
          .stop( true, false )
          .css( 'visibility', 'visible' )
          .animate( { opacity: '1' } );
      }
      else
      {
        filterButton
          .stop( true, false )
          .animate( { opacity: '0' }, function()
          {
            $( this ).css( 'visibility', 'hidden' );
          } );
      }
    }
  };

  var init = function()
  {
    if( History && History.enabled )
    {
      var State = History.getState();

      // Parse the data which belongs to the current state
      if( State.data && State.data.checked )
      {
        State.data.checked.c = State.data.checked.c || [];
        State.data.checked.education = State.data.checked.education || [];
        State.data.checked.hours = State.data.checked.hours || [];
        State.data.checked.recruiter = [ State.data.checked.recruiter ] || [];
        State.data.checked.branch = [ State.data.checked.branch ] || [];

        // Make sure the correct refinements are selected & shown
        setRefinements( State.data.checked );
      }

      // Get the current State from the History object
      if( !State.data.url || typeof State.data.url === 'undefined' )
      {
        // The first page is not loaded with AJAX, so it is not logged with History.js.
        // But we do want History.js to be able to go back to the first page

        // We do not want History.js to trigger an actual search
        noHistorySearch = true;
        var state = {
          url: buildUrl(),
          ajax: true,
          // c, education and hours are used as prefixes for the IDs of the checkboxes. These have to be equal!
          checked: { c: c, education: edu, hours: hours, recruiter: r, branch: branchId }
        };
        // Replaces the current state in History.js, which makes it possible to
        // use the browsers back button to get to the first view
        History.replaceState( state, document.title, state.url );

        // Makes sure next History.js searches are being performed
        noHistorySearch = false;
      }
    }
  };

  var setUrl = function( url )
  {
    baseUrl = url;
    return this;
  };
  var setEraseFiltersId = function( id )
  {
    eraseFiltersId = id;
    return this;
  };
  var setSearch = function( search )
  {
    s = search;
    changed();
    return this;
  };
  var setPlace = function( place )
  {
    p = place;
    changed();
    return this;
  };
  var setRadius = function( radius )
  {
    rad = radius;
    changed();
    return this;
  };
  var setPage = function( p )
  {
    page = p;
    changed();
    return this;
  };
  var setOrderBy = function( field )
  {
    ot = field;
    changed();
    return this;
  };
  var setDays = function( amountOfDays )
  {
    days = amountOfDays;
    changed();
    return this;
  };

  var addDaysOption = function( dayOption )
  {
    daysOptions.push( dayOption );
    changed();
    return this;
  };

  /*
   * Helper functions for the objects below
   */
  var addToArray = function( arr, value )
  {
    arr.push( value );
  };
  var removeFromArray = function( arr, value )
  {
    var index = arr.indexOf( value );
    if( index >= 0 )
    {
      arr.splice( index, 1 );
    }
  };

  var toggleHours = function( hoursType )
  {
    var index = hours.indexOf( hoursType );
    if( index >= 0 )
    {
      removeFromArray( hours, hoursType );
    }
    else
    {
      addToArray( hours, hoursType );
    }
    changed();
    return this;
  };
  var removeHours = function()
  {
    hours = [];
    changed();
    return this;
  };

  var toggleCategory = function( category )
  {
    var index = c.indexOf( category );
    if( index >= 0 )
    {
      removeFromArray( c, category );
    }
    else
    {
      addToArray( c, category );
    }
    changed();
    return this;
  };
  var removeCategories = function()
  {
    c = [];
    changed();
    return this;
  };

  var toggleEducation = function( education )
  {
    var index = edu.indexOf( education );
    if( index >= 0 )
    {
      removeFromArray( edu, education );
    }
    else
    {
      addToArray( edu, education );
    }
    changed();
    return this;
  };
  var removeEducations = function()
  {
    edu = [];
    changed();
    return this;
  };

  var setRecruiter = function( recruiter )
  {
    r = ( recruiter != r ? recruiter : '' );
    changed();
    return this;
  };
  var setBranchId = function( id )
  {
    branchId = ( id != branchId ? id : '' );
    changed();
    return this;
  };

  /**
   * The search function. If History.js is available, this is used to load the
   * new content. If it isn't, the content is loaded immediately.
   * @param bool useAjax Whether AJAX should be used
   * @param bool force Whether a search should be forced, even if no changes were made
   * @return bool If the search was performed
   */
  var search = function( useAjax, force )
  {
    if( typeof useAjax === 'undefined' )
    {
      useAjax = false;
    }
    if( changes || force )
    {
      var url = buildUrl();

      if( History && History.enabled )
      {
        var state = {
          url: url,
          ajax: useAjax,
          // c, education and hours are used as prefixes for the IDs of the checkboxes. These have to be equal!
          checked: { c: c, education: edu, hours: hours, recruiter: r, branch: branchId }
        };
        History.pushState( state, document.title, url );
      }
      else
      {
        loadContent( url, useAjax );
      }

      changes = false;
      return true;
    }
    return false;
  };

  /**
   * Function to actually load the new content.
   * Uses AJAX or simple redirect
   * @param string url The url to load content from
   * @param bool useAjax If AJAX should be used to load the content
   * @return this For fluent interface
   */
  var loadContent = function( url, useAjax )
  {
    if( !useAjax )
    {
      window.location = baseUrl + url;
    }
    else
    {
      // If there is a current request, we want to abort it
      if( currentRequest )
      {
        currentRequest.abort();
      }

      Overlay.show();
      currentRequest = $.ajax({
        type: 'get',
        url: ajaxBaseUrl + url,
        dataType: 'html',
        success: function( data )
        {
          // make sure ga exists
          // jscs:disable
          (function(i,s,o,g,r,a,m){
            i['GoogleAnalyticsObject']=r;i[r]=i[r]||function(){(i[r].q=i[r].q||[]).push(arguments)},i[r].l=1*new Date();
          })(window,document,'script','//www.google-analytics.com/analytics.js','ga');
          // jscs:enable

          ga( 'send', 'pageview', location.pathname + url );

          // Remove the reference to the current request
          currentRequest = null;
          // Insert the new content
          var $data = $( '<div>' ).html( data );
          jQuery( '#js-search-results-header' ).replaceWith( $data.find( '#js-search-results-header' ) );
          jQuery( '#js-search-results-content' ).replaceWith( $data.find( '#js-search-results-content' ) );
          // A pager is not always available
          var $dataPager = $data.find( '#js-search-results-pager' );
          if( $dataPager.length )
          {
            jQuery( '#js-search-results-pager' ).replaceWith( $dataPager );
          }
        },
        error: function( jqXHR, textStatus, errorThrown )
        {
          if( textStatus !== 'abort' )
          {
            if( erroredRequests++ < 3 )
            {
              loadContent( url, useAjax );
            }
            else
            {
              throw new Error( 'LoadContent error: [' + textStatus + '] ' + errorThrown );
            }
          }
        },
        complete: function()
        {
          Overlay.hide();
        }
      });
    }
    return this;
  };

  var setupSlider = function( $selector )
  {
    for( var value = 0, l = daysOptions.length; value < l && daysOptions[ value ][ 0 ] != days; value++ )
    {
      ;
    }

    $selector.attr(
      {
        min: 0,
        max: daysOptions.length - 1,
        step: 1,
        value: value
      }
    );
  };

  /**
   * Builds the slider for selecting the days period
   * @uses rangeslider.js component Slider
   * @return this For fluent interface
   * @param {boolean} landingPage - If the page where it's initialized is a landing page, default is true
   */
  var buildDaysSelector = function( selectorId, captionId )
  {
    daysSelectorId = selectorId;
    var $selector = jQuery( '#' + selectorId );

    setupSlider( $selector );

    $selector.rangeslider(
      {
        polyfill: false,

        onSlide: function( position, value )
        {
          days = daysOptions[ value ][ 0 ];
          jQuery( '#' + captionId ).text( daysOptions[ value ][ 1 ] );
          jQuery( '.rangeslider__handle' ).css( 'left', '-=1px' );
        },

        onSlideEnd: function()
        {
          changed();
          search( window.useAjax );
        }

      } );

    $selector.rangeslider( 'update', true );

    return this;
  };

  /**
   * Object to manipulate the overlay for when the search results are being loaded
   */
  var Overlay = {
    $overlay: null,
    $img: null,
    show: function()
    {
      if( !this.$overlay )
      {
        this.$img = $( '<img>', { src: '/images/loading.gif' } );

        this.$overlay = $( '<div>' );
        this.$overlay.addClass( 'overlay' );
        this.$overlay.append( this.$img );
      }
      this.$overlay.appendTo( '#js-search-results' );
      this.$img.css( 'width', this.$img.outerWidth() ? this.$img.outerWidth() : 'auto' );
      this.$overlay.show();
    },
    hide: function()
    {
      this.$overlay.hide();
    }
  };
  /**
   * Function to update the counter after each refinement
   */
  var setRefinementsCount = function( param )
  {
    var i, l,
      biggest, biggestShown,
      type, typeList,
      id, $checkbox, $container;

    var postSlideUp = function()
    {
      // Doing this first would make the container show briefly, just to
      // slide up immediately, so execute it after the slide up is finished
      $( this ).removeClass( 'disabled' );
    };

    var postSlideDown = function()
    {
      // if $(this) would have not been slid up, removing these classes
      // would immediately show the refinement without sliding down
      $( this ).removeClass( 'disabled collapsed' );
    };

    for( type in param )
    {
      // Set the variables to default for this loop
      biggest = [];
      typeList = param[ type ];
      // This loop fills the array biggestShown with itemsInCollapsedBlock times value of false
      // These are used later to track if the correct amount of items is shown
      for( biggestShown = []; biggestShown.length < itemsInCollapsedBlock; biggestShown.push( false ) )
      {
        ;
      }

      if( typeof typeList === 'undefined' )
      {
        continue;
      }

      // If refinements with the class collapsed are hidden, we are not showing all
      var $more = $( '.' + type + '-block .more' );
      var collapse = $more.length;
      var showAll = $more.text().trim() !== '+ meer opties';

      // Calculate the biggest refinements
      for( i = 0, l = typeList.length; i < l; i++ )
      {
        var count = parseInt( typeList[ i ].count ? typeList[ i ].count : 0 );
        if( biggest.length < itemsInCollapsedBlock )
        {
          // If the biggest array is not yet filled, add the current value
          biggest.push( count );
        }
        else if( count >= Array.min( biggest ) )
        {
          // If the current value is bigger as the smallest, remove the smallest
          // and push the current value into the array
          removeFromArray( biggest, Array.min( biggest ) );
          biggest.push( count );
        }
      }

      // Update all the totals after the refinements,
      // show the refinements which should be shown, and hide the others
      for( i = 0; i < l; i++ )
      {
        id = type + '-' +  typeList[ i ].name.replace( /[& ]/g, '-' ).toLowerCase();
        $checkbox = $( '#' + id );
        // $container is the div, not the label
        $container = $checkbox.parent().parent();
        var count = parseInt( typeList[ i ].count ? typeList[ i ].count : 0 );
        // Set the new number
        $container.find( '.number' ).text( numberFormat( count, 0, ',', '.' ) );

        if( $checkbox.is( ':checked' ) )
        {
          // These are visible, keep them visible.
          $container.removeClass( 'collapsed' );
        }
        else if( count == 0 )
        {
          // If this refinement does not add extra results, disable this refinement
          $container
            .addClass( 'disabled' );
          $checkbox
            .attr( 'disabled', true );

          if( collapse )
          {
            $container.addClass( 'collapsed' )
            if( !showAll )
            {
              $container.slideUp();
            }
          }
        }
        else if( collapse )
        {
          // If this typeList is currently collapsed, we should only show the
          // refinements which totals are in biggest

          // Is the current item already shown?
          var alreadyShown = false;
          var remembered = false;
          for( var j = 0; j < itemsInCollapsedBlock; j++ )
          {
            alreadyShown = alreadyShown || ( count == biggest[ j ] && !biggestShown[ j ] );

            if( !remembered && count == biggest[ j ] && !biggestShown[ j ] )
            {
              // Set that this value is now shown, to prevent showing to much
              // refinements, when a refinements total appears twice, but occures
              // only once in the biggest array
              biggestShown[ j ] = true;
              // Prevent this value from setting biggestShown twice to true
              remembered = true;
            }
          }

          $checkbox
            .attr( 'disabled', false );
          if( count < Array.min( biggest ) || !alreadyShown )
          {
            // This refinement should be collapsed, but is not disabled
            $container
              .addClass( 'collapsed' );
            if( showAll )
            {
              // We show all refinements in this block, so slide this one down
              $container
                .removeClass( 'disabled' )
                .slideDown();
            }
            else
            {
              // We only show the biggest four + active. This is not one of those, so hide it
              $container.slideUp( postSlideUp );
            }
          }
          else
          {
            // This refinement should be shown
            $container.slideDown( postSlideDown );
          }
        }
        else
        {
          // The refinement adds results to the search, and for this block all refinements are shown
          $container
            .removeClass( 'disabled' );
          $checkbox
            .attr( 'disabled', false );
        }
      }
    }
  };

  /**
   * Builds the URL to collect data from
   * New parameters should always be added here
   * @return string The final URL
   */
  var buildUrl = function()
  {
    var url = '?';

    /*
     * Preserve variables that have noting to do with the search parameters.
     **/
    var searchParameters = [ 's', 'p', 'rad', 'page', 'ot', 'days', 'hours[]', 'c[]', 'edu[]', 'r', 'branch_id' ];
    var ignoredParameters = [ 'ref', 'job_id' ];
    var queryParameters = location.search.substr( 1, location.search.length ).split( /[&?]/ );
    for( var i = 0; i < queryParameters.length; i++ )
    {
      var paramName = queryParameters[ i ].substr( 0, queryParameters[ i ].indexOf( '=' ) );
      if( searchParameters.indexOf( paramName ) === -1 && ignoredParameters.indexOf( paramName ) === -1 )
      {
        url += queryParameters[ i ] + '&';
      }
    }

    // Always add the s param, others are optional
    url += 's=' + encodeURIComponent( s ) + '&';
    url += p ? 'p=' + encodeURIComponent( p ) + '&' : '';
    url += rad ? 'rad=' + encodeURIComponent( rad ) + '&' : '';
    url += page ? 'page=' + encodeURIComponent( page ) + '&' : '';
    url += ot ? 'ot=' + encodeURIComponent( ot ) + '&' : '';
    url += days && days >= 0 ? 'days=' + encodeURIComponent( days ) + '&' : '';
    for( var i = 0, l = hours.length; i < l; i++ )
    {
      url += 'hours[]=' + encodeURIComponent( hours[ i ] ) + '&';
    }
    for( var i = 0, l = c.length; i < l; i++ )
    {
      url += 'c[]=' + encodeURIComponent( c[i] ) + '&';
    }
    for( var i = 0, l = edu.length; i < l; i++ )
    {
      url += 'edu[]=' + encodeURIComponent( edu[i] ) + '&';
    }
    url += r ? 'r=' + encodeURIComponent( r ) + '&' : '';
    url += branchId ? 'branch_id=' + encodeURIComponent( branchId ) + '&' : '';

    // Removes a trailing &
    url = url.slice( 0, -1 );
    return url;
  };

  var setRefinements = function( checkedValues )
  {
    if( checkedValues )
    {
      // Synchronize the JobSearch with the current page
      c = checkedValues.c || [];
      edu = checkedValues.education || [];
      hours = checkedValues.hours || [];
      r = checkedValues.recruiter[ 0 ] || '';
      branchId = checkedValues.branch[ 0 ] || '';
    }

    $( '.searchRefinements input[type=checkbox]' ).filter( function()
    {
      // Filter the found list, only use the checkboxes which are not in the new checkedValues list.
      for( var type in checkedValues )
      {
        var data = checkedValues[ type ];
        for( var i = 0, l = data.length; i < l; i++ )
        {
          if( $( this ).attr( 'id' ) == type + '-' + data[ i ].toLowerCase().replace( /[ ]/g, '-' ) && $( this ).is( ':checked' ) )
          {
            return false;
          }
        }
      }
      return true;
    }).prop( 'checked', false )
      .closest( '.checkbox' )
      .removeClass( 'checked' );

    for( var type in checkedValues )
    {
      // Show the checkboxes for the checkedValues that are not checked
      var data = checkedValues[ type ];
      for( var i = 0, l = data.length; i < l; i++ )
      {
        var $input = $( '#' + type + '-' + data[ i ].replace( /[& ]/g, '-' ) )
          .prop( 'checked', true )
          .closest( '.checkbox' )
          .addClass( 'checked' );
        if( $input.is( ':hidden' ) )
        {
          $input.slideDown();
        }
      }
    }
  };

  // The exposed API of this object
  var SearchJobExposed = {
    setUrl: setUrl,
    setEraseFiltersId: setEraseFiltersId,
    setSearch: setSearch,
    setPlace: setPlace,
    setRadius: setRadius,
    setPage: setPage,
    setOrderBy: setOrderBy,
    setDays: setDays,
    addDaysOption: addDaysOption,
    buildDaysSelector: buildDaysSelector,
    setRefinementsCount: setRefinementsCount,
    toggleHours: toggleHours,
    toggleCategory: toggleCategory,
    toggleEducation: toggleEducation,
    toggleRecruiter: setRecruiter,
    toggleBranchId: setBranchId,
    search: search,
    clear: clear,
    reset: reset,
    init: init,
    removeEducations: removeEducations,
    removeCategories: removeCategories,
    removeHours: removeHours
  };
  return SearchJobExposed;
} )( jQuery );

( function( $ )
{
  'use strict';

  var Job = {};
  Job.saveToFavorites = function( e )
  {
    var $this = $( this );

    // Prevent the link from being followed and the event from bubbling
    e.preventDefault();
    e.stopPropagation();

    // Save the job to favorites
    Job.saveToFavorites.startLoading( this );
    $.ajax( $this.attr( 'href' ), { context: this } )
      .done( Job.saveToFavorites.success )
      .fail( Job.saveToFavorites.error );
  };
  Job.saveToFavorites.startLoading = function( el )
  {
    var $el = $( el );
    var $container = $el.is( '.job__action' ) ? $el : $el.closest( '.job__action' );
    var $loadingImg = $( '<img>' )
      .attr( 'src', '/images/loading.gif' )
      .addClass( 'job__action__loader-image' );

    $container
      .addClass( 'job__action--in-progress' )
      .prepend( $loadingImg );
  };
  Job.saveToFavorites.success = function()
  {
    var $this = $( this );
    var $jobSaved = $( '<span>' )
      .addClass( 'job__action job__action--just-done' )
      .text( 'Vacature opgeslagen in ' )
      .append( $( '<a>' )
        .attr( 'href', '/mijn/profiel/opgeslagen-vacatures' )
        .text( 'mijn vacatures' )
      )
      .append( '.' );

    $this.replaceWith( $jobSaved );
  };
  Job.saveToFavorites.error = function()
  {
    var $this = $( this );
    var $container = $this.is( '.job__action' ) ? $this : $this.closest( '.job__action' );
    var $jobNotSaved = $( '<span>' )
      .addClass( 'job__action job__action--just-done' )
      .text( 'Vacature opslaan mislukt. ' )
      .append( $( '<a>' )
        .attr( 'href', $this.attr( 'href' ) )
        .addClass( 'js-save-job' )
        .text( 'Nog een keer proberen?' )
      );

    $container.replaceWith( $jobNotSaved );
  };

  Job.removeFromFavorites = function( e )
  {
    var $this = $( this );

    // Prevent the link from being followed and the event from bubbling
    e.preventDefault();
    e.stopPropagation();

    // Save the job to favorites
    Job.saveToFavorites.startLoading( this );
    $.ajax( $this.attr( 'href' ), { context: this } )
      .done( Job.removeFromFavorites.success )
      .fail( Job.removeFromFavorites.error );
  };
  Job.removeFromFavorites.success = function()
  {
    var $this = $( this );
    var $container = $this.is( '.job__action' ) ? $this : $this.closest( '.job__action' );
    var $jobRemoved = $( '<span>' )
      .addClass( 'job__action job__action--just-done' )
      .text( 'Vacature niet meer opgeslagen.' );

    $container.replaceWith( $jobRemoved );
  };
  Job.removeFromFavorites.error = function()
  {
    var $this = $( this );
    var $container = $this.is( '.job__action' ) ? $this : $this.closest( '.job__action' );
    var $jobNotSaved = $( '<span>' )
      .addClass( 'job__action job__action--just-done' )
      .text( 'Niet meer opslaan mislukt. ' )
      .append( $( '<a>' )
        .attr( 'href', $this.attr( 'href' ) )
        .addClass( 'js-forget-job' )
        .text( 'Nog een keer proberen?' )
      );

    $container.replaceWith( $jobNotSaved );
  };

  $( document ).on( 'click', '.js-save-job', Job.saveToFavorites );
  $( document ).on( 'click', '.js-forget-job', Job.removeFromFavorites );
} )( jQuery );

( function( $ )
{
  /**
   * @type {string} The selector to find elements that trigger the scroll
   */
  var scrollTrigger = '[data-trigger="scroll"]';

  /**
   * Constructor. Initializes the triggers in the form
   * @param {DOMElement} el The form that will be scrolled to when an element has keydown triggered
   */
  var ScrollToTopForm = window.ScrollToTopForm = function( el )
  {
    $( el ).on( 'keydown', scrollTrigger, this.scroll );
  };

  /**
   * Scroll to the form
   */
  ScrollToTopForm.prototype.scroll = function()
  {
    var $this = jQuery( this ),
      target = $this.data( 'target' ),
      $target = target ? $( target ) : $this;

    // Only activate this functionality on mobile
    if( document.documentElement.clientWidth <= 480 )
    {
      window.scrollTo( 0, $target[0].offsetTop );
    }
  };

  // Create the data-api
  $( document ).on( 'keydown', scrollTrigger, ScrollToTopForm.prototype.scroll );
} )( jQuery );

function numberFormat( number, decimals, decPoint, thousandsSep )
{
  'use strict';

  number = ( number + '' ).replace( /[^0-9+-Ee.]/g, '' );
  var n = !isFinite( +number ) ? 0 : +number,
    prec = !isFinite( +decimals ) ? 0 : Math.abs( decimals ),
    sep = ( typeof thousandsSep === 'undefined' ) ? ',' : thousandsSep,
    dec = ( typeof decPoint === 'undefined' ) ? '.' : decPoint,
    s = '',
    toFixedFix = function( n, prec )
    {
      var k = Math.pow( 10, prec );
      return '' + Math.round( n * k ) / k;
    };
  // Fix for IE parseFloat(0.55).toFixed(0) = 0;
  s = ( prec ? toFixedFix( n, prec ) : '' + Math.round( n ) ).split( '.' );
  if( s[ 0 ].length > 3 )
  {
    s[ 0 ] = s[ 0 ].replace( /\B(?=(?:\d{3})+(?!\d))/g, sep );
  }
  if( ( s[ 1 ] || '' ).length < prec )
  {
    s[ 1 ] = s[ 1 ] || '';
    s[ 1 ] += new Array( prec - s[ 1 ].length + 1 ).join( '0' );
  }
  return s.join( dec );
}

Array.max = function( array )
{
  'use strict';

  return Math.max.apply( Math, array );
};

Array.min = function( array )
{
  'use strict';

  return Math.min.apply( Math, array );
};

( function( $ )
{
  $( window ).resize( changeButtonSizePaging );

  $( window ).load( changeButtonSizePaging );

  /**
   * Function for changing the size of the paging button group on small screen.
   */
  function changeButtonSizePaging()
  {
    if( document.documentElement.clientWidth <= 480 && !$( '#paging-job-results' ).hasClass( 'btn-group-sm' ) )
    {
      $( '#paging-job-results' ).addClass( 'btn-group-sm' );
    }
    else if( document.documentElement.clientWidth > 480 && $( '#paging-job-results' ).hasClass( 'btn-group-sm' ) )
    {
      $( '#paging-job-results' ).removeClass( 'btn-group-sm' );
    }
  }
} )( jQuery );
