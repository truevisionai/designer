/*
 * Copyright Truesense AI Solutions Pvt Ltd, All Rights Reserved.
 */

import { AnyControlPoint, BaseControlPoint } from 'app/modules/three-js/objects/control-point';
import { BaseCommand } from './base-command';
import { PropInstance } from '../models/prop-instance.model';
import { PropPointTool } from '../tools/prop-point-tool';

export class CreatePropPointCommand extends BaseCommand {

	private propCreated: PropInstance;

	constructor ( private tool: PropPointTool, prop: PropInstance, private point: BaseControlPoint ) {

		super();

		this.propCreated = new PropInstance( prop.guid, prop.object.clone() );

		this.propCreated.object.position.copy( this.point.position );

		this.point.mainObject = this.propCreated;

	}

	execute () {

		this.map.gameObject.add( this.propCreated.object );

		this.map.props.push( this.propCreated );

		this.tool.currentPoint = this.point;
	}

	undo () {

		this.map.gameObject.remove( this.propCreated.object );

		const index = this.map.props.indexOf( this.propCreated );

		if ( index !== -1 ) {

			this.map.props.splice( index, 1 );

		}

		this.tool.shapeEditor.removeControlPoint( this.point );

		this.tool.currentPoint = null;
	}

	redo (): void {

		this.execute();

		this.tool.shapeEditor.pushControlPoint( this.point );

	}

}
