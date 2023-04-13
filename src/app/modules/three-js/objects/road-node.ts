/*
 * Copyright Truesense AI Solutions Pvt Ltd, All Rights Reserved.
 */

import { TvRoad } from 'app/modules/tv-map/models/tv-road.model';
import { COLOR } from 'app/shared/utils/colors.service';
import { Maths } from 'app/utils/maths';
import { BufferGeometry, Color, Group, LineBasicMaterial, LineSegments } from 'three';

export class RoadNode extends Group {

	public static readonly tag = 'road-node';
	public static readonly lineTag = 'road-node-line';

	public static defaultColor = COLOR.MAGENTA;
	public static defaultOpacity = 0.35;
	public static defaultWidth = 5;

	public line: LineSegments;
	public isSelected = false;

	constructor ( public road: TvRoad, public distance: 'start' | 'end', public s?: number ) {

		super();

		const sCoord = s || this.calculateS();

		const result = road.getRoadWidthAt( sCoord );

		const start = road.getPositionAt( sCoord, result.leftSideWidth );
		const end = road.getPositionAt( sCoord, -result.rightSideWidth );

		const lineGeometry = new BufferGeometry().setFromPoints( [ start.toVector3(), end.toVector3() ] );

		this.line = new LineSegments( lineGeometry, new LineBasicMaterial( {
			color: RoadNode.defaultColor,
			opacity: RoadNode.defaultOpacity,
			linewidth: RoadNode.defaultWidth,
		} ) );

		this.line[ 'tag' ] = RoadNode.lineTag;

		this.line.renderOrder = 3;

		this.add( this.line );

	}

	get material () {
		return this.line.material as LineBasicMaterial;
	}

	get roadId (): number {
		return this.road.id;
	}

	getRoadId (): number {
		return this.road.id;
	}

	calculateS (): number {

		return this.distance == 'start' ? 0 : this.road.length - Maths.Epsilon;

	}

	selected () {

		this.isSelected = true;

		this.material.color = new Color( COLOR.RED );

		this.renderOrder = 5;
	}

	unselected () {

		this.isSelected = false;

		this.material.color = new Color( RoadNode.defaultColor );

		this.renderOrder = 3;
	}

	update () {

		const sCoord = this.calculateS();

		const result = this.road.getRoadWidthAt( sCoord );

		const start = this.road.getPositionAt( sCoord, result.leftSideWidth );
		const end = this.road.getPositionAt( sCoord, -result.rightSideWidth );

		// TODO: can be improved
		this.line.geometry.dispose();
		this.line.geometry = new BufferGeometry().setFromPoints( [
			start.toVector3(),
			end.toVector3()
		] );
	}
}
