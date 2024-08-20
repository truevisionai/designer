/*
 * Copyright Truesense AI Solutions Pvt Ltd, All Rights Reserved.
 */


import { ObjectHandler } from 'app/core/object-handlers/object-handler';
import { BaseTool } from './base-tool';
import { OverlayHandler } from "../core/overlay-handlers/overlay-handler";
import { PointerEventData } from 'app/events/pointer-event-data';

export abstract class ToolWithHandler<T> extends BaseTool<T> {

	protected objectHandlers: Map<string, ObjectHandler<Object>>;

	protected overlayHandlers: Map<string, OverlayHandler<Object>>;

	disable (): void {

		super.disable();

		this.overlayHandlers.forEach( handler => handler.clear() );

		this.overlayHandlers.forEach( handler => handler.disable() );

	}

	override onObjectAdded ( object: Object ): void {

		const objectHandler = this.objectHandlers.get( object.constructor.name );

		objectHandler.getSelected().forEach( selected => this.onObjectUnselected( selected ) );

		const overlayHandler = this.overlayHandlers.get( object.constructor.name );

		objectHandler.onAdded( object );

		overlayHandler.onAdded( object );

	}

	override onObjectUpdated ( object: Object ): void {

		this.handleAction( object, 'onUpdated' );

	}

	override onObjectRemoved ( object: Object ): void {

		this.handleAction( object, 'onRemoved' );

	}

	override onObjectSelected ( object: Object ): void {

		const handle = ( item ) => {

			const objectHandler = this.objectHandlers.get( item.constructor.name );

			const overlayHandler = this.overlayHandlers.get( item.constructor.name );

			objectHandler.select( item );

			overlayHandler.onSelected( item );

		}

		if ( Array.isArray( object ) ) {

			object.forEach( handle );

		} else {

			handle( object );

		}
	}

	override onObjectUnselected ( object: Object ): void {

		const handle = ( item ) => {

			const objectHandler = this.objectHandlers.get( item.constructor.name );

			const overlayHandler = this.overlayHandlers.get( item.constructor.name );

			objectHandler.unselect( item );

			overlayHandler.onUnselected( item );

		}

		if ( Array.isArray( object ) ) {

			object.forEach( handle );

		} else {

			handle( object );

		}

	}

	protected override highlight ( e: PointerEventData ): void {

		this.overlayHandlers.forEach( ( overlayHandler, name ) => {

			const selected = this.objectHandlers.get( name ).getSelected();

			overlayHandler.getHighlighted().forEach( object => {

				if ( selected.includes( object ) ) return;

				overlayHandler.onDefault( object );

			} );

		} );

		const object = this.selectionService.highlight( e );
		if ( !object ) return;

		const objectHandler = this.objectHandlers.get( object.constructor.name );
		const overlayHandler = this.overlayHandlers.get( object.constructor.name );

		if ( !objectHandler || !overlayHandler ) {
			console.warn( `No handler found for ${ object.constructor.name }` );
			return;
		}

		// If the object is already selected, don't highlight it
		if ( objectHandler.isSelected( object ) ) return;

		overlayHandler.onHighlight( object );

	}

	private handleAction ( object: Object, action: 'onAdded' | 'onUpdated' | 'onRemoved' | 'onSelected' | 'onUnselected' ): void {

		const objectHandler = this.objectHandlers.get( object.constructor.name );
		const overlayHandler = this.overlayHandlers.get( object.constructor.name );

		if ( objectHandler && typeof objectHandler[ action ] === 'function' ) {
			objectHandler[ action ]( object );
		} else {
			console.warn( 'Invalid selection handler for object type', object );
		}

		if ( overlayHandler && typeof overlayHandler[ action ] === 'function' ) {
			overlayHandler[ action ]( object );
		} else {
			console.warn( 'Invalid debugger handler for object type', object );
		}

	}

}

