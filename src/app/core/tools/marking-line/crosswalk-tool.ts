/*
 * Copyright Truesense AI Solutions Pvt Ltd, All Rights Reserved.
 */

import { IToolWithPoint, SelectPointCommand } from 'app/core/commands/select-point-command';
import { SetInspectorCommand } from 'app/core/commands/set-inspector-command';
import { KeyboardInput } from 'app/core/input';
import { SceneService } from 'app/core/services/scene.service';
import { TvRoad } from 'app/modules/tv-map/models/tv-road.model';
import { CommandHistory } from 'app/services/command-history';
import {
	CrosswalkInspectorComponent,
	ICrosswalkInspectorData
} from 'app/views/inspectors/crosswalk-inspector/crosswalk-inspector.component';
import { MouseButton, PointerEventData } from '../../../events/pointer-event-data';
import { CopyPositionCommand } from '../../../modules/three-js/commands/copy-position-command';
import { TvRoadCoord } from '../../../modules/tv-map/models/tv-lane-coord';
import { Crosswalk, TvCornerRoad } from '../../../modules/tv-map/models/tv-road-object';
import { BaseCommand } from '../../commands/base-command';
import { ToolType } from '../../models/tool-types.enum';
import { ControlPointStrategy } from '../../snapping/select-strategies/control-point-strategy';
import { OnRoadStrategy } from '../../snapping/select-strategies/on-road-strategy';
import { SelectStrategy } from '../../snapping/select-strategies/select-strategy';
import { BaseTool } from '../base-tool';

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

		const command = getSelectPointCommand( this, point, point?.mainObject );

		CommandHistory.execute( command );

	}

}

function getSelectPointCommand ( tool: CrosswalkTool, point: TvCornerRoad, crosswalk: Crosswalk ): SelectPointCommand {

	const data: ICrosswalkInspectorData = {
		point: point,
		crosswalk: crosswalk
	};

	return new SelectPointCommand( tool, point, CrosswalkInspectorComponent, data );

}


export class CreateCrossWalkCommand extends BaseCommand {

	private readonly crosswalk: Crosswalk;
	private readonly selectPointCommand: SelectPointCommand;

	constructor ( private roadCoord: TvRoadCoord ) {

		super();

		const point = new TvCornerRoad( 0, roadCoord.road, roadCoord.s, roadCoord.t );

		this.crosswalk = new Crosswalk( roadCoord.s, roadCoord.t );

		this.crosswalk.addCornerRoad( point );

		const tool = this.getTool<CrosswalkTool>();

		this.selectPointCommand = getSelectPointCommand( tool, point, this.crosswalk );

	}

	execute (): void {

		this.roadCoord.road.gameObject.add( this.crosswalk );

		this.roadCoord.road.addRoadObjectInstance( this.crosswalk );

		this.selectPointCommand.execute();

	}

	undo (): void {

		this.roadCoord.road.gameObject.remove( this.crosswalk );

		this.roadCoord.road.removeRoadObjectById( this.crosswalk.attr_id );

		this.selectPointCommand.undo();

	}

	redo (): void {

		this.execute();

	}

}

export class DeleteCrossWalkCommand extends BaseCommand {

	private inspector: SetInspectorCommand;
	private road: TvRoad;

	constructor ( private crosswalk: Crosswalk ) {

		super();

		this.road = crosswalk.road;
		this.inspector = new SetInspectorCommand( null, null );
	}

	execute (): void {

		this.road?.gameObject.remove( this.crosswalk );

		SceneService.remove( this.crosswalk );

		this.road?.removeRoadObjectById( this.crosswalk.attr_id );

		this.inspector.execute();

	}

	undo (): void {

		this.road?.gameObject.add( this.crosswalk );

		this.road?.addRoadObjectInstance( this.crosswalk );

		this.inspector.undo();

	}

	redo (): void {

		this.execute();

	}

}

export class AddCrosswalkPointCommand extends BaseCommand {

	private selectPointCommand: SelectPointCommand;
	private point: TvCornerRoad;

	constructor ( private crosswalk: Crosswalk, private coord: TvRoadCoord ) {

		super();

		const id = this.crosswalk.outlines[ 0 ].cornerRoad.length;

		const point = this.point = new TvCornerRoad( id, coord.road, coord.s, coord.t );

		const tool = this.getTool<CrosswalkTool>();

		this.selectPointCommand = getSelectPointCommand( tool, point, crosswalk );
	}

	execute (): void {

		this.crosswalk.addCornerRoad( this.point );

		this.selectPointCommand.execute();

	}

	undo (): void {

		this.crosswalk.removeCornerRoad( this.point );

		this.selectPointCommand.undo();

	}

	redo (): void {

		this.execute();

	}

}
