/*
 * Copyright Truesense AI Solutions Pvt Ltd, All Rights Reserved.
 */

import { Rule } from "./tv-enums";

// experiment with generics

interface Value<T> {
	value: T;
}

class ConcreteValue<T> implements Value<T> {
	constructor ( private _value: T ) { }
	get value (): T {
		return this._value;
	}
}

class VariableValue<T> implements Value<T> {
	constructor ( private _var: string ) { }
	get value (): T {
		return window.get( this._var ) || null;
	}
}

export type NumberValue = Value<number>;
export type StringValue = Value<string>;

// class Number extends ConcreteValue<number> { }
class NumberVariable extends VariableValue<number> { }

// class String extends ConcreteValue<string> { }
class StringVariable extends VariableValue<string> { }


class NumberCondition {

	constructor ( public time: NumberValue, public rule: Rule ) { }

}

class StringCondition {

	constructor ( public entityRef: StringValue, public rule: Rule ) { }

}

let conditionWithValue = new NumberCondition( new ConcreteValue( 10 ), Rule.greater_than );
let conditionWithVariable = new NumberCondition( new NumberVariable( '$speed', ), Rule.greater_than );

conditionWithValue.time.value;
conditionWithVariable.time.value;

// conditionWithValue = new StringCondition( new ConcreteValue( '10' ), Rule.greater_than );
// conditionWithVariable = new StringCondition( new StringVariable( '$nae', ), Rule.greater_than );
