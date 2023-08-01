import { BoxGeometry, BufferGeometry, Layers, LoadingManager, Material, MaterialLoader, MathUtils, Matrix4, Mesh, MeshStandardMaterial, Object3D, ObjectLoader, Texture, Vector3 } from "three";
import { TvMaterial } from "./tv-material.model";
import { MeshGeometryData } from "app/modules/tv-map/models/mesh-geometry.data";
import { AppService } from "app/core/services/app.service";
import { AssetDatabase } from "app/services/asset-database";

export class TvPrefab extends Object3D {

	constructor ( public guid: string = MathUtils.generateUUID(), public name: string = 'Prefab' ) {
		super();
		this.name = name;
	}

	static parseString ( value: string ) {

		return this.parseJSON( JSON.parse( value ).object );

	}

	static parseJSON ( json: any ): TvPrefab {

		const prefab = new TvPrefab( json?.guid, json?.name );

		json.children?.forEach( ( child: any ) => {
			prefab.add( this.parseObject( child ) )
		} );

		return prefab;
	}

	static parseObject ( json: any ): TvPrefab {

		if ( json.type === 'Mesh' )
			return TvMesh.parseObject( json );

		if ( json.type === 'Group' )
			return this.parseJSON( json );

		if ( json.type === 'Object3D' )
			return this.parseJSON( json );

		return new TvPrefab( json?.guid, json?.name );
	}

	toJSON ( meta?: any ): any {

		const output = super.toJSON( meta );

		if ( this.guid ) {
			output.object.guid = this.guid;
		}

		return {
			metadata: output.metadata,
			object: output.object
		}
	}
}

export class TvMesh extends Mesh {

	public materialGuid: string | string[];
	public geometryGuid: string;

	constructor ( public guid: string, public name: string, geometry?: any, material?: any ) {
		super( geometry, material );
	}

	static new ( name = 'Prefab' ) {

		return new TvMesh( MathUtils.generateUUID(), name );

	}

	static fromObject3D ( object: Object3D ) {

		const prefab = new TvMesh( MathUtils.generateUUID(), object.name );

		prefab.copy( object as any, true );

		return prefab;

	}

	static parseString ( value: string ): TvMesh {

		return this.parseJSON( JSON.parse( value ) );

	}

	static parseJSON ( json: any ): TvMesh {

		// json
		// json.metdata
		// json.object

		return this.parseObject( json.object );
	}

	private static loader = new ObjectLoader();

	static parseObject ( json: any ): TvMesh {

		const obj = this.loader.load( json );

		const prefab = new TvMesh( json.uuid, json.name );

		prefab.copy( obj as any, false );

		if ( json.materialGuid != undefined ) {
			this.applyMaterial( prefab, json.materialGuid );
		}

		if ( json.geometryGuid != undefined ) {
			this.applyGeometry( prefab, json.geometryGuid );
		}

		json.children?.forEach( ( child: any ) => prefab.add( this.parseObject( child ) ) );

		return prefab;

	}

	static applyMaterial ( mesh: TvMesh, materialGuid: string | string[] ) {

		mesh.materialGuid = materialGuid;

		if ( materialGuid instanceof Array ) {

			const materials = materialGuid
				.map( guid => AssetDatabase.getInstance<TvMaterial>( guid ) )
				.filter( material => material != undefined );

			mesh.material = materials;

		} else {

			const material = AssetDatabase.getInstance<TvMaterial>( materialGuid );

			if ( material ) {
				mesh.material = material;
			} else {
				console.error( 'Material not found', materialGuid, this.name );
			}

		}

	}

	static applyGeometry ( mesh: TvMesh, geometryGuid: string ) {

		mesh.geometryGuid = geometryGuid;

		mesh.geometry = AssetDatabase.getInstance<BufferGeometry>( geometryGuid );

	}

	toJSON ( meta?: any ): any {

		const output = super.toJSON( meta );

		if ( this.geometryGuid ) output.object.geometryGuid = this.geometryGuid;

		if ( this.materialGuid ) output.object.materialGuid = this.materialGuid;

		return output;

	}
}


export class TvPrefabLoader extends ObjectLoader {

	constructor ( manager?: LoadingManager ) {
		super( manager )
	}

	parsePrefab ( json: any ): TvPrefab {

		return this.parseChild( json.object );

	}

	parseChild ( json: any ): TvMesh | TvPrefab {

		const object = super.parseObject( json, [], [], [] );

		if ( json.type === 'Mesh' ) {

			const mesh = new TvMesh( json.uuid, json.name );

			mesh.copy( object as any, false );

			if ( json.geometryGuid ) {

				mesh.geometryGuid = json.geometryGuid;

				mesh.geometry = AssetDatabase.getInstance( mesh.geometryGuid );

			}

			if ( json.materialGuid ) {

				mesh.materialGuid = json.materialGuid;

				if ( mesh.materialGuid instanceof Array ) {

					const materials = mesh.materialGuid
						.map( guid => AssetDatabase.getInstance<TvMaterial>( guid ) )
						.filter( material => material != undefined );

					mesh.material = materials;

				} else {

					const material = AssetDatabase.getInstance<TvMaterial>( mesh.materialGuid );

					if ( material ) {
						mesh.material = material;
					} else {
						console.error( 'Material not found', mesh.materialGuid, mesh.name );
					}

				}

			}

			return mesh;

		} else if ( json.type === 'Group' ) {

			const prefab = new TvPrefab( json?.guid, json.name );

			prefab.copy( object as any, false );

			json.children?.forEach( ( child: any ) => {

				prefab.add( this.parseChild( child ) )

			} );

			return prefab;

		} else {

			const prefab = new TvPrefab( json?.guid, json.name );

			prefab.copy( object as any, false );

			json.children?.forEach( ( child: any ) => {

				prefab.add( this.parseChild( child ) )

			} );

			return prefab;

		}

	}



}

export class TvMaterialLoader extends MaterialLoader {

	parseMaterial ( json: any ): TvMaterial {

		const material = super.parse( json );

		const tvMaterial = new TvMaterial( json?.guid );

		tvMaterial.copy( material );

		if ( json.mapGuid !== undefined ) {
			tvMaterial.mapGuid = json.mapGuid;
			tvMaterial.map = AssetDatabase.getInstance<Texture>( json.mapGuid );
		}

		if ( json.roughnessMapGuid !== undefined ) {
			tvMaterial.roughnessMapGuid = json.roughnessMapGuid;
			tvMaterial.roughnessMap = AssetDatabase.getInstance<Texture>( json.roughnessMapGuid );
		}

		if ( json.normalMapGuid !== undefined ) {
			tvMaterial.normalMapGuid = json.normalMapGuid;
			tvMaterial.normalMap = AssetDatabase.getInstance<Texture>( json.normalMapGuid );
		}

		if ( json.aoMapGuid !== undefined ) {
			tvMaterial.aoMapGuid = json.aoMapGuid;
			tvMaterial.aoMap = AssetDatabase.getInstance<Texture>( json.aoMapGuid );
		}

		if ( json.displacementMapGuid !== undefined ) {
			tvMaterial.displacementMapGuid = json.displacementMapGuid;
			tvMaterial.displacementMap = AssetDatabase.getInstance<Texture>( json.displacementMapGuid );
		}

		return tvMaterial;
	}

}
