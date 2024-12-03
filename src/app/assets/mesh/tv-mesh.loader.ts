/*
 * Copyright Truesense AI Solutions Pvt Ltd, All Rights Reserved.
 */

import { Injectable } from "@angular/core";
import { BufferGeometry, ObjectLoader } from "three";
import { TvMesh } from "./tv-mesh";
import { AssetDatabase } from "../../assets/asset-database";
import { TvStandardMaterial } from "../material/tv-standard-material";

@Injectable( {
	providedIn: 'root'
} )
export class TvMeshLoader {

	private loader = new ObjectLoader();

	constructor () {
	}

	parse ( json: any ): TvMesh {

		const object3d = this.loader.parse( json );

		const tvMesh = new TvMesh( json.uuid, json.name );

		tvMesh.copy( object3d as any, false );

		if ( json.materialGuid != undefined ) {
			this.parseMaterial( tvMesh, json.materialGuid );
		}

		if ( json.geometryGuid != undefined ) {
			this.parseGeometry( tvMesh, json.geometryGuid );
		}

		json.children?.forEach( ( child: any ) => tvMesh.add( this.parse( child ) ) );

		return tvMesh;

	}

	private parseMaterial ( mesh: TvMesh, materialGuid: string | string[] ): void {

		mesh.materialGuid = materialGuid;

		if ( materialGuid instanceof Array ) {

			mesh.material = materialGuid
				.map( guid => AssetDatabase.getMaterial( guid )?.material )
				.filter( material => material != undefined );

		} else {

			const material = AssetDatabase.getMaterial( materialGuid )?.material;

			if ( material ) {

				mesh.material = material;

			} else {

				console.error( 'Material not found', materialGuid, mesh.name );

			}

		}

	}

	private parseGeometry ( mesh: TvMesh, geometryGuid: string ): void {

		if ( geometryGuid == undefined ) return;

		mesh.geometry = AssetDatabase.getInstance<BufferGeometry>( geometryGuid );

	}

}