/*
 * Copyright Truesense AI Solutions Pvt Ltd, All Rights Reserved.
 */

import { IToolWithMainObject, IToolWithPoint, SelectPointCommand } from 'app/core/commands/select-point-command';
import { MouseButton, PointerEventData } from 'app/events/pointer-event-data';
import { CommandHistory } from 'app/services/command-history';
import { PropManager } from 'app/services/prop-manager';
import { SnackBar } from 'app/services/snack-bar.service';
import { DynamicControlPoint } from '../../../modules/three-js/objects/dynamic-control-point';
import { PropPolygon } from '../../../modules/tv-map/models/prop-polygons';
import { KeyboardInput } from '../../input';
import { ToolType } from '../../models/tool-types.enum';
import { BaseTool } from '../base-tool';
import { AddPropPolygonPointCommand } from './add-prop-polygon-point-command';
import { CreatePropPolygonCommand } from './create-prop-polygon-command';
import { DynamicInspectorComponent } from 'app/views/inspectors/dynamic-inspector/dynamic-inspector.component';
import { PropModel } from 'app/core/models/prop-model.model';
import { SelectStrategy } from 'app/core/snapping/select-strategies/select-strategy';
import { ControlPointStrategy } from 'app/core/snapping/select-strategies/control-point-strategy';
import { UpdatePositionCommand } from 'app/modules/three-js/commands/copy-position-command';

export class PropPolygonTool extends BaseTool implements IToolWithPoint, IToolWithMainObject {

	public name: string = 'PropPolygonTool';

	public toolType: ToolType = ToolType.PropPolygon;

	public point: DynamicControlPoint<PropPolygon>;

	public propPolygon: PropPolygon;

	private strategy: SelectStrategy<DynamicControlPoint<PropPolygon>>;

	private get prop (): PropModel {

		const prop = PropManager.getProp();

		if ( prop ) {

			return new PropModel( prop.guid, prop.data.rotationVariance, prop.data.scaleVariance );

		}

	}

	constructor () {

		super();

		this.strategy = new ControlPointStrategy<DynamicControlPoint<PropPolygon>>();

		this.setHint( 'Use LEFT CLICK to select control point or use SHIFT + LEFT CLICK to create control point' );
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

		this.map.propPolygons.forEach( polygon => polygon.show() );

	}


	disable (): void {

		super.disable();

		this.map.propPolygons.forEach( polygon => polygon.hide() );

	}

	onPointerDown ( e: PointerEventData ): void {

		if ( e.button !== MouseButton.LEFT ) return;

		if ( KeyboardInput.isShiftKeyDown ) {

			this.handleCreationMode( e );

		} else {

			this.handleSelectionMode( e );

		}

	}

	handleSelectionMode ( e: PointerEventData ) {

		const point = this.strategy.onPointerDown( e );

		if ( point ) {

			const cmd = new SelectPointCommand( this, point, DynamicInspectorComponent, point.mainObject );

			CommandHistory.execute( cmd );

			this.setHint( 'Drag control point using LEFT CLICK is down' );

			return;
		}


		// in first click, remove focus from control point and hide tangent

		const cmd = new SelectPointCommand( this, null, DynamicInspectorComponent, null );

		CommandHistory.execute( cmd );

		this.setHint( 'Use LEFT CLICK to select control point or use SHIFT + LEFT CLICK to create control point' );

	}

	handleCreationMode ( e: PointerEventData ) {

		if ( !this.prop ) SnackBar.warn( 'Select a prop from the project browser' );

		if ( !this.prop ) this.setHint( 'Select a prop from the project browser' );

		if ( !this.prop ) return;

		if ( !this.point ) {

			CommandHistory.execute( new CreatePropPolygonCommand( this, this.prop, e.point ) );

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
