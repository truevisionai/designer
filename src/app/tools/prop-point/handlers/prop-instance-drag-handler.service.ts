/*
 * Copyright Truesense AI Solutions Pvt Ltd, All Rights Reserved.
 */

import { Injectable } from '@angular/core';
import { BaseDragHandler } from 'app/core/drag-handlers/base-drag-handler';
import { PointerEventData } from 'app/events/pointer-event-data';
import { PropInstance } from 'app/map/prop-point/prop-instance.object';
import { Commands } from 'app/commands/commands';

@Injectable( {
	providedIn: 'root'
} )
export class PropInstanceDragHandler extends BaseDragHandler<PropInstance> {

	onDragStart ( object: PropInstance, event: PointerEventData ): void {

		if ( event.point ) {
			object.setPosition( event.point );
		}
	}

	onDrag ( object: PropInstance, event: PointerEventData ): void {

		if ( !event.point ) return;

		object.setPosition( event.point );
		object.update();
	}

	onDragEnd ( object: PropInstance, event: PointerEventData ): void {

		if ( !event.point ) return;

		Commands.UpdatePosition( object, event.point, this.dragStartPosition );
	}

}
