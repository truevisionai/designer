
export function removeDuplicates ( vertices: number[], edges: number[] ): { vertices: number[], edges: number[] } {
	const uniqueVertices = [];
	const vertexMap = new Map(); // Original index -> new index

	for ( let i = 0; i < vertices.length; i += 2 ) {
		const vertex = [ vertices[ i ], vertices[ i + 1 ] ];
		const key = vertex.toString();

		if ( !vertexMap.has( key ) ) {
			vertexMap.set( key, uniqueVertices.length / 2 );
			uniqueVertices.push( ...vertex );
		}
	}

	// Remap edges
	const newEdges = edges.map( index => {
		const vertex = [ vertices[ index * 2 ], vertices[ index * 2 + 1 ] ];
		const key = vertex.toString();
		return vertexMap.get( key );
	} );

	return { vertices: uniqueVertices, edges: newEdges };
}

export function weilerAtherton ( vertices: number[], edges: number[], clipPolygon: number[][] ): number[] {
	let outputTriangles = [];

	for ( let i = 0; i < edges.length; i += 3 ) {
		const triangle = [
			[ vertices[ edges[ i ] * 2 ], vertices[ edges[ i ] * 2 + 1 ] ],
			[ vertices[ edges[ i + 1 ] * 2 ], vertices[ edges[ i + 1 ] * 2 + 1 ] ],
			[ vertices[ edges[ i + 2 ] * 2 ], vertices[ edges[ i + 2 ] * 2 + 1 ] ]
		];

		const clippedTriangle = clipTriangle( triangle, clipPolygon );
		if ( clippedTriangle.length >= 3 ) {
			for ( let j = 1; j < clippedTriangle.length - 1; j++ ) {
				outputTriangles.push(
					findVertexIndex( vertices, clippedTriangle[ 0 ] ),
					findVertexIndex( vertices, clippedTriangle[ j ] ),
					findVertexIndex( vertices, clippedTriangle[ j + 1 ] )
				);
			}
		}
	}

	return outputTriangles;

	function findVertexIndex ( vertices, point ) {
		for ( let i = 0; i < vertices.length; i += 2 ) {
			if ( vertices[ i ] === point[ 0 ] && vertices[ i + 1 ] === point[ 1 ] ) {
				return i / 2;
			}
		}
		vertices.push( point[ 0 ], point[ 1 ] );
		return ( vertices.length / 2 ) - 1;
	}

	function clipTriangle ( triangle, clipPolygon ) {
		let outputList = triangle;

		for ( let i = 0; i < clipPolygon.length; i++ ) {
			const cp1 = clipPolygon[ i ];
			const cp2 = clipPolygon[ ( i + 1 ) % clipPolygon.length ];
			let inputList = outputList;
			outputList = [];

			let s = inputList[ inputList.length - 1 ];

			for ( let j = 0; j < inputList.length; j++ ) {
				const e = inputList[ j ];

				if ( inside( e, cp1, cp2 ) ) {
					if ( !inside( s, cp1, cp2 ) ) {
						outputList.push( intersection( cp1, cp2, s, e ) );
					}
					outputList.push( e );
				} else if ( inside( s, cp1, cp2 ) ) {
					outputList.push( intersection( cp1, cp2, s, e ) );
				}
				s = e;
			}
		}

		return outputList;

		function inside ( p, cp1, cp2 ) {
			return ( cp2[ 0 ] - cp1[ 0 ] ) * ( p[ 1 ] - cp1[ 1 ] ) > ( cp2[ 1 ] - cp1[ 1 ] ) * ( p[ 0 ] - cp1[ 0 ] );
		}

		function intersection ( cp1, cp2, s, e ) {
			const dc = [ cp1[ 0 ] - cp2[ 0 ], cp1[ 1 ] - cp2[ 1 ] ];
			const dp = [ s[ 0 ] - e[ 0 ], s[ 1 ] - e[ 1 ] ];

			const n1 = cp1[ 0 ] * cp2[ 1 ] - cp1[ 1 ] * cp2[ 0 ];
			const n2 = s[ 0 ] * e[ 1 ] - s[ 1 ] * e[ 0 ];
			const n3 = 1.0 / ( dc[ 0 ] * dp[ 1 ] - dc[ 1 ] * dp[ 0 ] );

			return [ ( n1 * dp[ 0 ] - n2 * dc[ 0 ] ) * n3, ( n1 * dp[ 1 ] - n2 * dc[ 1 ] ) * n3 ];
		}
	}
}

export function sutherlandHodgman ( vertices: number[], edges: number[], clipPolygon: number[][] ): number[] {
	let outputList = edges;

	for ( let j = 0; j < clipPolygon.length; j++ ) {
		const inputList = outputList;
		outputList = [];

		const cp1 = clipPolygon[ j ];
		const cp2 = clipPolygon[ ( j + 1 ) % clipPolygon.length ];

		for ( let i = 0; i < inputList.length; i += 3 ) {
			const s = inputList[ i ];
			const e = inputList[ i + 1 ];
			const f = inputList[ i + 2 ];

			const p1 = [ vertices[ s * 2 ], vertices[ s * 2 + 1 ] ];
			const p2 = [ vertices[ e * 2 ], vertices[ e * 2 + 1 ] ];
			const p3 = [ vertices[ f * 2 ], vertices[ f * 2 + 1 ] ];

			const points = [ p1, p2, p3 ];
			const newPoints = [];

			for ( let k = 0; k < points.length; k++ ) {
				const a = points[ k ];
				const b = points[ ( k + 1 ) % points.length ];

				if ( inside( a, cp1, cp2 ) ) {
					if ( !inside( b, cp1, cp2 ) ) {
						newPoints.push( intersection( cp1, cp2, a, b ) );
					}
					newPoints.push( b );
				} else if ( inside( b, cp1, cp2 ) ) {
					newPoints.push( intersection( cp1, cp2, a, b ) );
				}
			}

			if ( newPoints.length >= 3 ) {
				const baseIndex = vertices.length / 2;
				newPoints.forEach( np => {
					if ( !vertices.includes( np[ 0 ] ) || !vertices.includes( np[ 1 ] ) ) {
						vertices.push( np[ 0 ], np[ 1 ] );
					}
				} );
				for ( let np = 1; np < newPoints.length - 1; np++ ) {
					outputList.push(
						baseIndex,
						baseIndex + np,
						baseIndex + np + 1
					);
				}
			}
		}
	}

	return outputList;

	function inside ( p, cp1, cp2 ) {
		return ( cp2[ 0 ] - cp1[ 0 ] ) * ( p[ 1 ] - cp1[ 1 ] ) > ( cp2[ 1 ] - cp1[ 1 ] ) * ( p[ 0 ] - cp1[ 0 ] );
	}

	function intersection ( cp1, cp2, s, e ): number[] {
		const dc = [ cp1[ 0 ] - cp2[ 0 ], cp1[ 1 ] - cp2[ 1 ] ];
		const dp = [ s[ 0 ] - e[ 0 ], s[ 1 ] - e[ 1 ] ];

		const n1 = cp1[ 0 ] * cp2[ 1 ] - cp1[ 1 ] * cp2[ 0 ];
		const n2 = s[ 0 ] * e[ 1 ] - s[ 1 ] * e[ 0 ];
		const n3 = 1.0 / ( dc[ 0 ] * dp[ 1 ] - dc[ 1 ] * dp[ 0 ] );

		return [ ( n1 * dp[ 0 ] - n2 * dc[ 0 ] ) * n3, ( n1 * dp[ 1 ] - n2 * dc[ 1 ] ) * n3 ];
	}
}

export function simpleClip ( vertices: number[], triangles: number[], clipPolygon: number[][] ): number[] {
	const outputTriangles = [];

	for ( let i = 0; i < triangles.length; i += 3 ) {
		const s = triangles[ i ];
		const e = triangles[ i + 1 ];
		const f = triangles[ i + 2 ];

		const p1 = [ vertices[ s * 2 ], vertices[ s * 2 + 1 ] ];
		const p2 = [ vertices[ e * 2 ], vertices[ e * 2 + 1 ] ];
		const p3 = [ vertices[ f * 2 ], vertices[ f * 2 + 1 ] ];

		if ( inside( p1, clipPolygon ) && inside( p2, clipPolygon ) && inside( p3, clipPolygon ) ) {
			outputTriangles.push( s, e, f );
		}
	}

	return outputTriangles;

	function inside ( point: number[], polygon: number[][] ): boolean {
		let x = point[ 0 ], y = point[ 1 ];
		let inside = false;
		for ( let i = 0, j = polygon.length - 1; i < polygon.length; j = i++ ) {
			let xi = polygon[ i ][ 0 ], yi = polygon[ i ][ 1 ];
			let xj = polygon[ j ][ 0 ], yj = polygon[ j ][ 1 ];

			let intersect = ( ( yi > y ) !== ( yj > y ) ) && ( x < ( xj - xi ) * ( y - yi ) / ( yj - yi ) + xi );
			if ( intersect ) inside = !inside;
		}
		return inside;
	}
}

export function midpointClip ( vertices: number[], triangles: number[], clipPolygon: number[][] ): number[] {
	const outputTriangles = [];

	for ( let i = 0; i < triangles.length; i += 3 ) {
		const s = triangles[ i ];
		const e = triangles[ i + 1 ];
		const f = triangles[ i + 2 ];

		const p1 = [ vertices[ s * 2 ], vertices[ s * 2 + 1 ] ];
		const p2 = [ vertices[ e * 2 ], vertices[ e * 2 + 1 ] ];
		const p3 = [ vertices[ f * 2 ], vertices[ f * 2 + 1 ] ];

		// Calculate the midpoint of the triangle
		const midpoint = [
			( p1[ 0 ] + p2[ 0 ] + p3[ 0 ] ) / 3,
			( p1[ 1 ] + p2[ 1 ] + p3[ 1 ] ) / 3
		];

		if ( inside( midpoint, clipPolygon ) ) {
			outputTriangles.push( s, e, f );
		}
	}

	return outputTriangles;

	function inside ( point: number[], polygon: number[][] ): boolean {
		let x = point[ 0 ], y = point[ 1 ];
		let inside = false;
		for ( let i = 0, j = polygon.length - 1; i < polygon.length; j = i++ ) {
			let xi = polygon[ i ][ 0 ], yi = polygon[ i ][ 1 ];
			let xj = polygon[ j ][ 0 ], yj = polygon[ j ][ 1 ];

			let intersect = ( ( yi > y ) !== ( yj > y ) ) && ( x < ( xj - xi ) * ( y - yi ) / ( yj - yi ) + xi );
			if ( intersect ) inside = !inside;
		}
		return inside;
	}
}

export function enhancedClip ( vertices: number[], triangles: number[], clipPolygon: number[][] ): number[] {
	const outputTriangles = [];

	for ( let i = 0; i < triangles.length; i += 3 ) {
		const s = triangles[ i ];
		const e = triangles[ i + 1 ];
		const f = triangles[ i + 2 ];

		const p1 = [ vertices[ s * 2 ], vertices[ s * 2 + 1 ] ];
		const p2 = [ vertices[ e * 2 ], vertices[ e * 2 + 1 ] ];
		const p3 = [ vertices[ f * 2 ], vertices[ f * 2 + 1 ] ];

		const inside1 = inside( p1, clipPolygon );
		const inside2 = inside( p2, clipPolygon );
		const inside3 = inside( p3, clipPolygon );

		if ( inside1 && inside2 && inside3 ) {
			outputTriangles.push( s, e, f );
		} else if ( inside1 || inside2 || inside3 ) {
			const clippedTriangle = clipTriangle( [ p1, p2, p3 ], clipPolygon );
			if ( clippedTriangle.length >= 3 ) {
				const baseIndex = vertices.length / 2;
				clippedTriangle.forEach( pt => {
					vertices.push( pt[ 0 ], pt[ 1 ] );
				} );
				for ( let j = 1; j < clippedTriangle.length - 1; j++ ) {
					outputTriangles.push(
						baseIndex,
						baseIndex + j,
						baseIndex + j + 1
					);
				}
			}
		}
	}

	return outputTriangles;

	function inside ( point: number[], polygon: number[][] ): boolean {
		let x = point[ 0 ], y = point[ 1 ];
		let inside = false;
		for ( let i = 0, j = polygon.length - 1; i < polygon.length; j = i++ ) {
			let xi = polygon[ i ][ 0 ], yi = polygon[ i ][ 1 ];
			let xj = polygon[ j ][ 0 ], yj = polygon[ j ][ 1 ];

			let intersect = ( ( yi > y ) !== ( yj > y ) ) && ( x < ( xj - xi ) * ( y - yi ) / ( yj - yi ) + xi );
			if ( intersect ) inside = !inside;
		}
		return inside;
	}

	function clipTriangle ( triangle, clipPolygon ) {
		let outputList = triangle;

		for ( let i = 0; i < clipPolygon.length; i++ ) {
			const cp1 = clipPolygon[ i ];
			const cp2 = clipPolygon[ ( i + 1 ) % clipPolygon.length ];
			let inputList = outputList;
			outputList = [];

			let s = inputList[ inputList.length - 1 ];

			for ( let j = 0; j < inputList.length; j++ ) {
				const e = inputList[ j ];

				if ( inside( e, clipPolygon ) ) {
					if ( !inside( s, clipPolygon ) ) {
						outputList.push( intersection( cp1, cp2, s, e ) );
					}
					outputList.push( e );
				} else if ( inside( s, clipPolygon ) ) {
					outputList.push( intersection( cp1, cp2, s, e ) );
				}
				s = e;
			}
		}

		return outputList;

		function intersection ( cp1, cp2, s, e ) {
			const dc = [ cp1[ 0 ] - cp2[ 0 ], cp1[ 1 ] - cp2[ 1 ] ];
			const dp = [ s[ 0 ] - e[ 0 ], s[ 1 ] - e[ 1 ] ];

			const n1 = cp1[ 0 ] * cp2[ 1 ] - cp1[ 1 ] * cp2[ 0 ];
			const n2 = s[ 0 ] * e[ 1 ] - s[ 1 ] * e[ 0 ];
			const n3 = 1.0 / ( dc[ 0 ] * dp[ 1 ] - dc[ 1 ] * dp[ 0 ] );

			return [ ( n1 * dp[ 0 ] - n2 * dc[ 0 ] ) * n3, ( n1 * dp[ 1 ] - n2 * dc[ 1 ] ) * n3 ];
		}
	}
}

export function debugSutherlandHodgman ( vertices: number[], edges: number[], clipPolygon: number[][] ): number[] {
	let outputList = edges;  // Initialize outputList with the original edges

	// Iterate over each edge of the clip polygon
	for ( let j = 0; j < clipPolygon.length; j++ ) {
		const inputList = outputList;  // Set inputList as the current outputList
		outputList = [];  // Reset outputList for this iteration

		const cp1 = clipPolygon[ j ];  // Start point of the clip edge
		const cp2 = clipPolygon[ ( j + 1 ) % clipPolygon.length ];  // End point of the clip edge

		// Iterate over each triangle (3 vertices at a time)
		for ( let i = 0; i < inputList.length; i += 3 ) {
			const s = inputList[ i ];
			const e = inputList[ i + 1 ];
			const f = inputList[ i + 2 ];

			const p1 = [ vertices[ s * 2 ], vertices[ s * 2 + 1 ] ];
			const p2 = [ vertices[ e * 2 ], vertices[ e * 2 + 1 ] ];
			const p3 = [ vertices[ f * 2 ], vertices[ f * 2 + 1 ] ];

			const points = [ p1, p2, p3 ];
			const newPoints = [];

			// Clip each edge of the triangle against the clip edge
			for ( let k = 0; k < points.length; k++ ) {
				const a = points[ k ];
				const b = points[ ( k + 1 ) % points.length ];

				if ( inside( a, cp1, cp2 ) ) {
					if ( !inside( b, cp1, cp2 ) ) {
						newPoints.push( intersection( cp1, cp2, a, b ) );
					}
					newPoints.push( b );
				} else if ( inside( b, cp1, cp2 ) ) {
					newPoints.push( intersection( cp1, cp2, a, b ) );
				}
			}

			// If we have a valid clipped polygon, add it to the output list
			if ( newPoints.length >= 3 ) {
				const baseIndex = vertices.length / 2;
				newPoints.forEach( np => {
					if ( !vertices.includes( np[ 0 ] ) || !vertices.includes( np[ 1 ] ) ) {
						vertices.push( np[ 0 ], np[ 1 ] );
					}
				} );
				for ( let np = 1; np < newPoints.length - 1; np++ ) {
					outputList.push(
						baseIndex,
						baseIndex + np,
						baseIndex + np + 1
					);
				}
			}
		}
	}

	return outputList;

	function inside ( p, cp1, cp2 ) {
		return ( cp2[ 0 ] - cp1[ 0 ] ) * ( p[ 1 ] - cp1[ 1 ] ) > ( cp2[ 1 ] - cp1[ 1 ] ) * ( p[ 0 ] - cp1[ 0 ] );
	}

	function intersection ( cp1, cp2, s, e ): number[] {
		const dc = [ cp1[ 0 ] - cp2[ 0 ], cp1[ 1 ] - cp2[ 1 ] ];
		const dp = [ s[ 0 ] - e[ 0 ], s[ 1 ] - e[ 1 ] ];

		const n1 = cp1[ 0 ] * cp2[ 1 ] - cp1[ 1 ] * cp2[ 0 ];
		const n2 = s[ 0 ] * e[ 1 ] - s[ 1 ] * e[ 0 ];
		const n3 = 1.0 / ( dc[ 0 ] * dp[ 1 ] - dc[ 1 ] * dp[ 0 ] );

		return [ ( n1 * dp[ 0 ] - n2 * dc[ 0 ] ) * n3, ( n1 * dp[ 1 ] - n2 * dc[ 1 ] ) * n3 ];
	}
}

export function fixWindingOrder ( vertices, triangles ) {
	const fixedTriangles = [];
	for ( let i = 0; i < triangles.length; i += 3 ) {
		const s = triangles[ i ];
		const e = triangles[ i + 1 ];
		const f = triangles[ i + 2 ];

		const p1 = [ vertices[ s * 2 ], vertices[ s * 2 + 1 ] ];
		const p2 = [ vertices[ e * 2 ], vertices[ e * 2 + 1 ] ];
		const p3 = [ vertices[ f * 2 ], vertices[ f * 2 + 1 ] ];

		// Calculate the signed area of the triangle to determine winding order
		const area = ( p2[ 0 ] - p1[ 0 ] ) * ( p3[ 1 ] - p1[ 1 ] ) - ( p2[ 1 ] - p1[ 1 ] ) * ( p3[ 0 ] - p1[ 0 ] );

		if ( area < 0 ) {
			// If the area is negative, the vertices are in clockwise order; reverse them
			fixedTriangles.push( s, f, e );
		} else {
			// Otherwise, keep the original order
			fixedTriangles.push( s, e, f );
		}
	}
	return fixedTriangles;
}
