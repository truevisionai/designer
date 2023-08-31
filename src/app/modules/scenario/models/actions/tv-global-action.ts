/*
 * Copyright Truesense AI Solutions Pvt Ltd, All Rights Reserved.
 */

import { XmlElement } from '../../../tv-map/services/open-drive-parser.service';
import { ScenarioEntity } from '../entities/scenario-entity';
import { Position } from '../position';
import { TvAction } from '../tv-action';
import { ActionCategory, ActionType } from '../tv-enums';
import { ScenarioEnvironment } from './scenario-environment';

export abstract class GlobalAction extends TvAction {

	public category = ActionCategory.global;

}

export class EnvironmentAction extends GlobalAction {

	public actionType: ActionType = ActionType.Global_SetEnvironment;
	public label: string = 'Environment Action';

	constructor ( public env: ScenarioEnvironment ) {

		super();

	}

	static fromXML ( xml: XmlElement ): EnvironmentAction {

		const env = ScenarioEnvironment.fromXML( xml );

		return new EnvironmentAction( env );

	}

	execute ( entity: ScenarioEntity ): void {

		// this.scenario.setEnvironment( this.env );

		this.isCompleted = true;

	}

}

export class AddEntityAction extends GlobalAction {

	public actionType: ActionType = ActionType.Global_AddEntity;
	public label: string = 'AddEntityAction';

	constructor ( private entityRef: string, private position: Position ) {
		super();
	}

	execute ( entity: ScenarioEntity ): void {

		throw new Error( 'Method not implemented.' );

	}
}

export class DeleteEntityAction extends GlobalAction {

	public actionType: ActionType = ActionType.Global_DeleteEntity;
	public label: string = 'DeleteEntityAction';

	constructor ( private entityRef: string ) {
		super();
	}

	execute ( entity: ScenarioEntity ): void {

		throw new Error( 'Method not implemented.' );

	}

}

export class ParameterSetAction extends GlobalAction {

	actionType: ActionType = ActionType.Global_ParameterSet;
	label: string = 'ParameterSetAction';

	constructor ( public parameterRef: string, public value: string ) {
		super();
	}

	execute ( entity: ScenarioEntity ): void {
		throw new Error( 'Method not implemented.' );
	}
}

export class ParameterModifyAction extends GlobalAction {

	actionType: ActionType = ActionType.Global_ParameterModify;
	label: string = 'ParameterModifyAction';

	constructor ( public parameterRef: string, public value: number, private modifyType: 'add' | 'multiply' ) {
		super();
	}

	execute ( entity: ScenarioEntity ): void {
		throw new Error( 'Method not implemented.' );
	}
}

export abstract class InfrastructureAction extends GlobalAction {

}

export class TrafficSignalControllerAction extends InfrastructureAction {

	actionType: ActionType = ActionType.Global_TrafficSignalController;
	label: string;

	constructor ( public trafficSignalControllerRef: string, public phase: string ) {
		super();
	}

	execute ( entity: ScenarioEntity ): void {

	}

}

export class TrafficSignalStateAction extends InfrastructureAction {
	actionType: ActionType = ActionType.Global_TrafficSignalState;
	label: string;

	constructor ( public name: string, public state: string ) {
		super();
	}

	execute ( entity: ScenarioEntity ): void {
	}

}
