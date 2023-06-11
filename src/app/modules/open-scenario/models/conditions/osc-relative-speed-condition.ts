import { OscConditionType, OscRule, OscTriggeringRule } from '../osc-enums';
import { AbstractByEntityCondition } from './osc-condition';
import { OscSourceFile } from '../../services/osc-source-file';
import { OscUtils } from '../osc-utils';

export class OscRelativeSpeedCondition extends AbstractByEntityCondition {

	conditionType = OscConditionType.ByEntity_RelativeSpeed;

	constructor ( public entity: string, public value: number, public rule: OscRule ) {

		super();

	}

	hasPassed (): boolean {

		if ( this.passed ) {

			return true;

		} else {

			const targetEntity = OscSourceFile.openScenario.findEntityOrFail( this.entity );

			for ( const entityName of this.entities ) {

				const entity = OscSourceFile.openScenario.findEntityOrFail( entityName );

				const relativeSpeed = targetEntity.speed - entity.speed;

				const passed = OscUtils.hasRulePassed( this.rule, relativeSpeed, this.value );

				// exit if any of the entity distance is passed
				if ( passed && this.triggeringRule === OscTriggeringRule.Any ) {

					this.passed = true;

					break;
				}

				// exit if any of the entity distance is not passed
				if ( !passed && this.triggeringRule === OscTriggeringRule.All ) {

					this.passed = false;

					break;

				}

			}

			return this.passed;

		}

	}

}
