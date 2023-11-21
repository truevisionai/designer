/*
 * Copyright Truesense AI Solutions Pvt Ltd, All Rights Reserved.
 */

import { KeyboardEvents } from 'app/events/keyboard-events';
import { MouseButton, PointerEventData } from 'app/events/pointer-event-data';
import * as THREE from 'three';
import { SceneService } from '../../services/scene.service';
import { AbstractShapeEditor } from './abstract-shape-editor';
import { AnyControlPoint } from "../../modules/three-js/objects/any-control-point";

export class LineEditor extends AbstractShapeEditor {

	public curve: THREE.LineCurve3;

	private readonly maxPoints: number;

	constructor ( maxLines: number = 1 ) {

		super();

		this.maxPoints = maxLines * 2;

	}

	public draw () {

		if ( this.object != null ) SceneService.removeFromMain( this.object, false );

		this.curve = new THREE.LineCurve3( this.controlPointPositions[ 0 ], this.controlPointPositions[ 1 ] );

		const points = this.curve.getPoints( 2 );

		const material = new THREE.LineBasicMaterial( { color: '#afbeff' } );

		const geometry = new THREE.BufferGeometry().setFromPoints( points );

		this.object = new THREE.Line( geometry, material );

		this.object.name = 'Line';

		this.object.userData.is_selectable = false;

		this.object.renderOrder = 3;

		SceneService.addToMain( this.object, false );

		this.curveGeometryChanged.emit( this.curve );
	}

	onPointerDown ( e: PointerEventData ) {

		if ( e.button !== MouseButton.LEFT ) return;

		this.pointerIsDown = true;

		this.pointerDownAt = e.point;

		if ( this.controlPoints.length >= this.maxPoints ) return;

		if ( e.button === MouseButton.LEFT && KeyboardEvents.isShiftKeyDown && e.point != null ) {

			this.addControlPoint( e.point );

			if ( this.controlPoints.length > 1 ) this.draw();

		} else if ( e.button === MouseButton.LEFT ) {

			for ( const i of e.intersections ) {

				if ( i.object.type === 'Points' ) {

					this.unSelectControlPoint( this.currentPoint );

					this.selectControlPoint( i.object as AnyControlPoint );

					break;

				}

			}

		}
	}

}
