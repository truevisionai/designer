/*
 * Copyright Truesense AI Solutions Pvt Ltd, All Rights Reserved.
 */

import { PointerEventData, } from 'app/events/pointer-event-data';
import { TextObject3d } from 'app/modules/three-js/objects/text-object';
import { ToolType } from '../tool-types.enum';
import { BaseTool } from '../base-tool';
import { SceneService } from 'app/services/scene.service';
import { MeasurementToolService } from './measurement-tool.service';
import { BufferGeometry, Line, LineBasicMaterial } from 'three';

export class MeasurementTool extends BaseTool {

	public name: string = 'MeasurementTool';

	public toolType = ToolType.MeasurementTool;

	private line: THREE.Line;

	private text: TextObject3d;

	private start: THREE.Vector3;

	constructor ( private tool: MeasurementToolService ) {

		super();

		this.setHint( 'Measurement Tool is used for measurements of various objects, roads, lanes in the scene' );

	}

	disable (): void {

		super.disable();

		if ( this.line ) {

			SceneService.removeFromTool( this.line );

			this.line.geometry.dispose();

			this.line = null;

		}

		this.text?.remove();

	}

	onPointerDownSelect ( pointerEventData: PointerEventData ): void {

		if ( !this.start ) {

			this.start = pointerEventData.point;

			const geometry = new BufferGeometry().setFromPoints( [ this.start, this.start ] );

			const material = new LineBasicMaterial( { color: 0xffffff, linewidth: 5, } );

			this.line = new Line( geometry, material );

			const textSize = this.calculateTextSize( pointerEventData );

			this.text = this.tool.showTextAt( 'Distance', this.start, textSize );

			SceneService.addToolObject( this.line );

		} else {

			this.start = null;

			SceneService.removeFromTool( this.line );

			this.line.geometry.dispose();

			this.line = null;

			this.text?.remove();
		}

	}

	onPointerMoved ( pointerEventData: PointerEventData ): void {

		if ( !this.start ) return;

		if ( !this.line ) return;

		this.line.geometry.dispose();

		this.line.geometry = new BufferGeometry().setFromPoints( [ this.start, pointerEventData.point ] );

		const distance = this.start?.distanceTo( pointerEventData.point ).toFixed( 2 );

		this.tool.updateText( this.text, distance + 'm' );

	}

	private calculateTextSize ( pointerEventData: PointerEventData ): number {

		const minTextSize = 1; // minimum text size
		const maxTextSize = 30; // maximum text size
		const minCameraDistance = 10; // minimum expected camera distance
		const maxCameraDistance = 1000; // maximum expected camera distance

		let textSize: number;

		if ( pointerEventData.approxCameraDistance <= minCameraDistance ) {

			textSize = minTextSize;

		} else if ( pointerEventData.approxCameraDistance >= maxCameraDistance ) {

			textSize = maxTextSize;

		} else {

			// Linear interpolation between minTextSize and maxTextSize
			const fraction = ( pointerEventData.approxCameraDistance - minCameraDistance ) / ( maxCameraDistance - minCameraDistance );

			textSize = minTextSize + fraction * ( maxTextSize - minTextSize );

		}

		textSize = Math.min( Math.max( textSize, minTextSize ), maxTextSize ); // Clamping the value

		return textSize;

	}
}
