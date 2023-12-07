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

	private priority = new Map<string, number>();

	private debug = true;

	constructor () {

		MapEvents.objectSelected.subscribe( object => this.onObjectSelected( object ) );

		MapEvents.objectUnselected.subscribe( object => this.onObjectUnselected( object ) );

	}

	registerStrategy ( type: string, strategy: SelectStrategy<any> ): void {

		this.strategies.set( type, strategy );

		this.priority.set( type, this.strategies.size );

	}

	registerTag ( type: string, tag: any ): void {

		this.tags.set( type, tag );

	}

	handleHighlight ( e: PointerEventData, highlightCallback: ( object: any ) => void ): any {

		for ( const [ type, strategy ] of this.strategies ) {

			const object = strategy.select( e );

			if ( !object ) continue;

			highlightCallback( object )

			return;

		}

	}

	handleSelection ( e: PointerEventData ): void {

		for ( const [ type, strategy ] of this.strategies ) {

			const object = strategy.select( e );

			if ( !object ) continue;

			this.selectObject( object, type );

			return;

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

		this.priority.clear();

	}

	private handleDeselection (): void {

		for ( const [ type, strategy ] of this.strategies ) {

			if ( this.selectedObjects.has( type ) ) {

				this.deselectObject( type );

				break;

			}

		}

	}

	private selectObject ( object: any, type: string ): void {

		const index = this.priority.get( type );

		// unselect objects with lower priority
		const unselectObjects = [];

		for ( const [ key, value ] of this.selectedObjects.entries() ) {

			if ( this.priority.get( key ) <= index ) {

				unselectObjects.push( value );

			}

		}

		const lastSelected = this.getLastSelected( type );

		if ( lastSelected && lastSelected === object && unselectObjects.length === 0 ) return;

		CommandHistory.execute( new SelectObjectCommand( object, unselectObjects ) );

	}

	private onObjectSelected ( object: Object ): void {

		if ( object == null ) return;

		if ( object instanceof Array && object.length == 0 ) return;

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

		const className = this.getClassName( object );

		if ( this.tags.has( className ) ) {

			return this.tags.get( className );

		} else {

			return className;

		}

	}

	private getClassName ( object: Object ): string {

		if ( object instanceof Array ) {

			if ( object.length > 0 ) {

				return object[ 0 ].constructor.name;

			}

			return null;
		}

		return object.constructor.name;

	}

}
