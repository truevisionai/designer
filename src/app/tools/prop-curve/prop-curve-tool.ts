/*
 * Copyright Truesense AI Solutions Pvt Ltd, All Rights Reserved.
 */

import { ControlPointStrategy } from 'app/core/strategies/select-strategies/control-point-strategy';
import { MouseButton, PointerEventData } from 'app/events/pointer-event-data';
import { PropCurve } from 'app/map/models/prop-curve';
import { PropManager } from 'app/managers/prop-manager';
import { SnackBar } from 'app/services/snack-bar.service';
import { PropModel } from '../../core/models/prop-model.model';
import { ToolType } from '../tool-types.enum';
import { BaseTool } from '../base-tool';
import { PropCurveService } from './prop-curve.service';
import { Vector3 } from 'three';
import { AppInspector } from 'app/core/inspector';
import { PropCurveInspector } from './prop-curve.inspector';
import { SimpleControlPoint } from 'app/objects/dynamic-control-point';
import { AddObjectCommand } from 'app/commands/add-object-command';
import { CommandHistory } from 'app/services/command-history';
import { SelectObjectCommand } from 'app/commands/select-object-command';
import { UpdatePositionCommand } from 'app/commands/copy-position-command';

export class PropCurveTool extends BaseTool<any>{

	public name: string = 'PropCurveTool';

	public toolType = ToolType.PropCurve;

	private pointMoved = false;

	private debug = false;

	get selectedCurve (): PropCurve {
		return this.selectedPoint?.mainObject;
	}

	get selectedPoint (): SimpleControlPoint<PropCurve> {
		return this.tool.base.selection.getLastSelected<SimpleControlPoint<PropCurve>>( SimpleControlPoint.name );
	}

	constructor ( private tool: PropCurveService, ) {

		super();

	}

	private get prop (): PropModel {

		const prop = PropManager.getProp();

		if ( prop ) {

			return new PropModel(
				prop.guid,
				prop.data?.rotationVariance || new Vector3( 0, 0, 0 ),
				prop.data?.scaleVariance || new Vector3( 0, 0, 0 )
			);

		}

	}

	init (): void {

		this.tool.base.reset();

		this.tool.base.selection.reset();

		this.tool.base.selection.registerStrategy( SimpleControlPoint.name, new ControlPointStrategy() );

		this.tool.base.setHint( 'use SHIFT + LEFT CLICK to create control point' );

	}

	enable (): void {

		super.enable();

		this.tool.showPropCurves();

		this.tool.base.setHint( 'Select a prop from the project browser' );

	}

	disable (): void {

		super.disable();

		this.tool.base.reset();

		this.tool.hidePropCurves();

	}

	onPointerDownSelect ( event: PointerEventData ) {

		this.tool.base.selection.handleSelection( event );

	}

	onPointerDownCreate ( event: PointerEventData ) {

		if ( !this.prop ) this.tool.base.setWarning( 'Select a prop from the project browser' );

		if ( !this.prop ) this.setHint( 'Select a prop from the project browser' );

		if ( !this.prop ) return;

		if ( !event.point ) return;

		if ( this.selectedCurve ) {

			this.addCurvePoint( this.selectedCurve, event.point );

		} else {

			this.createPropCurve( event.point );

		}

	}

	onPointerMoved ( event: PointerEventData ): void {

		if ( !this.pointerDownAt ) return;

		if ( !this.selectedPoint?.isSelected ) return;

		this.selectedPoint?.position.copy( event.point );

		this.selectedPoint?.update();

		this.tool.updateCurve( this.selectedCurve );

	}

	onPointerUp ( event: PointerEventData ): void {

		this.tool.base.highlight( event );

		// if ( !this.selectedPoint ) return;

		// if ( !this.selectedPoint.isSelected ) return;

		// if ( !this.pointerDownAt ) return;

		// if ( event.button !== MouseButton.LEFT ) return;

		// if ( !this.selectedPoint?.isSelected ) return;

		// const command = new UpdatePositionCommand( this.selectedPoint, event.point, this.pointerDownAt )

		// CommandHistory.execute( command );

		// this.setHint( 'Use Inspector to modify curve properties' );

	}

	createPropCurve ( position: Vector3 ) {

		const propCurve = this.tool.createPropCurve( this.prop, position );

		const point = this.tool.createCurvePoint( propCurve, position );

		propCurve.addControlPoint( point );

		const addCommand = new AddObjectCommand( propCurve );

		const selectCommand = new SelectObjectCommand( point, this.selectedPoint );

		CommandHistory.executeMany( addCommand, selectCommand );

	}

	addCurvePoint ( selectedCurve: PropCurve, position: Vector3 ) {

		const point = this.tool.createCurvePoint( selectedCurve, position );

		this.executeAddObject( point );

	}

	onObjectAdded ( object: any ): void {

		if ( object instanceof PropCurve ) {

			this.tool.addPropCurve( object );

			this.onObjectSelected( object );

		} else if ( object instanceof SimpleControlPoint ) {

			this.tool.addPropCurvePoint( this.selectedCurve, object );

			this.onObjectSelected( object );

		}

	}

	onObjectUpdated ( object: any ): void {

		if ( object instanceof PropCurve ) {

			this.tool.updateCurve( object );

		} else if ( object instanceof SimpleControlPoint ) {

			this.onObjectUpdated( object.mainObject );

		} else if ( object instanceof PropCurveInspector ) {

			this.onObjectUpdated( object.curve );

		}
	}

	onObjectRemoved ( object: any ): void {

		if ( object instanceof PropCurve ) {

			this.tool.removePropCurve( object );

		} else if ( object instanceof SimpleControlPoint ) {

			this.tool.removePropCurvePoint( this.selectedCurve, object );

		}

	}

	onObjectSelected ( object: any ): void {

		console.log( 'onObjectSelected', object );

		if ( object instanceof PropCurve ) {

			AppInspector.setDynamicInspector( new PropCurveInspector( object ) );

		} else if ( object instanceof SimpleControlPoint ) {

			if ( this.selectedPoint ) this.onObjectUnselected( this.selectedPoint );

			object.select();

			AppInspector.setDynamicInspector( new PropCurveInspector( object.mainObject, object ) );

		}

	}

	onObjectUnselected ( object: any ): void {

		if ( object instanceof PropCurve ) {

			AppInspector.clear();

		} else if ( object instanceof SimpleControlPoint ) {

			object.unselect();

			AppInspector.clear();

		}
	}

}
