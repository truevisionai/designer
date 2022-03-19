/*
 * Copyright Truesense AI Solutions Pvt Ltd, All Rights Reserved.
 */

import { CatmullRomSpline } from 'app/core/shapes/catmull-rom-spline';
import * as THREE from 'three';
import { Mesh, Shape, ShapeBufferGeometry, Vector2 } from 'three';
import { OdTextures } from '../builders/od.textures';
import { SceneService } from 'app/core/services/scene.service';
import { TvMapSourceFile } from '../services/tv-map-source-file';
import { GameObject } from 'app/core/game-object';

export class TvSurface {

    public static readonly tag = 'surface';

    public static index = 0;

    public mesh: Mesh;

    public id: number;

    public textureDensity = 100;

    constructor (
        public materialGuid: string,
        public spline: CatmullRomSpline,
        public offset: Vector2 = new Vector2( 0, 0 ),
        public scale: Vector2 = new Vector2( 1, 1 ),
        public rotation: number = 0.0,
        public height: number = 0.0
    ) {

        this.init();
    }

    init (): void {

        this.id = TvSurface.index++;

        // make a blank shape to avoid any errors 
        this.mesh = this.makeMesh( new Shape() );

        // TODO: we can probably avoid doing this here
        // add the surface mesh to opendrive object to make it available
        // for exporting in 3d format easily
        TvMapSourceFile.openDrive.gameObject.add( this.mesh );

        // add the spline mesh direcly to scene and not opendrive
        // this helps avoid exporting it in the 3d file
        SceneService.add( this.spline.mesh );

        // update the surface if >=3 points are present
        if ( this.spline.controlPoints.length > 2 ) this.update();

    }

    update (): void {

        this.spline.update();

        if ( this.spline.controlPoints.length < 3 ) return;

        const points: Vector2[] = this.spline.curve.getPoints( 50 ).map(
            p => new Vector2( p.x, p.y )
        );

        const shape = new Shape();

        const first = points.shift();

        shape.moveTo( first.x, first.y );

        shape.splineThru( points );

        this.mesh.geometry.dispose();

        this.mesh.geometry = new ShapeBufferGeometry( shape );

        const uvAttribute = this.mesh.geometry.attributes.uv;

        for ( let i = 0; i < uvAttribute.count; i++ ) {

            const u = uvAttribute.getX( i );
            const v = uvAttribute.getY( i );

            uvAttribute.setXY( i, u * this.textureDensity, v * this.textureDensity );

        }
    }

    makeMesh ( shape: Shape ): Mesh {

        const geometry = new ShapeBufferGeometry( shape );

        const texture = OdTextures.terrain.clone();
        texture.wrapS = texture.wrapT = THREE.RepeatWrapping;
        texture.repeat.set( 0.008, 0.008 );
        texture.anisotropy = 16;
        texture.encoding = THREE.sRGBEncoding;

        const groundMaterial = new THREE.MeshLambertMaterial( { map: texture } );

        const mesh = new GameObject( "Surface", geometry, groundMaterial );

        mesh.position.set( 0, 0, -0.1 );

        mesh.Tag = TvSurface.tag;

        mesh.userData.surface = this;

        groundMaterial.map.needsUpdate = true;

        return mesh;
    }

    showCurve (): void {

        this.spline.show();

    }

    hideCurve (): void {

        this.spline.hide();

    }

    showControlPoints (): void {

        this.spline.showcontrolPoints();

    }

    hideControlPoints (): void {

        this.spline.hidecontrolPoints();

    }

    delete (): void {

        this.hideControlPoints();

        this.hideCurve();

        this.mesh.visible = false;

    }

}
