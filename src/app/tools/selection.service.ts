import { Injectable } from '@angular/core';
import { SelectObjectCommandv2, UnselectObjectCommandv2 } from 'app/commands/select-point-command';
import { SelectStrategy } from 'app/core/snapping/select-strategies/select-strategy';
import { MapEvents } from 'app/events/map-events';
import { PointerEventData } from 'app/events/pointer-event-data';
import { CommandHistory } from 'app/services/command-history';

@Injectable( {
	providedIn: 'root'
} )
export class SelectionService {

	private strategies = new Map<string, SelectStrategy<any>>();

	private selectedObjects = new Map<string, any>();

	private debug = true;

	constructor () {

		MapEvents.objectSelected.subscribe( object => this.onObjectSelected( object ) );

		MapEvents.objectUnselected.subscribe( object => this.onObjectUnselected( object ) );

	}

	registerStrategy ( type: string, strategy: SelectStrategy<any> ): void {

		this.strategies.set( type, strategy );

	}

	handleSelection ( e: PointerEventData ): void {

		for ( const [ type, strategy ] of this.strategies ) {

			const selected = strategy.select( e );

			if ( selected ) {

				const last = this.selectedObjects.get( type );

				if ( last === selected ) {

					return;

				}

				this.selectObject( selected, type );

				return;

			}

		}

		this.handleDeselection();

	}

	private handleDeselection (): void {

		if ( this.strategies.size > 0 ) {

			for ( const [ type, strategy ] of this.strategies ) {

				if ( this.selectedObjects.has( type ) ) {

					this.deselectObject( type );

					break;

				}

			}

		}

	}

	private selectObject ( object: any, type: string ): void {

		const previousObject = this.selectedObjects.get( type );

		CommandHistory.execute( new SelectObjectCommandv2( object, previousObject ) );

	}

	private onObjectSelected ( object: Object ): void {

		this.selectedObjects.set( object.constructor.name, object );

		if ( this.debug ) console.log( 'selected', object.constructor.name, object, this.selectedObjects );

	}

	private deselectObject ( type: string ): void {

		const object = this.selectedObjects.get( type );

		const deselectCommand = new UnselectObjectCommandv2( object );

		CommandHistory.execute( deselectCommand );

	}

	private onObjectUnselected ( object: any ): void {

		this.selectedObjects.delete( object.constructor.name );

		if ( this.debug ) console.log( 'unselected', object.constructor.name, object, this.selectedObjects );
	}

	getLastSelected<T> ( type: string ): T {

		return this.selectedObjects.get( type ) as T;

	}

	getAllSelected<T> ( cls: new ( ...args: any[] ) => T ): T[] {

		return Array.from( this.selectedObjects.values() ).filter( obj => obj instanceof cls ) as T[];

	}

	reset () {

		this.strategies.clear();

		this.selectedObjects.clear();

	}

}
