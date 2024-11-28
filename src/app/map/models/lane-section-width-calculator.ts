import { TvLane } from "./tv-lane";
import { TvLaneLocation } from "./tv-common";
import { TvLaneSection } from "./tv-lane-section";

export class LaneSectionWidthCalculator {

	private readonly laneSection: TvLaneSection;

	constructor ( laneSection: TvLaneSection ) {
		this.laneSection = laneSection;
	}

	public getWidthAt ( sOffset: number ): number {

		let width = 0;

		this.laneSection.getLeftLanes().forEach( lane => width += lane.getWidthValue( sOffset ) );
		this.laneSection.getRightLanes().forEach( lane => width += lane.getWidthValue( sOffset ) );

		return width;

	}

	/**
	 * Calculates width up to the start of the lane
	 * @param lane Target lane
	 * @param sCoordinate Coordinate with respect to lane section
	 */
	public getWidthUptoStart ( lane: TvLane, sCoordinate: number ): number {
		return this.calculateWidth( lane, sCoordinate, TvLaneLocation.START );
	}

	/**
	 * Calculates width up to the end of the lane
	 * @param lane Target lane
	 * @param sCoordinate Coordinate with respect to lane section
	 */
	public getWidthUptoEnd ( lane: TvLane, sCoordinate: number ): number {
		return this.calculateWidth( lane, sCoordinate, TvLaneLocation.END );
	}

	/**
	 * Calculates width up to the center of the lane
	 * @param lane Target lane
	 * @param sCoordinate Coordinate with respect to lane section
	 */
	public getWidthUptoCenter ( lane: TvLane, sCoordinate: number ): number {
		return this.calculateWidth( lane, sCoordinate, TvLaneLocation.CENTER );
	}

	/**
	 * Core calculation method that handles all width calculation types
	 * @private
	 */
	private calculateWidth ( lane: TvLane, sValue: number, type: TvLaneLocation ): number {

		// Early return for center lanes
		if ( lane.isCenter ) return 0;

		const lanes = this.getLanesInOrder( lane );

		let cumulativeWidth = 0;

		for ( const currentLane of lanes ) {

			const width = currentLane.getWidthValue( sValue );

			if ( currentLane.id === lane.id ) {
				switch ( type ) {
					case TvLaneLocation.START:
						return cumulativeWidth;
					case TvLaneLocation.END:
						return cumulativeWidth + width;
					case TvLaneLocation.CENTER:
						return cumulativeWidth + ( width / 2 );
				}
			}

			cumulativeWidth += width;
		}

		return cumulativeWidth;
	}

	/**
	 * Gets lanes in the correct order based on side
	 * @private
	 */
	private getLanesInOrder ( lane: TvLane ): TvLane[] {
		const lanes = this.laneSection.getLanesBySide( lane.side );
		return lane.isLeft ? [ ...lanes ].reverse() : lanes;
	}

}
