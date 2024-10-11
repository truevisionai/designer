import { Injectable } from "@angular/core";
import { AbstractSpline } from "app/core/shapes/abstract-spline";
import { JunctionFactory } from "app/factories/junction.factory";
import { ConnectionManager } from "app/map/junction/connection.manager";
import { AutoJunction, TvJunction } from "app/map/models/junctions/tv-junction";
import { TvRoad } from "app/map/models/tv-road.model";
import { JunctionService } from "app/services/junction/junction.service";
import { SplineIntersection } from "app/services/junction/spline-intersection";
import { MapService } from "app/services/map/map.service";
import { RoadService } from "app/services/road/road.service";
import { MapEvents } from "app/events/map-events";
import { IntersectionGroup } from "./Intersection-group";
import { TvContactPoint } from "app/map/models/tv-common";
import { SplineSection } from "app/services/junction/spline-section";
import { IntersectionGroupHelper } from "./intersection-group-helper";

@Injectable( {
	providedIn: 'root'
} )
export class AutomaticJunctions {

	constructor (
		public mapService: MapService,
		public roadService: RoadService,
		public junctionFactory: JunctionFactory,
		public junctionService: JunctionService,
		public connectionManager: ConnectionManager
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

	removeSegmentAfterJunction ( spline: AbstractSpline, junction: TvJunction ): void {

		const prevSegment = spline.getPreviousSegment( junction );
		const nextSegment = spline.getNextSegment( junction );

		if ( nextSegment instanceof TvRoad && prevSegment instanceof TvRoad ) {

			const successor = nextSegment.successor?.clone();

			nextSegment.successor?.replace( nextSegment, prevSegment, TvContactPoint.END );

			prevSegment.successor = successor;

			this.mapService.removeRoad( nextSegment );

			spline.removeSegment( nextSegment );

			MapEvents.removeMesh.emit( nextSegment );

		}

	}

	shouldRemoveRoadAfterJunction ( spline: AbstractSpline, junction: TvJunction ): boolean {

		const prevSegment = spline.getPreviousSegment( junction );
		const nextSegment = spline.getNextSegment( junction );

		if ( nextSegment instanceof TvRoad && prevSegment instanceof TvRoad ) {

			return true;

		} else {

			return false

		}

	}

	private createOrUpdateGroup ( spline: AbstractSpline, existingJunctions: TvJunction[], group: IntersectionGroup ): void {

		if ( existingJunctions.length == 0 ) {

			this.addOrUpdateJunction( this.createJunctionFromGroup( spline, group ) );

			return;
		}

		const junction = existingJunctions.find( junction => group.matchesJunction( junction ) ) as AutoJunction;

		if ( junction ) {

			junction.addSpline( spline );

			this.updateJunctionAndConnections( spline, junction, group );

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

		const junction = this.createOrGetJunctionFromGroup( group, spline );

		group.insertJunction( junction );

		const links = group.getJunctionLinks( junction );

		this.connectionManager.addConnectionsFromLinks( junction, links );

		return junction;

	}

	private createOrGetJunctionFromGroup ( group: IntersectionGroup, spline: AbstractSpline ): AutoJunction {

		let junction: AutoJunction;

		if ( group.getJunctions().length == 0 ) {

			junction = this.junctionFactory.createAutoJunctionFromGroup( group );

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

		this.connectionManager.addConnectionsFromLinks( junction, links );

		junction.updateBoundary();

		junction.updatePositionAndBounds();

		this.junctionService.update( junction );

	}

}
