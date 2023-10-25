/*
 * Copyright Truesense AI Solutions Pvt Ltd, All Rights Reserved.
 */

import { IToolWithPoint, SelectPointCommand } from 'app/commands/select-point-command';
import { ControlPointStrategy } from 'app/core/snapping/select-strategies/control-point-strategy';
import { SelectStrategy } from 'app/core/snapping/select-strategies/select-strategy';
import { MouseButton, PointerEventData } from 'app/events/pointer-event-data';
import { UpdatePositionCommand } from 'app/commands/copy-position-command';
import { DynamicControlPoint } from 'app/modules/three-js/objects/dynamic-control-point';
import { PropCurve } from 'app/modules/tv-map/models/prop-curve';
import { CommandHistory } from 'app/services/command-history';
import { PropManager } from 'app/managers/prop-manager';
import { SnackBar } from 'app/services/snack-bar.service';
import { DynamicInspectorComponent } from 'app/views/inspectors/dynamic-inspector/dynamic-inspector.component';
import { PropModel } from '../../core/models/prop-model.model';
import { ToolType } from '../tool-types.enum';
import { BaseTool } from '../base-tool';

import { CreatePropCurveCommand } from './create-prop-curve-command';
import { AddPropCurvePointCommand } from './add-prop-curve-point-command.ts';
import { FreeMovingStrategy } from "../../core/snapping/move-strategies/free-moving-strategy";

export class PropCurveToolV2 extends BaseTool implements IToolWithPoint {

	public name: string = 'PropCurveTool';

	public toolType = ToolType.PropCurve;

	public point: DynamicControlPoint<PropCurve>;

	private selectStrategy: SelectStrategy<DynamicControlPoint<PropCurve>>;

	private moveStrategy: FreeMovingStrategy;

	constructor () {

		super();

		this.selectStrategy = new ControlPointStrategy<DynamicControlPoint<PropCurve>>();

		this.moveStrategy = new FreeMovingStrategy();

		this.setHint( 'Use LEFT CLICK to select control point or use SHIFT + LEFT CLICK to create control point' );
	}

	private get prop (): PropModel {

		const prop = PropManager.getProp();

		if ( prop ) {

			return new PropModel( prop.guid, prop.data.rotationVariance, prop.data.scaleVariance );

		}

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

	onPointerDownSelect ( event: PointerEventData ) {

		const point = this.selectStrategy.onPointerDown( event );

		if ( point ) {

			if ( point == this.point ) return;

			const cmd = new SelectPointCommand( this, point, DynamicInspectorComponent, point );

			CommandHistory.execute( cmd );

			this.setHint( 'Drag control point using LEFT CLICK is down' );

			return;
		}

		if ( !this.point ) return;

		CommandHistory.execute( new SelectPointCommand( this, null, null, null ) );

		this.setHint( 'Use LEFT CLICK to select control point or use SHIFT + LEFT CLICK to create control point' );
	}

	onPointerDownCreate ( event: PointerEventData ) {

		if ( !this.prop ) SnackBar.warn( 'Select a prop from the project browser' );

		if ( !this.prop ) this.setHint( 'Select a prop from the project browser' );

		if ( !this.prop ) return;

		if ( !this.point ) {

			const point = new DynamicControlPoint<PropCurve>( null, event.point );

			const command = new CreatePropCurveCommand( this, this.prop, point )

			CommandHistory.execute( command );

			this.setHint( 'Add one more control point to create curve' );

		} else {

			const point = new DynamicControlPoint<PropCurve>( this.point.mainObject, event.point );

			const command = new AddPropCurvePointCommand( this, this.point.mainObject, point )

			CommandHistory.execute( command );

			this.setHint( 'Add more control points or drag control points to modify curve' );
		}
	}

	onPointerMoved ( event: PointerEventData ): void {

		this.selectStrategy.onPointerMoved( event );

		if ( !this.point?.isSelected ) return;

		if ( !this.pointerDownAt ) return;

		const position = this.moveStrategy.getPosition( event );

		this.point?.position.copy( position.position );

		this.point?.update();

	}

	onPointerUp ( event: PointerEventData ): void {

		if ( event.button !== MouseButton.LEFT ) return;

		if ( !this.point?.isSelected ) return;

		if ( !this.pointerDownAt ) return;

		const position = this.moveStrategy.getPosition( event );

		if ( position.position.distanceTo( this.pointerDownAt ) < 0.5 ) return;

		const command = new UpdatePositionCommand( this.point, position.position, this.pointerDownAt )

		CommandHistory.execute( command );

		this.setHint( 'Use Inspector to modify curve properties' );
	}

}
