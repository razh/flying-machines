function render( element, state ) {
  element.style.display = state.show ? 'block' : 'none';

  if ( !state.show ) {
    return;
  }

  element.innerHTML = (
    '<ul>' +
      state.messages.map( message => `<li>${ message }</li>` ).join('') +
    '</ul>'
  );
}

export default function createConsole() {
  const state = {
    messages: [],
    limit: 20,
    show: false,
  };

  const element = document.createElement( 'div' );
  element.className = 'console';
  document.body.appendChild( element );

  // eslint-disable-next-line no-console
  const log = console.log.bind( console );

  // eslint-disable-next-line no-console
  console.log = ( ...args ) => {
    log( ...args );

    state.messages.push( [ ...args ] );
    while ( state.messages.length > state.limit ) {
      state.messages.shift();
    }

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
