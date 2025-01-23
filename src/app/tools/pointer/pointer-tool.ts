/*
 * Copyright Truesense AI Solutions Pvt Ltd, All Rights Reserved.
 */

import { PointerEventData, PointerMoveData } from 'app/events/pointer-event-data';
import { TextObject } from 'app/objects/text-object';
import * as THREE from "three";
import { ToolType } from '../tool-types.enum';
import { BaseTool } from '../base-tool';

export class PointerTool extends BaseTool<any>{

	public name: string = 'PointerTool';

	public toolType = ToolType.Pointer;

	private line: THREE.Line;
	private text: TextObject;

	constructor () {

		super();

		this.setHint( 'Pointer Tool is used to browse and move through the scene' );

	}

	onPointerDown ( pointerEventData: PointerEventData ): void {

		// const geometry = new THREE.BufferGeometry().setFromPoints( [ pointerEventData.point, pointerEventData.point ] );

		// const material = new THREE.LineBasicMaterial( { color: 0xffffff, linewidth: 5 } );

		// this.line = new THREE.Line( geometry, material );

		// // Calculate the precision based on the approxCameraDistance
		// let precision = Math.exp( 0.001 * pointerEventData.approxCameraDistance ) * 5;

		// precision = Math.min( precision, 10 );

		// this.text = new TextObject( 'Distance', this.pointerDownAt, precision );

		// SceneService.add( this.line );

	}

	onPointerMoved ( pointerEventData: PointerMoveData ): void {

		// if ( !this.isPointerDown ) return;

		// this.line.geometry.dispose();

		// this.line.geometry = new THREE.BufferGeometry().setFromPoints( [ this.pointerDownAt, pointerEventData.point ] );

		// const distance = this.pointerDownAt?.distanceTo( pointerEventData.point ).toFixed( 2 );

		// this.text?.updateText( distance + 'm' );

	}

	onPointerUp ( pointerEventData: PointerEventData ): void {

		// this.text?.remove();

		// SceneService.remove( this.line );
	}

}
