/*
 * Copyright Truesense AI Solutions Pvt Ltd, All Rights Reserved.
 */


import { BaseTool } from './base-tool';
import { PointerEventData } from 'app/events/pointer-event-data';

export abstract class ToolWithHandler<T> extends BaseTool<T> {

	override onObjectAdded ( object: Object ): void {

		const objectHandler = this.objectHandlers.get( object.constructor.name );

		objectHandler.getSelected().forEach( selected => this.onObjectUnselected( selected ) );

		const overlayHandler = this.overlayHandlers.get( object.constructor.name );

		objectHandler.onAdded( object );

		overlayHandler.onAdded( object );

		this.setObjectHint( object, 'onAdded' );

	}

	override onObjectUpdated ( object: Object ): void {

		this.handleAction( object, 'onUpdated' );

	}

	override onObjectRemoved ( object: Object ): void {

		this.handleAction( object, 'onRemoved' );

	}

	override onObjectSelected ( object: Object ): void {

		this.handleSelectionWithHandlers( object );

		this.setObjectHint( object, 'onSelected' );

	}

	override onObjectUnselected ( object: Object ): void {

		this.handleUnselectionWithHandlers( object );

		this.setObjectHint( object, 'onUnselected' );

	}

	protected override highlight ( e: PointerEventData ): void {

		this.highlightWithHandlers( e );

	}

}

