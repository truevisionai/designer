/*
 * Copyright Truesense AI Solutions Pvt Ltd, All Rights Reserved.
 */

import { MetaImporter } from "../../core/asset/metadata.model";
import { TvRoadLaneOffset } from "../../map/models/tv-road-lane-offset";
import { TvLaneSection } from "../../map/models/tv-lane-section";
import { TvRoad } from "../../map/models/tv-road.model";
import { TvElevationProfile } from "app/map/road-elevation/tv-elevation-profile.model";
import { TvElevation } from "app/map/road-elevation/tv-elevation.model";
import { TvRoadObject } from "app/map/models/objects/tv-road-object";

export class RoadStyle {

	public static extension = 'roadstyle';

	public static importer = MetaImporter.ROAD_STYLE;

	public laneOffset: TvRoadLaneOffset;

	public laneSection: TvLaneSection;

	public objects: TvRoadObject[] = [];

	get elevations (): TvElevation[] {
		return this.elevationProfile?.getElevations().filter( e => e.s <= 1 );
	}

	get elevationProfile (): TvElevationProfile {
		return this._elevationProfile;
	}

	set elevationProfile ( value: TvElevationProfile ) {
		this._elevationProfile = value;
	}

	private _elevationProfile: TvElevationProfile;

	constructor () { }

	static fromRoad ( road: TvRoad ): RoadStyle {

		const style = new RoadStyle();

		style.laneOffset = new TvRoadLaneOffset( 0, 0, 0, 0, 0 );

		style.laneSection = new TvLaneSection( 0, 0, true, road );

		style.elevationProfile = road ? road.elevationProfile.clone() : new TvElevationProfile();

		style.laneSection.road = road;

		road.objects.object.forEach( object => {

			const clone = object.clone();

			clone.repeats.forEach( repeat => repeat.segmentLength = -1 );

			style.objects.push( clone );

		} );

		return style;
	}

	setRoad ( road: TvRoad ) {

		this.laneSection.road = road;

		this.objects.forEach( obj => obj.road = road );

	}

	clone ( road: TvRoad ): RoadStyle {

		const style = new RoadStyle();

		style.laneOffset = this.laneOffset.clone();

		style.laneSection = this.laneSection.cloneAtS();

		style.elevationProfile = this.elevationProfile.clone();

		style.laneSection.road = road;

		style.objects = this.objects.map( obj => obj.clone() );

		return style;
	}

}
