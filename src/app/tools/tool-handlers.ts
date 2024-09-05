/*
 * Copyright Truesense AI Solutions Pvt Ltd, All Rights Reserved.
 */

import { BaseController } from "app/core/controllers/base-controller";
import { Visualizer } from "app/core/visualizers/visualizer";
import { Log } from "app/core/utils/log";
import { PointerEventData } from "app/events/pointer-event-data";
import { SelectionService } from "./selection.service";
import { ValidationException } from "app/exceptions/exceptions";
import { StatusBarService } from "app/services/status-bar.service";
import { BaseDragHandler } from "app/core/drag-handlers/base-drag-handler";
import { DragManager } from "./drag-manager";
import { ClassMap, ConstructorFunction } from "app/core/models/class-map";

export class ToolHandlers {

	private debug = false;

	private controllers: ClassMap<BaseController<object>>;
	private visualizers: ClassMap<Visualizer<object>>;
	private dragManager: DragManager;

	constructor ( private selectionService: SelectionService ) {
		this.controllers = new ClassMap();
		this.visualizers = new ClassMap();
		this.dragManager = new DragManager();
	}

	disable (): void {

		this.visualizers.forEach( handle => handle.clear() );

		this.visualizers.forEach( handle => handle.disable() );

		this.controllers.forEach( handler => handler.disable() );

	}

	enable (): void {
		this.visualizers.forEach( handler => handler.enable() );
	}

	setSelectionService ( selectionService: SelectionService ): void {
		this.selectionService = selectionService;
	}

	getControllerByKey ( key: ConstructorFunction ): BaseController<object> {
		return this.controllers.get( key );
	}

	getVisualizerByKey ( key: ConstructorFunction ): Visualizer<object> {
		return this.visualizers.get( key );
	}

	getControllerByObject ( object: object ): BaseController<object> {
		return this.controllers.get( object.constructor as ConstructorFunction );
	}

	getVisualizerByObject ( object: object ): Visualizer<object> {
		return this.visualizers.get( object.constructor as ConstructorFunction );
	}

	addController ( key: ConstructorFunction, controller: BaseController<object> ): void {
		this.controllers.set( key, controller );
	}

	getDragHandler ( key: ConstructorFunction ): BaseDragHandler<object> {
		return this.dragManager.getDragHandler( key );
	}

	addVisualizer ( key: ConstructorFunction, visualizer: Visualizer<object> ): void {
		this.visualizers.set( key, visualizer );
	}

	addDragHandler ( key: ConstructorFunction, dragHandler: BaseDragHandler<object> ): void {
		this.dragManager.addDragHandler( key, dragHandler );
	}

	getControllers (): Map<ConstructorFunction, BaseController<object>> {
		return this.controllers;
	}

	getVisualizers (): Map<ConstructorFunction, Visualizer<object>> {
		return this.visualizers;
	}

	getDragHandlers (): Map<ConstructorFunction, BaseDragHandler<object>> {
		return this.dragManager.getDragHandlers();
	}

	handleAction ( object: object, action: 'onAdded' | 'onRemoved' ): void {

		const controller = this.getControllerByObject( object );
		const visualizer = this.getVisualizerByObject( object );

		if ( controller && typeof controller[ action ] === 'function' ) {
			controller[ action ]( object );
		} else {
			Log.warn( 'Invalid controller/action for object type', object.toString() );
		}

		if ( visualizer && typeof visualizer[ action ] === 'function' ) {
			visualizer[ action ]( object );
		} else {
			Log.warn( 'Invalid debugger handler for object type', object.toString() );
		}

	}

	addObject ( object: object ): void {

		// NOT NEEDED, TESTS ARE FAILING
		// this.selectionService.getSelectedObjects().forEach( selected => this.handleDeselection( selected ) );

		this.getControllerByObject( object )?.onAdded( object );

		this.getVisualizerByObject( object )?.onAdded( object );

		// this.setObjectHint( object, 'onAdded' );

	}

	handleSelection ( object: object ): void {

		const handle = ( item ) => {

			const visualizer = this.getVisualizerByObject( item );

			this.selectionService.addToSelected( item );

			visualizer.onSelected( item );

			// this.setObjectHint( item, 'onSelected' );

		};

		if ( Array.isArray( object ) ) {

			object.forEach( handle );

		} else {

			handle( object );

		}

	}

	handleDeselection ( object: object ): void {

		const handle = ( item ) => {

			const visualizer = this.getVisualizerByObject( item );

			visualizer.onUnselected( item );

			// this.setObjectHint( item, 'onUnselected' );

			this.selectionService.removeFromSelected( item );

		};

		if ( Array.isArray( object ) ) {

			object.forEach( handle );

		} else {

			handle( object );

		}
	}

	hasHandlersForObject ( object: object ): boolean {

		if ( Array.isArray( object ) ) {
			return object.every( item => this.hasControllerForObject( item ) && this.hasVisualizerForObject( item ) );
		}

		return this.hasControllerForObject( object ) && this.hasVisualizerForObject( object )
	}

	hasHandlersForKey ( key: ConstructorFunction ): boolean {
		return this.controllers.has( key ) && this.visualizers.has( key );
	}

	hasControllerForObject ( object: object ): boolean {
		return this.controllers.has( object.constructor as ConstructorFunction );
	}

	hasVisualizerForObject ( object: object ): boolean {
		return this.visualizers.has( object.constructor as ConstructorFunction );
	}

	updateVisuals ( object: object ): void {
		this.getVisualizerByObject( object )?.onUpdated( object );
	}

	getControllerCount (): number {
		return this.controllers.size;
	}

	showInspector ( object: object ): void {
		this.getControllerByObject( object )?.showInspector( object );
	}

	removeObject ( object: object ): void {

		if ( this.hasHandlersForObject( object ) ) {

			this.handleAction( object, 'onRemoved' );

		} else {

			Log.error( `unknown object removed: ${ object.toString() }` );

		}
	}

	updateObject ( object: object ): void {

		if ( !this.hasHandlersForObject( object ) ) {
			Log.error( `unknown object updated: ${ object.toString() }` );
			return;
		}

		const controller = this.getControllerByObject( object );
		const visualizer = this.getVisualizerByObject( object );

		try {

			controller.validate( object );

		} catch ( error ) {

			if ( error instanceof ValidationException ) {

				StatusBarService.setError( error.message );

			} else {

				// log unexpected error and return
				Log.error( error );
				return;

			}

		}

		controller.onUpdated( object );

		visualizer.onUpdated( object );

	}

	handleDrag ( object: object, e: PointerEventData ): void {

		this.dragManager.handleDrag( object, e );

	}

	handleDragEnd ( e: PointerEventData ): void {

		this.dragManager.handleDragEnd( e );

	}

	handleHighlight ( e: PointerEventData ): void {

		this.resetHighlighted();

		const object = this.selectionService.executeSelection( e );

		if ( !object ) return;

		if ( this.selectionService.isObjectSelected( object ) ) {
			if ( this.debug ) Log.info( 'ignoring selected object', object.toString() );
			return;
		}

		const visualizer = this.getVisualizerByObject( object );

		if ( !visualizer ) {
			if ( this.debug ) Log.warn( `No handler found for ${ object.toString() }` );
			return;
		}

		if ( this.debug ) Log.info( 'highlighting object', object.toString() );

		visualizer.onHighlight( object );

		visualizer.addToHighlighted( object );

	}

	private resetHighlighted (): void {

		if ( this.debug ) Log.info( 'resetting highlighted objects' );

		this.visualizers.forEach( ( visualizer ) => {

			const highlighted = visualizer.getHighlighted();

			highlighted.forEach( highlightedObject => {

				if ( this.selectionService.isObjectSelected( highlightedObject ) ) {
					return;
				}

				visualizer.onDefault( highlightedObject );

				visualizer.removeFromHighlighted( highlightedObject );

			} );

		} );

	}
}
