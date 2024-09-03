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

export class ToolHandlers {

	private debug = false;

	private controllers: Map<string, BaseController<object>>;
	private visualizers: Map<string, Visualizer<object>>;

	constructor ( private selectionService: SelectionService ) {
		this.controllers = new Map();
		this.visualizers = new Map();
	}

	disable (): void {

		this.visualizers.forEach( handler => handler.clear() );
		this.visualizers.forEach( handler => handler.disable() );

		this.controllers.forEach( handler => {
			handler.getSelected().forEach( selected => handler.unselect( selected ) );
		} );

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

	addVisualizer ( objectName: string, visualizer: Visualizer<object> ): void {
		this.visualizers.set( objectName, visualizer );
	}

	getControllers (): Map<string, BaseController<object>> {
		return this.controllers;
	}

	getVisualizers (): Map<string, Visualizer<object>> {
		return this.visualizers;
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

		const controller = this.controllers.get( object.constructor.name );

		controller.getSelected().forEach( selected => this.handleDeselection( selected ) );

		const visualizer = this.visualizers.get( object.constructor.name );

		controller.onAdded( object );

		visualizer.onAdded( object );

		// this.setObjectHint( object, 'onAdded' );

	}

	handleSelection ( object: object ): void {

		const handle = ( item ) => {

			const controller = this.controllers.get( item.constructor.name );

			const visualizer = this.visualizers.get( item.constructor.name );

			this.selectionService.addToSelected( item );

			controller.select( item );

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

			const controller = this.controllers.get( item.constructor.name );

			const visualizer = this.visualizers.get( item.constructor.name );

			controller.unselect( item );

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

	handleHighlight ( e: PointerEventData ): void {

		this.resetHighlightedObjects();

		const objectToHighlight = this.selectionService.highlight( e );

		if ( !objectToHighlight ) return;

		const controller = this.controllers.get( objectToHighlight.constructor.name );

		const visualizer = this.visualizers.get( objectToHighlight.constructor.name );

		if ( !controller || !visualizer ) {
			Log.warn( `No handler found for ${ objectToHighlight.constructor.name }` );
			return;
		}

		// If the object is already selected, don't highlight it
		if ( controller.isSelected( objectToHighlight ) ) return;

		if ( this.debug ) Log.info( 'highlighting object', objectToHighlight.toString() );

		visualizer.onHighlight( objectToHighlight );

		visualizer.addToHighlighted( objectToHighlight );

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

	private resetHighlightedObjects (): void {

		if ( this.debug ) Log.info( 'resetting highlighted objects' );

		this.visualizers.forEach( ( visualizer, name ) => {

			const selected = this.controllers.get( name ).getSelected();

			visualizer.getHighlighted().forEach( highlightedObject => {

				if ( selected.includes( highlightedObject ) ) return;

				if ( this.debug ) Log.info( 'resetting highlighted object', highlightedObject.toString() );

				visualizer.onDefault( highlightedObject );

				visualizer.removeFromHighlighted( highlightedObject );

			} );

		} );

	}
}
