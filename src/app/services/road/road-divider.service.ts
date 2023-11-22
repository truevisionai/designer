import { Injectable } from '@angular/core';
import { RoadFactory } from 'app/factories/road-factory.service';
import { TvRoad } from 'app/modules/tv-map/models/tv-road.model';

@Injectable( {
    providedIn: 'root'
} )
export class RoadDividerService {

    divideRoadAt ( road: TvRoad, s: number ) {

        const clone = road.clone( s );

        clone.id = RoadFactory.getNextRoadId();

        clone.sStart = road.sStart + s;

        return clone

    }

    cutRoadFromTo ( road: TvRoad, start: number, end: number ): TvRoad[] {

        if ( start > end ) throw new Error( 'Start must be less than end' );

        const right = road.clone( end );
        right.id = RoadFactory.getNextRoadId();
        right.sStart = road.sStart + end;

        // empty section/segment
        road.spline.addRoadSegment( start, -1 );

        return [ road, right ];

    }
}
