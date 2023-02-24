/*
 * Copyright Truesense AI Solutions Pvt Ltd, All Rights Reserved.
 */

import { SceneService } from 'app/core/services/scene.service';
import { CURVE_Y } from 'app/core/shapes/spline-config';
import { OdTextures } from 'app/modules/tv-map/builders/od.textures';
import { TvGeometryType } from 'app/modules/tv-map/models/tv-common';
import { TvRoad } from 'app/modules/tv-map/models/tv-road.model';
import { COLOR } from 'app/shared/utils/colors.service';
import { BufferAttribute, BufferGeometry, Line, LineBasicMaterial, PointsMaterial, Vector3 } from 'three';
import { BaseControlPoint } from './control-point';
import { RoadTangentPoint } from './road-tangent-point';

export class RoadControlPoint extends BaseControlPoint {

    public static readonly tag = 'road-control-point';

    public frontTangent: RoadTangentPoint;
    public backTangent: RoadTangentPoint;

    public tangentLine: Line;
    public tangentLineGeometry: BufferGeometry;
    public tangentLineMaterial = new LineBasicMaterial( {
        color: 0x0000ff,
        linewidth: 2
    } );

    public hdg: number = 0;
    public segmentType: TvGeometryType;

    public allowChange: boolean = true;

    // tag, tagindex, cpobjidx are not used anywhere in new fixed workflow
    // can add hdg here and
    // remove segmentType from here to spline directly
    constructor (
        public road: TvRoad,
        position: Vector3,
        tag = 'cp',
        tagindex?: number,
        cpobjidx?: number,
    ) {

        super( new BufferGeometry(), new PointsMaterial() );

        this.geometry = new BufferGeometry();

        this.geometry.setAttribute( 'position', new BufferAttribute( new Float32Array( 3 ), 3 ) );

        const texture = OdTextures.point;

        this.material = new PointsMaterial( {
            size: 10,
            sizeAttenuation: false,
            map: texture,
            alphaTest: 0.5,
            transparent: true,
            color: COLOR.BLUE,
            depthTest: false
        } );

        if ( position ) this.copyPosition( position );

        this.userData.is_button = true;
        this.userData.is_control_point = true;
        this.userData.is_selectable = true;

        this.tag = tag;
        this.tagindex = tagindex;

        this.renderOrder = 3;

    }

    copyPosition ( position: Vector3 ) {

        if ( !this.allowChange ) return;

        super.copyPosition( position );

        if ( this.frontTangent ) {

            this.segmentType = TvGeometryType.SPIRAL;

            const frontPosition = new Vector3( Math.cos( this.hdg ), Math.sin( this.hdg ), CURVE_Y )
                .multiplyScalar( this.frontTangent.length )
                .add( this.position );

            this.frontTangent.copyPosition( frontPosition );

        }

        if ( this.backTangent ) {

            this.segmentType = TvGeometryType.SPIRAL;

            const backPosition = new Vector3( Math.cos( this.hdg ), Math.sin( this.hdg ), CURVE_Y )
                .multiplyScalar( -this.backTangent.length )
                .add( this.position );

            this.backTangent.copyPosition( backPosition );

        }

        if ( this.frontTangent || this.backTangent ) {

            this.updateTangentLine();

        }

    }

    show () {

        super.show();

        if ( this.frontTangent ) this.frontTangent.show();

        if ( this.backTangent ) this.backTangent.show();

        if ( this.tangentLine ) this.tangentLine.visible = true;
    }

    hide () {

        super.hide();

        if ( this.frontTangent ) this.frontTangent.hide();

        if ( this.backTangent ) this.backTangent.hide();

        if ( this.tangentLine ) this.tangentLine.visible = false;

    }

    addDefaultTangents ( hdg: number, frontLength: number, backLength: number ) {

        const frontPosition = new Vector3( Math.cos( hdg ), Math.sin( hdg ), CURVE_Y )
            .multiplyScalar( frontLength )
            .add( this.position );

        const backPosition = new Vector3( Math.cos( hdg ), Math.sin( hdg ), CURVE_Y )
            .multiplyScalar( -backLength )
            .add( this.position );

        this.frontTangent = new RoadTangentPoint(
            this.road,
            frontPosition,
            'tpf',
            this.tagindex,
            this.tagindex + 1 + this.tagindex * 2,
            this,
        );

        this.backTangent = new RoadTangentPoint(
            this.road,
            backPosition,
            'tpb',
            this.tagindex,
            this.tagindex + 1 + this.tagindex * 2 + 1,
            this,
        );

        // TODO: move this maybe somewhere else

        SceneService.add( this.frontTangent );

        SceneService.add( this.backTangent );

        this.tangentLineGeometry = new BufferGeometry().setFromPoints( [ this.frontTangent.position, this.backTangent.position ] );

        this.tangentLine = new Line( this.tangentLineGeometry, this.tangentLineMaterial );

        this.tangentLine.castShadow = true;

        this.tangentLine.renderOrder = 3;

        this.tangentLine.frustumCulled = false;

        SceneService.add( this.tangentLine );
    }

    updateTangentLine () {

        if ( this.tangentLine && this.backTangent ) {

            const buffer = this.tangentLineGeometry.attributes.position as BufferAttribute;

            buffer.setXYZ( 0, this.frontTangent.position.x, this.frontTangent.position.y, this.frontTangent.position.z );

            buffer.setXYZ( 1, this.backTangent.position.x, this.backTangent.position.y, this.backTangent.position.z );

            buffer.needsUpdate = true;
        }

    }

    moveForward ( s: number ): RoadControlPoint {

        const x = this.position.x + Math.cos( this.hdg ) * s;
        const y = this.position.y + Math.sin( this.hdg ) * s;

        return new RoadControlPoint( this.road, new Vector3( x, y, 0 ), this.tag, this.tagindex, this.tagindex );
    }

}
