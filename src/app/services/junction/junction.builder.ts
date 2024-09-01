/*
 * Copyright Truesense AI Solutions Pvt Ltd, All Rights Reserved.
 */

import { Injectable } from '@angular/core';
import {
	Box2,
	BoxGeometry,
	BufferGeometry,
	DoubleSide,
	FrontSide,
	Material,
	Mesh,
	MeshStandardMaterial,
	RepeatWrapping,
	Texture,
	Vector2
} from 'three';
import { OdTextures } from 'app/deprecated/od.textures';
import { TvJunction } from 'app/map/models/junctions/tv-junction';
import { TvJunctionBoundaryBuilder } from 'app/map/junction-boundary/tv-junction-boundary.builder';
import { TvMaterialService } from 'app/graphics/material/tv-material.service';
import { Log } from 'app/core/utils/log';
import { JunctionRoadService } from './junction-road.service';
import { RoadMeshService } from '../road/road-mesh.service';
import { GeometryUtils } from '../surface/geometry-utils';

const ASPHALT_GUID = '09B39764-2409-4A58-B9AB-D9C18AD5485C';

@Injectable( {
	providedIn: 'root'
} )
export class JunctionBuilder {

	constructor (
		private roadMeshService: RoadMeshService,
		private junctionRoadService: JunctionRoadService,
		private boundaryBuilder: TvJunctionBoundaryBuilder,
		private materialService: TvMaterialService,
	) {
	}

	buildBoundingBox ( junction: TvJunction ): Box2 {

		const points = this.boundaryBuilder.convertBoundaryToPositions( junction.outerBoundary );

		if ( points.length < 2 ) {
			Log.error( 'JunctionBuilder.buildBoundingBox: Invalid boundary points', junction.toString() );
			return new Box2();
		}

		const box = new Box2();

		box.setFromPoints( points.map( p => new Vector2( p.x, p.y ) ) );

		return box;

	}

	buildJunction ( junction: TvJunction ): Mesh {

		const geometry = this.getJunctionGeometry( junction );

		return new Mesh( geometry, this.junctionMaterial );

	}

	getJunctionGeometry ( junction: TvJunction ): BufferGeometry {

		// return this.getJunctionGeometryFromRoads( junction );

		return this.boundaryBuilder.getBufferGeometry( junction.innerBoundary, 'delaunay' );

	}

	private getJunctionGeometryFromRoads ( junction: TvJunction ) {

		const connectingRoads = this.junctionRoadService.getConnectingRoads( junction );

		const geometries = this.roadMeshService.getRoadGeometries( connectingRoads );

		const geometry = GeometryUtils.mergeGeometries( geometries );

		return GeometryUtils.mergeVertices( geometry );

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
