import { MetaImporter } from "./metadata.model";
import { TvRoadLaneOffset } from "../../modules/tv-map/models/tv-road-lane-offset";
import { TvLaneSection } from "../../modules/tv-map/models/tv-lane-section";
import { TvRoad } from "../../modules/tv-map/models/tv-road.model";
import { TvElevationProfile } from "app/modules/tv-map/models/tv-elevation-profile";
import { TvElevation } from "app/modules/tv-map/models/tv-elevation";

export class RoadStyle {

	public static extension = 'roadstyle';

	public static importer = MetaImporter.ROAD_STYLE;

	public laneOffset: TvRoadLaneOffset;

	public laneSection: TvLaneSection;

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

	constructor ( road?: TvRoad ) {

		this.laneOffset = new TvRoadLaneOffset( 0, 0, 0, 0, 0 );

		this.laneSection = new TvLaneSection( 0, 0, true, road );

		this.elevationProfile = road ? road.elevationProfile.clone() : new TvElevationProfile();

		this.laneSection.road = road;

	}

	clone ( road: TvRoad ): RoadStyle {

		const style = new RoadStyle( road );

		style.laneOffset = this.laneOffset.clone();

		style.laneSection = this.laneSection.cloneAtS();

		style.elevationProfile = this.elevationProfile.clone();

		return style;
	}

}
