/*
 * Copyright Truesense AI Solutions Pvt Ltd, All Rights Reserved.
 */

import { KeyboardInput } from 'app/core/input';
import { PointerEventData } from '../../../events/pointer-event-data';
import { TvRoadCoord } from '../../../modules/tv-map/models/tv-lane-coord';
import { Crosswalk, TvCornerRoad, TvRoadObject } from '../../../modules/tv-map/models/tv-road-object';
import { ToolType } from '../../models/tool-types.enum';
import { ControlPointStrategy } from '../../snapping/select-strategies/control-point-strategy';
import { OnRoadStrategy } from '../../snapping/select-strategies/on-road-strategy';
import { SelectStrategy } from '../../snapping/select-strategies/select-strategy';
import { BaseTool } from '../base-tool';
import { CommandHistory } from 'app/services/command-history';
import { IToolWithPoint, SelectPointCommand } from 'app/core/commands/select-point-command';
import { ISelectable } from 'app/modules/three-js/objects/i-selectable';

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

		this.crosswalk = this.point?.parent as Crosswalk;

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

					} )
				} )

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

					} )

				} )

			} );

		} );
	}

	onPointerDown ( pointerEventData: PointerEventData ) {

		if ( !KeyboardInput.isShiftKeyDown ) {

			// selection

			const point = this.selectStrategy.onPointerDown( pointerEventData );

			if ( point ) this.selectPoint( point );

			if ( point ) return;

			this.selectPoint( null );

		} else {

			// creation

			const coord = this.onRoadStrategy.onPointerDown( pointerEventData );

			if ( !coord ) return;

			if ( this.crosswalk ) {

				this.addPoint( coord );

			} else {

				this.createCrosswalk( coord );

			}
		}
	}

	addPoint ( coord: TvRoadCoord ) {

		console.log( 'add' );

		const id = this.crosswalk.outlines[ 0 ].cornerRoad.length;

		const point = new TvCornerRoad( id, coord.road, coord.s, coord.t );

		this.crosswalk.addCornerRoad( point );

		this.selectPoint( point );
	}

	createCrosswalk ( coord: TvRoadCoord ) {

		console.log( 'create' );

		this.point = new TvCornerRoad( 0, coord.road, coord.s, coord.t );

		this.crosswalk = new Crosswalk( coord.s, coord.t );

		this.crosswalk.addCornerRoad( this.point );

		coord.road.gameObject.add( this.crosswalk );

		coord.road.addRoadObjectInstance( this.crosswalk );

	}

	unselectPoint () {

		this.point?.unselect();

		this.point = null;

		this.crosswalk = null;

	}

	selectPoint ( point: TvCornerRoad ) {

		CommandHistory.execute( new SelectPointCommand( this, point ) );

	}

	onPointerMoved ( pointerEventData: PointerEventData ) {

		if ( !this.point?.isSelected ) return;

		if ( !this.pointerDownAt ) return;

		const coord = this.onRoadStrategy.onPointerMoved( pointerEventData );

		if ( !coord ) return;

		this.point.copyPosition( coord.toPosTheta().toVector3() );

		( this.point.parent as Crosswalk )?.update();

	}

	onPointerUp ( pointerEventData: PointerEventData ): void {

		// const coord = this.onRoadStrategy.onPointerUp( pointerEventData );

		// const point = this.selectStrategy.onPointerUp( pointerEventData );

		// if ( point?.isSelected && this.pointerDownAt ) {

		// 	point.copyPosition( coord.toPosTheta().toVector3() );

		// 	( point.parent as Crosswalk )?.update();

		// 	return;
		// }

	}
}
