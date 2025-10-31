import { Injectable } from '@angular/core';
import { PointerEventData } from 'app/events/pointer-event-data';
import { IView, isView } from 'app/tools/lane/visualizers/i-view';

@Injectable( {
	providedIn: 'root'
} )
export class ViewportDragManager {

	private selectedObject: IView | undefined;

	isDragging: boolean;

	onDragStart ( selectedObject: object, event: PointerEventData ): void {

		if ( !isView( selectedObject ) ) return;

		this.selectedObject = selectedObject;

		this.isDragging = true;

		this.selectedObject.emit( 'dragStart', event );

	}

	onDragEnd ( event: PointerEventData ): void {

		this.isDragging = false;

		if ( !isView( this.selectedObject ) ) return;

		this.selectedObject.emit( 'dragEnd', event );

		this.selectedObject = undefined;

	}

	onDrag ( object: object, event: PointerEventData ): void {

		if ( !isView( this.selectedObject ) ) return;

		this.selectedObject.emit( 'drag', event );

	}

}
