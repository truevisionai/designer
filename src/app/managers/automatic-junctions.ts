/*
 * Copyright Truesense AI Solutions Pvt Ltd, All Rights Reserved.
 */

import { Injectable } from "@angular/core";
import { AbstractSpline } from "app/core/shapes/abstract-spline";
import { JunctionFactory } from "app/factories/junction.factory";
import { ConnectionManager } from "app/map/junction/connection.manager";
import { TvJunction } from "app/map/models/junctions/tv-junction";
import { JunctionService } from "app/services/junction/junction.service";
import { SplineIntersection } from "app/services/junction/spline-intersection";
import { MapService } from "app/services/map/map.service";
import { RoadService } from "app/services/road/road.service";
import { IntersectionGroup } from "./Intersection-group";
import { IntersectionGroupHelper } from "./intersection-group-helper";
import { AutoJunction } from "../map/models/junctions/auto-junction";
import { AddJunctionConnectionForEachLane } from "app/services/junction/create-junction-with-single-connection";
import { SplineGeometryGenerator } from "app/services/spline/spline-geometry-generator";

@Injectable( {
	providedIn: 'root'
} )
export class AutomaticJunctions {

	constructor (
		public mapService: MapService,
		public roadService: RoadService,
		public junctionService: JunctionService,
		public connectionManager: ConnectionManager,
		private splineBuilder: SplineGeometryGenerator,
	) {
	}

	detectJunctions ( spline: AbstractSpline ): void {

		const existingJunctions = spline.getJunctionSegments();

		const intersections = this.getIntersections( spline );

		const groups = this.getGroups( intersections );

		if ( this.shouldDisconnectAllJunctions( existingJunctions, groups ) ) {

			this.disconnectFromJunction( spline, existingJunctions );

		} else {

			for ( const junction of existingJunctions ) {

				if ( !groups.find( group => group.matchesJunction( junction ) ) ) {

					this.disconnectFromJunction( spline, junction );

				}

			}

			this.createJunctionsFromGroups( spline, existingJunctions, groups );

		}

	}

	private shouldDisconnectAllJunctions ( existingJunctions: TvJunction[], groups: IntersectionGroup[] ): boolean {

		return groups.length == 0 && existingJunctions.length > 0;

	}

	private createJunctionsFromGroups ( spline: AbstractSpline, existingJunctions: TvJunction[], groups: IntersectionGroup[] ): void {

		for ( const group of groups ) {

			this.createOrUpdateGroup( spline, existingJunctions, group );

		}

	}

	private getGroups ( intersections: SplineIntersection[] ): IntersectionGroup[] {

		return ( new IntersectionGroupHelper( intersections ) ).getGroups();

	}

	private getIntersections ( spline: AbstractSpline ): SplineIntersection[] {

		const intersections: SplineIntersection[] = [];

		for ( const otherSpline of this.mapService.nonJunctionSplines ) {

			if ( spline.equals( otherSpline ) ) continue;
			if ( spline.isLinkedTo( otherSpline ) ) continue;

			intersections.push( ...spline.getIntersections( otherSpline ) );

		}

		return intersections;
	}

	private disconnectFromJunction ( spline: AbstractSpline, junctions: TvJunction | TvJunction[] ): void {

		if ( junctions instanceof Array ) {

			for ( const junction of junctions ) {

				this.disconnectJunction( spline, junction );

			}

		} else if ( junctions instanceof TvJunction ) {

			this.disconnectJunction( spline, junctions );

		}

	}

	private disconnectJunction ( spline: AbstractSpline, junction: TvJunction ): void {

		junction.removeSpline( spline );

		spline.getRoadSegments().forEach( road => {

			junction.removeConnectionsByRoad( road );

		} );

		spline.removeJunctionSegmentAndUpdate( junction );

		this.junctionService.update( junction );

	}

	private createOrUpdateGroup ( spline: AbstractSpline, existingJunctions: TvJunction[], group: IntersectionGroup ): void {

		group.reComputeJunctionOffsets( true );

		const existingJunction = existingJunctions.find( junction => group.matchesJunction( junction ) ) as AutoJunction;

		if ( existingJunction ) {

			existingJunction.addSpline( spline );

			this.updateJunctionAndConnections( spline, existingJunction, group );

		} else {

			this.addOrUpdateJunction( this.createJunctionFromGroup( spline, group ) );

		}
	}

	private addOrUpdateJunction ( junction: TvJunction ): void {

		if ( this.mapService.hasJunction( junction ) ) {

			this.junctionService.update( junction );

		} else {

			this.junctionService.add( junction );

		}

	}

	private createJunctionFromGroup ( spline: AbstractSpline, group: IntersectionGroup ): TvJunction {

		group.reComputeJunctionOffsets( true );

		const junction = this.createOrGetJunctionFromGroup( group, spline );

		group.insertJunction( junction );

		const links = group.getJunctionLinks( junction );

		const helper = ( new AddJunctionConnectionForEachLane( this.roadService.roadFactory, this.splineBuilder ) );

		helper.add( junction, links );

		return junction;

	}

	private createOrGetJunctionFromGroup ( group: IntersectionGroup, spline: AbstractSpline ): AutoJunction {

		let junction: AutoJunction;

		if ( group.getJunctions().length == 0 ) {

			junction = JunctionFactory.createAutoJunctionFromGroup( group );

		} else {

			junction = group.getJunctions()[ 0 ] as AutoJunction;

			junction.addSpline( spline );

			group.expandByJunction( junction );

		}

		return junction;

	}

	private updateJunctionAndConnections ( spline: AbstractSpline, junction: AutoJunction, group: IntersectionGroup ): void {

		junction.removeAllConnections();

		group.updateJunction( junction );

		const links = group.getJunctionLinks( junction );

		const helper = ( new AddJunctionConnectionForEachLane( this.roadService.roadFactory, this.splineBuilder ) );

		helper.add( junction, links );

		junction.updateBoundary();

		junction.updatePositionAndBounds();

		this.junctionService.update( junction );

	}

}
