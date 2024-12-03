import { Project, SyntaxKind, MethodDeclaration, FunctionDeclaration, Node, ScriptTarget, ModuleKind, Type } from 'ts-morph';

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

// Usage
const transformer = new ReturnTypeAdder( [ './src/app/**/*.ts' ] );
transformer.addReturnTypes();
// transformer.saveFiles();
