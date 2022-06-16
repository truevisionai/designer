import { Mesh, Shape, PlaneBufferGeometry, Texture } from 'three';
import { AssetDatabase } from 'app/services/asset-database';
import { GameObject } from 'app/core/game-object';
import { MarkingTypes } from '../services/tv-marking.service';
import * as THREE from 'three';
import { TvLane } from './tv-lane';
import { AnyControlPoint, SimpleControlPoint } from 'app/modules/three-js/objects/control-point';

/**
 * Instance of road marking object/prefab in the road/lane/map
 */
export class TvPointMarking {

    public static extension = 'roadmarking';

    public static tag = 'roadmarking';

    public mesh: Mesh;

    public controlPoint: SimpleControlPoint<TvPointMarking>;

    public type: MarkingTypes = MarkingTypes.point;

    constructor ( public name: string, public textureGuid: string, public lane?: TvLane ) {

        this.mesh = this.makeMesh();

    }

    static new (): TvPointMarking {

        return new TvPointMarking( 'NewPointMarking', null );

    }

    static importFromString ( contents: string ): TvPointMarking {

        const json = JSON.parse( contents );

        return new TvPointMarking( json.name, json.textureGuid );

    }

    show (): void {



    }

    hide (): void {

    }

    makeMesh (): Mesh {

        const geometry = new PlaneBufferGeometry();

        const texture = AssetDatabase.getInstance<Texture>( this.textureGuid );

        const material = new THREE.MeshLambertMaterial( { map: texture, transparent: true, alphaTest: 0.1 } );

        const mesh = new GameObject( this.name, geometry, material );

        mesh.position.set( 0, 0, 0.01 );

        mesh.Tag = TvPointMarking.tag;

        mesh.userData.roadmarking = this;

        return mesh;

    }

    toJSONString (): any {

        return JSON.stringify( {

            name: this.name,

            type: this.type,

            textureGuid: this.textureGuid,

        }, null, 2 );

    }

    clone () {

        return new TvPointMarking( this.name, this.textureGuid );

    }

}