import { OscSourceFile } from '../../services/osc-source-file';
import { OscConditionType, OscRule, OscTriggeringRule } from '../osc-enums';
import { AbstractPosition } from '../osc-interfaces';
import { OscUtils } from '../osc-utils';
import { AbstractByEntityCondition } from './osc-condition';

export class OscDistanceCondition extends AbstractByEntityCondition {

	public readonly conditionType = OscConditionType.ByEntity_Distance;

	constructor (
		public position?: AbstractPosition,
		public value?: number,
		public freespace?: boolean,
		public alongRoute?: boolean,
		public rule?: OscRule
	) {
		super();
	}

	hasPassed (): boolean {

		if ( this.passed ) {

			return true;

		} else {

			const otherPosition = this.position.getPosition();

			for ( const entityName of this.entities ) {

				const entity = OscSourceFile.openScenario.findEntityOrFail( entityName );

				const distance = entity.position.distanceTo( otherPosition );

				// console.log( 'distance-to-entity', distance );

				const passed = OscUtils.hasRulePassed( this.rule, distance, this.value );

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
