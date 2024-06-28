/*
 * Copyright Truesense AI Solutions Pvt Ltd, All Rights Reserved.
 */

import { CatmullRomSpline } from "app/core/shapes/catmull-rom-spline";
import { AbstractFactory } from "app/core/interfaces/abstract-factory";
import { Surface } from "app/map/surface/surface.model";
import { Injectable } from "@angular/core";
import { Asset, AssetType } from "app/core/asset/asset.model";
import { AssetDatabase } from "app/core/asset/asset-database";
import { Vector3 } from "three";

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

		surface.spline.controlPoints.push( this.createControlPoint( surface, new Vector3( 0, 0, 0 ) ) );
		surface.spline.controlPoints.push( this.createControlPoint( surface, new Vector3( surfaceWidth, 0, 0 ) ) );
		surface.spline.controlPoints.push( this.createControlPoint( surface, new Vector3( surfaceWidth, surfaceHeight, 0 ) ) );
		surface.spline.controlPoints.push( this.createControlPoint( surface, new Vector3( 0, surfaceHeight, 0 ) ) );

		return surface;

	}

	createFromPosition ( position: Vector3 ): Surface {

		return this.createSurface( 'grass', position );

	}

	createSurface ( materialGuid = 'grass', position?: Vector3, curve?: CatmullRomSpline ) {

		return new Surface( materialGuid, curve || new CatmullRomSpline( true, 'catmullrom', 0 ) );

	}
}
