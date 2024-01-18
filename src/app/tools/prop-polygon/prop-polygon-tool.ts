/*
 * Copyright Truesense AI Solutions Pvt Ltd, All Rights Reserved.
 */

import { IToolWithMainObject, IToolWithPoint, SelectPointCommand } from 'app/commands/select-point-command';
import { PropModel } from 'app/core/models/prop-model.model';
import { ControlPointStrategy } from 'app/core/snapping/select-strategies/control-point-strategy';
import { ObjectUserDataStrategy } from 'app/core/snapping/select-strategies/object-tag-strategy';
import { SelectStrategy } from 'app/core/snapping/select-strategies/select-strategy';
import { MouseButton, PointerEventData } from 'app/events/pointer-event-data';
import { UpdatePositionCommand } from 'app/commands/copy-position-command';
import { CommandHistory } from 'app/services/command-history';
import { PropManager } from 'app/managers/prop-manager';
import { SnackBar } from 'app/services/snack-bar.service';
import { DynamicInspectorComponent } from 'app/views/inspectors/dynamic-inspector/dynamic-inspector.component';
import { DynamicControlPoint } from '../../modules/three-js/objects/dynamic-control-point';
import { PropPolygon } from '../../modules/tv-map/models/prop-polygons';
import { KeyboardEvents } from '../../events/keyboard-events';
import { ToolType } from '../tool-types.enum';
import { BaseTool } from '../base-tool';
import { AddPropPolygonPointCommand } from './add-prop-polygon-point-command';
// import { CreatePropPolygonCommand } from './create-prop-polygon-command';
import { SelectMainObjectCommand } from "../../commands/select-main-object-command";
import { PropPolygonToolService } from "./prop-polygon-tool.service";
import { Vector3 } from 'three';

export class PropPolygonTool extends BaseTool implements IToolWithPoint, IToolWithMainObject {

	public name: string = 'PropPolygonTool';

	public toolType: ToolType = ToolType.PropPolygon;

	public point: DynamicControlPoint<PropPolygon>;

	public propPolygon: PropPolygon;

	private controlPointStrategy: SelectStrategy<DynamicControlPoint<PropPolygon>>;

	private objectStrategy: SelectStrategy<PropPolygon>;

	constructor (
		private tool: PropPolygonToolService
	) {

		super();

		this.controlPointStrategy = new ControlPointStrategy<DynamicControlPoint<PropPolygon>>();

		this.objectStrategy = new ObjectUserDataStrategy<PropPolygon>( PropPolygon.tag, 'polygon' );

		this.setHint( 'Use LEFT CLICK to select control point or use SHIFT + LEFT CLICK to create control point' );
	}

	private get prop (): PropModel {

		const prop = PropManager.getProp();

		if ( prop ) {

			return new PropModel(
				prop.guid,
				prop.data.rotationVariance || new Vector3( 0, 0, 0 ),
				prop.data.scaleVariance || new Vector3( 0, 0, 0 )
			);

		}

	}

	setMainObject ( value: PropPolygon ): void {

		this.propPolygon = value;

	}

	getMainObject (): PropPolygon {

		return this.propPolygon;

	}


	setPoint ( value: DynamicControlPoint<PropPolygon> ): void {

		this.point = value;

	}

	getPoint (): DynamicControlPoint<PropPolygon> {

		return this.point;

	}

	enable (): void {

		super.enable();

		this.tool.mapService.map.propPolygons.forEach( polygon => polygon.show() );

	}


	disable (): void {

		super.disable();

		this.tool.mapService.map.propPolygons.forEach( polygon => polygon.hide() );

	}

	onPointerDown ( e: PointerEventData ): void {

		if ( e.button !== MouseButton.LEFT ) return;

		if ( KeyboardEvents.isShiftKeyDown ) {

			this.handleCreationMode( e );

		} else {

			this.handleSelectionMode( e );

		}

	}

	handleSelectionMode ( e: PointerEventData ) {

		const point = this.controlPointStrategy.onPointerDown( e );

		if ( point ) {

			if ( point === this.point ) return;

			const cmd = new SelectPointCommand( this, point, DynamicInspectorComponent, point.mainObject );

			CommandHistory.execute( cmd );

			this.setHint( 'Drag control point using LEFT CLICK is down' );

			return;
		}


		const polygon = this.objectStrategy.onPointerDown( e );

		if ( polygon ) {

			if ( polygon === this.propPolygon ) return;

			const cmd = new SelectMainObjectCommand( this, polygon, DynamicInspectorComponent, polygon );

			CommandHistory.execute( cmd );

			this.setHint( 'Drag control point using LEFT CLICK is down' );

			return;

		}


		if ( this.point || this.propPolygon ) {

			CommandHistory.executeMany(
				new SelectPointCommand( this, null, DynamicInspectorComponent, null ),

				new SelectMainObjectCommand( this, null, DynamicInspectorComponent, null )
			);

		}


		this.setHint( 'Use LEFT CLICK to select control point or use SHIFT + LEFT CLICK to create control point' );

	}

	handleCreationMode ( e: PointerEventData ) {

		if ( !this.prop ) this.tool.base.setWarning( 'Select a prop from the project browser' );

		if ( !this.prop ) this.setHint( 'Select a prop from the project browser' );

		if ( !this.prop ) return;

		if ( !this.point ) {

			// CommandHistory.execute( new CreatePropPolygonCommand( this, this.prop, e.point ) );

			this.setHint( 'Add two more control point to create polygon' );

		} else {

			CommandHistory.execute( new AddPropPolygonPointCommand( this, this.point.mainObject, e.point ) );

			this.setHint( 'Add more control points or drag control points to modify polygon' );
		}
	}

	onPointerMoved ( pointerEventData: PointerEventData ): void {

		if ( pointerEventData.button !== MouseButton.LEFT ) return;

		if ( !this.point?.isSelected ) return;

		if ( !this.pointerDownAt ) return;

		this.point?.position.copy( pointerEventData.point );

		this.point?.mainObject?.spline?.update();

	}

	onPointerUp ( pointerEventData: PointerEventData ): void {

		if ( pointerEventData.button !== MouseButton.LEFT ) return;

		if ( !this.point?.isSelected ) return;

		if ( !this.pointerDownAt ) return;

		const position = pointerEventData.point;

		if ( position.distanceTo( this.pointerDownAt ) < 0.5 ) return;

		const cmd = new UpdatePositionCommand( this.point, position, this.pointerDownAt );

		CommandHistory.execute( cmd );

		this.setHint( 'Use Inspector to modify polygon properties' );
	}

}
