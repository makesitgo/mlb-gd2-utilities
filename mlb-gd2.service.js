const assert = require( 'assert' ),
  cheerio = require( 'cheerio' ),
  request = require( 'request' );

const BASE_URL = 'http://gd2.mlb.com/components/game/mlb';

function MlbGd2Service() {
  "use strict";

  var self = this;

  self.mock = function( isSuccess, year, month, day ) {
    "use strict";

    return new Promise( function( resolve, reject ) {
      if ( isSuccess ) {
        resolve( {
          year: year,
          month: month,
          day: day
        } );
      } else {
        reject( 'mock failure' );
      }
    } );
  }

  self.findAll = function() {
    "use strict";

    return new Promise( function( resolve, reject ) {
      fetch( BASE_URL ).then( function( data ) {
        Promise.all( scrapeYears( data ).map( function( year ) {
          return self.findForYear( year );
        } ) ).then( function( allGids ) {
          resolve( flattenArrayofArrays( allGids ) );
        } );
      } ).catch( function( error ) {
        reject( error );
      } );
    } );
  }

  self.findForYear = function( year ) {
    "use strict";

    const url = yearUrl( year );
    return new Promise( function( resolve, reject ) {
      fetch( url ).then( function( data ) {
        Promise.all( scrapeMonths( data ).map( function( month ) {
          return self.findForMonth( year, month );
        } ) ).then( function( allGids ) {
          resolve( flattenArrayofArrays( allGids ) );
        } ).catch( function( error ) {
          reject( error );
        } );
      } );
    } );
  }

  self.findForMonth = function( year, month ) {
    "use strict";

    const url = monthUrl( year, month );
    return new Promise( function( resolve, reject ) {
      fetch( url ).then( function( data ) {
        Promise.all( scrapeDays( data ).map( function( day ) {
          return self.findForDay( year, month, day );
        } ) ).then( function( allGids ) {
          resolve( flattenArrayofArrays( allGids ) );
        } );
      } ).catch( function( error ) {
        reject( error );
      } );
    } );
  }

  self.findForDay = function( year, month, day ) {
    "use strict";

    const url = dayUrl( year, month, day );
    return new Promise( function( resolve, reject ) {
      fetch( url ).then( function( data ) {
        const gids = scrape( data ).filter( function( link ) {
          return link.href.startsWith( 'gid_' );
        } ).map( function( link ) {
          return url + '/' + link.href;
        } );

        resolve( gids );
      } ).catch( function( error ) {
        console.log( error );
        reject( error );
      } );
    } );
  }
}

function yearUrl( year, month ) {
  "use strict";
  return BASE_URL + yearPath( year );
}

function monthUrl( year, month ) {
  "use strict";
  return yearUrl( year ) + monthPath( month );
}

function dayUrl( year, month, day ) {
  "use strict";
  return monthUrl( year, month ) + dayPath( day );
}

function yearPath( year ) {
  "use strict";
  return '/year_' + pad( year, 4, '0' );
}

function monthPath( month ) {
  "use strict";
  return '/month_' + pad( month, 2, '0' );
}

function dayPath( day ) {
  "use strict";
  return '/day_' + pad( day, 2, '0' );
}

function pad( n, width, z ) {
  "use strict";

  z = z || '0';
  n = n + '';

  return n.length >= width ? n : new Array( width - n.length + 1 ).join( z ) + n;
}

function fetch( url ) {
  "use strict";

  return new Promise( function( resolve, reject ) {
    request( url, function( err, res, body ) {
      if ( err ) {
        reject( err );
      } else if ( res.statusCode !== 200 ) {
        err = new Error( "Unexpected status code: " + res.statusCode );
        err.res = res;
        reject( err );
      }
      resolve( body );
    } );
  } );
}

function scrapeYears( body ) {
  "use strict";

  return scrape( body ).filter( function( link ) {
    return link.href.startsWith( 'year_' );
  } ).map( function( link ) {
    return parseInt( link.href.substring( 5, 9 ) );
  } )
}

function scrapeMonths( body ) {
  "use strict";

  return scrape( body ).filter( function( link ) {
    return link.href.startsWith( 'month_' );
  } ).map( function( link ) {
    return parseInt( link.href.substring( 6, 8 ) );
  } )
}

function scrapeDays( body ) {
  "use strict";

  return scrape( body ).filter( function( link ) {
    return link.href.startsWith( 'day_' );
  } ).map( function( link ) {
    return parseInt( link.href.substring( 4, 6 ) );
  } )
}

function scrape( data ) {
  "use strict";

  const results = [];

  const $ = cheerio.load( data );
  const links = $( 'a' );

  $( links ).each( function( i, link ) {
    const result = {
      index: i,
      text: $( link ).text(),
      href: $( link ).attr( 'href' )
    };

    results.push( result );
  } );

  results.sort( function( r1, r2 ) {
    return r1.index - r2.index;
  } );

  return results;
}

function flattenArrayofArrays( arrayOfArrays ) {
  "use strict";

  const items = [];
  arrayOfArrays.forEach( function( array ) {
    array.forEach( function( item ) {
      items.push( item );
    } );
  } );
  return items;
}

module.exports.MlbGd2Service = MlbGd2Service;
