export default function createConsole() {
  const element = document.createElement( 'div' );
  element.className = 'console';
  document.body.appendChild( element );

  function render( element, state ) {
    const { messages } = state;

    while ( messages.length > state.limit ) {
      messages.shift();
    }

    element.innerHTML = (
      `<ul style="display: ${ state.show ? 'block' : 'none' }">
        ${ messages.map( message => `<li>${ message }</li>` ).join('') }
      </ul>`
    );
  }

  const state = {
    messages: [],
    limit: 20,
    show: false
  };

  /* eslint-disable no-console */
  const log = console.log.bind( console );

  console.log = ( ...args ) => {
    log( ...args );
    state.messages.push( [ ...args ] );
    render( element, state );
  };

  document.addEventListener( 'keydown', event => {
    // Backtick.
    if ( event.keyCode === 192 ) {
      state.show = !state.show;
      render( element, state );
    }
  });
}
