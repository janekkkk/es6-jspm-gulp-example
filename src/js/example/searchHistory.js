/*
 * To change this template, choose Tools | Templates
 * and open the template in the editor.
 */

module.exports.searchHistory = ( function( $ )
{
  'use strict';

  var SearchHistory = window.SearchHistory = window.SearchHistory || {};

  $( document ).on( 'click', '.searchHistoryErase', function( e )
    {
      e.preventDefault();
      SearchHistory.erase.apply( this );
    }
  );

  SearchHistory.erase = function()
  {
    $( this ).append( '<img class="ajaxLoader ajaxLoader--small" src="/images/loading.gif" />' );

    $.ajax({
      type: 'POST',
      url: '/ajax/delete_search_history.php',
      // Make sure the this in callbacks is set correctly
      context: this
    }).done( SearchHistory.erase.success );
  };

  SearchHistory.erase.success = function()
  {
    $( this )
      .closest( '.searchHistory' )
      .slideUp( function()
      {
        $( this ).remove();
      });
  };
})( jQuery );
