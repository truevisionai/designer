/*
 * Copyright Truesense AI Solutions Pvt Ltd, All Rights Reserved.
 */

import { CatmullRomSpline } from 'app/core/shapes/catmull-rom-spline';
import { AnyControlPoint } from 'app/modules/three-js/objects/control-point';
import { Object3D, Mesh, Shape, ShapeBufferGeometry, MeshBasicMaterial, Vector2, ShapeUtils, BufferGeometryUtils, BufferAttribute, Vector3 } from 'three';
import { GameObject } from 'app/core/game-object';
import * as THREE from 'three';
import { PropService } from 'app/services/prop-service';

export class PropPolygon {

    public static index = 0;

    public static tag: string = 'prop-polygon';

    public id: number;

    public props: Object3D[] = [];

    public mesh: Mesh;

    constructor ( public propGuid: string, public spline?: CatmullRomSpline, public density = 0.5 ) {

        if ( !this.spline ) {

            this.spline = new CatmullRomSpline( true, 'catmullrom', 0.001 );

        }

        this.id = PropPolygon.index++;

        // make a blank shape to avoid any errors
        this.mesh = this.makeMesh( new Shape() );
    }

    makeMesh ( shape: Shape ): Mesh {

        const geometry = new ShapeBufferGeometry( shape );

        const groundMaterial = new MeshBasicMaterial( {} );

        const mesh = new GameObject( PropPolygon.tag, geometry, groundMaterial );

        mesh.position.set( 0, 0, -0.1 );

        mesh.Tag = PropPolygon.tag;

        mesh.userData.polygon = this;

        return mesh;
    }

    update () {

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

        const geometry = this.mesh.geometry = new ShapeBufferGeometry( shape );

        geometry.computeBoundingBox();

        PropService.updateCurvePolygonProps( this );
    }

    addControlPoint ( cp: AnyControlPoint ) {

        ( this.spline as CatmullRomSpline ).add( cp );

        this.update();
    }

    delete () {

        this.hideControlPoints();

        this.hideCurve();

    }

    hideControlPoints () {

        this.spline.hidecontrolPoints();

    }

    hideCurve () {

        this.spline.hide();

    }

    showCurve () {

        this.spline.show();

    }

    showControlPoints () {

        this.spline.showcontrolPoints();

    }
}
