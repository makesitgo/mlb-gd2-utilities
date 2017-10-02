const assert = require( 'assert' ),
  commander = require( 'commander' ),
  inquirer = require( 'inquirer' ),
  chalk = require( 'chalk' ),
  MlbGd2Service = require( './mlb-gd2.service' ).MlbGd2Service,
  Prompter = require( './prompter' ).Prompter;

const INPUT_PRUNE_GIDS = "pruneGids";

const program = commander
  .version( '0.0.0' )
  .option( '-y, --year <n>', 'Specify the year [ yyyy format ]', parseInt )
  .option( '-m, --month <n>', 'Specify the month', parseInt )
  .option( '-d, --day [n]', 'Specify the day', parseInt )
  .parse( process.argv );

const prompt = inquirer.createPromptModule();

const mlbGd2Service = new MlbGd2Service();
const prompter = new Prompter();

fetchGids( false, program, mlbGd2Service ).then( function( gids ) {
  askToPruneGids( prompt /*, true */ ).then( function( answers ) {
    // TODO:  prune gids
  } );
} );

/*
  Validates any required program inputs are present,
  displays help and exits if not.
*/
function validateProgramInputs() {
  if ( !( ( 'year' in program ) && 'month' in program ) ) {
    program.help( function( text ) {
      return chalk.green( text );
    } );
  }
}

/*
  Returns all gids for the program-requested time period.
*/
function fetchGids( isOnline, program, mlbGd2Service ) {
  if ( isOnline ) {
    console.log( 'TEST: is online!' );
    // return ( 'day' in program ) ?
    //   mlbGd2Service.findForDay( program.year, program.month, program.day ) :
    //   mlbGd2Service.findForMonth( program.year, program.month );
  } else {
    return mlbGd2Service.mock( true, program.year, program.month, program.day );
  }
}

/*
  Request for confirmation on whether to prune all gids for just valid, regular season ones.
*/
function askToPruneGids( prompt, debug ) {
  return prompter.confirm( prompt, INPUT_PRUNE_GIDS, 'Do you wish filter for valid, regular season games only?', debug );
}
