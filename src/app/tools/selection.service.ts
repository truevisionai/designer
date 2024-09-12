/*
 * Copyright Truesense AI Solutions Pvt Ltd, All Rights Reserved.
 */

import { Injectable } from '@angular/core';
import { BaseSelectionStrategy } from 'app/core/strategies/select-strategies/select-strategy';
import { MapEvents } from 'app/events/map-events';
import { PointerEventData } from 'app/events/pointer-event-data';
import { CommandHistory } from 'app/commands/command-history';
import { UnselectObjectCommand } from "../commands/unselect-object-command";
import { SelectObjectCommand } from "../commands/select-object-command";
import { IMovingStrategy } from "../core/strategies/move-strategies/move-strategy";
import { Position } from "../scenario/models/position";
import { Log } from 'app/core/utils/log';
import { ClassMap, ConstructorFunction } from 'app/core/models/class-map';

@Injectable( {
	providedIn: 'root'
} )
export class SelectionService {

	private movingStrategies: IMovingStrategy[] = [];

	private strategies: ClassMap<BaseSelectionStrategy<any>>;

	private selectedObjects: ClassMap<any>;

	private tags: ClassMap<string>;

	private priority: ClassMap<number>;

	private debug = false;

	private lastSelectedObject?: any;

	constructor () {

		this.strategies = new ClassMap<BaseSelectionStrategy<any>>();

		this.selectedObjects = new ClassMap<any>();

		this.tags = new ClassMap<string>();

		this.priority = new ClassMap<number>();

		MapEvents.objectSelected.subscribe( object => this.addToSelected( object ) );

		MapEvents.objectUnselected.subscribe( object => this.removeFromSelected( object ) );

	}

	getStrategies (): BaseSelectionStrategy<any>[] {

		return Array.from( this.strategies.values() );

	}

	registerStrategy ( key: ConstructorFunction, strategy: BaseSelectionStrategy<any> ): void {

		if ( this.debug ) Log.log( 'Registering strategy', key, strategy );

		this.strategies.set( key, strategy );

		this.priority.set( key, this.strategies.size );

	}

	registerTag ( key: ConstructorFunction, tag: any ): void {

		if ( this.debug ) Log.log( 'Registering tag', key, tag );

		this.tags.set( key, tag );

	}

	handleHighlight ( e: PointerEventData, highlightCallback: ( object: any ) => void ): any {

		for ( const [ type, strategy ] of this.strategies ) {

			const object = strategy.handleSelection( e );

			if ( !object ) continue;

			highlightCallback( object )

			return;

		}

	}

	handleSelection ( e: PointerEventData, selected?: ( object: any ) => void, unselected?: () => void ): void {

		for ( const [ type, strategy ] of this.strategies ) {

			const object = strategy.handleSelection( e );

			if ( !object ) continue;

			if ( selected ) selected( object );

			this.selectNewObjectAndUnselectOld( object, type );

			return;

		}

		if ( unselected ) unselected();

		this.handleDeselection();

	}

	handleSelectionWithoutDeselection ( e: PointerEventData, deselection?: () => void ): void {

		for ( const [ type, strategy ] of this.strategies ) {

			const object = strategy.handleSelection( e );

			if ( !object ) continue;

			this.selectNewObjectOnly( object );

			return;

		}

		if ( deselection ) deselection();

	}

	executeSelection ( e: PointerEventData ): any {

		for ( const [ type, strategy ] of this.strategies ) {

			const object = strategy.handleSelection( e );

			if ( !object ) continue;

			return object;

		}

	}

	handleCreation ( e: PointerEventData, callback: ( object ) => void, none?: Function ): void {

		for ( const [ type, strategy ] of this.strategies ) {

			const object = strategy.handleSelection( e );

			if ( !object ) continue;

			callback( object );

			return;

		}

		if ( none ) none();
	}

	findSelectedObject<T> ( key: ConstructorFunction ): T | undefined {
		return this.selectedObjects.get( key ) as T;
	}

	getSelectedObjects (): any[] {
		return Array.from( this.selectedObjects.values() );
	}

	getSelectedObjectsByKey<T> ( key: ConstructorFunction ): T[] {
		if ( this.selectedObjects.has( key ) ) {
			return [ this.selectedObjects.get( key ) as T ];
		}
		return [];
	}

	getLastSelectedObject (): any | undefined {
		return this.lastSelectedObject;
	}

	getSelectedObjectCount (): number {
		return this.selectedObjects.size;
	}

	reset () {

		this.strategies.clear();

		this.selectedObjects.clear();

		this.tags.clear();

		this.priority.clear();

		this.movingStrategies = [];

		this.lastSelectedObject = null;

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

	private selectNewObjectAndUnselectOld ( newSelected: any, selectedKey: ConstructorFunction ): void {

		const newSelectedPriority = this.priority.get( selectedKey );

		const unselectObjects = [];

		for ( const [ oldSelectedType, oldSelected ] of this.selectedObjects.entries() ) {

			const oldSelectedPriority = this.priority.get( oldSelected.constructor );

			// unselect objects with lower priority
			if ( oldSelectedPriority < newSelectedPriority ) {

				unselectObjects.push( oldSelected );

				// unselect objects with same priority if they are not the same
			} else if ( oldSelectedPriority == newSelectedPriority && oldSelected !== newSelected ) {

				unselectObjects.push( oldSelected );

			}

		}

		const lastSelected = this.lastSelectedObject;

		if ( lastSelected && lastSelected === newSelected && unselectObjects.length === 0 ) return;

		CommandHistory.execute( new SelectObjectCommand( newSelected, unselectObjects ) );

		if ( this.debug ) Log.info( 'SelectObjectCommand fired', selectedKey, newSelected, this.selectedObjects );

	}

	private selectNewObjectOnly ( newSelected: any ): void {

		const lastSelected = this.lastSelectedObject;

		if ( lastSelected && lastSelected === newSelected ) return;

		CommandHistory.execute( new SelectObjectCommand( newSelected ) );

		if ( this.debug ) Log.info( 'SelectObjectCommand fired', newSelected, this.selectedObjects );

	}

	addToSelected<T> ( object: InstanceType<ConstructorFunction<T>> ): void {

		if ( object == null ) return;

		if ( object instanceof Array && object.length == 0 ) return;

		this.selectedObjects.set( object.constructor as ConstructorFunction<T>, object );

		this.lastSelectedObject = object;

		if ( this.debug ) Log.info( 'addToSelected', object, this.getSelectedObjects() );

	}

	private deselectObject ( type: ConstructorFunction ): void {

		const object = this.selectedObjects.get( type );

		const deselectCommand = new UnselectObjectCommand( object );

		CommandHistory.execute( deselectCommand );

		if ( this.debug ) Log.info( 'UnselectObjectCommand fired', type, object, this.selectedObjects );

	}

	removeFromSelected ( object: any ): void {

		this.selectedObjects.delete( object.constructor );

		this.lastSelectedObject = null;

		if ( this.debug ) Log.info( 'removeFromSelected', object, this.selectedObjects );

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

	hasSelectorByKey ( key: ConstructorFunction ): boolean {

		return this.strategies.has( key );

	}

	isObjectSelected ( object: any ): boolean {

		return this.getSelectedObjects().includes( object );

	}

}
