using CatalogOrders.Application.DTOs;
using FluentValidation;

namespace CatalogOrders.Application.Validators;

public class UpdateProductValidator : AbstractValidator<UpdateProductDto>
{
    public UpdateProductValidator()
    {
        RuleFor(x => x.Name)
            .NotEmpty().WithMessage("Nome é obrigatório")
            .MaximumLength(200).WithMessage("Nome deve ter no máximo 200 caracteres");

        RuleFor(x => x.Price)
            .GreaterThan(0).WithMessage("Preço deve ser maior que zero")
            .LessThanOrEqualTo(999999.99m).WithMessage("Preço não pode ser maior que 999.999,99");

        RuleFor(x => x.StockQty)
            .GreaterThanOrEqualTo(0).WithMessage("Estoque não pode ser negativo");
    }
}

