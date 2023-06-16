import { Component, Input, OnInit } from '@angular/core';
import { AbstractCondition } from 'app/modules/scenario/models/conditions/tv-condition';
import { OffRoadCondition } from 'app/modules/scenario/models/conditions/tv-off-road-condition';
import { SetValueCommand } from 'app/modules/three-js/commands/set-value-command';
import { CommandHistory } from 'app/services/command-history';

@Component( {
	selector: 'app-off-road-condition-editor',
	templateUrl: './off-road-condition-editor.component.html',
	styleUrls: [ './off-road-condition-editor.component.scss' ]
} )
export class OffRoadConditionEditorComponent {

	@Input() condition: AbstractCondition;

	get offRoadCondition () {

		return this.condition as OffRoadCondition;

	}

	onDurationChanged ( $duration: number ) {

		CommandHistory.execute( new SetValueCommand( this.offRoadCondition, 'duration', $duration ) )

	}

}
