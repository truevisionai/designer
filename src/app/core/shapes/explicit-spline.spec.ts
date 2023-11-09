// /*
//  * Copyright Truesense AI Solutions Pvt Ltd, All Rights Reserved.
//  */

// import { TvGeometryType } from 'app/modules/tv-map/models/tv-common';
// import { TvRoad } from 'app/modules/tv-map/models/tv-road.model';
// import { TvMapInstance } from 'app/modules/tv-map/services/tv-map-instance';
// import { Maths } from 'app/utils/maths';
// import { Shape } from 'three';
// import { ExplicitSplinePath } from './cubic-spline-curve';
// import { ExplicitSpline } from './explicit-spline';


// describe( 'ExplicitSpline Test', () => {

// 	let road: TvRoad;
// 	let spline: ExplicitSpline;

// 	beforeEach( () => {

// 		road = TvMapInstance.map.addDefaultRoad();

// 		spline = road.spline = new ExplicitSpline();

// 	} );

// 	it( 'should work as curve path', () => {

// 		road.addGeometryLine( 0, 0, 0, 0, 100 );

// 		const shape = new Shape();
// 		shape.moveTo( 0, -0.25 );
// 		shape.lineTo( 0, 0.25 );

// 		spline.addFromFile( 0, road.getStartCoord().toVector3(), 0, TvGeometryType.LINE );
// 		spline.addFromFile( 1, road.getEndCoord().toVector3(), 0, TvGeometryType.LINE );

// 		const path = new ExplicitSplinePath( spline );
// 		// const path = new CatmullRomPath( [ road.startPosition().toVector3(), road.endPosition().toVector3() ] );

// 		expect( Maths.approxEquals( path.getLength(), 100, 0.01 ) ).toBe( true );

// 		// const extrudeSettings = {
// 		//     steps: path.getLength() * 2,
// 		//     bevelEnabled: false,
// 		//     extrudePath: path
// 		// };

// 		// const geometry = new ExtrudeGeometry( shape, extrudeSettings );

// 	} );


// } );
