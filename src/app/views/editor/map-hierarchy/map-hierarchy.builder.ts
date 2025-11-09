/*
 * Copyright Truesense AI Solutions Pvt Ltd, All Rights Reserved.
 */

import { Injectable } from '@angular/core';
import { TravelDirection, TvLaneSide } from 'app/map/models/tv-common';
import { TvLane } from 'app/map/models/tv-lane';
import { TvLaneSection } from 'app/map/models/tv-lane-section';
import { TvRoad } from 'app/map/models/tv-road.model';
import {
	MapHierarchyNestedNode,
	MapHierarchyNodeType
} from './map-hierarchy.models';

@Injectable( {
	providedIn: 'root'
} )
export class MapHierarchyBuilder {

	build ( roads: TvRoad[] ): MapHierarchyNestedNode[] {

		if ( !roads || roads.length === 0 ) return [];

		return roads
			.slice()
			.sort( ( a, b ) => a.id - b.id )
			.map( road => this.createRoadNode( road ) );
	}

	private createRoadNode ( road: TvRoad ): MapHierarchyNestedNode {

		return {
			id: `road-${ road.id }`,
			label: this.formatRoadLabel( road ),
			type: MapHierarchyNodeType.Road,
			data: road,
			children: this.createLaneSectionNodes( road ),
			parentRoadId: road.id,
		};
	}

	private createLaneSectionNodes ( road: TvRoad ): MapHierarchyNestedNode[] {

		const laneSections = ( road.laneSections ?? [] ).slice().sort( ( a, b ) => a.s - b.s );

		return laneSections.map( laneSection => this.createLaneSectionNode( road, laneSection ) );
	}

	private createLaneSectionNode ( road: TvRoad, laneSection: TvLaneSection ): MapHierarchyNestedNode {

		return {
			id: `road-${ road.id }-section-${ laneSection.id }`,
			label: this.formatLaneSectionLabel( laneSection ),
			type: MapHierarchyNodeType.LaneSection,
			data: laneSection,
			children: this.createLaneNodes( road, laneSection ),
			parentRoadId: road.id,
		};
	}

	private createLaneNodes ( road: TvRoad, laneSection: TvLaneSection ): MapHierarchyNestedNode[] {

		const lanes = laneSection.getLanes().slice().sort( ( a, b ) => this.compareLaneOrder( a, b ) );

		return lanes.map( lane => ( {
			id: `road-${ road.id }-section-${ laneSection.id }-lane-${ lane.id }`,
			label: this.formatLaneLabel( lane ),
			type: MapHierarchyNodeType.Lane,
			data: lane,
			children: [],
			parentRoadId: road.id,
		} ) );
	}

	private compareLaneOrder ( a: TvLane, b: TvLane ): number {

		if ( a.id === b.id ) return 0;

		const aCenter = a.id === 0;
		const bCenter = b.id === 0;

		if ( aCenter && !bCenter ) return -1;
		if ( bCenter && !aCenter ) return 1;

		const absDiff = Math.abs( a.id ) - Math.abs( b.id );

		if ( absDiff !== 0 ) return absDiff;

		return b.id - a.id;
	}

	private formatRoadLabel ( road: TvRoad ): string {

		const displayName = road.name?.trim?.() ? road.name.trim() : `Road ${ road.id }`;
		const kind = road.isJunction ? 'Junction Road' : 'Road';

		return `${ kind } ${ road.id }${ road.name ? ` - ${ displayName }` : '' }`;
	}

	private formatLaneSectionLabel ( laneSection: TvLaneSection ): string {

		const start = laneSection.s.toFixed( 2 );
		const length = laneSection.getLength();
		const hasLength = Number.isFinite( length ) && length > 0;
		const end = hasLength ? ( laneSection.s + length ).toFixed( 2 ) : undefined;
		const idPart = `Section ${ laneSection.id }`;
		const rangePart = end ? `s=${ start } -> ${ end }` : `s=${ start }`;
		const lanesPart = `${ laneSection.getLaneCount() } lanes`;

		return `${ idPart } - ${ rangePart } - ${ lanesPart }`;
	}

	private formatLaneLabel ( lane: TvLane ): string {

		const direction = ( lane.direction ?? TravelDirection.undirected ) as TravelDirection;
		const side = ( TvLaneSide[ lane.side ] ?? 'UNKNOWN' ).toString().toLowerCase();
		const type = lane.type;
		const role = lane.isDrivingLane ? 'driving' : type;

		return `Lane ${ lane.id } - ${ role } - ${ side } - ${ direction }`;
	}
}
