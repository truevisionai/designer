/*
 * Copyright Truesense AI Solutions Pvt Ltd, All Rights Reserved.
 */

import { BaseControlPoint } from 'app/modules/three-js/objects/control-point';
import { BaseCommand } from '../../commands/base-command';
import { PropInstance } from '../../models/prop-instance.model';
import { PropPointTool } from './prop-point-tool';
import { SceneService } from 'app/core/services/scene.service';
import { Scene } from 'three';

export class CreatePropPointCommand extends BaseCommand {

	private propInstance: PropInstance;

	constructor ( private tool: PropPointTool, prop: PropInstance, private point: BaseControlPoint ) {

		super();

		this.propInstance = new PropInstance( prop.guid, prop.object.clone() );

		this.propInstance.object.position.copy( this.point.position );

		this.point.mainObject = this.propInstance;

	}

	execute () {

		SceneService.add( this.propInstance.object );

		SceneService.add( this.point );

		this.map.props.push( this.propInstance );

		this.tool.setPoint( this.point );

		this.tool.points.push( this.point );
	}

	undo () {

		SceneService.remove( this.propInstance.object );

		SceneService.remove( this.point );

		this.map.props.splice( this.map.props.indexOf( this.propInstance ), 1 );

		this.tool.setPoint( null );

		this.tool.points.splice( this.tool.points.indexOf( this.point ), 1 );
	}

	redo (): void {

		this.execute();

	}

}
