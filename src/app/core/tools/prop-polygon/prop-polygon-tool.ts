/*
 * Copyright Truesense AI Solutions Pvt Ltd, All Rights Reserved.
 */

import { IToolWithMainObject, IToolWithPoint, SelectMainObjectCommand, SelectPointCommand } from 'app/core/commands/select-point-command';
import { MouseButton, PointerEventData, PointerMoveData } from 'app/events/pointer-event-data';
import { ISelectable } from 'app/modules/three-js/objects/i-selectable';
import { CommandHistory } from 'app/services/command-history';
import { PropManager } from 'app/services/prop-manager';
import { SnackBar } from 'app/services/snack-bar.service';
import { DynamicControlPoint } from '../../../modules/three-js/objects/dynamic-control-point';
import { PropPolygon } from '../../../modules/tv-map/models/prop-polygons';
import { KeyboardInput } from '../../input';
import { ToolType } from '../../models/tool-types.enum';
import { PickingHelper } from '../../services/picking-helper.service';
import { BaseTool } from '../base-tool';
import { AddPropPolygonPointCommand } from './add-prop-polygon-point-command';
import { CreatePropPolygonCommand } from './create-prop-polygon-command';
import { SelectPropPolygonCommand } from './select-prop-polygon-command';
import { UpdatePropPolygonPointCommand } from './update-prop-polygon-point-command';

export class PropPolygonTool extends BaseTool implements IToolWithPoint, IToolWithMainObject {

	public name: string = 'PropPolygonTool';
	public toolType = ToolType.PropPolygon;

	public point: DynamicControlPoint<PropPolygon>;
	public propPolygon: PropPolygon;
	private pointUpdated: boolean;

	constructor () {

		super();

	}

	setMainObject ( value: ISelectable ): void {
		this.propPolygon = value as PropPolygon;
	}

	getMainObject (): ISelectable {
		return this.propPolygon;
	}

	setPoint ( value: ISelectable ): void {
		this.point = value as DynamicControlPoint<PropPolygon>;
	}

	getPoint (): ISelectable {
		return this.point;
	}

	public init () {

		super.init();

	}

	public enable () {

		super.enable();

		this.map.propPolygons.forEach( polygon => {

			polygon.showControlPoints();
			polygon.showCurve();

			polygon.spline.controlPoints.forEach( cp => {

				cp.mainObject = polygon;

			} );
		} );
	}

	public disable (): void {

		super.disable();

		this.map.propPolygons.forEach( polygon => {

			polygon.hideCurve();
			polygon.hideControlPoints();

		} );

	}

	public onPointerDown ( e: PointerEventData ) {

		if ( !e.point || e.button != MouseButton.LEFT ) return;

		if ( KeyboardInput.isShiftKeyDown ) {

			const prop = PropManager.getProp();

			if ( !prop ) return SnackBar.warn( 'Select a prop from the project browser' );

			if ( this.propPolygon ) {

				CommandHistory.execute( new AddPropPolygonPointCommand( this, this.propPolygon, e.point ) );

			} else {

				CommandHistory.execute( new CreatePropPolygonCommand( this, prop, e.point ) );
			}

		} else {

			if ( this.controlPointIsSelected( e ) ) return;

			if ( this.propPolygonIsSelected( e ) ) return;

			if ( this.propPolygon || this.point ) {

				CommandHistory.executeMany(
					new SelectMainObjectCommand( this, null ),
					new SelectPointCommand( this, null ),
				);

			}
		}
	}

	public onPointerMoved ( e: PointerMoveData ) {

		if ( e.point && this.isPointerDown && this.point && this.point.isSelected ) {

			this.point.copyPosition( e.point );

			this.point.mainObject.spline.update();

			this.pointUpdated = true;

		}

	}

	public onPointerUp ( e: PointerEventData ) {

		if ( this.point && this.point.isSelected && this.pointUpdated ) {

			const oldPosition = this.pointerDownAt.clone();
			const newPosition = this.point.position.clone();

			CommandHistory.execute( new UpdatePropPolygonPointCommand( this.point, newPosition, oldPosition ) );

		}

		this.pointUpdated = false;

	}


	propPolygonIsSelected ( e: PointerEventData ) {

		const polygons = this.map.propPolygons.map( s => s.mesh );

		const results = PickingHelper.findAllByTag( PropPolygon.tag, e, polygons, false );

		if ( results.length == 0 ) return false;

		const propPolygon = results[ 0 ].userData.polygon as PropPolygon;

		if ( !this.propPolygon || this.propPolygon.mesh.id !== propPolygon.mesh.id ) {

			CommandHistory.executeMany(
				new SelectPropPolygonCommand( this, propPolygon ),
				new SelectPointCommand( this, null ),
			);

		} else {

			CommandHistory.executeMany(
				new SelectPointCommand( this, null ),
			);

		}

		return true;

	}

	controlPointIsSelected ( e: PointerEventData ) {

		const points = this.map.propPolygons.reduce( ( acc, s ) => acc.concat( s.spline.controlPoints ), [] );

		const point = PickingHelper.findByObjectType<DynamicControlPoint<PropPolygon>>( 'Points', e, points, true );

		if ( !point ) return false;

		if ( !this.point || this.point.uuid !== point.uuid ) {

			CommandHistory.execute( new SelectPointCommand( this, point ) );

		}

		return true;

	}

}
