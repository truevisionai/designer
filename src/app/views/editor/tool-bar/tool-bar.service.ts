/*
 * Copyright Truesense AI Solutions Pvt Ltd, All Rights Reserved.
 */

import { Injectable } from '@angular/core';
import { ToolType } from 'app/tools/tool-types.enum';
import { ToolManager } from 'app/managers/tool-manager';
import { ToolFactory } from "../../../tools/tool.factory";
import { Tool } from "../../../tools/tool";
import { TvConsole } from 'app/core/utils/console';
import { ThreeService } from 'app/renderer/three.service';
import { SetInspectorCommand } from 'app/commands/set-inspector-command';
import { EnvironmentInspectorComponent } from 'app/views/inspectors/environment-inspector/environment-inspector.component';
import { WorldSettingInspectorComponent } from 'app/views/inspectors/world-setting-inspector/world-setting-inspector.component';
import { Commands } from 'app/commands/commands';
import { CommandHistory } from 'app/commands/command-history';

@Injectable( {
	providedIn: 'root'
} )
export class ToolBarService {

	private height: number;

	constructor (
		private toolFactory: ToolFactory,
		private threeService: ThreeService,
	) {
	}

	setToolByType ( type: ToolType ) {

		if ( ToolManager.isCurrentTool( type ) ) {
			return ToolManager.getCurrentTool();
		}

		const tool = this.toolFactory.createTool( type );

		if ( !tool ) {
			TvConsole.error( `Tool not found for type: ${ type }` );
			return
		}

		this.setTool( tool );

		return tool;

	}

	private setTool ( tool: Tool ): void {

		Commands.SetTool( tool );

	}

	setToolbarHeight ( height: number ): void {

		this.height = height;

	}

	getToolbarHeight (): number {

		return this.height;

	}

	setWorldInspector (): void {

		const environment = this.threeService.environment;

		const command = new SetInspectorCommand( WorldSettingInspectorComponent, environment )

		CommandHistory.execute( command );

	}

	setEnvironmentInspector (): void {

		const environment = this.threeService.environment;

		const command = new SetInspectorCommand( EnvironmentInspectorComponent, environment )

		CommandHistory.execute( command );

	}

}
