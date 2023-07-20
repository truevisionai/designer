/*
 * Copyright Truesense AI Solutions Pvt Ltd, All Rights Reserved.
 */

import { IToolWithPoint, SelectPointCommand } from 'app/core/commands/select-point-command';
import { KeyboardInput } from 'app/core/input';
import { CommandHistory } from 'app/services/command-history';
import { PointerEventData } from '../../../events/pointer-event-data';
import { CopyPositionCommand } from '../../../modules/three-js/commands/copy-position-command';
import { TvRoadCoord } from '../../../modules/tv-map/models/tv-lane-coord';
import { Crosswalk, TvCornerRoad } from '../../../modules/tv-map/models/tv-road-object';
import { BaseCommand } from '../../commands/base-command';
import { ToolType } from '../../models/tool-types.enum';
import { ControlPointStrategy } from '../../snapping/select-strategies/control-point-strategy';
import { OnRoadStrategy } from '../../snapping/select-strategies/on-road-strategy';
import { SelectStrategy } from '../../snapping/select-strategies/select-strategy';
import { BaseTool } from '../base-tool';

export class MarkingLineTool extends BaseTool implements IToolWithPoint {

	name: string = 'MarkingLineTool';

	toolType = ToolType.MarkingLine;

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

		if ( !KeyboardInput.isShiftKeyDown ) {

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

				this.addPoint( coord );

			} else {

				CommandHistory.execute( new CreateCrossWalkCommand( coord ) );

			}
		}
	}


	onPointerMoved ( pointerEventData: PointerEventData ) {

		this.selectStrategy.onPointerMoved( pointerEventData );

		if ( !this.point?.isSelected ) return;

		if ( !this.pointerDownAt ) return;

		const coord = this.onRoadStrategy.onPointerMoved( pointerEventData );

		if ( !coord ) return;

		this.point.copyPosition( coord.toPosTheta().toVector3() );

	}

	onPointerUp ( pointerEventData: PointerEventData ): void {

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

		CommandHistory.execute( new SelectPointCommand( this, point ) );

	}

}


export class CreateCrossWalkCommand extends BaseCommand {

	private readonly crosswalk: Crosswalk;
	private readonly setValueCommand: SelectPointCommand;

	constructor ( private roadCoord: TvRoadCoord ) {

		super();

		const point = new TvCornerRoad( 0, roadCoord.road, roadCoord.s, roadCoord.t );

		this.crosswalk = new Crosswalk( roadCoord.s, roadCoord.t );

		this.crosswalk.addCornerRoad( point );

		const tool = this.getTool<MarkingLineTool>();

		this.setValueCommand = new SelectPointCommand( tool, point );

	}

	execute (): void {

		this.roadCoord.road.gameObject.add( this.crosswalk );

		this.roadCoord.road.addRoadObjectInstance( this.crosswalk );

		this.setValueCommand.execute();

	}

	undo (): void {

		this.roadCoord.road.gameObject.remove( this.crosswalk );

		this.roadCoord.road.removeRoadObjectById( this.crosswalk.attr_id );

		this.setValueCommand.undo();

	}

	redo (): void {

		this.execute();

	}

}
