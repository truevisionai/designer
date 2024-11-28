/*
 * Copyright Truesense AI Solutions Pvt Ltd, All Rights Reserved.
 */

import { TvContactPoint } from 'app/map/models/tv-common';
import { TvPosTheta } from 'app/map/models/tv-pos-theta';
import { TvRoad } from 'app/map/models/tv-road.model';
import { COLOR } from 'app/views/shared/utils/colors.service';
import { Color, Group } from 'three';
import { Line2 } from 'three/examples/jsm/lines/Line2';
import { LineMaterial } from 'three/examples/jsm/lines/LineMaterial';
import { ISelectable } from '../i-selectable';
import { TvLink, TvLinkType } from 'app/map/models/tv-link';
import { LinkFactory } from 'app/map/models/link-factory';
import { TvLaneSection } from 'app/map/models/tv-lane-section';

export class RoadNode extends Group implements ISelectable {

	public static readonly tag = 'road-node';
	public static readonly lineTag = 'road-node-line';

	public static defaultColor = COLOR.MAGENTA;
	public static defaultWidth = 6;

	public line: Line2;
	public isSelected = false;

	public tag = RoadNode.tag;

	constructor ( public road: TvRoad, public contact: TvContactPoint ) {

		super();

		this.layers.enable( 31 );

	}

	get posTheta (): TvPosTheta {
		return this.road.getPosThetaByContact( this.contact );
	}

	get material (): LineMaterial {
		return this.line.material;
	}

	set material ( value: LineMaterial ) {
		this.line.material = value;
	}

	get laneSection (): TvLaneSection {
		return this.road.getLaneProfile().getLaneSectionAtContact( this.contact );
	}

	select () {

		this.isSelected = true;

		this.material.color = new Color( COLOR.RED );

		this.renderOrder = 5;
	}

	unselect () {

		this.isSelected = false;

		this.material.color = new Color( RoadNode.defaultColor );

		this.renderOrder = 3;
	}

	onMouseOver () {

		this.material.color = new Color( COLOR.YELLOW );
		this.material.needsUpdate = true;

	}

	onMouseOut () {

		this.material.color = new Color( RoadNode.defaultColor );
		this.material.needsUpdate = true;

	}

	get isConnected () {

		if ( this.contact == TvContactPoint.START ) {

			return this.road.hasPredecessor();

		}

		return this.road.hasSuccessor();

	}

	getPosition (): TvPosTheta {

		return this.contact == TvContactPoint.START ? this.road.getStartPosTheta() : this.road.getEndPosTheta();

	}

	toLink () {

		return LinkFactory.createRoadLink( this.road, this.contact );

	}

}
