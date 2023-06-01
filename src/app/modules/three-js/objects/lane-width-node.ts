import { BufferGeometry, Group, LineBasicMaterial, LineSegments } from 'three';
import { COLOR } from '../../../shared/utils/colors.service';
import { TvLane } from '../../tv-map/models/tv-lane';
import { TvLaneWidth } from '../../tv-map/models/tv-lane-width';
import { TvRoad } from '../../tv-map/models/tv-road.model';
import { TvMapQueries } from '../../tv-map/queries/tv-map-queries';
import { AnyControlPoint } from './control-point';

export class LaneWidthNode extends Group {

	public static readonly tag = 'width-node';
	public static readonly pointTag = 'width-point';
	public static readonly lineTag = 'width-line';

	public line: LineSegments;
	public point: AnyControlPoint;

	constructor ( private _road: TvRoad, private _lane: TvLane, private _s: number, public laneWidth: TvLaneWidth ) {

		super();

		this.createMesh();
	}

	get road () {
		return this._road;
	}

	get lane () {
		return this._lane;
	}

	get roadId () {
		return this.road.id;
	}

	get laneId () {
		return this.lane.id;
	}

	updateLaneWidthValues () {

		this.road.getLaneSectionAt( this.laneWidth.s ).updateLaneWidthValues( this.lane );

	}

	private createMesh () {

		const road = this.road;
		const lane = this.lane;

		const offset = this.laneWidth.getValue( this.laneWidth.s ) * 0.5;
		const start = TvMapQueries.getLanePosition( road.id, lane.id, this.laneWidth.s, -offset );
		const end = TvMapQueries.getLanePosition( road.id, lane.id, this.laneWidth.s, offset );

		this.point = AnyControlPoint.create( 'point', end );
		this.point.tag = LaneWidthNode.pointTag;
		this.add( this.point );

		const lineGeometry = new BufferGeometry().setFromPoints( [ start, end ] );
		this.line = new LineSegments( lineGeometry, new LineBasicMaterial( { color: COLOR.DARKBLUE, opacity: 0.35 } ) );
		this.line[ 'tag' ] = LaneWidthNode.lineTag;
		this.line.renderOrder = 3;
		this.add( this.line );
	}
}
