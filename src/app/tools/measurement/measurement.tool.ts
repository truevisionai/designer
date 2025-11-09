/*
 * Copyright Truesense AI Solutions Pvt Ltd, All Rights Reserved.
 */

import { PointerEventData, } from 'app/events/pointer-event-data';
import { ToolType } from '../tool-types.enum';
import { BaseTool } from '../base-tool';
import { SceneService } from 'app/services/scene.service';
import { MeasurementToolService } from './measurement-tool.service';
import { BufferGeometry, Line, LineBasicMaterial } from "three";
import { TooltipRef } from 'app/services/debug/tool-tip.service';
import { AbstractControlPoint } from 'app/objects/abstract-control-point';
import { Vector3 } from 'app/core/maths';

export class MeasurementTool extends BaseTool<any>{

	public name: string = 'MeasurementTool';

	public toolType = ToolType.MeasurementTool;

	private line: THREE.Line;

	private start: Vector3;
	private startPoint: AbstractControlPoint;
	private endPoint: AbstractControlPoint;

	private toolTip: TooltipRef;

	constructor ( private tool: MeasurementToolService ) {

		super();

		this.setHint( 'Measurement Tool is used for measurements of various objects, roads, lanes in the scene' );

	}

	disable (): void {

		super.disable();

		if ( this.line ) SceneService.removeFromTool( this.line );

		if ( this.startPoint ) SceneService.removeFromTool( this.startPoint );

		if ( this.endPoint ) SceneService.removeFromTool( this.endPoint );

		if ( this.toolTip ) this.tool.removeToolTip( this.toolTip );

	}

	onPointerDownSelect ( pointerEventData: PointerEventData ): void {

		if ( !this.start ) {

			this.start = pointerEventData.point;

			const geometry = new BufferGeometry().setFromPoints( [ this.start, this.start ] );

			const material = new LineBasicMaterial( {
				color: 0xffffff,
				linewidth: 5,
				depthTest: false,
				depthWrite: false,
				transparent: true,
			} );

			this.line = new Line( geometry, material );

			this.line.renderOrder = 999;

			this.startPoint = this.tool.controlPointFactory.createSimpleControlPoint( null, this.start );

			this.endPoint = this.tool.controlPointFactory.createSimpleControlPoint( null, this.start );

			SceneService.addToolObject( this.line );

			SceneService.addToolObject( this.startPoint );

			SceneService.addToolObject( this.endPoint );

			this.toolTip = this.tool.showToolTipAt( 'Distance', pointerEventData.point );

		} else {

			this.start = null;

			this.line.geometry.dispose();

			this.tool.removeToolTip( this.toolTip );

			SceneService.removeFromTool( this.line );

			SceneService.removeFromTool( this.startPoint );

			SceneService.removeFromTool( this.endPoint );

		}

	}

	onPointerMoved ( pointerEventData: PointerEventData ): void {

		if ( !this.start ) return;

		if ( !this.line ) return;

		this.line.geometry.dispose();

		this.line.geometry = new BufferGeometry().setFromPoints( [ this.start, pointerEventData.point ] );

		const distance = this.start?.distanceTo( pointerEventData.point ).toFixed( 2 );

		if ( this.toolTip ) {
			this.tool.updateToolTip( this.toolTip.id, distance + 'm' );
		}

		if ( this.endPoint ) {
			this.endPoint.position.copy( pointerEventData.point );
		}

	}

}
