import { MetaImporter } from "./metadata.model";
import { TvRoadLaneOffset } from "../../modules/tv-map/models/tv-road-lane-offset";
import { TvLaneSection } from "../../modules/tv-map/models/tv-lane-section";
import { TvRoad } from "../../modules/tv-map/models/tv-road.model";

export class RoadStyle {

    public static extension = 'roadstyle';

    public static importer = MetaImporter.ROAD_STYLE;

    public laneOffset: TvRoadLaneOffset;

    public laneSection: TvLaneSection;

    constructor ( road?: TvRoad ) {

        this.laneOffset = new TvRoadLaneOffset( null, 0, 0, 0, 0, 0 );

        this.laneSection = new TvLaneSection( 0, 0, true, road );

        this.laneSection.road = road;

    }

    clone ( road: TvRoad ): RoadStyle {

        const style = new RoadStyle( road );

        style.laneOffset = this.laneOffset.clone();

        style.laneSection = this.laneSection.cloneAtS();

        return style;
    }

}