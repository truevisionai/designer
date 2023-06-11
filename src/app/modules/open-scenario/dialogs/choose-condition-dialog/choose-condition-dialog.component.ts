import { Component, Inject, OnInit } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { OscAtStartCondition } from '../../models/conditions/osc-at-start-condition';
import { AbstractCondition } from '../../models/conditions/osc-condition';
import { OscDistanceCondition } from '../../models/conditions/osc-distance-condition';
import { OscReachPositionCondition } from '../../models/conditions/osc-reach-position-condition';
import { OscSimulationTimeCondition } from '../../models/conditions/osc-simulation-time-condition';
import { OscConditionCategory, OscConditionType, OscRule, OscStoryElementType } from '../../models/osc-enums';

@Component( {
	selector: 'app-choose-condition-dialog',
	templateUrl: './choose-condition-dialog.component.html',
	styleUrls: [ './choose-condition-dialog.component.css' ]
} )
export class ChooseConditionDialogComponent implements OnInit {

	selectedCategory: OscConditionCategory;
	selectedType: OscConditionType;
	selectedCondition: AbstractCondition;

	constructor (
		public dialogRef: MatDialogRef<ChooseConditionDialogComponent>,
		@Inject( MAT_DIALOG_DATA ) public data: any,
	) {

	}

	get types () {
		return OscConditionType;
	}

	get categories () {
		return OscConditionCategory;
	}

	ngOnInit () {

	}

	onCancel () {
		this.dialogRef.close( null );
	}

	onAdd () {

		switch ( this.selectedCategory ) {
			case OscConditionCategory.ByEntity:
				this.createByEntity();
				break;
			case OscConditionCategory.ByState:
				this.createByState();
				break;
			case OscConditionCategory.ByValue:
				this.createByValue();
				break;
		}


		this.dialogRef.close( this.selectedCondition );
	}

	createByValue (): any {
		switch ( this.selectedType ) {
			case OscConditionType.ByValue_Parameter:
				break;
			case OscConditionType.ByValue_TimeOfDay:
				break;
			case OscConditionType.ByValue_SimulationTime:
				this.selectedCondition = new OscSimulationTimeCondition( 0, OscRule.greater_than );
				break;
		}
	}

	createByState (): any {
		switch ( this.selectedType ) {
			case OscConditionType.ByState_AfterTermination:
				break;
			case OscConditionType.ByState_AtStart:
				this.selectedCondition = new OscAtStartCondition( 'actName', OscStoryElementType.act );
				break;
			case OscConditionType.ByState_Command:
				break;
			case OscConditionType.ByState_Signal:
				break;
			case OscConditionType.ByState_Controller:
				break;
		}
	}

	createByEntity (): any {
		switch ( this.selectedType ) {
			case OscConditionType.ByEntity_EndOfRoad:
				break;
			case OscConditionType.ByEntity_Collision:
				break;
			case OscConditionType.ByEntity_Offroad:
				break;
			case OscConditionType.ByEntity_TimeHeadway:
				break;
			case OscConditionType.ByEntity_TimeToCollision:
				break;
			case OscConditionType.ByEntity_Acceleration:
				break;
			case OscConditionType.ByEntity_StandStill:
				break;
			case OscConditionType.ByEntity_Speed:
				break;
			case OscConditionType.ByEntity_RelativeSpeed:
				break;
			case OscConditionType.ByEntity_TraveledDistance:
				break;
			case OscConditionType.ByEntity_ReachPosition:
				this.selectedCondition = new OscReachPositionCondition();
				break;
			case OscConditionType.ByEntity_Distance:
				this.selectedCondition = new OscDistanceCondition();
				break;
			case OscConditionType.ByEntity_RelativeDistance:
				break;
		}
	}
}
