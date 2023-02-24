/*
 * Copyright Truesense AI Solutions Pvt Ltd, All Rights Reserved.
 */

import { TvColors, TvLaneSide, TvLaneType, TvRoadMarkTypes, TvRoadMarkWeights } from 'app/modules/tv-map/models/tv-common';
import { TvLaneSection } from 'app/modules/tv-map/models/tv-lane-section';
import { TvRoadLaneOffset } from 'app/modules/tv-map/models/tv-road-lane-offset';

export class RoadStyle {

    public static extension = 'roadstyle';

    public static importer = 'RoadStyleImporter';

    public laneOffset: TvRoadLaneOffset;

    public laneSection: TvLaneSection;

    constructor ( roadId?: number ) {

        this.laneOffset = new TvRoadLaneOffset( 0, 0, 0, 0, 0 );

        this.laneSection = new TvLaneSection( 0, 0, true, roadId );

        this.laneSection.roadId = roadId;

    }

    clone ( roadId: number ): RoadStyle {

        const style = new RoadStyle( roadId );

        style.laneOffset = this.laneOffset.clone();

        style.laneSection = this.laneSection.cloneAtS();

        return style;
    }


}

export class RoadStyleService {

    private static style?: RoadStyle;

    static setCurrentStyle ( style: RoadStyle ) {

        this.style = style;

    }

    static getRoadStyle ( roadId?: number ): RoadStyle {

        if ( this.style ) {

            return this.style.clone( roadId );
        }

        return this.getDefaultRoadStyle( roadId );
    }

    static getDefaultRoadStyle ( roadId?: number ): RoadStyle {

        const roadStyle = new RoadStyle();

        roadStyle.laneOffset = new TvRoadLaneOffset( 0, 0, 0, 0, 0 );

        roadStyle.laneSection = new TvLaneSection( 0, 0, true, roadId );

        const leftLane3 = roadStyle.laneSection.addLane( TvLaneSide.LEFT, 3, TvLaneType.sidewalk, true, true );
        const leftLane2 = roadStyle.laneSection.addLane( TvLaneSide.LEFT, 2, TvLaneType.shoulder, true, true );
        const leftLane1 = roadStyle.laneSection.addLane( TvLaneSide.LEFT, 1, TvLaneType.driving, true, true );
        const centerLane = roadStyle.laneSection.addLane( TvLaneSide.CENTER, 0, TvLaneType.driving, true, true );
        const rightLane1 = roadStyle.laneSection.addLane( TvLaneSide.RIGHT, -1, TvLaneType.driving, true, true );
        const rightLane2 = roadStyle.laneSection.addLane( TvLaneSide.RIGHT, -2, TvLaneType.shoulder, true, true );
        const rightLane3 = roadStyle.laneSection.addLane( TvLaneSide.RIGHT, -3, TvLaneType.sidewalk, true, true );

        leftLane1.addRoadMarkRecord( 0, TvRoadMarkTypes.NONE, TvRoadMarkWeights.STANDARD, TvColors.STANDARD, 0.15, 'none', 0 );
        centerLane.addRoadMarkRecord( 0, TvRoadMarkTypes.BROKEN, TvRoadMarkWeights.STANDARD, TvColors.STANDARD, 0.15, 'none', 0 );
        rightLane1.addRoadMarkRecord( 0, TvRoadMarkTypes.NONE, TvRoadMarkWeights.STANDARD, TvColors.STANDARD, 0.15, 'none', 0 );

        roadStyle.laneSection.getLaneVector().forEach( lane => {

            if ( lane.side !== TvLaneSide.CENTER ) {

                if ( lane.type == TvLaneType.driving ) {
                    lane.addWidthRecord( 0, 3.6, 0, 0, 0 );
                } else if ( lane.type == TvLaneType.sidewalk ) {
                    lane.addWidthRecord( 0, 2, 0, 0, 0 );
                } else {
                    lane.addWidthRecord( 0, 0.5, 0, 0, 0 );
                }

            }

        } );

        return roadStyle;
    }

    // static getCountryRoadStyle (): RoadStyle {

    //     const roadStyle = new RoadStyle();

    //     roadStyle.laneSection = new TvLaneSection( 1, 0, true, -1 );

    //     const leftLane2 = roadStyle.laneSection.addLane( TvLaneSide.LEFT, 2, TvLaneType.shoulder, true, true );
    //     const leftLane1 = roadStyle.laneSection.addLane( TvLaneSide.LEFT, 1, TvLaneType.driving, true, true );
    //     const centerLane = roadStyle.laneSection.addLane( TvLaneSide.CENTER, 0, TvLaneType.driving, true, true );
    //     const rightLane1 = roadStyle.laneSection.addLane( TvLaneSide.RIGHT, -1, TvLaneType.driving, true, true );
    //     const rightLane2 = roadStyle.laneSection.addLane( TvLaneSide.RIGHT, -2, TvLaneType.shoulder, true, true );

    //     leftLane1.addRoadMarkRecord( 0, TvRoadMarkTypes.SOLID, TvRoadMarkWeights.STANDARD, TvColors.STANDARD, 0.15, 'none', 0 );
    //     centerLane.addRoadMarkRecord( 0, TvRoadMarkTypes.NONE, TvRoadMarkWeights.STANDARD, TvColors.STANDARD, 0.15, 'none', 0 );
    //     rightLane1.addRoadMarkRecord( 0, TvRoadMarkTypes.SOLID, TvRoadMarkWeights.STANDARD, TvColors.STANDARD, 0.15, 'none', 0 );

    //     roadStyle.laneSection.getLaneVector().forEach( lane => {

    //         if ( lane.side !== TvLaneSide.CENTER ) {

    //             if ( lane.type == TvLaneType.driving ) lane.addWidthRecord( 0, 3.6, 0, 0, 0 );

    //             else if ( lane.type == TvLaneType.sidewalk ) lane.addWidthRecord( 0, 2, 0, 0, 0 );

    //             else lane.addWidthRecord( 0, 0.5, 0, 0, 0 );

    //         }

    //     } );

    //     return roadStyle;
    // }

    // static getHighwayPassingRoadStyle (): RoadStyle {

    //     const roadStyle = new RoadStyle();

    //     roadStyle.laneSection = new TvLaneSection( 1, 0, true, -1 );

    //     const leftLane2 = roadStyle.laneSection.addLane( TvLaneSide.LEFT, 2, TvLaneType.shoulder, true, true );
    //     const leftLane1 = roadStyle.laneSection.addLane( TvLaneSide.LEFT, 1, TvLaneType.driving, true, true );
    //     const centerLane = roadStyle.laneSection.addLane( TvLaneSide.CENTER, 0, TvLaneType.driving, true, true );
    //     const rightLane1 = roadStyle.laneSection.addLane( TvLaneSide.RIGHT, -1, TvLaneType.driving, true, true );
    //     const rightLane2 = roadStyle.laneSection.addLane( TvLaneSide.RIGHT, -2, TvLaneType.shoulder, true, true );

    //     leftLane1.addRoadMarkRecord( 0, TvRoadMarkTypes.SOLID, TvRoadMarkWeights.STANDARD, TvColors.STANDARD, 0.15, 'none', 0 );
    //     centerLane.addRoadMarkRecord( 0, TvRoadMarkTypes.BROKEN, TvRoadMarkWeights.STANDARD, TvColors.YELLOW, 0.15, 'none', 0 );
    //     rightLane1.addRoadMarkRecord( 0, TvRoadMarkTypes.SOLID, TvRoadMarkWeights.STANDARD, TvColors.STANDARD, 0.15, 'none', 0 );

    //     roadStyle.laneSection.getLaneVector().forEach( lane => {

    //         if ( lane.side !== TvLaneSide.CENTER ) {

    //             if ( lane.type == TvLaneType.driving ) lane.addWidthRecord( 0, 3.6, 0, 0, 0 );

    //             else if ( lane.type == TvLaneType.sidewalk ) lane.addWidthRecord( 0, 2, 0, 0, 0 );

    //             else lane.addWidthRecord( 0, 0.5, 0, 0, 0 );

    //         }

    //     } );

    //     return roadStyle;
    // }

    // static getHighwayRoadStyle (): RoadStyle {

    //     const roadStyle = new RoadStyle();

    //     roadStyle.laneSection = new TvLaneSection( 1, 0, true, -1 );

    //     const leftLane2 = roadStyle.laneSection.addLane( TvLaneSide.LEFT, 2, TvLaneType.shoulder, true, true );
    //     const leftLane1 = roadStyle.laneSection.addLane( TvLaneSide.LEFT, 1, TvLaneType.driving, true, true );
    //     const centerLane = roadStyle.laneSection.addLane( TvLaneSide.CENTER, 0, TvLaneType.driving, true, true );
    //     const rightLane1 = roadStyle.laneSection.addLane( TvLaneSide.RIGHT, -1, TvLaneType.driving, true, true );
    //     const rightLane2 = roadStyle.laneSection.addLane( TvLaneSide.RIGHT, -2, TvLaneType.shoulder, true, true );

    //     leftLane1.addRoadMarkRecord( 0, TvRoadMarkTypes.SOLID, TvRoadMarkWeights.STANDARD, TvColors.STANDARD, 0.15, 'none', 0 );
    //     centerLane.addRoadMarkRecord( 0, TvRoadMarkTypes.SOLID_SOLID, TvRoadMarkWeights.STANDARD, TvColors.YELLOW, 0.15, 'none', 0 );
    //     rightLane1.addRoadMarkRecord( 0, TvRoadMarkTypes.SOLID, TvRoadMarkWeights.STANDARD, TvColors.STANDARD, 0.15, 'none', 0 );

    //     roadStyle.laneSection.getLaneVector().forEach( lane => {

    //         if ( lane.side !== TvLaneSide.CENTER ) {

    //             if ( lane.type == TvLaneType.driving ) lane.addWidthRecord( 0, 3.6, 0, 0, 0 );

    //             else if ( lane.type == TvLaneType.sidewalk ) lane.addWidthRecord( 0, 2, 0, 0, 0 );

    //             else lane.addWidthRecord( 0, 0.5, 0, 0, 0 );

    //         }

    //     } );

    //     return roadStyle;
    // }

    // static getFreewayRoadStyle (): RoadStyle {

    //     const roadStyle = new RoadStyle();

    //     roadStyle.laneSection = new TvLaneSection( 1, 0, true, -1 );

    //     const leftLane6 = roadStyle.laneSection
    //         .addLane( TvLaneSide.LEFT, 6, TvLaneType.shoulder, true, true );

    //     const leftLane5 = roadStyle.laneSection
    //         .addLane( TvLaneSide.LEFT, 5, TvLaneType.driving, true, true )
    //         .addRoadMarkRecord( 0, TvRoadMarkTypes.SOLID, TvRoadMarkWeights.STANDARD, TvColors.STANDARD, 0.15, 'none', 0 );

    //     const leftLane4 = roadStyle.laneSection
    //         .addLane( TvLaneSide.LEFT, 4, TvLaneType.driving, true, true )
    //         .addRoadMarkRecord( 0, TvRoadMarkTypes.BROKEN, TvRoadMarkWeights.STANDARD, TvColors.STANDARD, 0.15, 'none', 0 );

    //     const leftLane3 = roadStyle.laneSection
    //         .addLane( TvLaneSide.LEFT, 3, TvLaneType.driving, true, true )
    //         .addRoadMarkRecord( 0, TvRoadMarkTypes.BROKEN, TvRoadMarkWeights.STANDARD, TvColors.STANDARD, 0.15, 'none', 0 );

    //     const leftLane2 = roadStyle.laneSection
    //         .addLane( TvLaneSide.LEFT, 2, TvLaneType.driving, true, true )
    //         .addRoadMarkRecord( 0, TvRoadMarkTypes.BROKEN, TvRoadMarkWeights.STANDARD, TvColors.STANDARD, 0.15, 'none', 0 );

    //     const leftLane1 = roadStyle.laneSection
    //         .addLane( TvLaneSide.LEFT, 1, TvLaneType.shoulder, true, true )
    //         .addRoadMarkRecord( 0, TvRoadMarkTypes.SOLID, TvRoadMarkWeights.STANDARD, TvColors.YELLOW, 0.15, 'none', 0 );

    //     const centerLane = roadStyle.laneSection
    //         .addLane( TvLaneSide.CENTER, 0, TvLaneType.none, true, true )
    //         .addRoadMarkRecord( 0, TvRoadMarkTypes.NONE, TvRoadMarkWeights.STANDARD, TvColors.STANDARD, 0.15, 'none', 0 );

    //     const rightLane1 = roadStyle.laneSection
    //         .addLane( TvLaneSide.RIGHT, -1, TvLaneType.shoulder, true, true )
    //         .addRoadMarkRecord( 0, TvRoadMarkTypes.SOLID, TvRoadMarkWeights.STANDARD, TvColors.YELLOW, 0.15, 'none', 0 );

    //     const rightLane2 = roadStyle.laneSection
    //         .addLane( TvLaneSide.RIGHT, -2, TvLaneType.driving, true, true )
    //         .addRoadMarkRecord( 0, TvRoadMarkTypes.BROKEN, TvRoadMarkWeights.STANDARD, TvColors.STANDARD, 0.15, 'none', 0 );

    //     const rightLane3 = roadStyle.laneSection
    //         .addLane( TvLaneSide.RIGHT, -3, TvLaneType.driving, true, true )
    //         .addRoadMarkRecord( 0, TvRoadMarkTypes.BROKEN, TvRoadMarkWeights.STANDARD, TvColors.STANDARD, 0.15, 'none', 0 );

    //     const rightLane4 = roadStyle.laneSection
    //         .addLane( TvLaneSide.RIGHT, -4, TvLaneType.driving, true, true )
    //         .addRoadMarkRecord( 0, TvRoadMarkTypes.BROKEN, TvRoadMarkWeights.STANDARD, TvColors.STANDARD, 0.15, 'none', 0 );

    //     const rightLane5 = roadStyle.laneSection
    //         .addLane( TvLaneSide.RIGHT, -5, TvLaneType.driving, true, true )
    //         .addRoadMarkRecord( 0, TvRoadMarkTypes.SOLID, TvRoadMarkWeights.STANDARD, TvColors.STANDARD, 0.15, 'none', 0 );

    //     const rightLane6 = roadStyle.laneSection
    //         .addLane( TvLaneSide.RIGHT, -6, TvLaneType.shoulder, true, true );

    //     roadStyle.laneSection.getLaneVector().forEach( lane => {

    //         if ( lane.side !== TvLaneSide.CENTER ) {

    //             if ( lane.type == TvLaneType.driving ) lane.addWidthRecord( 0, 3.6, 0, 0, 0 );

    //             else if ( lane.type == TvLaneType.shoulder ) lane.addWidthRecord( 0, 3.6, 0, 0, 0 );

    //             else lane.addWidthRecord( 0, 0.5, 0, 0, 0 );

    //         }

    //     } );

    //     return roadStyle;
    // }

    // static getFreewayOneWayRoadStyle (): RoadStyle {

    //     const roadStyle = new RoadStyle();

    //     roadStyle.laneSection = new TvLaneSection( 1, 0, true, -1 );

    //     const centerLane = roadStyle.laneSection
    //         .addLane( TvLaneSide.CENTER, 0, TvLaneType.none, true, true )
    //         .addRoadMarkRecord( 0, TvRoadMarkTypes.NONE, TvRoadMarkWeights.STANDARD, TvColors.STANDARD, 0.15, 'none', 0 );

    //     const rightLane1 = roadStyle.laneSection
    //         .addLane( TvLaneSide.RIGHT, -1, TvLaneType.shoulder, true, true )
    //         .addRoadMarkRecord( 0, TvRoadMarkTypes.SOLID, TvRoadMarkWeights.STANDARD, TvColors.YELLOW, 0.15, 'none', 0 );

    //     const rightLane2 = roadStyle.laneSection
    //         .addLane( TvLaneSide.RIGHT, -2, TvLaneType.driving, true, true )
    //         .addRoadMarkRecord( 0, TvRoadMarkTypes.BROKEN, TvRoadMarkWeights.STANDARD, TvColors.STANDARD, 0.15, 'none', 0 );

    //     const rightLane3 = roadStyle.laneSection
    //         .addLane( TvLaneSide.RIGHT, -3, TvLaneType.driving, true, true )
    //         .addRoadMarkRecord( 0, TvRoadMarkTypes.BROKEN, TvRoadMarkWeights.STANDARD, TvColors.STANDARD, 0.15, 'none', 0 );

    //     const rightLane4 = roadStyle.laneSection
    //         .addLane( TvLaneSide.RIGHT, -4, TvLaneType.driving, true, true )
    //         .addRoadMarkRecord( 0, TvRoadMarkTypes.BROKEN, TvRoadMarkWeights.STANDARD, TvColors.STANDARD, 0.15, 'none', 0 );

    //     const rightLane5 = roadStyle.laneSection
    //         .addLane( TvLaneSide.RIGHT, -5, TvLaneType.driving, true, true )
    //         .addRoadMarkRecord( 0, TvRoadMarkTypes.SOLID, TvRoadMarkWeights.STANDARD, TvColors.STANDARD, 0.15, 'none', 0 );

    //     const rightLane6 = roadStyle.laneSection
    //         .addLane( TvLaneSide.RIGHT, -6, TvLaneType.shoulder, true, true );

    //     roadStyle.laneSection.getLaneVector().forEach( lane => {

    //         if ( lane.side !== TvLaneSide.CENTER ) {

    //             if ( lane.type == TvLaneType.driving ) lane.addWidthRecord( 0, 3.6, 0, 0, 0 );

    //             else if ( lane.type == TvLaneType.shoulder ) lane.addWidthRecord( 0, 3.6, 0, 0, 0 );

    //             else lane.addWidthRecord( 0, 0.5, 0, 0, 0 );

    //         }

    //     } );

    //     return roadStyle;
    // }

    // static getOneWayRoadStyle (): RoadStyle {

    //     const roadStyle = new RoadStyle();

    //     roadStyle.laneSection = new TvLaneSection( 1, 0, true, -1 );

    //     const l1 = roadStyle.laneSection
    //         .addLane( TvLaneSide.LEFT, 1, TvLaneType.sidewalk, true, true )
    //         .addWidthRecord( 0, 2.0, 0, 0, 0 );

    //     const centerLane = roadStyle.laneSection
    //         .addLane( TvLaneSide.CENTER, 0, TvLaneType.none, true, true );

    //     const r1 = roadStyle.laneSection
    //         .addLane( TvLaneSide.RIGHT, -1, TvLaneType.driving, true, true )
    //         .addWidthRecord( 0, 3.6, 0, 0, 0 );

    //     const r2 = roadStyle.laneSection
    //         .addLane( TvLaneSide.RIGHT, -2, TvLaneType.sidewalk, true, true )
    //         .addWidthRecord( 0, 2.0, 0, 0, 0 );

    //     return roadStyle;
    // }

}
