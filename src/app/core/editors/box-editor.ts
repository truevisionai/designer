/*
 * Copyright Truesense AI Solutions Pvt Ltd, All Rights Reserved.
 */

import { EventEmitter } from '@angular/core';
import { KeyboardEvents } from 'app/events/keyboard-events';
import { MouseButton, PointerEventData, PointerMoveData } from 'app/events/pointer-event-data';
import { COLOR } from 'app/views/shared/utils/colors.service';
import { BoxGeometry, Mesh, MeshBasicMaterial } from 'three';
import { AppService } from '../../services/app.service';
import { SceneService } from '../../services/scene.service';
import { AbstractShapeEditor } from './abstract-shape-editor';

export interface BoxCreatedEvent {
	mesh?: Mesh;
	geometry?: BoxGeometry;
	height?: number;
	width?: number;
	length?: number;
}

export class BoxEditor extends AbstractShapeEditor {

	boxGeometry = new BoxGeometry();
	boxMaterial = new MeshBasicMaterial( { color: COLOR.RED } );
	boxMesh: Mesh;

	height: number;
	width: number;
	length: number = 1;

	boxCreated = new EventEmitter<BoxCreatedEvent>();

	boxes: Mesh[] = [];

	creating = false;

	constructor ( public keepAspectRatio: boolean = false ) {

		super();

	}

	disable () {

		super.disable();

		AppService.three.enableControls();

	}

	draw () {

		this.boxGeometry = new BoxGeometry( this.height, this.width, this.length );

		if ( this.boxMesh ) SceneService.removeFromMain( this.boxMesh );

		this.boxMesh = new Mesh( this.boxGeometry, this.boxMaterial );

		this.boxMesh.position.copy( this.pointerDownAt );

		SceneService.addToMain( this.boxMesh );
	}

	onPointerDown ( e: PointerEventData ) {

		AppService.three.disableControls();

		if ( e.button !== MouseButton.LEFT && !KeyboardEvents.isShiftKeyDown ) return;

		this.pointerIsDown = true;
		this.pointerDownAt = e.point;

	}

	onPointerUp ( e: PointerEventData ) {

		AppService.three.enableControls();

		if ( e.button !== MouseButton.LEFT || !this.creating ) return;

		this.creating = false;

		this.pointerIsDown = false;

		if ( this.boxMesh ) SceneService.removeFromMain( this.boxMesh );

		const cp = this.addControlPoint( this.boxMesh.position );

		const box = new Mesh( this.boxGeometry, this.boxMaterial );

		box.position.copy( this.boxMesh.position );

		this.boxes.push( box );

		this.boxCreated.emit( {
			mesh: box,
			geometry: this.boxGeometry,
			height: this.length,
			width: this.height,
			length: this.width,
		} );

	}

	onPointerMoved ( e: PointerMoveData ) {

		if ( this.pointerIsDown && KeyboardEvents.isShiftKeyDown ) {

			this.creating = true;

			// this.height = this.pointerDownAt.distanceTo( e.point );
			// this.width = this.pointerDownAt.distanceTo( e.point );
			// this.depth = this.pointerDownAt.distanceTo( e.point );

			const startPoint = this.pointerDownAt;
			const endPoint = e.point;

			// const tmpPoint = startPoint.clone();

			// tmpPoint.x = Math.min( startPoint.x, endPoint.x );
			// tmpPoint.y = Math.max( startPoint.y, endPoint.y );
			// endPoint.x = Math.max( startPoint.x, endPoint.x );
			// endPoint.y = Math.min( startPoint.y, endPoint.y );


			this.width = Math.abs( startPoint.y - endPoint.y ) * 2;
			this.height = Math.abs( startPoint.x - endPoint.x ) * 2;

			this.draw();
		}

		if ( this.pointerIsDown && this.currentPoint != null ) {

			e.point.z = 0;

			this.currentPoint.copyPosition( e.point );

			this.controlPointMoved.emit( this.currentPoint );


		}

	}

}
