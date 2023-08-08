/*
 * Copyright Truesense AI Solutions Pvt Ltd, All Rights Reserved.
 */

import { MouseButton, PointerEventData, PointerMoveData } from 'app/events/pointer-event-data';
import { PropCurve } from 'app/modules/tv-map/models/prop-curve';
import { CommandHistory } from 'app/services/command-history';
import { PropManager } from 'app/services/prop-manager';
import { SnackBar } from 'app/services/snack-bar.service';
import { KeyboardInput } from '../../input';
import { PropModel } from '../../models/prop-model.model';
import { ToolType } from '../../models/tool-types.enum';
import { BaseTool } from '../base-tool';
import { AddPropCurvePointCommand } from './add-prop-curve-point-command.ts';
import { CreatePropCurveCommand } from './create-prop-curve-command';
import { IToolWithPoint, SelectPointCommand } from 'app/core/commands/select-point-command';
import { DynamicControlPoint } from 'app/modules/three-js/objects/dynamic-control-point';
import { SelectStrategy } from 'app/core/snapping/select-strategies/select-strategy';
import { ControlPointStrategy } from 'app/core/snapping/select-strategies/control-point-strategy';
import { UpdatePositionCommand } from 'app/modules/three-js/commands/copy-position-command';
import { ObjectUserDataStrategy } from 'app/core/snapping/select-strategies/object-tag-strategy';
import { DynamicInspectorComponent } from 'app/views/inspectors/dynamic-inspector/dynamic-inspector.component';

export class PropCurveToolV2 extends BaseTool implements IToolWithPoint {

	public name: string = 'PropCurveTool';

	public toolType = ToolType.PropCurve;

	public point: DynamicControlPoint<PropCurve>;

	private strategy: SelectStrategy<DynamicControlPoint<PropCurve>>;

	private get prop (): PropModel {

		const prop = PropManager.getProp();

		if ( prop ) {

			return new PropModel( prop.guid, prop.data.rotationVariance, prop.data.scaleVariance );

		}

	}

	constructor () {

		super();

		this.strategy = new ControlPointStrategy<DynamicControlPoint<PropCurve>>();

		this.setHint( 'Use LEFT CLICK to select control point or use SHIFT + LEFT CLICK to create control point' );
	}

	setPoint ( value: DynamicControlPoint<PropCurve> ): void {

		this.point = value;

	}

	getPoint (): DynamicControlPoint<PropCurve> {

		return this.point;

	}

	enable (): void {

		super.enable();

		this.map.propCurves.forEach( curve => curve.show() );

	}


	disable (): void {

		super.disable();

		this.map.propCurves.forEach( curve => curve.hide() );

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

			if ( point == this.point ) return;

			const cmd = new SelectPointCommand( this, point, DynamicInspectorComponent, point.mainObject );

			CommandHistory.execute( cmd );

			this.setHint( 'Drag control point using LEFT CLICK is down' );

			return;
		}

		if ( !this.point ) return;

		CommandHistory.execute( new SelectPointCommand( this, null, DynamicInspectorComponent, null ) );

		this.setHint( 'Use LEFT CLICK to select control point or use SHIFT + LEFT CLICK to create control point' );
	}

	handleCreationMode ( e: PointerEventData ) {

		if ( !this.prop ) SnackBar.warn( 'Select a prop from the project browser' );

		if ( !this.prop ) this.setHint( 'Select a prop from the project browser' );

		if ( !this.prop ) return;

		if ( !this.point ) {

			const point = new DynamicControlPoint<PropCurve>( null, e.point );

			CommandHistory.execute( new CreatePropCurveCommand( this, this.prop, point ) );

			this.setHint( 'Add one more control point to create curve' );

		} else {

			const point = new DynamicControlPoint<PropCurve>( this.point.mainObject, e.point );

			CommandHistory.execute( new AddPropCurvePointCommand( this, this.point.mainObject, point ) );

			this.setHint( 'Add more control points or drag control points to modify curve' );
		}
	}

	onPointerMoved ( pointerEventData: PointerEventData ): void {

		if ( pointerEventData.button !== MouseButton.LEFT ) return;

		if ( !this.point?.isSelected ) return;

		if ( !this.pointerDownAt ) return;

		this.point?.position.copy( pointerEventData.point );

		this.point?.update();

	}

	onPointerUp ( pointerEventData: PointerEventData ): void {

		if ( pointerEventData.button !== MouseButton.LEFT ) return;

		if ( !this.point?.isSelected ) return;

		if ( !this.pointerDownAt ) return;

		const position = pointerEventData.point;

		if ( position.distanceTo( this.pointerDownAt ) < 0.5 ) return;

		CommandHistory.execute( new UpdatePositionCommand( this.point, position, this.pointerDownAt ) );

		this.setHint( 'Use Inspector to modify curve properties' );
	}

}
