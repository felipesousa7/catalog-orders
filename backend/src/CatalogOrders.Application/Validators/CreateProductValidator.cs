using CatalogOrders.Application.DTOs;
using FluentValidation;

namespace CatalogOrders.Application.Validators;

public class CreateProductValidator : AbstractValidator<CreateProductDto>
{
    public CreateProductValidator()
    {
        RuleFor(x => x.Name)
            .NotEmpty().WithMessage("Nome é obrigatório")
            .MaximumLength(200).WithMessage("Nome deve ter no máximo 200 caracteres");

        RuleFor(x => x.Sku)
            .NotEmpty().WithMessage("SKU é obrigatório")
            .MaximumLength(100).WithMessage("SKU deve ter no máximo 100 caracteres")
            .Matches("^[A-Z0-9-]+$").WithMessage("SKU deve conter apenas letras maiúsculas, números e hífens");

        RuleFor(x => x.Price)
            .GreaterThan(0).WithMessage("Preço deve ser maior que zero")
            .LessThanOrEqualTo(999999.99m).WithMessage("Preço não pode ser maior que 999.999,99");

        RuleFor(x => x.StockQty)
            .GreaterThanOrEqualTo(0).WithMessage("Estoque não pode ser negativo");
    }
}

