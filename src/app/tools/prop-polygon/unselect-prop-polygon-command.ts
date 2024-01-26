/*
 * Copyright Truesense AI Solutions Pvt Ltd, All Rights Reserved.
 */

// import { BaseCommand } from 'app/core/commands/base-command';
// import { SetInspectorCommand } from 'app/core/commands/set-inspector-command';
// import { PropPolygon } from 'app/modules/tv-models/models/prop-polygons';
// import {
// 	PropPolygonInspectorComponent,
// 	PropPolygonInspectorData
// } from 'app/views/inspectors/prop-polygon-inspector/prop-polygon-inspector.component';
// import { PropPolygonTool } from './prop-polygon-tool';
//
// export class UnselectPropPolygonCommand extends BaseCommand {
//
// 	private readonly polygon: PropPolygon;
// 	private inspectorCommand: SetInspectorCommand;
//
// 	constructor ( private tool: PropPolygonTool ) {
//
// 		super();
//
// 		this.polygon = tool.propPolygon;
//
// 		this.inspectorCommand = new SetInspectorCommand( PropPolygonInspectorComponent,
// 			new PropPolygonInspectorData( null, null )
// 		);
// 	}
//
// 	execute (): void {
// 		this.tool.propPolygon = null;
// 		this.inspectorCommand.execute();
// 	}
//
// 	undo (): void {
// 		this.tool.propPolygon = this.polygon;
// 		this.inspectorCommand.undo();
// 	}
//
// 	redo (): void {
// 		this.execute();
// 	}
//
// }
