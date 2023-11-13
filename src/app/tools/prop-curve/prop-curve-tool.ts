/*
 * Copyright Truesense AI Solutions Pvt Ltd, All Rights Reserved.
 */

import { ControlPointStrategy } from 'app/core/snapping/select-strategies/control-point-strategy';
import { PointerEventData } from 'app/events/pointer-event-data';
import { DynamicControlPoint } from 'app/modules/three-js/objects/dynamic-control-point';
import { PropCurve } from 'app/modules/tv-map/models/prop-curve';
import { PropManager } from 'app/managers/prop-manager';
import { SnackBar } from 'app/services/snack-bar.service';
import { PropModel } from '../../core/models/prop-model.model';
import { ToolType } from '../tool-types.enum';
import { BaseTool } from '../base-tool';
import { FreeMovingStrategy } from "../../core/snapping/move-strategies/free-moving-strategy";
import { PropCurveService } from './prop-curve.service';
import { WorldPosition } from 'app/modules/scenario/models/positions/tv-world-position';
import { Vector3 } from 'three';

export class PropCurveTool extends BaseTool {

	public name: string = 'PropCurveTool';

	public toolType = ToolType.PropCurve;

	private selectedPoint: DynamicControlPoint<PropCurve>;

	private selectedCurve: PropCurve;

	private pointMoved = false;

	private debug = false;

	constructor ( private tool: PropCurveService ) {

		super();

	}

	private get prop (): PropModel {

		const prop = PropManager.getProp();

		if ( prop ) {

			return new PropModel( prop.guid, prop.data.rotationVariance, prop.data.scaleVariance );

		}

	}

	init (): void {

		this.tool.base.init();

		this.tool.base.addSelectionStrategy( new ControlPointStrategy<DynamicControlPoint<PropCurve>>() );

		this.tool.base.addMovingStrategy( new FreeMovingStrategy() );

		this.setHint( 'Use LEFT CLICK to select control point or use SHIFT + LEFT CLICK to create control point' );

	}

	enable (): void {

		super.enable();

		this.tool.showPropCurves();

		this.tool.base.setHint( 'Select a prop from the project browser' );

	}

	disable (): void {

		super.disable();

		this.tool.hidePropCurves();

	}

	onPointerDownSelect ( event: PointerEventData ) {

		this.tool.base.handleSelection( event, selected => {

			if ( selected instanceof DynamicControlPoint ) {

				this.selectObject( selected, this.selectedPoint );

			} else if ( selected instanceof PropCurve ) {

				this.selectObject( selected, this.selectedCurve );

			}

		}, () => {

			if ( this.selectedCurve ) {

				this.unselectObject( this.selectedCurve );

			} else if ( this.selectedPoint ) {

				this.unselectObject( this.selectedPoint );

			}

		} );

		// const point = this.selectStrategy.onPointerDown( event );

		// if ( point ) {

		// 	if ( point == this.point ) return;

		// 	const cmd = new SelectPointCommand( this, point, DynamicInspectorComponent, point );

		// 	CommandHistory.execute( cmd );

		// 	this.setHint( 'Drag control point using LEFT CLICK is down' );

		// 	return;
		// }

		// if ( !this.point ) return;

		// CommandHistory.execute( new SelectPointCommand( this, null, null, null ) );

		// this.setHint( 'Use LEFT CLICK to select control point or use SHIFT + LEFT CLICK to create control point' );
	}

	onPointerDownCreate ( event: PointerEventData ) {

		if ( !this.prop ) SnackBar.warn( 'Select a prop from the project browser' );

		if ( !this.prop ) this.setHint( 'Select a prop from the project browser' );

		if ( !this.prop ) return;

		this.tool.base.handleMovement( event, position => {

			if ( position instanceof WorldPosition ) {

				if ( this.selectedCurve ) {

					this.addCurvePoint( this.selectedCurve, position.position );

				} else {

					this.createPropCurve( position.position );

				}

			}

		} );

		// if ( !this.point ) {

		// 	const point = new DynamicControlPoint<PropCurve>( null, event.point );

		// 	const command = new CreatePropCurveCommand( this, this.prop, point )

		// 	CommandHistory.execute( command );

		// 	this.setHint( 'Add one more control point to create curve' );

		// } else {

		// 	const point = new DynamicControlPoint<PropCurve>( this.point.mainObject, event.point );

		// 	const command = new AddPropCurvePointCommand( this, this.point.mainObject, point )

		// 	CommandHistory.execute( command );

		// 	this.setHint( 'Add more control points or drag control points to modify curve' );
		// }
	}

	onPointerMoved ( event: PointerEventData ): void {

		// this.selectStrategy.onPointerMoved( event );

		// if ( !this.point?.isSelected ) return;

		// if ( !this.pointerDownAt ) return;

		// const position = this.moveStrategy.getPosition( event );

		// this.point?.position.copy( position.position );

		// this.point?.update();

	}

	onPointerUp ( event: PointerEventData ): void {

		// if ( event.button !== MouseButton.LEFT ) return;

		// if ( !this.point?.isSelected ) return;

		// if ( !this.pointerDownAt ) return;

		// const position = this.moveStrategy.getPosition( event );

		// if ( position.position.distanceTo( this.pointerDownAt ) < 0.5 ) return;

		// const command = new UpdatePositionCommand( this.point, position.position, this.pointerDownAt )

		// CommandHistory.execute( command );

		// this.setHint( 'Use Inspector to modify curve properties' );
	}

	createPropCurve ( position: Vector3 ) {

		const propCurve = this.tool.createPropCurve( this.prop, position );

		const point = this.tool.createCurvePoint( propCurve, position );

		propCurve.addControlPoint( point );

		this.executeAddObject( propCurve );

	}

	addCurvePoint ( selectedCurve: PropCurve, position: Vector3 ) {

		const point = this.tool.createCurvePoint( selectedCurve, position );

		this.executeAddObject( point );

	}

	onObjectAdded ( object: any ): void {

		if ( object instanceof PropCurve ) {

			this.tool.addPropCurve( object );

			this.onObjectSelected( object );

		} else if ( object instanceof DynamicControlPoint ) {

			this.tool.addPropCurvePoint( this.selectedCurve, object );

			this.onObjectSelected( object );

		}

	}

	onObjectRemoved ( object: any ): void {

		if ( object instanceof PropCurve ) {

			this.tool.removePropCurve( object );

		} else if ( object instanceof DynamicControlPoint ) {

			this.tool.removePropCurvePoint( this.selectedCurve, object );

		}

	}

	onObjectSelected ( object: any ): void {

		if ( object instanceof PropCurve ) {

			this.selectedCurve = object;

		} else if ( object instanceof DynamicControlPoint ) {

			this.selectedPoint = object;

		}

	}

}
