import { Component, HostListener, Input, OnInit } from '@angular/core';
import { ContextMenuType, MenuService } from 'app/services/menu.service';
import { ActionFactory } from '../../builders/action-factory';
import { ConditionFactory } from '../../builders/condition-factory';
import { Condition } from '../../models/conditions/tv-condition';
import { PrivateAction } from '../../models/private-action';
import { TvAction } from '../../models/tv-action';
import { EntityObject } from '../../models/tv-entities';
import { ActionType, ConditionType } from '../../models/tv-enums';
import { TvEvent } from '../../models/tv-event';
import { ScenarioInstance } from '../../services/scenario-instance';

@Component( {
	selector: 'app-event-editor',
	templateUrl: './event-editor.component.html',
	styleUrls: [ './event-editor.component.scss' ]
} )
export class EventEditorComponent implements OnInit {

	@Input() entity: EntityObject;
	@Input() event: TvEvent;

	actionType = ActionType;
	conditionType = ConditionType;

	get scenario () {
		return ScenarioInstance.scenario;
	}

	constructor (
		private menuService: MenuService
	) {
	}

	ngOnInit () {
	}

	onAddCondition ( $type: ConditionType ) {

		if ( $type !== null ) {

			const condition = ConditionFactory.createCondition( $type, this.entity );

			this.event.addStartCondition( condition );

			this.conditionClicked( condition );

		}

	}

	removeCondition ( $condition: Condition ) {

		this.event.removeCondition( $condition );

	}

	removeAction ( action: TvAction ) {

		this.event.removeAction( action as PrivateAction );

	}

	onAddEventAction ( $type: ActionType ) {

		if ( $type !== null ) {

			const action = ActionFactory.createActionWithoutName( $type, this.entity );

			this.event.addAction( action );

			this.actionClicked( action );

		}

	}

	actionClicked ( action: TvAction ) {

	}

	conditionClicked ( condition: Condition ) {

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
				label: 'Delete ' + action.label,
				click: () => this.removeAction( action ),
			},
		] );

		this.menuService.showContextMenu( ContextMenuType.HIERARCHY );
	}

	showConditionMenu ( $event, condition: Condition ) {

		$event.preventDefault();
		$event.stopPropagation();

		this.menuService.registerContextMenu( ContextMenuType.HIERARCHY, [
			{
				label: 'Delete ' + condition.label,
				click: () => this.removeCondition( condition ),
			},
		] );

		this.menuService.showContextMenu( ContextMenuType.HIERARCHY );
	}

	isOpen = false;

	toggle ( $event: MouseEvent ) {

		$event.preventDefault();
		$event.stopPropagation();

		this.isOpen = !this.isOpen;

	}

	deleteManeuver ( $event: MouseEvent ) {

		$event.preventDefault();
		$event.stopPropagation();

		// this.entity.removeEvent( this.event );

	}
}
