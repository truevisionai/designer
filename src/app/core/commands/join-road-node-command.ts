/*
 * Copyright Truesense AI Solutions Pvt Ltd, All Rights Reserved.
 */

import { RoadFactory } from 'app/core/factories/road-factory.service';
import { AppInspector } from 'app/core/inspector';
import { RoadNode } from 'app/modules/three-js/objects/road-node';
import { TvRoad } from '../../modules/tv-map/models/tv-road.model';
import { RoadInspector } from '../../views/inspectors/road-inspector/road-inspector.component';
import { OdBaseCommand } from './od-base-command';

export class JoinRoadNodeCommand extends OdBaseCommand {

	private joiningRoad: TvRoad;
	private lastInspector;
	private lastInspectorData;

	constructor (
		private firstNode: RoadNode,
		private secondNode: RoadNode
	) {

		super();

		this.lastInspector = AppInspector.currentInspector;
		this.lastInspectorData = AppInspector.currentInspectorData;

	}

	get firstRoad () {
		return this.map.getRoadById( this.firstNode.roadId );
	}

	get secondRoad () {
		return this.map.getRoadById( this.secondNode.roadId );
	}

	execute (): void {

		this.joiningRoad = RoadFactory.joinRoadNodes( this.firstRoad, this.firstNode, this.secondRoad, this.secondNode );

		AppInspector.setInspector( RoadInspector, { road: this.joiningRoad, node: this.secondNode } );

	}

	undo (): void {

		// remove from opendrive
		// remove and clear the splines points
		// remove the entire game object

		this.map.roads.delete( this.joiningRoad.id );

		this.map.gameObject.remove( this.joiningRoad.gameObject );

		RoadFactory.removeRoadConnections( this.firstRoad, this.joiningRoad );
		RoadFactory.removeRoadConnections( this.secondRoad, this.joiningRoad );

		AppInspector.setInspector( this.lastInspector, this.lastInspectorData );
	}

	redo (): void {

		this.map.roads.set( this.joiningRoad.id, this.joiningRoad );

		this.map.gameObject.add( this.joiningRoad.gameObject );

		RoadFactory.makeRoadConnections( this.firstRoad, this.firstNode, this.secondRoad, this.secondNode, this.joiningRoad );

		AppInspector.setInspector( RoadInspector, { road: this.joiningRoad, node: this.secondNode } );
	}


}
