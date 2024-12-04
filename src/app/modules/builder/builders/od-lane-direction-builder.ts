/*
 * Copyright Truesense AI Solutions Pvt Ltd, All Rights Reserved.
 */

import { SceneService } from 'app/services/scene.service';
import { ArrowHelper, Object3D, Vector3 } from 'three';
import { SimpleArrowObject } from '../../../objects/lane-arrow-object';
import { TvLaneSide } from '../../../map/models/tv-common';
import { TvLane } from '../../../map/models/tv-lane';
import { TvLaneSection } from '../../../map/models/tv-lane-section';
import { TvRoad } from '../../../map/models/tv-road.model';

export class OdLaneDirectionBuilder {

	private stepValue = 5;
	private arrows: Object3D[] = [];

	constructor ( private road: TvRoad ) {

	}

	setRoad ( value: TvRoad ): void {

		this.clear();

		this.road = value;

	}

	create (): void {

		this.road.computeLaneSectionCoordinates();

		for ( let i = 0; i < this.road.getLaneProfile().getLaneSections().length; i++ ) {

			const laneSection = this.road.getLaneProfile().getLaneSections()[ i ];

			laneSection.getLeftLanes().forEach( lane => this.drawLane( lane, laneSection ) );

			laneSection.getRightLanes().forEach( lane => this.drawLane( lane, laneSection ) );
		}

	}

	clear (): void {

		this.arrows.forEach( arrow => SceneService.removeFromTool( arrow ) );

	}

	drawSingleLane ( road: TvRoad, lane: TvLane ): void {

		this.road = road;

		for ( let i = 0; i < this.road.getLaneProfile().getLaneSections().length; i++ ) {

			const laneSection = this.road.getLaneProfile().getLaneSections()[ i ];

			this.drawLane( lane, laneSection );
		}
	}

	/**
	 *
	 * @param origin
	 * @param direction
	 * @private
	 * @deprecated not used anymore
	 */
	private createArrow3D ( origin: Vector3, direction: Vector3 ): void {

		// var dir = new Vector3( 0, 1, 0 );

		// normalize the direction vector (convert to vector of length 1)
		direction.normalize();

		const length = 2.5;
		const hex = 0xffff00;

		const headLength = 0.2 * length;
		const headWidth = 0.75 * headLength;

		origin.setZ( origin.z + 0.1 );

		const arrowHelper = new ArrowHelper( direction, origin, length, hex, headLength, headWidth );

		arrowHelper.renderOrder = 3;

		this.arrows.push( arrowHelper );

		// add to helper to avoid raycasting
		SceneService.addToolObject( arrowHelper );
	}

	private createArrow2D ( origin: Vector3, hdg: number ): SimpleArrowObject {

		const arrow = new SimpleArrowObject( origin, hdg );

		this.arrows.push( arrow );

		SceneService.addToolObject( arrow );

		return arrow;
	}

	private drawLane ( lane: TvLane, laneSection: TvLaneSection ): void {

		// if ( lane.type !== TvLaneType.driving ) return;

		let s = laneSection.s;

		while ( s <= laneSection.endS ) {

			// Compute the width of the lane section up to the current position.
			let width = laneSection.getWidthUptoCenter( lane, s );

			// Get the road coordinates at the current position.
			const posTheta = lane.laneSection.road.getPosThetaAt( s );

			// Adjust position and heading based on lane side.
			if ( lane.side === TvLaneSide.LEFT ) {
				// Reverse the direction to show arrow in traffic direction.
				// TODO: Make traffic direction editable from the editor.
				posTheta.hdg += Math.PI;
			}

			// The width is negated regardless of the side
			width *= -1;

			// Add the lateral offset to the position.
			posTheta.addLateralOffset( width );

			// Create a 2D arrow at the current position and direction.
			this.createArrow2D( posTheta.toVector3(), posTheta.hdg );

			s += this.stepValue;
		}

	}
}

export class LaneDirectionHelper {

	private static distance = 5;

	public static drawSingleLane ( lane: TvLane, distance: number = 5, size: number = 0.5 ): SimpleArrowObject[] {

		this.distance = distance;

		return this.drawLane( lane, lane.laneSection, size );

	}

	private static drawLane ( lane: TvLane, laneSection: TvLaneSection, size: number = 0.5 ): SimpleArrowObject[] {

		const arrows: SimpleArrowObject[] = [];

		// if ( lane.type !== TvLaneType.driving ) return;

		let s = laneSection.s + this.distance;

		while ( s < laneSection.endS ) {

			// Compute the width of the lane section up to the current position.
			let width = laneSection.getWidthUptoCenter( lane, s );

			// Get the road coordinates at the current position.
			const posTheta = lane.laneSection.road.getPosThetaAt( s );

			// Adjust position and heading based on lane side.
			if ( lane.side === TvLaneSide.LEFT ) {
				// Reverse the direction to show arrow in traffic direction.
				// TODO: Make traffic direction editable from the editor.
				posTheta.hdg += Math.PI;
			}

			// The width is negated regardless of the side
			width *= -1;

			// Add the lateral offset to the position.
			posTheta.addLateralOffset( width );

			// Create a 2D arrow at the current position and direction.
			const arrow = new SimpleArrowObject( posTheta.toVector3(), posTheta.hdg, size );

			arrows.push( arrow );

			s += this.distance;
		}

		return arrows;
	}
}
