using AutoMapper;
using CatalogOrders.Application.DTOs;
using CatalogOrders.Domain.Interfaces;

namespace CatalogOrders.Application.UseCases.Customers;

public class UpdateCustomerUseCase
{
    private readonly IUnitOfWork _unitOfWork;
    private readonly IMapper _mapper;

    public UpdateCustomerUseCase(IUnitOfWork unitOfWork, IMapper mapper)
    {
        _unitOfWork = unitOfWork;
        _mapper = mapper;
    }

    public async Task<CustomerDto> Execute(int id, UpdateCustomerDto dto, CancellationToken cancellationToken = default)
    {
        // Buscar cliente
        var customer = await _unitOfWork.Customers.GetByIdAsync(id, cancellationToken);
        if (customer == null)
        {
            throw new KeyNotFoundException($"Cliente com ID {id} não encontrado.");
        }

        // Validar se novo email já existe (se mudou)
        if (customer.Email != dto.Email)
        {
            var existingByEmail = await _unitOfWork.Customers.GetByEmailAsync(dto.Email, cancellationToken);
            if (existingByEmail != null && existingByEmail.Id != id)
            {
                throw new InvalidOperationException($"Cliente com email '{dto.Email}' já existe.");
            }
        }

        // Validar se novo documento já existe (se mudou)
        if (customer.Document != dto.Document)
        {
            var existingByDocument = await _unitOfWork.Customers.GetByDocumentAsync(dto.Document, cancellationToken);
            if (existingByDocument != null && existingByDocument.Id != id)
            {
                throw new InvalidOperationException($"Cliente com documento '{dto.Document}' já existe.");
            }
        }

        // Atualizar propriedades
        customer.Name = dto.Name;
        customer.Email = dto.Email;
        customer.Document = dto.Document;

        // Salvar alterações
        await _unitOfWork.Customers.UpdateAsync(customer, cancellationToken);
        await _unitOfWork.SaveChangesAsync(cancellationToken);

        // Converter Entity para DTO
        return _mapper.Map<CustomerDto>(customer);
    }
}

