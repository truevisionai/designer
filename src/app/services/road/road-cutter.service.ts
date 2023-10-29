import { Injectable } from '@angular/core';
import { AutoSplineV2 } from 'app/core/shapes/auto-spline-v2';
import { RoadFactory } from 'app/factories/road-factory.service';
import { TvRoadCoord } from 'app/modules/tv-map/models/tv-lane-coord';
import { TvRoad } from 'app/modules/tv-map/models/tv-road.model';

@Injectable( {
	providedIn: 'root'
} )
export class RoadCutterService {

	constructor () { }

	// should cut the road in 2 at given
	// cut geometry
	// cut lane sections
	// make successor and predecessor relationships

	cutRoad ( road: TvRoad, roadCoord: TvRoadCoord ): TvRoad {

		const spline = road.spline as AutoSplineV2;

		const newRoad = road.clone( roadCoord.s );
		newRoad.id = RoadFactory.getNextRoadId();

		const currentSegment = spline.getRoadSegments().find( i => i.road.id == road.id );

		if ( !currentSegment ) throw new Error( 'Road segment not found' );

		const roadSplineStart = currentSegment.start;

		const newRoadStart = roadSplineStart + roadCoord.s;
		const newRoadLength = road.length - roadCoord.s;

		spline.addRoadSegment( newRoadStart, newRoadLength, newRoad );

		const currentRoadLength = roadCoord.s;

		currentSegment.length = currentRoadLength;

		return newRoad;

		// const laneSection = this.getLaneSectionAt( roadCoord.s ).cloneAtS( 0, 0 );
		// const length = this.length - ( roadCoord.s );

		// const secondPoint = this.getRoadCoordAt( this.length );

		// const newRoad = this.clone( roadCoord.s );
		// newRoad.addControlPointAt( roadCoord.toVector3() );
		// ( newRoad.spline.getFirstPoint() as RoadControlPoint ).allowChange = false;
		// newRoad.addControlPointAt( secondPoint.toVector3(), true );

		// newRoad.clearLaneSections();
		// newRoad.addLaneSectionInstance( laneSection );

		// this.length = this.length - length;

		// this.spline?.getLastPoint().position.copy( roadCoord.toVector3() );
		// ( this.spline?.getLastPoint() as RoadControlPoint ).allowChange = false;
		// this.updateGeometryFromSpline();

		// this.computeLaneSectionLength();
		// newRoad.computeLaneSectionLength();

		// return newRoad;

	}

}
