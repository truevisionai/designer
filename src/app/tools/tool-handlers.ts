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

export class ToolHandlers {

	private debug = false;

	private controllers: Map<string, BaseController<object>>;
	private visualizers: Map<string, Visualizer<object>>;
	private dragManager: DragManager;

	constructor ( private selectionService: SelectionService ) {
		this.controllers = new Map();
		this.visualizers = new Map();
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

	getController ( objectName: string ): BaseController<object> {
		return this.controllers.get( objectName );
	}

	addController ( objectName: string, controller: BaseController<object> ): void {
		this.controllers.set( objectName, controller );
	}

	getDragHandler ( objectName: string ): BaseDragHandler<object> {
		return this.dragManager.getDragHandler( objectName );
	}

	addVisualizer ( objectName: string, visualizer: Visualizer<object> ): void {
		this.visualizers.set( objectName, visualizer );
	}

	addDragHandler ( objectName: string, dragHandler: BaseDragHandler<object> ): void {
		this.dragManager.addDragHandler( objectName, dragHandler );
	}

	getControllers (): Map<string, BaseController<object>> {
		return this.controllers;
	}

	getVisualizers (): Map<string, Visualizer<object>> {
		return this.visualizers;
	}

	getDragHandlers (): Map<string, BaseDragHandler<object>> {
		return this.dragManager.getDragHandlers();
	}

	handleAction ( object: object, action: 'onAdded' | 'onRemoved' ): void {

		const controller = this.controllers.get( object.constructor.name );
		const visualizer = this.visualizers.get( object.constructor.name );

		if ( controller && typeof controller[ action ] === 'function' ) {
			controller[ action ]( object );
		} else {
			Log.warn( 'Invalid controller/action for object type', object.constructor.name );
		}

		if ( visualizer && typeof visualizer[ action ] === 'function' ) {
			visualizer[ action ]( object );
		} else {
			Log.warn( 'Invalid debugger handler for object type', object.constructor.name );
		}

	}

	addObject ( object: object ): void {

		// NOT NEEDED, TESTS ARE FAILING
		// this.selectionService.getSelectedObjects().forEach( selected => this.handleDeselection( selected ) );

		this.controllers.get( object.constructor.name )?.onAdded( object );

		this.visualizers.get( object.constructor.name )?.onAdded( object );

		// this.setObjectHint( object, 'onAdded' );

	}

	handleSelection ( object: object ): void {

		const handle = ( item ) => {

			const visualizer = this.visualizers.get( item.constructor.name );

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

			const visualizer = this.visualizers.get( item.constructor.name );

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

	hasHandlersFor ( object: object ): boolean {

		if ( Array.isArray( object ) ) {
			return object.every( item => this.hasHandlersForName( item.constructor.name ) );
		}

		return this.hasHandlersForName( object.constructor.name );

	}

	hasHandlersForName ( objectName: string ): boolean {

		return this.controllers.has( objectName ) && this.visualizers.has( objectName );

	}

	updateVisuals ( object: object ): void {
		if ( this.visualizers.has( object.constructor.name ) ) {
			this.visualizers.get( object.constructor.name ).onUpdated( object );
		} else {
			Log.error( `No visualizer found for ${ object.constructor.name }` );
		}
	}

	getControllerCount (): number {
		return this.controllers.size;
	}

	showInspector ( object: object ): void {

		this.getController( object.constructor.name )?.showInspector( object );

	}

	removeObject ( object: object ): void {

		if ( this.hasHandlersFor( object ) ) {

			this.handleAction( object, 'onRemoved' );

		} else {

			Log.error( `unknown object removed: ${ object.constructor.name }` );

		}
	}

	updateObject ( object: object ): void {

		if ( !this.hasHandlersFor( object ) ) {
			Log.error( `unknown object updated: ${ object.constructor.name }` );
			return;
		}

		const controller = this.controllers.get( object.constructor.name );
		const visualizer = this.visualizers.get( object.constructor.name );

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

		const visualizer = this.visualizers.get( object.constructor.name );

		if ( !visualizer ) {
			if ( this.debug ) Log.warn( `No handler found for ${ object.constructor.name }` );
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
