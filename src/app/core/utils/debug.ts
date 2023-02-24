/*
 * Copyright Truesense AI Solutions Pvt Ltd, All Rights Reserved.
 */

import { Mesh, MeshBasicMaterial, SphereGeometry, Vector2, Vector3 } from 'three';
import { environment } from '../../../environments/environment';
import { SceneService } from '../services/scene.service';

export class Debug {

    private static sphereAdded: boolean;
    private static sphere: Mesh;

    static log ( message?: any, ...optionalParams: any[] ) {

        if ( !environment.production ) {

            console.log( message, optionalParams );

        }
    }

    static drawSphere ( position: Vector3 | Vector2 ) {

        if ( !this.sphereAdded ) {

            const geometry = new SphereGeometry();
            const material = new MeshBasicMaterial();

            this.sphere = new Mesh( geometry, material );

            SceneService.add( this.sphere );

            this.sphereAdded = true;
        }

        this.sphere.position.setX( position.x );
        this.sphere.position.setY( position.y );

    }
}
