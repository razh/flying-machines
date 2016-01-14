import FlyControls from './fly-controls';
import forEach from 'lodash/forEach';

function copyTouch( touch ) {
  return {
    identifier: touch.identifier,
    clientX: touch.clientX,
    clientY: touch.clientY
  };
}

export default class FlyControlsTouch extends FlyControls {
  constructor( ...args ) {
    super( ...args );

    this.initialTouches = [];
    this.touches = [];

    this.deadzone = 16;
    this.touchRadius = 128;

    // Touch regions.
    this.identifiers = {
      left: null,
      right: null
    };

    this.onTouchStart = this.onTouchStart.bind( this );
    this.onTouchMove = this.onTouchMove.bind( this );
    this.onTouchEnd = this.onTouchEnd.bind( this );

    document.addEventListener( 'touchstart', this.onTouchStart );
    document.addEventListener( 'touchmove', this.onTouchMove );
    document.addEventListener( 'touchend', this.onTouchEnd );
  }

  onTouchStart( event ) {
    if ( !this.enabled ) {
      return;
    }

    const { width } = this.domElement.getBoundingClientRect();

    forEach( event.changedTouches, touch => {
      this.initialTouches[ touch.identifier ] = copyTouch( touch );

      if ( touch.clientX < width / 2 ) {
        if ( this.identifiers.left === null ) {
          this.identifiers.left = touch.identifier;
        }
      } else if ( this.identifiers.right === null ) {
        this.identifiers.right = touch.identifier;
      }
    });
  }

  onTouchMove( event ) {
    if ( !this.enabled ) {
      return;
    }

    event.preventDefault();

    forEach( event.changedTouches, touch => {
      const left = touch.identifier === this.identifiers.left;
      const right = touch.identifier === this.identifiers.right;

      if ( !left && !right ) {
        return;
      }

      const initialTouch = this.initialTouches[ touch.identifier ];
      if ( !initialTouch ) {
        return;
      }

      const dx = touch.clientX - initialTouch.clientX;
      const dy = touch.clientY - initialTouch.clientY;

      // Ignore if inside deadzone.
      if ( dx * dx + dy * dy < this.deadzone * this.deadzone ) {
        return;
      }

      if ( left ) {
        this.movementVector.z =  dy / this.touchRadius;
        this.rotationVector.z = -dx / this.touchRadius;
      } else if ( right ) {
        this.rotationVector.x = -dy / this.touchRadius;
        this.rotationVector.y = -dx / this.touchRadius;
      }
    });
  }

  onTouchEnd( event ) {
    if ( !this.enabled ) {
      return;
    }

    forEach( event.changedTouches, touch => {
      delete this.initialTouches[ touch.identifier ];

      if ( touch.identifier === this.identifiers.left ) {
        this.identifiers.left = null;
        this.movementVector.z = 0;
        this.rotationVector.z = 0;
      } else if ( touch.identifier === this.identifiers.right ) {
        this.identifiers.right = null;
        this.rotationVector.x = 0;
        this.rotationVector.y = 0;
      }
    });
  }

  dispose() {
    super.dispose();

    document.removeEventListener( 'touchstart', this.onTouchStart );
    document.removeEventListener( 'touchmove', this.onTouchMove );
    document.removeEventListener( 'touchend', this.onTouchEnd );
  }
}
