Design patterns are typical solutions to common problems in software design. They define the skeleton for a particular type of software problem, and developers can customize these solutions to solve their own specific problems. Here are ten popular design patterns, explained with brief TypeScript examples and how they relate to the SOLID principles.

1. **Singleton Pattern**: Ensures a class has only one instance and provides a global point of access to it. This pattern helps with the Single Responsibility principle, as it controls the instantiation of the class itself.

    ```typescript
    class Singleton {
        private static instance: Singleton;

        private constructor() {
            // private constructor logic
        }

        public static getInstance(): Singleton {
            if (!Singleton.instance) {
                Singleton.instance = new Singleton();
            }
            return Singleton.instance;
        }
    }
    ```

2. **Factory Method Pattern**: Defines an interface for creating an object but lets subclasses alter the type of objects that will be created. This aligns with the Open/Closed principle, as it allows extension without modifying existing code.

    ```typescript
    interface Product {
        doStuff(): void;
    }

    class ConcreteProductA implements Product {
        doStuff(): void {
            console.log('Product A behavior');
        }
    }

    class ConcreteProductB implements Product {
        doStuff(): void {
            console.log('Product B behavior');
        }
    }

    abstract class Creator {
        public abstract factoryMethod(): Product;

        public someOperation(): void {
            let product = this.factoryMethod();
            product.doStuff();
        }
    }

    class ConcreteCreatorA extends Creator {
        public factoryMethod(): Product {
            return new ConcreteProductA();
        }
    }

    class ConcreteCreatorB extends Creator {
        public factoryMethod(): Product {
            return new ConcreteProductB();
        }
    }
    ```

3. **Abstract Factory Pattern**: Offers an interface for creating families of related or dependent objects without specifying their concrete classes. This pattern respects the Open/Closed principle, allowing for the introduction of new factories without changing the code that uses the factory.

    ```typescript
    // Abstract products
    interface Button {
        paint(): void;
    }

    interface Checkbox {
        paint(): void;
    }

    // Concrete products
    class WinButton implements Button {
        public paint(): void {
            console.log('Windows-style button');
        }
    }

    class MacButton implements Button {
        public paint(): void {
            console.log('Mac-style button');
        }
    }

    class WinCheckbox implements Checkbox {
        public paint(): void {
            console.log('Windows-style checkbox');
        }
    }

    class MacCheckbox implements Checkbox {
        public paint(): void {
            console.log('Mac-style checkbox');
        }
    }

    // Abstract factory
    interface GUIFactory {
        createButton(): Button;
        createCheckbox(): Checkbox;
    }

    // Concrete factories
    class WinFactory implements GUIFactory {
        public createButton(): Button {
            return new WinButton();
        }

        public createCheckbox(): Checkbox {
            return new WinCheckbox();
        }
    }

    class MacFactory implements GUIFactory {
        public createButton(): Button {
            return new MacButton();
        }

        public createCheckbox(): Checkbox {
            return new MacCheckbox();
        }
    }
    ```

4. **Builder Pattern**: Allows constructing a complex object step by step, and the final step returns the object. The process of constructing an object is isolated from the main code. This pattern supports the Single Responsibility Principle by isolating the complexity of construction from the business logic.

    ```typescript
    interface Builder {
        buildPartA(): void;
        buildPartB(): void;
        getProduct(): Product;
    }

    class ConcreteBuilder implements Builder {
        private product: Product;

        constructor() {
            this.product = new Product();
        }

        public buildPartA(): void {
            this.product.addPart('PartA');
        }

        public buildPartB(): void {
            this.product.addPart('PartB');
        }

        public getProduct(): Product {
            return this.product;
        }
    }

    class Product {
        private parts: string[] = [];

        public addPart(part: string): void {
            this.parts.push(part);
        }

        public listParts(): void {
            console.log(`Product parts: ${this.parts.join(', ')}`);
        }
    }

    class Director {
        public construct(builder: Builder): void {
            builder.buildPartA();
            builder.buildPartB();
        }
    }
    ```

5. **Prototype Pattern**: Creates new objects by copying an existing object, known as the prototype. This pattern upholds the Open/Closed principle since you can introduce new types of objects without changing the code that copies the objects.

    ```typescript
    interface Clonable {
        clone(): Clonable;
    }

    class Prototype implements Clonable {
        constructor(private prototypeData: number) {}

        clone(): Prototype {
            return new Prototype(this.prototypeData);
        }
    }
    ```

6. **Adapter Pattern**: Allows the interface of an existing class to be used as another interface. It is often used to make existing classes work with others without modifying their source code. This relates to the Open/Closed principle as it allows extension without modification.

    ```typescript
    interface Target {
        request(): string;
    }

    class Adaptee {
        public specificRequest(): string {
            return 'specific behavior of the Adaptee';
        }
    }

    class Adapter implements Target {
        constructor(private adaptee: Adaptee) {}

        public request(): string {
            return this.adaptee.specificRequest();
        }
    }
    ```

7. **Decorator Pattern**: Lets you attach new behaviors to objects by placing these objects inside special wrapper objects that contain the behaviors. It corresponds with the Single Responsibility Principle, as it allows functionality to be divided between classes with unique areas of concern.

    ```typescript
    interface Component {
        operation(): string;
    }

    class ConcreteComponent implements Component {
        public operation(): string {
            return 'ConcreteComponent';
        }
    }

    class Decorator implements Component {
        constructor(protected component: Component) {}

        public operation(): string {
            return this.component.operation();
        }
    }

    class ConcreteDecoratorA extends Decorator {
        public operation(): string {
            return `ConcreteDecoratorA(${super.operation()})`;
        }
    }

    class ConcreteDecoratorB extends Decorator {
        public operation(): string {
            return `ConcreteDecoratorB(${super.operation()})`;
        }
    }
    ```

8. **Observer Pattern**: Defines a subscription mechanism to notify multiple objects about any events that happen to the object they're observing. It supports the Open/Closed principle as it allows introducing new subscriber classes without changing the publisher's code and vice versa.

    ```typescript
    interface Observer {
        update(subject: Subject): void;
    }

    interface Subject {
        attach(observer: Observer): void;
        detach(observer: Observer): void;
        notify(): void;
    }

    class ConcreteSubject implements Subject {
        public state: number;
        private observers: Observer[] = [];

        public attach(observer: Observer): void {
            const isExist = this.observers.includes(observer);
            if (isExist) {
                return console.log('Subject: Observer has been attached already.');
            }

            console.log('Subject: Attached an observer.');
            this.observers.push(observer);
        }

        public detach(observer: Observer): void {
            const observerIndex = this.observers.indexOf(observer);


            if (observerIndex === -1) {
                return console.log('Subject: Nonexistent observer.');
            }

            this.observers.splice(observerIndex, 1);
            console.log('Subject: Detached an observer.');
        }

        public notify(): void {
            console.log('Subject: Notifying observers...');
            for (const observer of this.observers) {
                observer.update(this);
            }
        }

        public someBusinessLogic(): void {
            console.log('Subject: I\'m doing something important.');
            this.state = Math.floor(Math.random() * (10 + 1));

            console.log(`Subject: My state has just changed to: ${this.state}`);
            this.notify();
        }
    }

    class ConcreteObserverA implements Observer {
        public update(subject: Subject): void {
            if (subject instanceof ConcreteSubject && subject.state < 3) {
                console.log('ConcreteObserverA: Reacted to the event.');
            }
        }
    }

    class ConcreteObserverB implements Observer {
        public update(subject: Subject): void {
            if (subject instanceof ConcreteSubject && (subject.state === 0 || subject.state >= 2)) {
                console.log('ConcreteObserverB: Reacted to the event.');
            }
        }
    }
    ```

9. **Strategy Pattern**: Enables selecting an algorithm at runtime. Instead of implementing a single algorithm directly, code receives run-time instructions as to which in a family of algorithms to use. This pattern aligns with the Open/Closed principle by allowing the introduction of new strategies without changing the context.

    ```typescript
    interface Strategy {
        doAlgorithm(data: number[]): number[];
    }

    class ConcreteStrategyA implements Strategy {
        public doAlgorithm(data: number[]): number[] {
            return data.sort();
        }
    }

    class ConcreteStrategyB implements Strategy {
        public doAlgorithm(data: number[]): number[] {
            return data.reverse();
        }
    }

    class Context {
        private strategy: Strategy;

        constructor(strategy: Strategy) {
            this.strategy = strategy;
        }

        public setStrategy(strategy: Strategy) {
            this.strategy = strategy;
        }

        public doSomeBusinessLogic(data: number[]): number[] {
            return this.strategy.doAlgorithm(data);
        }
    }
    ```

10. **Command Pattern**: Turns a request into a stand-alone object that contains all information about the request. This transformation lets parameterize methods with different requests, delay or queue a request's execution, and support undoable operations. It assists in adhering to the Single Responsibility Principle by separating command execution from the implementer.

    ```typescript
    interface Command {
        execute(): void;
    }

    class SimpleCommand implements Command {
        private payload: string;

        constructor(payload: string) {
            this.payload = payload;
        }

        public execute(): void {
            console.log(`SimpleCommand: See, I can do simple things like printing (${this.payload})`);
        }
    }

    class ComplexCommand implements Command {
        private receiver: Receiver;

        // Complex commands can be composed of several other commands
        constructor(receiver: Receiver) {
            this.receiver = receiver;
        }

        public execute(): void {
            console.log('ComplexCommand: Complex stuff should be done by a receiver object.');
            this.receiver.doSomething();
            this.receiver.doSomethingElse();
        }
    }

    class Receiver {
        public doSomething(): void {
            console.log('Receiver: Working on (something)');
        }

        public doSomethingElse(): void {
            console.log('Receiver: Also working on (something else)');
        }
    }

    class Invoker {
        private onStart: Command;
        private onFinish: Command;

        public setOnStart(command: Command): void {
            this.onStart = command;
        }

        public setOnFinish(command: Command): void {
            this.onFinish = command;
        }

        public doSomethingImportant(): void {
            console.log('Invoker: Does anybody want something done before I begin?');
            if (this.onStart instanceof Command) {
                this.onStart.execute();
            }

            console.log('Invoker: ...doing something really important...');

            console.log('Invoker: Does anybody want something done after I finish?');
            if (this.onFinish instanceof Command) {
                this.onFinish.execute();
            }
        }
    }
    ```

In all these patterns, SOLID principles are preserved as follows:

- **Single Responsibility Principle**: Each pattern ensures classes have single responsibility and delegates all other functionality to respective classes.
- **Open/Closed Principle**: These design patterns enable us to introduce new behaviors without changing existing codebases, following the "open for extension, closed for modification" mantra.
- **Liskov Substitution Principle**: The patterns (especially Factory, Strategy, and Command) support substitutability for the base class with its derived class objects.
- **Interface Segregation Principle**: Clients aren't forced to depend on interfaces they don't use, particularly observable in Strategy, Command, and Builder patterns.
- **Dependency Inversion Principle**: High-level modules are not dependent on low-level modules. Both should depend on abstractions. This is evident in patterns like Abstract Factory, Dependency Injection, and Strategy.

By following design patterns, the codebase maintains a high level of organization, scalability, and maintainability. These patterns help in reducing tight coupling and make codebases more modular and easier to manage, aligning with best practices and SOLID principles.
