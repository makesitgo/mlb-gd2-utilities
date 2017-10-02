const assert = require( 'assert' ),
  inquirer = require( 'inquirer' );

function Prompter() {
  var self = this;

  self.confirm = function( prompt, name, message, debug ) {
    const question = {
      type: 'confirm',
      name: name
    };

    if ( message ) {
      question.message = message;
    } else {
      question.message = name + '?';
    }

    return self.inquire( prompt, [ question ], debug );
  }

  self.inquire = function( prompt, questions, debug ) {
    return new Promise( function( resolve, reject ) {
      prompt( questions ).then( function( answers ) {
        if ( debug ) {
          console.log( '*** Prompter Debug Info: BEGIN' )
          questions.map( function( question ) {
            return question.name;
          } ).forEach( function( name ) {
            console.log( name + ': ' + answers[ name ] );
          } )
          console.log( '*** Prompter Debug Info: END' )
        }
        resolve( answers );
      } );
    } );
  }

  self.passthrough = function() {
    return new Promise( function( resolve, reject ) {
      reslve( {} );
    } );
  }
}

module.exports.Prompter = Prompter;;
