import { Injectable } from "@angular/core";
import { TvRoad } from "app/modules/tv-map/models/tv-road.model";
import { TvUtils } from "app/modules/tv-map/models/tv-utils";

@Injectable( {
	providedIn: 'root'
} )
export class RoadElevationManager {

	constructor () { }

	onRoadCreated ( road: TvRoad ) {

		this.createDefaultNodes( road );

		this.removeInvalidNodes( road );

	}

	onRoadUpdated ( road: TvRoad ): void {

		this.createDefaultNodes( road );

		if ( road.isJunction ) {

			this.removeInvalidNodes( road );

		} else {

			this.syncSuccessor( road );

			this.syncPredecessor( road );

			this.removeInvalidNodes( road );

		}

	}

	syncPredecessor ( road: TvRoad ) {

		if ( !road.predecessor ) return;

		if ( road.predecessor.isRoad ) {

			const predecessor = road.predecessor.getElement<TvRoad>();

			this.createDefaultNodes( predecessor );

			const lastElevation = predecessor.elevationProfile.elevation[ predecessor.elevationProfile.elevation.length - 1 ];

			lastElevation.a = road.getElevationValue( 0 );

			TvUtils.computeCoefficients( predecessor.elevationProfile.elevation, predecessor.length );

		}

		// in case of junction make sure we have 0 elevation
		if ( road.predecessor.isJunction ) {

			// const firstElevation = road.elevationProfile.elevation[ 0 ];

			// firstElevation.s = 0;

			// firstElevation.a = 0;

			// TvUtils.computeCoefficients( road.elevationProfile.elevation, road.length );

		}

	}

	private syncSuccessor ( road: TvRoad ) {

		if ( !road.successor ) return;

		if ( road.successor.isRoad ) {

			const successor = road.successor.getElement<TvRoad>();

			this.createDefaultNodes( successor );

			const firstElevation = successor.elevationProfile.elevation[ 0 ];

			firstElevation.a = road.getElevationValue( road.length );

			TvUtils.computeCoefficients( successor.elevationProfile.elevation, successor.length );

		}

		// in case of junction make sure we have 0 elevation
		if ( road.successor.isJunction ) {

			// const lastElevation = road.elevationProfile.elevation[ road.elevationProfile.elevation.length - 1 ];

			// lastElevation.s = road.length;

			// lastElevation.a = 0;

			// TvUtils.computeCoefficients( road.elevationProfile.elevation, road.length );

		}

	}

	private createDefaultNodes ( road: TvRoad ): void {

		if ( road.isJunction ) return;

		// Ensure there are at least two nodes
		this.ensureMinimumTwoNodes( road );

		// Update first and last nodes
		this.updateFirstAndLastNodes( road );

	}

	removeInvalidNodes ( road: TvRoad ) {

		for ( const elevation of road.elevationProfile.elevation ) {

			// Remove nodes that are out of bounds
			if ( elevation.s > road.length ) {
				road.removeElevationInstance( elevation );
			}

			// Remove nodes that are out of bounds
			if ( elevation.s < 0 ) {
				road.removeElevationInstance( elevation );
			}

		}

	}

	private ensureMinimumTwoNodes ( road: TvRoad ): void {

		// Add two default nodes if there are no nodes
		if ( road.elevationProfile.elevation.length === 0 ) {
			road.addElevation( 0, 0, 0, 0, 0 );
			road.addElevation( road.length, 0, 0, 0, 0 );
			return;
		}

		// Add a node at the end if there's only one node
		if ( road.elevationProfile.elevation.length === 1 ) {
			road.addElevation( road.length, 0, 0, 0, 0 );
		}

	}

	private updateFirstAndLastNodes ( road: TvRoad ) {

		// Update the first node
		if ( road.elevationProfile.elevation.length > 0 ) {
			road.elevationProfile.elevation[ 0 ].s = 0;
		}

		// Update the last node
		const lastIndex = road.elevationProfile.elevation.length - 1;
		if ( lastIndex >= 0 ) {
			road.elevationProfile.elevation[ lastIndex ].s = road.length;
		}

	}

}
