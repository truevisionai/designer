/*
 * Copyright Truesense AI Solutions Pvt Ltd, All Rights Reserved.
 */

import { IToolWithPoint, SelectPointCommand } from 'app/commands/select-point-command';
import { KeyboardEvents } from 'app/events/keyboard-events';
import { CommandHistory } from 'app/services/command-history';
import {
	CrosswalkInspectorComponent,
	ICrosswalkInspectorData
} from 'app/views/inspectors/crosswalk-inspector/crosswalk-inspector.component';
import { MouseButton, PointerEventData } from '../../events/pointer-event-data';
import { CopyPositionCommand } from '../../commands/copy-position-command';
import { TvRoadCoord } from '../../modules/tv-map/models/tv-lane-coord';
import { Crosswalk, TvCornerRoad } from '../../modules/tv-map/models/tv-road-object';
import { ToolType } from '../tool-types.enum';
import { ControlPointStrategy } from '../../core/snapping/select-strategies/control-point-strategy';
import { OnRoadStrategy } from '../../core/snapping/select-strategies/on-road-strategy';
import { SelectStrategy } from '../../core/snapping/select-strategies/select-strategy';
import { BaseTool } from '../base-tool';
import { CreateCrossWalkCommand } from './CreateCrossWalkCommand';
import { AddCrosswalkPointCommand } from './AddCrosswalkPointCommand';

export class CrosswalkTool extends BaseTool implements IToolWithPoint {

	name: string = 'CrosswalkTool';

	toolType = ToolType.Crosswalk;

	onRoadStrategy = new OnRoadStrategy();

	selectStrategy: SelectStrategy<TvCornerRoad>;

	point: TvCornerRoad;

	crosswalk: Crosswalk;

	constructor () {

		super();

	}

	setPoint ( value: TvCornerRoad ): void {

		this.point = value;

		this.crosswalk = this.point?.mainObject;

	}

	getPoint (): TvCornerRoad {

		return this.point;

	}

	init () {

		super.init();

		this.selectStrategy = new ControlPointStrategy<TvCornerRoad>();

	}

	enable () {

		super.enable();

		this.showMarkingObjects();

	}


	showMarkingObjects () {

		this.map.getRoads().forEach( road => {

			road.getRoadObjects().forEach( object => {

				object.outlines.forEach( outline => {

					outline.cornerRoad.forEach( corner => {

						corner.show();

					} );
				} );

			} );

		} );

	}

	disable (): void {

		super.disable();

		this.hideMarkingObjects();

	}

	hideMarkingObjects () {

		this.map.getRoads().forEach( road => {

			road.getRoadObjects().forEach( object => {

				object.outlines.forEach( outline => {

					outline.cornerRoad.forEach( corner => {

						corner.hide();

					} );

				} );

			} );

		} );
	}

	onPointerDown ( pointerEventData: PointerEventData ) {

		if ( pointerEventData.button !== MouseButton.LEFT ) return;

		if ( !KeyboardEvents.isShiftKeyDown ) {

			// selection

			const point = this.selectStrategy.onPointerDown( pointerEventData );

			if ( point && point != this.point ) this.selectPoint( point );

			if ( point ) return;

			if ( this.point ) this.selectPoint( null );

		} else {

			// creation

			const coord = this.onRoadStrategy.onPointerDown( pointerEventData );

			if ( !coord ) return;

			if ( this.crosswalk ) {

				CommandHistory.execute( new AddCrosswalkPointCommand( this.crosswalk, coord ) );

			} else {

				CommandHistory.execute( new CreateCrossWalkCommand( coord ) );

			}
		}
	}


	onPointerMoved ( pointerEventData: PointerEventData ) {

		if ( pointerEventData.button !== MouseButton.LEFT ) return;

		this.selectStrategy.onPointerMoved( pointerEventData );

		if ( !this.point?.isSelected ) return;

		if ( !this.pointerDownAt ) return;

		const coord = this.onRoadStrategy.onPointerMoved( pointerEventData );

		if ( !coord ) return;

		this.point.copyPosition( coord.toPosTheta().toVector3() );

	}

	onPointerUp ( pointerEventData: PointerEventData ): void {

		if ( pointerEventData.button !== MouseButton.LEFT ) return;

		if ( !this.point?.isSelected ) return;

		if ( !this.pointerDownAt ) return;

		const coord = this.onRoadStrategy.onPointerMoved( pointerEventData );

		if ( !coord ) return;

		const position = coord.toPosTheta().toVector3();

		if ( position.distanceTo( this.pointerDownAt ) < 0.5 ) return;

		CommandHistory.execute( new CopyPositionCommand( this.point, position, this.pointerDownAt ) );

	}

	private addPoint ( coord: TvRoadCoord ) {

		console.log( 'add' );

		const id = this.crosswalk.outlines[ 0 ].cornerRoad.length;

		const point = new TvCornerRoad( id, coord.road, coord.s, coord.t );

		this.crosswalk.addCornerRoad( point );

		this.selectPoint( point );
	}

	private selectPoint ( point: TvCornerRoad ): void {

		// const command = getSelectPointCommand( this, point, point?.mainObject );

		// CommandHistory.execute( command );

	}

}

// export function getSelectPointCommand ( tool: CrosswalkTool, point: TvCornerRoad, crosswalk: Crosswalk ): SelectPointCommand {

// 	const data: ICrosswalkInspectorData = {
// 		point: point,
// 		crosswalk: crosswalk
// 	};

// 	return new SelectPointCommand( tool, point, CrosswalkInspectorComponent, data );

// }



