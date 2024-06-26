/*
 * Copyright Truesense AI Solutions Pvt Ltd, All Rights Reserved.
 */

import { Injectable } from '@angular/core';
import { SelectStrategy } from 'app/core/strategies/select-strategies/select-strategy';
import { MapEvents } from 'app/events/map-events';
import { PointerEventData } from 'app/events/pointer-event-data';
import { CommandHistory } from 'app/services/command-history';
import { UnselectObjectCommand } from "../commands/unselect-object-command";
import { SelectObjectCommand } from "../commands/select-object-command";
import { IMovingStrategy } from "../core/strategies/move-strategies/move-strategy";
import { Position } from "../scenario/models/position";
import { Debug } from 'app/core/utils/debug';

@Injectable( {
	providedIn: 'root'
} )
export class SelectionService {

	private movingStrategies: IMovingStrategy[] = [];

	private strategies = new Map<string, SelectStrategy<any>>();

	private selectedObjects = new Map<string, any>();

	private tags = new Map<string, string>();

	private priority = new Map<string, number>();

	private debug = false;

	constructor () {

		MapEvents.objectSelected.subscribe( object => this.onObjectSelected( object ) );

		MapEvents.objectUnselected.subscribe( object => this.onObjectUnselected( object ) );

	}

	getStrategies (): SelectStrategy<any>[] {

		return Array.from( this.strategies.values() );

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

	highlight ( e: PointerEventData ) {

		for ( const strategy of this.getStrategies() ) {

			const result = strategy.onPointerMoved( e );

			if ( result ) {

				return result;

			}
		}
	}

	handleSelection ( e: PointerEventData, selected?: ( object: any ) => void, unselected?: () => void ): void {

		for ( const [ type, strategy ] of this.strategies ) {

			const object = strategy.select( e );

			if ( !object ) continue;

			if ( selected ) selected( object );

			this.selectObject( object, type );

			return;

		}

		if ( unselected ) unselected();

		this.handleDeselection();

	}

	handleCreation ( e: PointerEventData, callback: ( object ) => void, none?: Function ): void {

		for ( const [ type, strategy ] of this.strategies ) {

			const object = strategy.select( e );

			if ( !object ) continue;

			callback( object );

			return;

		}

		if ( none ) none();
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

		this.movingStrategies = [];

	}

	clearSelection (): void {

		this.selectedObjects.clear();

	}

	private handleDeselection (): void {

		for ( const [ type, strategy ] of this.strategies ) {

			if ( this.selectedObjects.has( type ) ) {

				this.deselectObject( type );

				break;

			}

		}

	}

	private selectObject ( newSelected: any, selectedType: string ): void {

		const newSelectedPriority = this.priority.get( selectedType );

		const unselectObjects = [];

		for ( const [ oldSelectedType, oldSelected ] of this.selectedObjects.entries() ) {

			const oldSelectedPriority = this.priority.get( oldSelectedType );

			// unselect objects with lower priority
			if ( oldSelectedPriority < newSelectedPriority ) {

				unselectObjects.push( oldSelected );

				// unselect objects with same priority if they are not the same
			} else if ( oldSelectedPriority == newSelectedPriority && oldSelected !== newSelected ) {

				unselectObjects.push( oldSelected );

			}

		}

		const lastSelected = this.getLastSelected( selectedType );

		if ( lastSelected && lastSelected === newSelected && unselectObjects.length === 0 ) return;

		CommandHistory.execute( new SelectObjectCommand( newSelected, unselectObjects ) );

	}

	private onObjectSelected ( object: Object ): void {

		if ( object == null ) return;

		if ( object instanceof Array && object.length == 0 ) return;

		const tag = this.getTag( object );

		this.selectedObjects.set( tag, object );

		if ( this.debug ) Debug.log( 'selected', tag, object, this.selectedObjects );

	}

	private deselectObject ( type: string ): void {

		const object = this.selectedObjects.get( type );

		const deselectCommand = new UnselectObjectCommand( object );

		CommandHistory.execute( deselectCommand );

	}

	private onObjectUnselected ( object: any ): void {

		const tag = this.getTag( object );

		this.selectedObjects.delete( tag );

		if ( this.debug ) Debug.log( 'unselected', tag, object, this.selectedObjects );
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

	addMovingStrategy ( strategy: IMovingStrategy ) {

		this.movingStrategies.push( strategy );

	}

	handleTargetMovement ( e: PointerEventData, target: any ): Position {

		for ( let i = 0; i < this.movingStrategies.length; i++ ) {

			const strategy = this.movingStrategies[ i ];

			const position = strategy.getPosition( e, target );

			if ( position ) {

				return position;

			}

		}

	}
}
