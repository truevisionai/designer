import { Project, SyntaxKind, MethodDeclaration, FunctionDeclaration, Node, ScriptTarget, ModuleKind, Type, ArrowFunction } from 'ts-morph';

class ReturnTypeAdder {
	private project: Project;

	constructor ( private fileGlobs: string[] ) {
		this.project = new Project( {
			compilerOptions: {
				strict: false,
				noImplicitAny: true,
				target: ScriptTarget.ES2018,
				module: ModuleKind.CommonJS,
			},
		} );
		this.project.addSourceFilesAtPaths( fileGlobs );
	}

	public addReturnTypes (): void {
		const sourceFiles = this.project.getSourceFiles();

		sourceFiles.forEach( ( sourceFile ) => {
			sourceFile.forEachDescendant( ( node ) => {
				if ( Node.isFunctionDeclaration( node ) || Node.isMethodDeclaration( node ) ) {
					this.processFunctionLikeDeclaration( node );
				}
			} );
			sourceFile.saveSync();
		} );
	}

	// eslint-disable-next-line max-lines-per-function
	private processFunctionLikeDeclaration ( node: FunctionDeclaration | MethodDeclaration ): void {
		if ( !node.getReturnTypeNode() ) {
			const signature = node.getSignature();
			const returnType = signature.getReturnType();

			let returnTypeText: string;

			if ( this.isAnonymousObjectType( returnType ) ) {
				returnTypeText = 'any';
			} else {
				returnTypeText = returnType.getText( node );
			}

			console.log( `Processing function: ${ node.getName ? node.getName() : 'anonymous' }` );
			console.log( `Inferred return type: ${ returnTypeText }` );

			if ( returnTypeText === 'void' ) {
				node.setReturnType( 'void' );
			} else {
				node.setReturnType( returnTypeText );
			}
		}
	}

	// eslint-disable-next-line max-lines-per-function
	private isAnonymousObjectType ( type: Type ): boolean {
		// Handle arrays, tuples, and type references (e.g., generics)
		if ( type.isArray() || type.isTuple() ) {
			const typeArguments = type.getTypeArguments();
			for ( const typeArg of typeArguments ) {
				if ( this.isAnonymousObjectType( typeArg ) ) {
					return true;
				}
			}

			// For arrays without type arguments (e.g., simple arrays)
			if ( type.isArray() ) {
				const arrayElementType = type.getArrayElementType();
				if ( arrayElementType && this.isAnonymousObjectType( arrayElementType ) ) {
					return true;
				}
			}
		}

		if ( type.isObject() ) {
			const symbol = type.getSymbol();
			if ( !symbol ) {
				// No symbol means it's an anonymous type
				return true;
			}

			const name = symbol.getName();
			if ( name === '__type' || name === '__object' ) {
				return true;
			}
		}

		return false;
	}

	public saveFiles (): void {
		this.project.saveSync();
	}
}

// // Usage
// const transformer = new ReturnTypeAdder( [ './src/app/**/*.ts' ] );
// transformer.addReturnTypes();
// // transformer.saveFiles();

class ParameterTypeAdder {
	private project: Project;

	constructor ( private fileGlobs: string[] ) {
		this.project = new Project( {
			// tsConfigFilePath: 'path/to/tsconfig.json', // Update with your tsconfig.json path
		} );
		this.project.addSourceFilesAtPaths( fileGlobs );
	}

	public addParameterTypes () {
		const sourceFiles = this.project.getSourceFiles();

		sourceFiles.forEach( ( sourceFile ) => {
			sourceFile.forEachDescendant( ( node ) => {
				if (
					Node.isFunctionDeclaration( node ) ||
					Node.isMethodDeclaration( node ) ||
					Node.isArrowFunction( node )
				) {
					this.processFunctionLikeDeclaration( node );
				}
			} );
			sourceFile.saveSync();
		} );
	}

	private processFunctionLikeDeclaration (
		node: FunctionDeclaration | MethodDeclaration | ArrowFunction
	) {
		if ( Node.isArrowFunction( node ) ) {
			return;
			// this.ensureArrowFunctionParametersHaveParentheses( node );
		}

		this.processParameters( node );
	}

	private processParameters ( node: FunctionDeclaration | MethodDeclaration | ArrowFunction ) {
		node.getParameters().forEach( ( param ) => {
			if ( !param.getTypeNode() ) {
				// Attempt to infer the parameter's type
				const type = param.getType();
				let typeText = type.getText( param );

				// If the type is anonymous or 'any', set it to 'any'
				if ( this.isAnonymousOrAnyType( type ) || typeText === 'any' ) {
					typeText = 'any';
				}

				console.log( `Processing parameter: ${ param.getName() }` );
				console.log( `Inferred type: ${ typeText }` );

				// Set the parameter's type
				param.setType( typeText );
			}
		} );
	}

	private isAnonymousOrAnyType ( type: Type ): boolean {
		// Check if the type is 'any'
		if ( type.getText() === 'any' ) {
			return true;
		}

		// Check for anonymous types
		if ( type.isAnonymous() || type.isObject() || type.isInterface() ) {
			const symbol = type.getSymbol();
			if ( !symbol ) {
				return true;
			}

			const name = symbol.getName();
			if ( name.startsWith( '__' ) ) {
				return true;
			}
		}

		return false;
	}

	private ensureArrowFunctionParametersHaveParentheses ( arrowFunction: ArrowFunction ) {
		const parameters = arrowFunction.getParameters();

		// If there's only one parameter and no parentheses, add parentheses
		if ( parameters.length === 1 ) {
			const paramText = parameters[ 0 ].getText();
			const arrowFunctionText = arrowFunction.getText();
			const parameterText = arrowFunctionText.substring( 0, arrowFunctionText.indexOf( '=>' ) ).trim();

			if ( !parameterText.startsWith( '(' ) ) {
				// Replace the arrow function with one that has parentheses around the parameter
				const newArrowFunctionText = `(${ paramText }) => ${ arrowFunction.getBody().getText() }`;
				arrowFunction.replaceWithText( newArrowFunctionText );
			}
		}
	}

	public saveFiles () {
		this.project.saveSync();
	}
}

// Usage
const parameterTypeAdder = new ParameterTypeAdder( [ './src/app/models/**/*.ts' ] ); // Adjust the glob pattern as needed
parameterTypeAdder.addParameterTypes();
parameterTypeAdder.saveFiles();
