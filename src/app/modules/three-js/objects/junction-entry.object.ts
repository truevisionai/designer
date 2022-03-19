/*
 * Copyright Truesense AI Solutions Pvt Ltd, All Rights Reserved.
 */

import { Color, Geometry, PointsMaterial, Vector3 } from 'three';
import { COLOR } from 'app/shared/utils/colors.service';
import { OdTextures } from 'app/modules/tv-map/builders/od.textures';
import { TvRoad } from 'app/modules/tv-map/models/tv-road.model';
import { BaseControlPoint } from './control-point';
import { TvContactPoint } from 'app/modules/tv-map/models/tv-common';
import { TvLane } from '../../tv-map/models/tv-lane';

export class JunctionEntryObject extends BaseControlPoint {

    public static tag = 'junction-dot';

    public contact: TvContactPoint;

    public road: TvRoad;

    public lane: TvLane;

    constructor ( name: string, position: Vector3, contact: TvContactPoint, road: TvRoad, lane?: TvLane ) {

        const geometry = new Geometry();

        geometry.vertices.push( new Vector3( 0, 0, 0 ) );

        const texture = OdTextures.point;

        const material = new PointsMaterial( {
            size: 20,
            sizeAttenuation: false,
            map: texture,
            alphaTest: 0.5,
            transparent: true,
            color: COLOR.SKYBLUE,
            depthTest: true
        } );

        super( geometry, material );

        this.contact = contact;

        this.road = road;

        this.lane = lane;

        this.name = name;

        if ( position ) this.copyPosition( position );

        this.tag = JunctionEntryObject.tag;

        this.renderOrder = 3;

    }

    select () {

        this.isSelected = true;

        ( this.material as PointsMaterial ).color = new Color( COLOR.RED );
        ( this.material as PointsMaterial ).needsUpdate = true;

    }

    unselect () {

        this.isSelected = false;

        ( this.material as PointsMaterial ).color = new Color( COLOR.SKYBLUE );
        ( this.material as PointsMaterial ).needsUpdate = true;

    }
}
