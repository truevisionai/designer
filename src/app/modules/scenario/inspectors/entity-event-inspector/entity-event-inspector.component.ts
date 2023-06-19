import { Component, HostListener, Input, OnInit, ViewChild } from '@angular/core';
import { MatSelect } from '@angular/material/select';
import { ContextMenuType, MenuService } from 'app/services/menu.service';
import { ActionFactory } from '../../builders/action-factory';
import { ConditionFactory } from '../../builders/condition-factory';
import { TvAction } from '../../models/tv-action';
import { PrivateAction } from '../../models/private-action';
import { Condition } from '../../models/conditions/tv-condition';
import { EntityObject } from '../../models/tv-entities';
import { ActionType, ConditionType } from '../../models/tv-enums';
import { TvEvent } from '../../models/tv-event';
import { TvScenarioInstance } from '../../services/tv-scenario-instance';

@Component( {
	selector: 'app-entity-event-inspector',
	templateUrl: './entity-event-inspector.component.html',
	styleUrls: [ './entity-event-inspector.component.scss' ]
} )
export class EntityEventInspectorComponent implements OnInit {

	@Input() entity: EntityObject;
	@Input() event: TvEvent;

	selectedAction: TvAction;
	showAction: boolean;
	selectedCondition: Condition;
	showCondition: boolean;

	actionType = ActionType;
	conditionType = ConditionType;

	get scenario () {
		return TvScenarioInstance.openScenario;
	}

	constructor (
		private menuService: MenuService
	) {
	}

	ngOnInit () {
	}

	onAddCondition ( $type: ConditionType, event: TvEvent ) {

		if ( $type !== null ) {

			const condition = ConditionFactory.createCondition( $type, this.entity );

			event.addStartCondition( condition );

			this.conditionClicked( condition );

		}

	}

	removeCondition ( $condition: Condition, event: TvEvent ) {

		event.removeCondition( $condition );

		if ( this.selectedCondition === $condition ) {
			this.selectedCondition = null;
			this.showCondition = false;
		}

	}

	removeAction ( action: TvAction, event: TvEvent ) {

		event.removeAction( action as PrivateAction );

		if ( this.selectedAction === action ) {
			this.selectedAction = null;
			this.showAction = false;
		}

	}

	onAddEventAction ( type: ActionType, event: TvEvent ) {

		if ( type !== null ) {

			const action = ActionFactory.createAction( type, this.entity );

			event.addAction( action );

			this.actionClicked( action );

		}

	}

	actionClicked ( action: TvAction ) {

		this.showCondition = false;

		if ( this.selectedAction === action && this.showAction ) {

			this.showAction = false;
			this.selectedAction = null;

		} else {

			this.showAction = true;
			this.selectedAction = action;

		}

	}

	conditionClicked ( condition: Condition ) {

		this.showAction = false;

		if ( this.selectedCondition === condition && this.showCondition ) {

			this.showCondition = false;
			this.selectedCondition = null;

		} else {

			this.showCondition = true;
			this.selectedCondition = condition;

		}

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

	showActionMenu ( $event, action: TvAction ) {

		$event.preventDefault();
		$event.stopPropagation();

		this.menuService.registerContextMenu( ContextMenuType.HIERARCHY, [
			{
				label: 'Delete ' + action[ 'actionName' ],
				click: () => this.removeAction( action, this.event ),
			},
		] );

		this.menuService.showContextMenu( ContextMenuType.HIERARCHY );
	}

	showConditionMenu ( $event, condition: Condition ) {

		$event.preventDefault();
		$event.stopPropagation();

		this.menuService.registerContextMenu( ContextMenuType.HIERARCHY, [
			{
				label: 'Delete ' + condition.name,
				click: () => this.removeCondition( condition, this.event ),
			},
		] );

		this.menuService.showContextMenu( ContextMenuType.HIERARCHY );
	}

}
