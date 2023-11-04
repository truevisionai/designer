/*
 * Copyright Truesense AI Solutions Pvt Ltd, All Rights Reserved.
 */

import { RoadFactory } from 'app/factories/road-factory.service';
import { RoadNode } from 'app/modules/three-js/objects/road-node';
import { RoadControlPoint } from '../../modules/three-js/objects/road-control-point';
import { TvRoad } from '../../modules/tv-map/models/tv-road.model';
import { RoadInspector } from '../../views/inspectors/road-inspector/road-inspector.component';
import { OdBaseCommand } from '../../commands/od-base-command';
import { SetInspectorCommand } from '../../commands/set-inspector-command';
import { RoadTool } from './road-tool';

export class JoinRoadNodeCommand extends OdBaseCommand {

	private joiningRoad: TvRoad;

	private oldRoad: TvRoad;
	private oldNode: RoadNode;
	private oldControlPoint: RoadControlPoint;
	private inspectorCommand: SetInspectorCommand;


	constructor (
		private tool: RoadTool,
		private firstNode: RoadNode,
		private secondNode: RoadNode
	) {

		super();

		this.oldRoad = tool.road;
		this.oldNode = tool.node;
		this.oldControlPoint = tool.controlPoint;

		this.inspectorCommand = new SetInspectorCommand( RoadInspector, { road: this.joiningRoad, node: this.secondNode } );
	}

	get firstRoad () {
		return this.firstNode.road;
	}

	get secondRoad () {
		return this.secondNode.road;
	}

	execute (): void {

		this.tool.node = null;
		this.tool.controlPoint = null;

		this.joiningRoad = this.tool.road = RoadFactory.joinRoadNodes( this.firstRoad, this.firstNode, this.secondRoad, this.secondNode );

		this.inspectorCommand.execute();

	}

	undo (): void {

		this.tool.node = this.oldNode;
		this.tool.road = this.oldRoad;
		this.tool.controlPoint = this.oldControlPoint;

		// remove from opendrive
		// remove and clear the splines points
		// remove the entire game object

		this.joiningRoad.hide();
		this.joiningRoad.hideHelpers();

		this.map.roads.delete( this.joiningRoad.id );
		this.map.gameObject.remove( this.joiningRoad.gameObject );

		this.firstRoad.removeConnection( this.joiningRoad );
		this.secondRoad.removeConnection( this.joiningRoad );

		this.joiningRoad.removeConnection( this.firstRoad );
		this.joiningRoad.removeConnection( this.secondRoad );

		this.inspectorCommand.undo();
	}

	redo (): void {

		this.tool.node = null;
		this.tool.road = null;
		this.tool.controlPoint = null;

		this.map.roads.set( this.joiningRoad.id, this.joiningRoad );
		this.map.gameObject.add( this.joiningRoad.gameObject );

		this.joiningRoad.show();
		this.joiningRoad.showHelpers();

		RoadFactory.makeRoadConnections( this.firstRoad, this.firstNode, this.secondRoad, this.secondNode, this.joiningRoad );

		this.inspectorCommand.execute();
	}


}
