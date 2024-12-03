/*
 * Copyright Truesense AI Solutions Pvt Ltd, All Rights Reserved.
 */

import { COLOR } from 'app/views/shared/utils/colors.service';
import { Maths } from 'app/utils/maths';
import * as THREE from 'three';
import { Color, Line, LineBasicMaterial, LineDashedMaterial, Material, Object3D, Vector3 } from 'three';
import { TvLaneSide } from '../../../map/models/tv-common';
import { TvLane } from '../../../map/models/tv-lane';
import { TvLaneSection } from '../../../map/models/tv-lane-section';
import { TvPosTheta } from '../../../map/models/tv-pos-theta';
import { TvRoad } from '../../../map/models/tv-road.model';
import { SceneService } from 'app/services/scene.service';

export enum LineType {
	SOLID = 'solid',
	DASHED = 'dashed',
	BOTH = 'both',
}

const DEFAULT_LINE_COLOR = COLOR.CYAN;
const HIGHLIGHT_LINE_COLOR = new Color( 0, 1, 0 );
const SELECTED_LINE_COLOR = new Color( 1, 0, 0 );

const DEFAULT_SOLID_WIDTH = 1;
const HIGHLIGHT_SOLID_WIDTH = 2;

const DEFAULT_DASHED_WIDTH = 2;
const HIGHLIGHT_DASHED_WIDTH = 3;


export class OdLaneReferenceLineBuilder {

	public lines: Object3D[] = [];

	public readonly tag: string = 'lane-reference-line';

	private basicMaterial = new THREE.LineBasicMaterial( {
		color: DEFAULT_LINE_COLOR,
		linewidth: DEFAULT_SOLID_WIDTH
	} );

	private dashedMaterial = new LineDashedMaterial( {
		color: DEFAULT_LINE_COLOR,
		opacity: 0.35,
		linewidth: DEFAULT_DASHED_WIDTH,
		scale: 1,
		dashSize: 0.2,
		gapSize: 0.1,
	} );

	private mouseOverLine: Line;

	private selectedLine: Line;

	constructor (
		private road?: TvRoad,
		private lineType: LineType = LineType.SOLID,
		private color?: number,
		private drawCenterLane = true,
	) {

	}

	private static makeLanePoints ( laneSection: TvLaneSection, lane: TvLane, points: TvPosTheta[] = [] ): void {

		let s = laneSection.s;

		while ( s <= laneSection.endS ) {

			OdLaneReferenceLineBuilder.makeLanePointsLoop( s, laneSection, lane, points );

			s++;
		}

		s = laneSection.endS - Maths.Epsilon;

		OdLaneReferenceLineBuilder.makeLanePointsLoop( s, laneSection, lane, points );
	}

	private static makeLanePointsLoop ( s: number, laneSection: TvLaneSection, lane: TvLane, points: TvPosTheta[] = [] ): void {

		let posTheta = lane.laneSection.road.getPosThetaAt( s );

		let width = laneSection.getWidthUptoEnd( lane, s - laneSection.s );

		// If right side lane then make the offset negative
		if ( lane.side === TvLaneSide.RIGHT ) {
			width *= -1;
		}

		posTheta.addLateralOffset( width );

		points.push( posTheta );

	}

	public setType ( lineType: LineType ): void {

		this.lineType = lineType;

	}

	public create (): void {

		this.road.computeLaneSectionCoordinates();

		this.drawRoad( this.road );
	}

	public redraw ( type: LineType = LineType.SOLID ): void {

		const road = this.road;

		this.clear();

		this.drawRoad( road, type );
	}

	public drawRoad ( road: TvRoad, type: LineType = LineType.SOLID, redraw = false ): void {

		if ( road == null ) return;

		// TODO: remove this logic as the responsibility should not be here
		// simply return if the road is already selected
		if ( !redraw && this.road && this.road.id === road.id ) return;

		this.clear();

		this.road = road;

		for ( let i = 0; i < road.getLaneProfile().getLaneSections().length; i++ ) {

			const laneSection = road.getLaneProfile().getLaneSections()[ i ];

			laneSection.getLanes().forEach( lane => {

				if ( this.drawCenterLane === false && lane.isCenter ) return;

				const points: TvPosTheta[] = [];

				OdLaneReferenceLineBuilder.makeLanePoints( laneSection, lane, points );

				this.drawLine( lane, this.convertToVector3List( points ), type );


			} );

		}
	}

	public showLaneLine ( lane: TvLane, type: LineType = LineType.SOLID ): void {

		const points: TvPosTheta[] = [];

		OdLaneReferenceLineBuilder.makeLanePoints( lane.laneSection, lane, points );

		this.drawLine( lane, this.convertToVector3List( points ), type );

	}

	public clear (): void {

		this.lines.forEach( line => {

			const lane = line.userData.lane as TvLane;

			lane.laneSection.road.gameObject.remove( line );

		} );

		this.road = null;

	}

	onMouseOverLine ( line: Line ): void {

		if ( this.selectedLine && line.id === this.selectedLine.id ) return;

		// // not reqquired it seems
		// // dont higlight if this line is already selected
		// if ( this.mouseOverLine && this.selectedLine && line.id === this.selectedLine.id ) return;

		// if same line is being asked to highlight then simple return and do nothing
		if ( this.mouseOverLine && this.mouseOverLine.id == line.id ) return;

		// // not reqquired it seems
		// simpley return if mouse is over the selected line
		// if ( this.mouseOverLine && this.selectedLine && this.selectedLine.id == this.mouseOverLine.id ) return;

		// else remove the previously highlighted line if present
		this.onMouseOutLine();

		// make this the new highlighted line
		this.mouseOverLine = line;

		// set the current material property to highlighted color
		( line.computeLineDistances() );

		( line.material as LineBasicMaterial ).color.set( HIGHLIGHT_LINE_COLOR );

		if ( this.lineType == LineType.SOLID ) {

			( line.material as LineBasicMaterial ).linewidth = HIGHLIGHT_SOLID_WIDTH;

		} else {

			( line.material as LineBasicMaterial ).linewidth = HIGHLIGHT_DASHED_WIDTH;
		}

		( line.material as LineBasicMaterial ).needsUpdate = true;
	}

	onMouseOutLine (): void {

		if ( !this.mouseOverLine ) return;

		// simpley return if mouse was over the selected line
		if ( this.mouseOverLine && this.selectedLine && this.mouseOverLine.id == this.selectedLine.id ) return;

		// set the current material property to highlighted color
		( this.mouseOverLine.computeLineDistances() );

		( this.mouseOverLine.material as LineBasicMaterial ).color.set( DEFAULT_LINE_COLOR );

		if ( this.lineType == LineType.SOLID ) {

			( this.mouseOverLine.material as LineBasicMaterial ).linewidth = DEFAULT_SOLID_WIDTH;

		} else {

			( this.mouseOverLine.material as LineBasicMaterial ).linewidth = DEFAULT_DASHED_WIDTH;
		}

		( this.mouseOverLine.material as LineBasicMaterial ).needsUpdate = true;

		this.mouseOverLine = null;
	}

	onLineSelected ( line: Line ): void {

		if ( this.selectedLine && this.selectedLine.id == line.id ) return;

		this.onLineUnselected();

		this.selectedLine = line;

		( line.computeLineDistances() );

		( line.material as LineBasicMaterial ).color.set( SELECTED_LINE_COLOR );

		if ( this.lineType == LineType.SOLID ) {

			( line.material as LineBasicMaterial ).linewidth = HIGHLIGHT_SOLID_WIDTH;

		} else {

			( line.material as LineBasicMaterial ).linewidth = HIGHLIGHT_DASHED_WIDTH;
		}

		( line.material as LineBasicMaterial ).needsUpdate = true;

	}

	onLineUnselected (): void {

		if ( !this.selectedLine ) return;

		( this.selectedLine.computeLineDistances() );

		( this.selectedLine.material as LineBasicMaterial ).color.set( DEFAULT_LINE_COLOR );

		if ( this.lineType == LineType.SOLID ) {

			( this.selectedLine.material as LineBasicMaterial ).linewidth = DEFAULT_SOLID_WIDTH;

		} else {

			( this.selectedLine.material as LineBasicMaterial ).linewidth = DEFAULT_DASHED_WIDTH;
		}

		( this.selectedLine.material as LineBasicMaterial ).needsUpdate = true;

		this.selectedLine = null;

	}

	private drawLine ( lane: TvLane, points: Vector3[], type: LineType = LineType.SOLID ): void {

		const geometry = new THREE.BufferGeometry().setFromPoints( points );

		const material = this.getLineMaterial( type );

		if ( this.color ) material.color.set( this.color );

		const line = new THREE.Line( geometry, material );

		( line.material as Material ).depthTest = false;

		line.computeLineDistances();

		line.name = 'LaneWidthLine';

		line.userData.is_selectable = true;

		line.userData.lane = lane;

		line.renderOrder = 999;

		line[ 'tag' ] = this.tag;

		this.lines.push( line );

		SceneService.addToolObject( line );
	}

	private getLineMaterial ( type: LineType ) {

		if ( type == LineType.SOLID ) {

			return new LineBasicMaterial().copy( this.basicMaterial );

		} else if ( type == LineType.DASHED ) {

			return new LineDashedMaterial().copy( this.dashedMaterial );

		} else if ( type == LineType.BOTH ) {

			return new LineDashedMaterial().copy( this.dashedMaterial );

		} else {

			console.warn( 'unknown line type' );

			return new LineBasicMaterial().copy( this.basicMaterial );

		}
	}

	private convertToVector3List ( poses: TvPosTheta[] ): Vector3[] {

		const tmp: Vector3[] = [];

		poses.forEach( pose => {

			tmp.push( new Vector3( pose.x, pose.y, pose.z ) );

		} );

		return tmp;
	}


}
