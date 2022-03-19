/*
 * Copyright Truesense AI Solutions Pvt Ltd, All Rights Reserved.
 */

import { AutoManeuverTool } from './auto-maneuver-tool';
import { TvMap } from 'app/modules/tv-map/models/tv-map.model';
import { TvMapSourceFile } from 'app/modules/tv-map/services/tv-map-source-file';
import { Maths } from 'app/utils/maths';
import { TvDirection } from 'app/modules/tv-map/models/tv-common';


describe( 'AutoManeuverTool Test', () => {

    let tool: AutoManeuverTool;
    let openDrive: TvMap;

    beforeEach( () => {

        tool = new AutoManeuverTool();

        tool.init();

        openDrive = TvMapSourceFile.openDrive = new TvMap();

        AutoManeuverTool.DOTCOUNT = 0;

    } );

    it( 'should find straight road intersection in same direction', () => {

        const roads = createStraightRoadsSameDirection();

        const intersections = tool.findIntersectionsSlow( roads );

        expect( intersections.length ).toBe( 1 );
        expect( intersections[ 0 ].road1 ).toBe( roads[ 0 ].id );
        expect( intersections[ 0 ].road2 ).toBe( roads[ 1 ].id );
        expect( intersections[ 0 ].x ).toBe( 0 );
        expect( intersections[ 0 ].y ).toBe( 0 );
        expect( intersections[ 0 ].s1 ).toBe( 50 );
        expect( intersections[ 0 ].s2 ).toBe( 50 );
    } );

    it( 'should find straight road intersection in opposite direction', () => {

        const roads = createStraightRoadsOppositeDirection();

        const intersections = tool.findIntersectionsSlow( roads );

        expect( intersections.length ).toBe( 1 );
        expect( intersections[ 0 ].road1 ).toBe( roads[ 0 ].id );
        expect( intersections[ 0 ].road2 ).toBe( roads[ 1 ].id );
        expect( intersections[ 0 ].x ).toBe( 0 );
        expect( intersections[ 0 ].y ).toBe( 0 );
        expect( intersections[ 0 ].s1 ).toBe( 50 );
        expect( intersections[ 0 ].s2 ).toBe( 50 );
    } );

    it( 'should find angled road (45 degree) intersection in same direction', () => {

        const road1 = openDrive.addDefaultRoad();
        const road2 = openDrive.addDefaultRoad();

        // left to right with angle
        road1.addGeometryLine( 0, -35.35, -35.35, Maths.Deg2Rad * 45, 100 );

        // down to up
        road2.addGeometryLine( 0, 0, -50, 1.5708, 100 );

        const intersections = tool.findIntersectionsSlow( [ road1, road2 ] );

        expect( intersections.length ).toBe( 1 );
        expect( intersections[ 0 ].road1 ).toBe( road1.id );
        expect( intersections[ 0 ].road2 ).toBe( road2.id );
        expect( Maths.approxEquals( intersections[ 0 ].x, -0.71, 0.01 ) ).toBe( true );
        expect( Maths.approxEquals( intersections[ 0 ].y, -0.71, 0.01 ) ).toBe( true );
        expect( intersections[ 0 ].s1 ).toBe( 49 );
        expect( intersections[ 0 ].s2 ).toBe( 49 );


    } );

    it( 'should find angled road (45 degree) intersection in opposite direction', () => {

        const road1 = openDrive.addDefaultRoad();
        const road2 = openDrive.addDefaultRoad();

        // left to right with angle
        road1.addGeometryLine( 0, -35.35, -35.35, Maths.Deg2Rad * 45, 100 );

        // up to down
        road2.addGeometryLine( 0, 0, 50, -1.5708, 100 );

        const intersections = tool.findIntersectionsSlow( [ road1, road2 ] );

        expect( intersections.length ).toBe( 1 );
        expect( intersections[ 0 ].road1 ).toBe( road1.id );
        expect( intersections[ 0 ].road2 ).toBe( road2.id );
        expect( Maths.approxEquals( intersections[ 0 ].x, 0.71, 0.01 ) ).toBe( true );
        expect( Maths.approxEquals( intersections[ 0 ].y, 0.71, 0.01 ) ).toBe( true );
        expect( intersections[ 0 ].s1 ).toBe( 51 );
        expect( intersections[ 0 ].s2 ).toBe( 49 );


    } );

    it( 'should find correct distance from intersection', () => {

        let distance = tool.calculateDistance( 0, 90 * Maths.Deg2Rad );

        // let isEqual = Maths.approxEquals( distance, 2.35619450625 );

        expect( distance ).toBe( 2.35619450625 );


        distance = tool.calculateDistance( 45 * Maths.Deg2Rad, 90 * Maths.Deg2Rad );

        // isEqual = Maths.approxEquals( distance, 3.53429174325 );

        expect( distance ).toBe( 3.53429174325 );

    } );

    it( 'should calculate hdg difference', () => {

        let hdgA = 0 * Maths.Deg2Rad;
        let hdgB = 90 * Maths.Deg2Rad;

        expect( tool.calculateSDirection( hdgA, hdgB ) ).toBe( TvDirection.SAME );
        expect( tool.calculateSDirection( hdgB, hdgA ) ).toBe( TvDirection.SAME );

        hdgA = -45 * Maths.Deg2Rad;
        hdgB = 45 * Maths.Deg2Rad;

        expect( tool.calculateSDirection( hdgA, hdgB ) ).toBe( TvDirection.SAME );
        expect( tool.calculateSDirection( hdgB, hdgA ) ).toBe( TvDirection.SAME );

        hdgA = -45 * Maths.Deg2Rad;
        hdgB = 0 * Maths.Deg2Rad;

        expect( tool.calculateSDirection( hdgA, hdgB ) ).toBe( TvDirection.SAME );
        expect( tool.calculateSDirection( hdgB, hdgA ) ).toBe( TvDirection.SAME );

        hdgA = 90 * Maths.Deg2Rad;
        hdgB = 0 * Maths.Deg2Rad;

        expect( tool.calculateSDirection( hdgA, hdgB ) ).toBe( TvDirection.SAME );
        expect( tool.calculateSDirection( hdgB, hdgA ) ).toBe( TvDirection.SAME );

        hdgA = 100 * Maths.Deg2Rad;
        hdgB = 0 * Maths.Deg2Rad;

        expect( tool.calculateSDirection( hdgA, hdgB ) ).toBe( TvDirection.OPPOSITE );
        expect( tool.calculateSDirection( hdgB, hdgA ) ).toBe( TvDirection.OPPOSITE );

        hdgA = 135 * Maths.Deg2Rad;
        hdgB = 0 * Maths.Deg2Rad;

        expect( tool.calculateSDirection( hdgA, hdgB ) ).toBe( TvDirection.OPPOSITE );
        expect( tool.calculateSDirection( hdgB, hdgA ) ).toBe( TvDirection.OPPOSITE );

        hdgA = 135 * Maths.Deg2Rad;
        hdgB = 90 * Maths.Deg2Rad;

        expect( tool.calculateSDirection( hdgA, hdgB ) ).toBe( TvDirection.SAME );
        expect( tool.calculateSDirection( hdgB, hdgA ) ).toBe( TvDirection.SAME );

    } );

    it( 'should display links' );

    it( 'should delete link' );

    it( 'should create link' );

    it( 'should show link control points' );

    function createStraightRoadsSameDirection () {

        const road1 = openDrive.addDefaultRoad();
        const road2 = openDrive.addDefaultRoad();

        // left to right
        road1.addGeometryLine( 0, -50, 0, 0, 100 );

        // down to up
        road2.addGeometryLine( 0, 0, -50, 1.5708, 100 );

        return [ road1, road2 ];
    }

    function createStraightRoadsOppositeDirection () {

        const road1 = openDrive.addDefaultRoad();
        const road2 = openDrive.addDefaultRoad();

        // left to right
        road1.addGeometryLine( 0, -50, 0, 0, 100 );

        // up to down
        road2.addGeometryLine( 0, 0, 50, -1.5708, 100 );

        return [ road1, road2 ];
    }

} );

