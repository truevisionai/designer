/*
 * Copyright Truesense AI Solutions Pvt Ltd, All Rights Reserved.
 */

import { CoordinateSystem } from "app/services/exporter.service";
import { Object3D } from "three";

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
				//Unity/glTF (Y-up) to OpenDRIVE (Z-up)
				gameObject.rotateX( Math.PI / 2 );
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

}
