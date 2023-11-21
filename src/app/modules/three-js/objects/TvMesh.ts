import { AssetDatabase } from 'app/core/asset/asset-database';
import { BufferGeometry, MathUtils, Mesh, Object3D, ObjectLoader } from 'three';
import { TvMaterial } from './tv-material.model';


export class TvMesh extends Mesh {

	private static loader = new ObjectLoader();
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
