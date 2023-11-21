// export abstract class TvBaseEvent {
// 	private propagationStopped = false;

// 	stopPropagation (): void {
// 		this.propagationStopped = true;
// 	}

// 	isPropagationStopped (): boolean {
// 		return this.propagationStopped;
// 	}
// }

// export class Subscription {
// 	constructor ( public unsubscribe: () => void ) { }
// }

// export class EventService {

// 	private static listeners = new Map<string, Array<( event: TvBaseEvent ) => void>>();

// 	// Subscribe to an event with a specific event type and callback
// 	static subscribe<T extends TvBaseEvent> ( eventType: new ( ...args: any[] ) => T, callback: ( event: T ) => void ) {

// 		const eventName = eventType.name;

// 		if ( !this.listeners.has( eventName ) ) {
// 			this.listeners.set( eventName, [] );
// 		}

// 		console.log( 'Subscribing', eventName, callback );

// 		this.listeners.get( eventName ).push( callback as ( event: TvBaseEvent ) => void );

// 		const currentListeners = this.listeners.get( eventName );
// 		currentListeners.push( callback as ( event: TvBaseEvent ) => void );

// 		// Return an unsubscribe object
// 		return {
// 			unsubscribe: () => {
// 				console.log( 'Unsubscribing', eventName, callback );
// 				const callbackIndex = currentListeners.indexOf( callback );
// 				if ( callbackIndex !== -1 ) {
// 					currentListeners.splice( callbackIndex, 1 ); // Remove the listener from the array
// 				}
// 			}
// 		};
// 	}

// 	static unsubscribe<T extends TvBaseEvent> ( eventType: new ( ...args: any[] ) => T, callback: ( event: T ) => void ): void {

// 		const eventName = eventType.name;

// 		if ( this.listeners.has( eventName ) ) {

// 			// Filter out the callback that needs to be unsubscribed

// 			const callbacks = this.listeners.get( eventName ).filter( cb => cb !== callback );

// 			this.listeners.set( eventName, callbacks );

// 		}
// 	}

// 	// Emit an event to all subscribers of this event type
// 	static emit<T extends TvBaseEvent> ( event: T ): void {

// 		const eventName = event.constructor.name;

// 		if ( this.listeners.has( eventName ) ) {

// 			for ( const listener of this.listeners.get( eventName ) ) {

// 				if ( event.isPropagationStopped() ) {

// 					break;

// 				}

// 				try {

// 					listener( event );

// 				} catch ( err ) {

// 					console.error( `Error thrown from event listener [${ eventName }]: `, err );

// 				}

// 			}

// 		}

// 	}

// }
