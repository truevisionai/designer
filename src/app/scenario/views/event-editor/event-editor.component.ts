/*
 * Copyright Truesense AI Solutions Pvt Ltd, All Rights Reserved.
 */

import { Component, HostListener, Input, OnInit } from '@angular/core';
import { ContextMenuType, MenuService } from 'app/services/menu.service';
import { ConditionFactory } from '../../builders/condition-factory';
import { ScenarioElementFactory } from '../../builders/scenario-element-factory';
import { Condition } from '../../models/conditions/tv-condition';
import { ScenarioEntity } from '../../models/entities/scenario-entity';
import { PrivateAction } from '../../models/private-action';
import { TvAction } from '../../models/tv-action';
import { ActionType, ConditionType } from '../../models/tv-enums';
import { TvEvent } from '../../models/tv-event';
import { ScenarioService } from '../../services/scenario.service';
import { Log } from 'app/core/utils/log';

@Component( {
	selector: 'app-event-editor',
	templateUrl: './event-editor.component.html',
	styleUrls: [ './event-editor.component.scss' ]
} )
export class EventEditorComponent implements OnInit {

	@Input() entity: ScenarioEntity;
	@Input() event: TvEvent;

	ACTION = ActionType;
	CONDITION = ConditionType;

	@Input() isOpen = true;

	constructor (
		private menuService: MenuService,
		private elementFactory: ScenarioElementFactory,
		private scenarioService: ScenarioService
	) {
	}

	get scenario () {
		return this.scenarioService.getScenario();
	}

	ngOnInit (): void {
	}

	addCondition ( $type: ConditionType ): void {

		const condition = ConditionFactory.createCondition( $type, this.entity );

		this.event.addStartCondition( condition );

	}

	addAction ( $type: ActionType ): void {

		const action = this.elementFactory.createEventAction( $type, this.entity );

		this.event.addNewAction( action.name, action );

	}

	removeAction ( action: TvAction ): void {

		this.event.removeAction( action as PrivateAction );

	}

	removeCondition ( condition: Condition ): void {

		this.event.removeCondition( condition );

	}

	@HostListener( 'contextmenu', [ '$event' ] )
	onContextMenu ( $event ): void {

		$event.preventDefault();
		$event.stopPropagation();

		this.menuService.registerContextMenu( ContextMenuType.HIERARCHY, [
			{
				label: 'ComponentMenu',
				enabled: false,
			},
			{
				label: 'Delete',
				click: () => Log.info( 'delete' ),
			},
		] );

		this.menuService.showContextMenu( ContextMenuType.HIERARCHY );
	}

	toggle ( $event: MouseEvent ): void {

		$event.preventDefault();
		$event.stopPropagation();

		this.isOpen = !this.isOpen;

	}

	delete ( $event: MouseEvent ): void {

		$event.preventDefault();
		$event.stopPropagation();

		this.scenario.storyboard.removeEvent( this.event );

	}
}
