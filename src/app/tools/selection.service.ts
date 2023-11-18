import { Injectable } from '@angular/core';
import { SelectStrategy } from 'app/core/snapping/select-strategies/select-strategy';
import { MapEvents } from 'app/events/map-events';
import { PointerEventData } from 'app/events/pointer-event-data';
import { CommandHistory } from 'app/services/command-history';
import { UnselectObjectCommand } from "../commands/unselect-object-command";
import { SelectObjectCommand } from "../commands/select-object-command";

@Injectable( {
	providedIn: 'root'
} )
export class SelectionService {

	private strategies = new Map<string, SelectStrategy<any>>();

	private selectedObjects = new Map<string, any>();

	private tags = new Map<string, string>();

	private debug = true;

	constructor () {

		MapEvents.objectSelected.subscribe( object => this.onObjectSelected( object ) );

		MapEvents.objectUnselected.subscribe( object => this.onObjectUnselected( object ) );

	}

	registerStrategy ( type: string, strategy: SelectStrategy<any> ): void {

		this.strategies.set( type, strategy );

	}

	registerTag ( type: string, tag: any ): void {

		this.tags.set( type, tag );

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

	getLastSelected<T> ( type: string ): T {

		return this.selectedObjects.get( type ) as T;

	}

	getAllSelected<T> ( cls: new ( ...args: any[] ) => T ): T[] {

		return Array.from( this.selectedObjects.values() ).filter( obj => obj instanceof cls ) as T[];

	}

	reset () {

		this.strategies.clear();

		this.selectedObjects.clear();

		this.tags.clear();

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

		CommandHistory.execute( new SelectObjectCommand( object, previousObject ) );

	}

	private onObjectSelected ( object: Object ): void {

		const tag = this.getTag( object );

		this.selectedObjects.set( tag, object );

		if ( this.debug ) console.log( 'selected', tag, object, this.selectedObjects );

	}

	private deselectObject ( type: string ): void {

		const object = this.selectedObjects.get( type );

		const deselectCommand = new UnselectObjectCommand( object );

		CommandHistory.execute( deselectCommand );

	}

	private onObjectUnselected ( object: any ): void {

		const tag = this.getTag( object );

		this.selectedObjects.delete( tag );

		if ( this.debug ) console.log( 'unselected', tag, object, this.selectedObjects );
	}

	private getTag ( object: Object ): string {

		if ( this.tags.has( object.constructor.name ) ) {

			return this.tags.get( object.constructor.name );

		} else {

			return object.constructor.name;

		}

	}

}
