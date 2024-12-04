/*
 * Copyright Truesense AI Solutions Pvt Ltd, All Rights Reserved.
 */

import { Injectable } from "@angular/core";
import { TvRoad } from "app/map/models/tv-road.model";
import { TvUtils } from "app/map/models/tv-utils";

@Injectable( {
	providedIn: 'root'
} )
export class RoadElevationManager {

	constructor () { }

	onRoadCreated ( road: TvRoad ): void {

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

	private syncPredecessor ( road: TvRoad ): void {

		if ( !road.predecessor ) return;

		if ( road.predecessor.isRoad ) {

			const predecessor = road.predecessor.getElement<TvRoad>();

			this.createDefaultNodes( predecessor );

			const lastElevation = predecessor.getElevationProfile().getLastElevation();

			lastElevation.a = road.getElevationProfile().getElevationValue( 0 );

			predecessor.getElevationProfile().computeCoefficients( predecessor.length );

		}

		if ( road.predecessor.isRoad ) {

			const prevRoad = road.predecessor.element as TvRoad;

			const prevSuperElevation = prevRoad.getLateralProfile().getLastSuperElevation();
			const firstSuperElevation = road.getLateralProfile().getFirstSuperElevation();

			if ( prevSuperElevation && firstSuperElevation ) {
				prevSuperElevation.a = firstSuperElevation.a;
			} else {
				console.error( 'Super elevation not found predecessor', prevSuperElevation, firstSuperElevation );
			}

			prevRoad.getLateralProfile().computeCoefficients( prevRoad.length );

		}

		// in case of junction make sure we have 0 elevation
		if ( road.predecessor.isJunction ) {

			// const firstElevation = road.elevationProfile.elevation[ 0 ];

			// firstElevation.s = 0;

			// firstElevation.a = 0;

			// TvUtils.computeCoefficients( road.elevationProfile.elevation, road.length );

		}

	}

	private syncSuccessor ( road: TvRoad ): void {

		if ( !road.successor ) return;

		if ( road.successor.isRoad ) {

			const successor = road.successor.getElement<TvRoad>();

			this.createDefaultNodes( successor );

			const firstElevation = successor.getElevationProfile().getFirstElevation();

			firstElevation.a = road.getElevationProfile().getElevationValue( road.length );

			successor.getElevationProfile().computeCoefficients( successor.length );

		}

		if ( road.successor.isRoad ) {

			const nextRoad = road.successor.element as TvRoad;

			const nextSuperElevation = nextRoad.getLateralProfile().getFirstSuperElevation();
			const lastSuperElevation = road.getLateralProfile().getLastSuperElevation();

			if ( nextSuperElevation && lastSuperElevation ) {
				nextSuperElevation.a = lastSuperElevation.a;
			} else {
				console.error( 'Super elevation not found successor', nextSuperElevation, lastSuperElevation );
			}

			nextRoad.getLateralProfile().computeCoefficients( nextRoad.length );

		}

		// in case of junction make sure we have 0 elevation
		if ( road.successor.isJunction ) {

			// const lastElevation = road.elevationProfile.elevation[ road.getElevationProfile().getElevationCount() - 1 ];

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

	removeInvalidNodes ( road: TvRoad ): void {

		for ( const elevation of road.getElevationProfile().getElevations() ) {

			// Remove nodes that are out of bounds
			if ( elevation.s > road.length ) {
				road.getElevationProfile().removeElevation( elevation );
			}

			// Remove nodes that are out of bounds
			if ( elevation.s < 0 ) {
				road.getElevationProfile().removeElevation( elevation );
			}

		}

		TvUtils.computeCoefficients( road.getElevationProfile().getElevations(), road.getLength() );
	}

	private ensureMinimumTwoNodes ( road: TvRoad ): void {

		// Add two default nodes if there are no nodes
		if ( road.getElevationProfile().getElevationCount() === 0 ) {
			this.addFirstElevationNode( road );
			this.addLastElevationNode( road );
		}

		// Add a node at the end if there's only one node
		if ( road.getElevationProfile().getElevationCount() === 1 ) {
			this.addLastElevationNode( road );
		}

		// Add two default nodes if there are no nodes
		if ( road.getLateralProfile().getSuperElevationCount() === 0 ) {
			road.getLateralProfile().createSuperElevation( 0, 0, 0, 0, 0 );
			road.getLateralProfile().createSuperElevation( road.length, 0, 0, 0, 0 );
		}

		// Add a node at the end if there's only one node
		if ( road.getLateralProfile().getSuperElevationCount() === 1 ) {
			road.getLateralProfile().createSuperElevation( road.length, 0, 0, 0, 0 );
		}

	}

	addFirstElevationNode ( road: TvRoad ): void {
		road.getElevationProfile().createAndAddElevation( 0, 0, 0, 0, 0 );
	}

	addLastElevationNode ( road: TvRoad ): void {
		road.getElevationProfile().createAndAddElevation( road.length, 0, 0, 0, 0 );
	}

	private updateFirstAndLastNodes ( road: TvRoad ): void {

		// Update the first node
		road.getElevationProfile().getFirstElevation().s = 0;

		// Update the last node
		road.getElevationProfile().getLastElevation().s = road.length;

		const firstSuperElevation = road.getLateralProfile().getFirstSuperElevation();

		const lastSuperElevation = road.getLateralProfile().getLastSuperElevation();

		if ( firstSuperElevation ) firstSuperElevation.s = 0;

		if ( lastSuperElevation ) lastSuperElevation.s = road.length;

	}

}
