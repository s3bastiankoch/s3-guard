package main

import (
	"fmt"
	"os"

	"github.com/open-policy-agent/opa/ast"
	"github.com/open-policy-agent/opa/cmd"
	"github.com/open-policy-agent/opa/rego"
	"github.com/open-policy-agent/opa/types"
)

func main() {

	rego.RegisterBuiltin1(
		&rego.Function{
			Name: "tabular.allow_columns",
			Decl: types.NewFunction(types.Args(types.A), types.A),
		},
		func(bctx rego.BuiltinContext, a *ast.Term) (*ast.Term, error) {

			// Input to the function is an array of strings
			x, ok := a.Value.(*ast.Array)
			if !ok {
				return nil, fmt.Errorf("operand not array")
			}

			inputTerms := []*ast.Term{}

			x.Iter(func(value *ast.Term) error {
				term, ok := value.Value.(ast.String)

				if !ok {
					return fmt.Errorf("unexpected type in array")
				}

				inputTerms = append(inputTerms, ast.StringTerm(string(term)))
				return nil
			})
		
			// Return object with "allow" key set to true
			return ast.ObjectTerm(
				ast.Item(ast.StringTerm("key"), ast.StringTerm("tabular.allow_columns")),
				ast.Item(ast.StringTerm("input"), ast.ArrayTerm(inputTerms...),
			)), nil
		},
	)

	rego.RegisterBuiltin1(
		&rego.Function{
			Name: "purpose",
			Decl: types.NewFunction(types.Args(types.A), types.A),
		},
		func(bctx rego.BuiltinContext, a *ast.Term) (*ast.Term, error) {

			input, ok := a.Value.(ast.Object)
			if !ok {
				return nil, fmt.Errorf("operand not object")
			}

			transformersTerm := input.Get(ast.StringTerm("transformers"))
			if transformersTerm == nil {
				return nil, fmt.Errorf("missing 'transformers' key")
			}

			// Turn transformersTerm into array
			transformers, ok := transformersTerm.Value.(*ast.Array)
			if !ok {
				return nil, fmt.Errorf("'transformers' key not array")
			}
			combinedTransformers := []*ast.Term{}

			// Read "specifies" key from input, if it exists
			specifiesTerm := input.Get(ast.StringTerm("specifies"))
			if specifiesTerm != nil {
				// Specifies is an array of transformer, combine with combinedTransformers
				specifies, ok := specifiesTerm.Value.(*ast.Array)
				if !ok {
					return nil, fmt.Errorf("'specifies' key not array")
				}

				specifies.Iter(func(value *ast.Term) error {
					transformers, ok := value.Value.(*ast.Array)

					if !ok {
						return fmt.Errorf("unexpected error")
					}

					transformers.Iter(func(term *ast.Term) error {
						// Add transformer to combinedTransformers
						combinedTransformers = append(combinedTransformers, term)

						return nil
					})
					
					return nil
				})
			}

			// Iterate over transformers
			transformers.Iter(func(value *ast.Term) error {
				// Add transformer to combinedTransformers
				combinedTransformers = append(combinedTransformers, value)
				return nil
			})
			
			// Return combinedTransformers as array of transformers
			return ast.ArrayTerm(combinedTransformers...), nil
		},
	)

	if err := cmd.RootCommand.Execute(); err != nil {
		fmt.Println(err)
		os.Exit(1)
	}
}