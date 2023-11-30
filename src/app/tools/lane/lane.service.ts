import { Injectable } from '@angular/core';
import { BaseToolService } from '../base-tool.service';
import { DebugLine, LaneReferenceLineService } from '../lane-reference-line.service';
import { TvRoad } from 'app/modules/tv-map/models/tv-road.model';
import { Object3DMap } from '../lane-width/object-3d-map';
import { TvLane } from 'app/modules/tv-map/models/tv-lane';
import { COLOR } from 'app/views/shared/utils/colors.service';
import { Vector2 } from 'three';
import { LineGeometry } from 'three/examples/jsm/lines/LineGeometry';
import { LineMaterial } from 'three/examples/jsm/lines/LineMaterial';
import { MapEvents } from 'app/events/map-events';
import { BaseService } from 'app/services/base.service';
import { TvLaneType } from 'app/modules/tv-map/models/tv-common';
import { ParkingRoadToolService } from '../parking/parking-road-tool.service';

@Injectable( {
	providedIn: 'root'
} )
export class LaneService {

	private static lineMap: Object3DMap<string, DebugLine<TvLane>> = new Object3DMap();

	constructor (
		public base: BaseToolService,
		private laneReferenceLine: LaneReferenceLineService,
		private baseService: BaseService,
		private parkingRoadToolService: ParkingRoadToolService,
	) { }

	showRoad ( road: TvRoad ) {

		LaneService.lineMap.clear();

		road.laneSections.forEach( laneSection => {

			laneSection.lanes.forEach( lane => {

				const points = this.laneReferenceLine.getPoints( lane, laneSection.s, laneSection.endS );

				const geometry = new LineGeometry().setPositions( points.flatMap( p => [ p.x, p.y, p.z + 0.05 ] ) );

				const material = new LineMaterial( {
					color: COLOR.CYAN,
					linewidth: 2,
					resolution: new Vector2( window.innerWidth, window.innerHeight ),
				} );

				const line = new DebugLine( lane, geometry, material );

				line.renderOrder = 999;

				LaneService.lineMap.add( lane.uuid, line );

			} );

		} );

	}

	hideRoad ( road: TvRoad ) {

		road.laneSections.forEach( laneSection => {

			laneSection.lanes.forEach( lane => {

				LaneService.lineMap.remove( lane.uuid );

			} );

		} );

		LaneService.lineMap.clear();
	}

	addLane ( lane: TvLane ) {

		lane.laneSection.addLaneInstance( lane, true );

		LaneService.lineMap.clear();

		this.showRoad( lane.laneSection.road );

		this.baseService.rebuildRoad( lane.laneSection.road );

		MapEvents.laneCreated.emit( lane );

	}

	removeLane ( lane: TvLane ) {

		lane.laneSection.removeLane( lane );

		LaneService.lineMap.clear();

		this.showRoad( lane.laneSection.road );

		this.baseService.rebuildRoad( lane.laneSection.road );

		MapEvents.laneRemoved.emit( lane );

	}

	updateLane ( lane: TvLane ) {

		MapEvents.laneUpdated.emit( lane );

	}

	onLaneUpdated ( lane: TvLane ) {

		if ( lane.type == TvLaneType.parking ) {

			this.parkingRoadToolService.removeRepeatedParkingObject( lane.laneSection.road, lane );
			this.parkingRoadToolService.addRepeatedParkingObject( lane.laneSection.road, lane );

		} else {

			this.parkingRoadToolService.removeRepeatedParkingObject( lane.laneSection.road, lane );

		}

		if ( lane.type == TvLaneType.sidewalk || lane.type == TvLaneType.curb ) {

			if ( lane.getLaneHeightCount() == 0 ) {

				lane.addHeightRecord( 0, 0.12, 0.12 );

			}

		} else {

			if ( lane.getLaneHeightCount() == 1 && lane.getLaneHeight( 0 ).sOffset == 0 ) {

				lane.clearLaneHeight();

			}

		}

	}

}
