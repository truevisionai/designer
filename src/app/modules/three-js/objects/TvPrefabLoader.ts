import { AssetDatabase } from 'app/core/asset/asset-database';
import { LoadingManager, ObjectLoader } from 'three';
import { TvMaterial } from './tv-material.model';
import { TvPrefab } from './tv-prefab.model';
import { TvMesh } from './TvMesh';



export class TvPrefabLoader extends ObjectLoader {

	constructor ( manager?: LoadingManager ) {
		super( manager );
	}

	parsePrefab ( json: any ): TvPrefab {

		return this.parseChild( json.object );

	}

	parseChild ( json: any ): TvMesh | TvPrefab {

		const object = super.parseObject( json, {}, {}, {} );

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

				prefab.add( this.parseChild( child ) );

			} );

			return prefab;

		} else {

			const prefab = new TvPrefab( json?.guid, json.name );

			prefab.copy( object as any, false );

			json.children?.forEach( ( child: any ) => {

				prefab.add( this.parseChild( child ) );

			} );

			return prefab;

		}

	}


}
