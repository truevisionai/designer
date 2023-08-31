/*
 * Copyright Truesense AI Solutions Pvt Ltd, All Rights Reserved.
 */

import { BaseControlPoint } from 'app/modules/three-js/objects/control-point';
import { BaseCommand } from '../../commands/base-command';
import { PropInstance } from '../../models/prop-instance.model';
import { PropPointTool } from './prop-point-tool';

export class CreatePropPointCommand extends BaseCommand {

	private propInstance: PropInstance;

	constructor ( private tool: PropPointTool, prop: PropInstance, private point: BaseControlPoint ) {

		super();

		this.propInstance = new PropInstance( prop.guid, prop.object.clone() );

		this.propInstance.object.position.copy( this.point.position );

		this.propInstance.point = this.point;

		this.point.mainObject = this.propInstance;

	}

	execute () {

		this.map.gameObject.add( this.propInstance.object );

		this.map.props.push( this.propInstance );

		this.tool.currentPoint = this.point;
	}

	undo () {

		this.map.gameObject.remove( this.propInstance.object );

		const index = this.map.props.indexOf( this.propInstance );

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
