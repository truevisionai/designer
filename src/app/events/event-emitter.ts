/*
 * Copyright Truesense AI Solutions Pvt Ltd, All Rights Reserved.
 */

type Listener<T = any> = ( arg: T ) => void;

export class EventEmitter<T = any> {
	private listeners: { [ event: string ]: Listener<T>[] } = {};

	// Subscribe to an event
	on ( event: string, listener: Listener<T> ): void {
		if ( !this.listeners[ event ] ) {
			this.listeners[ event ] = [];
		}
		this.listeners[ event ].push( listener );
	}

	// Unsubscribe from an event
	off ( event: string, listenerToRemove: Listener<T> ): void {
		if ( !this.listeners[ event ] ) return;

		this.listeners[ event ] = this.listeners[ event ].filter( listener => listener !== listenerToRemove );
	}

	// Emit an event
	emit ( event: string, arg: T ): void {
		if ( !this.listeners[ event ] ) return;

		this.listeners[ event ].forEach( listener => listener( arg ) );
	}

	// Clear all listeners for an event
	clear ( event: string ): void {
		if ( !this.listeners[ event ] ) return;

		delete this.listeners[ event ];
	}
}
