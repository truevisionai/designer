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

	cutRoadAt ( road: TvRoad, s: number ): TvRoad {

		const spline = road.spline as AutoSplineV2;

		const newRoad = road.clone( s );
		newRoad.id = RoadFactory.getNextRoadId();

		const currentSegment = spline.getRoadSegments().find( i => i.roadId == road.id );

		if ( !currentSegment ) throw new Error( 'Road segment not found' );

		const roadSplineStart = currentSegment.start;

		const newRoadStart = roadSplineStart + s;
		const newRoadLength = road.length - s;

		spline.addRoadSegment( newRoadStart, newRoadLength, newRoad.id );

		const currentRoadLength = s;

		currentSegment.length = currentRoadLength;

		return newRoad;

	}

	cutRoad ( road: TvRoad, roadCoord: TvRoadCoord ): TvRoad {

		return this.cutRoadAt( road, roadCoord.s );

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
