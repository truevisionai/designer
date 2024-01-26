/*
 * Copyright Truesense AI Solutions Pvt Ltd, All Rights Reserved.
 */

// /*
//  * Copyright Truesense AI Solutions Pvt Ltd, All Rights Reserved.
//  */

// import { SelectPointCommand } from 'app/commands/select-point-command';
// import { PropCurve } from 'app/modules/tv-models/models/prop-curve';
// import {
// 	PropCurveInspectorComponent,
// 	PropCurveInspectorData
// } from 'app/views/inspectors/prop-curve-inspector/prop-curve-inspector.component';
// import { BaseCommand } from '../../commands/base-command';
// import { PropModel } from '../../core/models/prop-model.model';
// import { SceneService } from '../../services/scene.service';
// import { PropCurveToolV2 } from './prop-curve-tool';
// import { AbstractControlPoint } from "../../modules/three-js/objects/abstract-control-point";

// export class CreatePropCurveCommand extends BaseCommand {

// 	private curve: PropCurve;

// 	private selectPointCommand: SelectPointCommand;

// 	constructor ( private tool: PropCurveToolV2, private prop: PropModel, private point: AbstractControlPoint ) {

// 		super();

// 		this.curve = new PropCurve( this.prop.guid );

// 		point.mainObject = this.curve;

// 		const data = new PropCurveInspectorData( this.point, this.curve );

// 		this.selectPointCommand = new SelectPointCommand( this.tool as PropCurveToolV2, this.point, PropCurveInspectorComponent, data );
// 	}

// 	execute (): void {

// 		this.selectPointCommand.execute();

// 		this.models.propCurves.push( this.curve );

// 		this.curve.addControlPoint( this.point );

// 		SceneService.addToMain( this.point );

// 		this.curve.show();

// 	}

// 	undo (): void {

// 		this.selectPointCommand.undo();

// 		this.curve.delete();

// 		SceneService.removeFromMain( this.point );

// 		const index = this.models.propCurves.indexOf( this.curve );

// 		this.models.propCurves.splice( index, 1 );

// 	}

// 	redo (): void {

// 		this.execute();

// 	}

// }
