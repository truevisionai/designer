/*
 * Copyright Truesense AI Solutions Pvt Ltd, All Rights Reserved.
 */

import { TvMapInstance } from '../services/tv-map-source-file';
import { TvLaneSide, TvLaneType } from './tv-common';
import { TvLane } from './tv-lane';
import { TvLaneSection } from './tv-lane-section';
import { TvMap } from './tv-map.model';

describe( 'OpenDrive LaneSection', () => {

    let laneSection: TvLaneSection;

    let leftOne: TvLane;
    let leftTwo: TvLane;
    let leftThree: TvLane;
    let rightOne: TvLane;
    let rightTwo: TvLane;
    let rightThree: TvLane;
    let rightFour: TvLane;

    beforeEach( () => {

        laneSection = new TvLaneSection( 1, 0, true, 1 );

        laneSection.addLane( TvLaneSide.LEFT, 2, TvLaneType.driving, true, true );
        leftTwo = laneSection.getLastAddedLane();

        laneSection.addLane( TvLaneSide.LEFT, 3, TvLaneType.driving, true, true );
        leftThree = laneSection.getLastAddedLane();

        laneSection.addLane( TvLaneSide.LEFT, 1, TvLaneType.driving, true, true );
        leftOne = laneSection.getLastAddedLane();

        laneSection.addLane( TvLaneSide.CENTER, 0, TvLaneType.driving, true, true );

        laneSection.addLane( TvLaneSide.RIGHT, -1, TvLaneType.driving, true, true );
        rightOne = laneSection.getLastAddedLane();

        laneSection.addLane( TvLaneSide.RIGHT, -3, TvLaneType.driving, true, true );
        rightThree = laneSection.getLastAddedLane();

        laneSection.addLane( TvLaneSide.RIGHT, -2, TvLaneType.driving, true, true );
        rightTwo = laneSection.getLastAddedLane();

        laneSection.addLane( TvLaneSide.RIGHT, -4, TvLaneType.driving, true, true );
        rightFour = laneSection.getLastAddedLane();

        laneSection.getLaneVector().forEach( lane => {

            if ( lane.side !== TvLaneSide.CENTER ) {

                lane.addWidthRecord( 0, 2, 0, 0, 0 );

            }

        } );

    } );

    it( 'should give correct width for first left lanes', () => {

        const start = laneSection.getWidthUptoStart( leftOne, 0 );
        const center = laneSection.getWidthUptoCenter( leftOne, 0 );
        const end = laneSection.getWidthUptoEnd( leftOne, 0 );

        expect( start ).toBe( 0 );
        expect( center ).toBe( 1 );
        expect( end ).toBe( 2 );

    } );

    it( 'should give correct width for second left lanes', () => {

        const start = laneSection.getWidthUptoStart( leftTwo, 0 );
        const center = laneSection.getWidthUptoCenter( leftTwo, 0 );
        const end = laneSection.getWidthUptoEnd( leftTwo, 0 );

        expect( start ).toBe( 2 );
        expect( center ).toBe( 3 );
        expect( end ).toBe( 4 );

    } );

    it( 'should give correct width for first right lanes', () => {

        const start = laneSection.getWidthUptoStart( rightOne, 0 );
        const center = laneSection.getWidthUptoCenter( rightOne, 0 );
        const end = laneSection.getWidthUptoEnd( rightOne, 0 );

        expect( start ).toBe( 0 );
        expect( center ).toBe( 1 );
        expect( end ).toBe( 2 );

    } );

    it( 'should give correct width for second right lanes', () => {

        const start = laneSection.getWidthUptoStart( rightTwo, 0 );
        const center = laneSection.getWidthUptoCenter( rightTwo, 0 );
        const end = laneSection.getWidthUptoEnd( rightTwo, 0 );

        expect( start ).toBe( 2 );
        expect( center ).toBe( 3 );
        expect( end ).toBe( 4 );

    } );

    it( 'should give correct count for total lanes', () => {
        expect( laneSection.getLaneCount() ).toBe( 8 );
    } );

    it( 'should give correct count for left lanes', () => {
        expect( laneSection.getLeftLaneCount() ).toBe( 3 );
    } );

    it( 'should give correct count for right lanes', () => {
        expect( laneSection.getRightLaneCount() ).toBe( 4 );
    } );

    it( 'should give correct length for laneSection', () => {

        TvMapInstance.map = new TvMap();

        const road = TvMapInstance.map.addRoad( '', 100, 1, -1 );

        const section1 = road.addGetLaneSection( 0, false );
        const section2 = road.addGetLaneSection( 40, false );
        const section3 = road.addGetLaneSection( 50, false );

        expect( section1.roadId ).toBe( 1 );
        expect( section2.roadId ).toBe( 1 );
        expect( section3.roadId ).toBe( 1 );

        expect( road.getLaneSectionLength( section1 ) ).toBe( 40 );
        expect( road.getLaneSectionLength( section2 ) ).toBe( 10 );
        expect( road.getLaneSectionLength( section3 ) ).toBe( 50 );

        expect( section1.length ).toBe( 40 );
        expect( section2.length ).toBe( 10 );
        expect( section3.length ).toBe( 50 );

    } );

    it( 'should copy lane correctly', () => {

        // 3 left 1 center 4 right
        expect( laneSection.lanes.size ).toBe( 8 );

        const newLane = leftTwo.clone( 1 );

        laneSection.addLaneInstance( newLane, true );

        expect( laneSection.lanes.size ).toBe( 9 );

        expect( laneSection.lanes.get( 3 ).id ).toBe( 3 );
        expect( laneSection.lanes.get( 4 ).id ).toBe( 4 );

    } );

} );
