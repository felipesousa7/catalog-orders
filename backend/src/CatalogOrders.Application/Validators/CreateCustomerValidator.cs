using CatalogOrders.Application.DTOs;
using FluentValidation;
using System.Text.RegularExpressions;

namespace CatalogOrders.Application.Validators;

public class CreateCustomerValidator : AbstractValidator<CreateCustomerDto>
{
    public CreateCustomerValidator()
    {
        RuleFor(x => x.Name)
            .NotEmpty().WithMessage("Nome é obrigatório")
            .MaximumLength(200).WithMessage("Nome deve ter no máximo 200 caracteres");

        RuleFor(x => x.Email)
            .NotEmpty().WithMessage("Email é obrigatório")
            .EmailAddress().WithMessage("Email deve ter um formato válido")
            .MaximumLength(200).WithMessage("Email deve ter no máximo 200 caracteres");

        RuleFor(x => x.Document)
            .NotEmpty().WithMessage("Documento é obrigatório")
            .MaximumLength(20).WithMessage("Documento deve ter no máximo 20 caracteres")
            .Must(BeValidDocument).WithMessage("Documento inválido (CPF ou CNPJ)");
    }

    private bool BeValidDocument(string document)
    {
        if (string.IsNullOrWhiteSpace(document))
            return false;

        // Remove caracteres não numéricos
        var cleanDocument = Regex.Replace(document, @"[^\d]", "");

        // Valida CPF (11 dígitos) ou CNPJ (14 dígitos)
        return cleanDocument.Length == 11 || cleanDocument.Length == 14;
    }
}

