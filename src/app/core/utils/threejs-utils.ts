/*
 * Copyright Truesense AI Solutions Pvt Ltd, All Rights Reserved.
 */

import { CoordinateSystem } from 'app/services/CoordinateSystem';
import { CanvasTexture, Object3D, Vector3 } from 'three';

export class ThreeJsUtils {

	static changeCoordinateSystem ( gameObject: Object3D, from: CoordinateSystem, to: CoordinateSystem ): Object3D {

		// FBX: Y-up (depends on the tool that exported it, but most commonly Y-up)
		// Three.js: Y-up
		// OpenDRIVE: Z-up
		// Blender: Z-up
		// glTF: Y-up
		// GLB (Binary glTF): Y-up
		// OBJ: No specific coordinate system is defined, but typically
		// it's Y-up or Z-up. The source tool's coordinate system often
		// determines the exported OBJ file's coordinate system.
		// Unity3D: Y-up
		// Unreal Engine: Z-up

		const fromTo = [ from, to ].join( '_' );

		switch ( fromTo ) {
			case [ CoordinateSystem.THREE_JS, CoordinateSystem.OPEN_DRIVE ].join( '_' ):
				// THREE.js (Y-up) to OpenDRIVE (Z-up)
				gameObject.rotateX( Math.PI / 2 );
				break;
			case [ CoordinateSystem.OPEN_DRIVE, CoordinateSystem.BLENDER ].join( '_' ):
				// OpenDRIVE (Z-up) to Blender (Z-up)
				// No change required
				break;
			case [ CoordinateSystem.UNITY_GLTF, CoordinateSystem.OPEN_DRIVE ].join( '_' ):
				// Set the "up" direction of the object to be along the z-axis
				gameObject.up.set( 0, 0, 1 );
				//Unity/glTF (Y-up) to OpenDRIVE (Z-up)
				gameObject.rotateX( Math.PI / 2 );
				// After changing the coordinate system, make the object face north
				// Assuming the object's "front" is along the positive Z-axis
				const northPoint = new Vector3( gameObject.position.x, gameObject.position.y + 1, gameObject.position.z );
				gameObject.lookAt( northPoint );
				break;
			case [ CoordinateSystem.OPEN_DRIVE, CoordinateSystem.UNITY_GLTF ].join( '_' ):
				// OpenDRIVE (Z-up) to Unity/glTF (Y-up)
				gameObject.rotateX( -Math.PI / 2 );
				break;
			case [ CoordinateSystem.THREE_JS, CoordinateSystem.BLENDER ].join( '_' ):
				// THREE.js (Y-up) to Blender (Z-up)
				gameObject.rotateX( Math.PI / 2 );
				break;
			case [ CoordinateSystem.THREE_JS, CoordinateSystem.UNITY_GLTF ].join( '_' ):
				// THREE.js (Y-up) to Unity/glTF (Y-up)
				// No change required
				break;
			default:
				console.warn( `Unsupported coordinate system conversion: ${ from } to ${ to }` );
		}

		gameObject.updateMatrix();

		return gameObject;
	}

	static createPinkTexture ( width, height ): CanvasTexture {

		// Create a canvas
		const canvas = document.createElement( 'canvas' );
		canvas.width = width;
		canvas.height = height;

		// Get the canvas 2D context
		const context = canvas.getContext( '2d' );

		// Set the fill color to bright pink
		context.fillStyle = '#FF69B4';

		// Fill the canvas with the pink color
		context.fillRect( 0, 0, width, height );

		// Create a texture from the canvas
		const pinkTexture = new CanvasTexture( canvas );

		return pinkTexture;
	}
}
