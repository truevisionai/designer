import { Injectable } from '@angular/core';
import { BufferAttribute, BufferGeometry, DoubleSide, FrontSide, Mesh, MeshPhongMaterial, MeshStandardMaterial, RepeatWrapping, Shape, ShapeGeometry, Texture, Vector2, Vector3 } from 'three';
import earcut from 'earcut';
import { TvRoad } from 'app/modules/tv-map/models/tv-road.model';
import { TvRoadCoord } from 'app/modules/tv-map/models/tv-lane-coord';
import { TvPosTheta } from 'app/modules/tv-map/models/tv-pos-theta';
import { OdTextures } from 'app/modules/tv-map/builders/od.textures';
import { TvJunction } from 'app/modules/tv-map/models/tv-junction';

@Injectable( {
	providedIn: 'root'
} )
export class JunctionMeshService {

	constructor () { }

	createJunctionFromRoadCoords ( coords: TvRoadCoord[] ) {

		const points = [];

		coords.forEach( roadCoord => {

			const s = roadCoord.s;

			const rightT = roadCoord.road.getRightsideWidth( s );
			const leftT = roadCoord.road.getLeftSideWidth( s );

			const leftPosition = roadCoord.road.getPositionAt( s ).addLateralOffset( leftT );
			const rightPosition = roadCoord.road.getPositionAt( s ).addLateralOffset( -rightT );

			points.push( leftPosition );
			points.push( rightPosition );

		} );

		return this.createPolygonalMesh( points );

	}

	createMeshFromJunction ( junction: TvJunction ) {

		const connectingRoads = junction.getConnections().map( connection => connection.connectingRoad );
		const incomingRoads = junction.getConnections().map( connection => connection.incomingRoad );

		const uniqueIncomingRoads = incomingRoads
			.filter( ( road, index, array ) => array.indexOf( road ) === index );

		const coords: TvRoadCoord[] = [];

		uniqueIncomingRoads.forEach( road => {

			if ( road?.successor?.elementType == 'junction' ) {

				coords.push( road.getEndCoord().toRoadCoord( road.id ) );

			} else if ( road?.predecessor?.elementType == 'junction' ) {

				coords.push( road.getStartCoord().toRoadCoord( road.id ) );

			}

		} );

		return this.createJunctionFromRoadCoords( coords );

	}

	createMeshFromRoads ( roads: TvRoad[] ): Mesh {

		const coords: TvPosTheta[] = [];

		roads.forEach( road => {

			if ( road?.successor?.elementType == 'junction' ) {

				coords.push( road.getEndCoord() );

			} else if ( road?.predecessor?.elementType == 'junction' ) {

				coords.push( road.getStartCoord() );

			}

		} );

		return this.createMeshFromPosTheta( coords );
	}

	createMeshFromPosTheta ( coords: TvPosTheta[] ): Mesh {

		const positions: Vector3[] = coords.map( coord => coord.toVector3() );

		return this.createLinedShapeMesh( positions );

	}

	createMeshFromRoadCoord ( coords: TvRoadCoord[] ): Mesh {

		const positions: Vector3[] = coords.map( coord => coord.position );

		return this.createSmoothShapeMesh( positions );

	}

	// /**
	//  *
	//  * @param positions
	//  * @returns
	//  * @deprecated does not work
	//  */
	// createPolygonalMesh ( positions: Vector3[] ): Mesh {
	// 	const geometry = new BufferGeometry();

	// 	// Flatten the Vector3 array to a vertices array for earcut
	// 	const vertices = positions.flatMap( p => [ p.x, p.y, p.z ] );

	// 	// Compute the bounds of the positions
	// 	let minX = Infinity, maxX = -Infinity;
	// 	let minY = Infinity, maxY = -Infinity;

	// 	positions.forEach( p => {
	// 		if ( p.x < minX ) minX = p.x;
	// 		if ( p.x > maxX ) maxX = p.x;
	// 		if ( p.y < minY ) minY = p.y;
	// 		if ( p.y > maxY ) maxY = p.y;
	// 	} );

	// 	// const rangeX = maxX - minX;
	// 	// const rangeY = maxY - minY;

	// 	// Use Earcut to get the indices array for 2D vertices
	// 	const vertices2D = positions.flatMap( p => [ p.x, p.y ] );
	// 	const indices = earcut( vertices2D );

	// 	// Create BufferAttribute for positions and set it in the geometry
	// 	const positionAttribute = new BufferAttribute( new Float32Array( vertices ), 3 );
	// 	geometry.setAttribute( 'position', positionAttribute );
	// 	geometry.setIndex( indices );

	// 	// Compute normals for the vertices
	// 	geometry.computeVertexNormals();

	// 	// // Create normalized UV mapping for the mesh
	// 	// const uvs = new Float32Array( positions.length * 2 );
	// 	// for ( let i = 0; i < positions.length; i++ ) {
	// 	// 	// Normalize the x and y coordinates to [0, 1] for UV mapping
	// 	// 	uvs[ i * 2 ] = ( positions[ i ].x - minX ) / rangeX;
	// 	// 	uvs[ i * 2 + 1 ] = ( positions[ i ].y - minY ) / rangeY;
	// 	// }
	// 	// geometry.setAttribute( 'uv', new BufferAttribute( uvs, 2 ) );

	// 	const map = OdTextures.uv_grid().clone();

	// 	map.wrapS = map.wrapT = RepeatWrapping;

	// 	// Create a mesh with a basic material
	// 	const material = new MeshStandardMaterial( { map: map, side: FrontSide } );

	// 	const mesh = new Mesh( geometry, material );

	// 	return mesh;
	// }

	createPolygonalMesh ( positions: Vector3[] ): Mesh {

		function sortByAngle ( points, center ) {
			const angles = points.map( point => Math.atan2( point.y - center.y, point.x - center.x ) );
			return points.map( ( point, index ) => ( { point, index } ) ).sort( ( a, b ) => angles[ a.index ] - angles[ b.index ] ).map( sortedObj => sortedObj.point );
		}

		// Calculate the centroid of the points
		let center = new Vector3();
		positions.forEach( p => { center.add( p ); } );
		center.divideScalar( positions.length );

		// Sort the points by angle from the center
		let sortedPositions = sortByAngle( positions, center );

		const geometry = new BufferGeometry();

		// Flatten the Vector3 array to a vertices array for earcut
		const vertices = sortedPositions.flatMap( p => [ p.x, p.y, p.z ] );

		// Use Earcut to get the indices array for 2D vertices
		const vertices2D = sortedPositions.flatMap( p => [ p.x, p.y ] );
		const indices = earcut( vertices2D );

		// Create BufferAttribute for positions and set it in the geometry
		const positionAttribute = new BufferAttribute( new Float32Array( vertices ), 3 );
		geometry.setAttribute( 'position', positionAttribute );
		geometry.setIndex( indices );

		// Compute normals for the vertices
		geometry.computeVertexNormals();

		// Create UV mapping for the mesh
		// Here we map each 1x1 Three.js unit to a 1x1 area in the texture.
		const uvs = new Float32Array( sortedPositions.length * 2 );
		for ( let i = 0; i < sortedPositions.length; i++ ) {
			// Use the x and y sortedPositions directly as UV coordinates
			uvs[ i * 2 ] = sortedPositions[ i ].x;
			uvs[ i * 2 + 1 ] = sortedPositions[ i ].y;
		}
		geometry.setAttribute( 'uv', new BufferAttribute( uvs, 2 ) );

		const mesh = new Mesh( geometry, this.junctionMaterial );

		return mesh;
	}

	createSmoothShapeMesh ( positions: Vector3[] ): Mesh {

		const positions2D = positions.map( p => new Vector2( p.x, p.y ) );

		const shape = new Shape();

		const first = positions2D.shift();

		shape.moveTo( first.x, first.y );

		shape.splineThru( positions2D );

		const geometry = new ShapeGeometry( shape );

		const mesh = new Mesh( geometry, this.junctionMaterial );

		return mesh;

	}

	createLinedShapeMesh ( positions: Vector3[] ): Mesh {

		const shape = new Shape();

		// Use the first vertex to move to the start position
		shape.moveTo( positions[ 0 ].x, positions[ 0 ].y );

		// Create the shape using lines instead of a spline
		positions.slice( 1 ).forEach( p => {
			shape.lineTo( p.x, p.y );
		} );

		// Close the shape if it's not already closed
		shape.lineTo( positions[ 0 ].x, positions[ 0 ].y );

		// Generate geometry from the shape
		const geometry = new ShapeGeometry( shape );

		// Create a mesh from the geometry and material
		const mesh = new Mesh( geometry, this.junctionMaterial );

		return mesh;
	}

	private getJunctionTexture (): Texture {

		// Clone the texture and set wrapping to repeat
		const map = OdTextures.asphalt().clone();

		map.wrapS = map.wrapT = RepeatWrapping;

		return map;

	}

	private get junctionMaterial () {

		const map = this.getJunctionTexture();

		return new MeshStandardMaterial( { map: map, side: FrontSide } );
	}
}
