/*
 * Copyright Truesense AI Solutions Pvt Ltd, All Rights Reserved.
 */

import { CatmullRomSpline } from "app/core/shapes/catmull-rom-spline";
import { AbstractFactory } from "app/core/interfaces/abstract-factory";
import { Surface } from "app/map/surface/surface.model";
import { Injectable } from "@angular/core";
import { Asset, AssetType } from "app/assets/asset.model";
import { AssetDatabase } from "app/assets/asset-database";
import { Vector3 } from "app/core/maths"
import { SimpleControlPoint } from "app/objects/simple-control-point";
import { AbstractControlPoint } from "app/objects/abstract-control-point";

@Injectable( {
	providedIn: 'root'
} )
export class SurfaceFactory extends AbstractFactory<Surface> {

	createFromAsset ( asset: Asset, position: Vector3 ): Surface {

		if ( asset.type != AssetType.TEXTURE ) return;

		const texture = AssetDatabase.getTexture( asset.guid )?.texture;

		const surfaceWidth = texture.image.width;

		const surfaceHeight = texture.image.height;

		const surface = this.createSurface( null, position );

		surface.textureGuid = asset.guid;

		surface.repeat.set( 1 / surfaceWidth, 1 / surfaceHeight );

		surface.addControlPoint( this.createControlPoint( surface, new Vector3( 0, 0, 0 ) ) );
		surface.addControlPoint( this.createControlPoint( surface, new Vector3( surfaceWidth, 0, 0 ) ) );
		surface.addControlPoint( this.createControlPoint( surface, new Vector3( surfaceWidth, surfaceHeight, 0 ) ) );
		surface.addControlPoint( this.createControlPoint( surface, new Vector3( 0, surfaceHeight, 0 ) ) );

		return surface;

	}

	createFromPosition ( position: Vector3 ): Surface {

		return this.createSurface( 'grass', position );

	}

	createSurface ( materialGuid: string = 'grass', position?: Vector3, curve?: CatmullRomSpline ): any {

		return new Surface( materialGuid, curve || new CatmullRomSpline( true, 'catmullrom', 0 ) );

	}

	static createSurfacePoint ( position: Vector3, surface: Surface ): AbstractControlPoint {

		const point = new SimpleControlPoint<Surface>( surface );

		point.position.copy( position );

		return point;
	}

}
