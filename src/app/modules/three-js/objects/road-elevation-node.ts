/*
 * Copyright Truesense AI Solutions Pvt Ltd, All Rights Reserved.
 */

import { Action, SerializedField } from 'app/core/components/serialization';
import { DeleteElevationCommand } from 'app/tools/road-elevation/delete-elevation-command';
import { TvElevation } from 'app/modules/tv-map/models/tv-elevation';
import { TvRoad } from 'app/modules/tv-map/models/tv-road.model';
import { TvUtils } from 'app/modules/tv-map/models/tv-utils';
import { CommandHistory } from 'app/services/command-history';
import { SnackBar } from 'app/services/snack-bar.service';
import { Maths } from 'app/utils/maths';
import { Vector3 } from 'three';
import { DynamicControlPoint } from './dynamic-control-point';
// import { MapEvents, RoadUpdatedEvent } from 'app/events/map-events';

export class RoadElevationNode extends DynamicControlPoint<any> {

	static readonly TAG = 'RoadElevationNode';

	constructor ( public road: TvRoad, public elevation: TvElevation ) {

		super( elevation, road?.getPositionAt( elevation.s || 0 ).toVector3() || new Vector3() );

		this.tag = this.name = RoadElevationNode.TAG;

	}

	@SerializedField( { type: 'int' } )
	get s (): number {
		return this.elevation.s;
	}

	set s ( value: number ) {
		this.elevation.s = value;
		this.updateValuesAndPosition();
		// MapEvents.roadUpdated.emit( new RoadUpdatedEvent( this.road, false ) );
	}

	@SerializedField( { type: 'int' } )
	get height (): number {
		return this.elevation.a;
	}

	set height ( value: number ) {
		this.elevation.a = value;
		this.updateValuesAndPosition();
		// MapEvents.roadUpdated.emit( new RoadUpdatedEvent( this.road, false ) );
	}

	@Action()
	delete () {
		if ( Maths.approxEquals( this.s, 0 ) ) {
			SnackBar.warn( 'Cannot delete first node' );
		} else {
			CommandHistory.execute( new DeleteElevationCommand( this ) );
		}
	}

	update () {

		// const roadCoord = this.road.getCoordAt( this.position );

		// this.elevation.s = roadCoord.s;

		// this.updateValuesAndPosition();

		// MapEvents.roadUpdated.emit( new RoadUpdatedEvent( this.road, false ) );

		// MapEvents.objectUpdated.emit( this );

	}

	getWorldPosition (): Vector3 {

		return this.road?.getPositionAt( this.elevation.s ).toVector3();

	}

	updateValuesAndPosition () {

		TvUtils.computeCoefficients( this.road.elevationProfile.elevation, this.road.length );

		this.position.copy( this.getWorldPosition() );

		this.updateOthers();

	}

	updateByPosition ( point: Vector3 ) {

		const roadCoord = this.road.getCoordAt( point );

		this.elevation.s = roadCoord.s;

		this.updateValuesAndPosition();

	}

	updateOthers () {

		this.road.getElevationProfile().getElevations().forEach( elevation => {


		} );

	}


}
