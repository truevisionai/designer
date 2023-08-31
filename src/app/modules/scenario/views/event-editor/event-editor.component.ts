/*
 * Copyright Truesense AI Solutions Pvt Ltd, All Rights Reserved.
 */

import { Component, HostListener, Input, OnInit } from '@angular/core';
import { ContextMenuType, MenuService } from 'app/services/menu.service';
import { ActionFactory } from '../../builders/action-factory';
import { ScenarioElementFactory } from '../../builders/scenario-element-factory';
import { ConditionFactory } from '../../builders/condition-factory';
import { PrivateAction } from '../../models/private-action';
import { TvAction } from '../../models/tv-action';
import { ScenarioEntity } from '../../models/entities/scenario-entity';
import { ActionType, ConditionType } from '../../models/tv-enums';
import { TvEvent } from '../../models/tv-event';
import { ScenarioInstance } from '../../services/scenario-instance';
import { Condition } from '../../models/conditions/tv-condition';

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

	get scenario () {
		return ScenarioInstance.scenario;
	}

	constructor (
		private menuService: MenuService
	) {
	}

	ngOnInit () {
	}

	addCondition ( $type: ConditionType ) {

		const condition = ConditionFactory.createCondition( $type, this.entity );

		this.event.addStartCondition( condition );

	}

	addAction ( $type: ActionType ) {

		const action = ScenarioElementFactory.createEventAction( $type, this.entity );

		this.event.addNewAction( action.name, action );

	}

	removeAction ( action: TvAction ) {

		this.event.removeAction( action as PrivateAction );

	}

	removeCondition ( condition: Condition ) {

		this.event.removeCondition( condition );

	}

	@HostListener( 'contextmenu', [ '$event' ] )
	onContextMenu ( $event ) {

		$event.preventDefault();
		$event.stopPropagation();

		this.menuService.registerContextMenu( ContextMenuType.HIERARCHY, [
			{
				label: 'ComponentMenu',
				enabled: false,
			},
			{
				label: 'Delete',
				click: () => console.log( 'delete' ),
			},
		] );

		this.menuService.showContextMenu( ContextMenuType.HIERARCHY );
	}

	toggle ( $event: MouseEvent ) {

		$event.preventDefault();
		$event.stopPropagation();

		this.isOpen = !this.isOpen;

	}

	delete ( $event: MouseEvent ) {

		$event.preventDefault();
		$event.stopPropagation();

		ScenarioInstance.scenario.storyboard.removeEvent( this.event );

	}
}
