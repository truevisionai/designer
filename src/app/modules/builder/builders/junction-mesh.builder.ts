/*
 * Copyright Truesense AI Solutions Pvt Ltd, All Rights Reserved.
 */

import { Injectable } from '@angular/core';
import {
	BufferGeometry,
	DoubleSide,
	Material,
	Mesh,
	MeshStandardMaterial,
	Object3D,
	RepeatWrapping,
	Texture,
} from "three";
import { OdTextures } from 'app/deprecated/od.textures';
import { TvJunction } from 'app/map/models/junctions/tv-junction';
import { TvMaterialService } from 'app/assets/material/tv-material.service';
import { MeshBuilder } from 'app/core/builders/mesh.builder';
import { JunctionBoundaryBuilder } from './junction-boundary.builder';

const ASPHALT_GUID = '09B39764-2409-4A58-B9AB-D9C18AD5485C';

@Injectable( {
	providedIn: 'root'
} )
export class JunctionMeshBuilder implements MeshBuilder<TvJunction> {

	constructor (
		private boundaryBuilder: JunctionBoundaryBuilder,
		private materialService: TvMaterialService,
	) {
	}

	build ( junction: TvJunction ): Object3D {

		const geometry = this.getJunctionGeometry( junction );

		return new Mesh( geometry, this.junctionMaterial );

	}

	getJunctionGeometry ( junction: TvJunction ): BufferGeometry {

		return this.boundaryBuilder.getBufferGeometry( junction.outerBoundary, 'delaunay' );

	}

	private getJunctionTexture (): Texture {

		// Clone the texture and set wrapping to repeat
		const map = OdTextures.asphalt().clone();

		map.wrapS = map.wrapT = RepeatWrapping;

		return map;

	}

	private get junctionMaterial (): Material {

		const asphalt = this.materialService.getMaterial( ASPHALT_GUID )

		if ( asphalt ) {
			return asphalt.material;
		}

		const map = this.getJunctionTexture();

		return new MeshStandardMaterial( { map: map, side: DoubleSide } );
	}

}
