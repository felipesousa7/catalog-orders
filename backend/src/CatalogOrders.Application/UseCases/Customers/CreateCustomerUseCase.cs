using AutoMapper;
using CatalogOrders.Application.DTOs;
using CatalogOrders.Domain.Interfaces;

namespace CatalogOrders.Application.UseCases.Customers;

public class CreateCustomerUseCase
{
    private readonly IUnitOfWork _unitOfWork;
    private readonly IMapper _mapper;

    public CreateCustomerUseCase(IUnitOfWork unitOfWork, IMapper mapper)
    {
        _unitOfWork = unitOfWork;
        _mapper = mapper;
    }

    public async Task<CustomerDto> Execute(CreateCustomerDto dto, CancellationToken cancellationToken = default)
    {
        // Validar se email já existe
        var existingByEmail = await _unitOfWork.Customers.GetByEmailAsync(dto.Email, cancellationToken);
        if (existingByEmail != null)
        {
            throw new InvalidOperationException($"Cliente com email '{dto.Email}' já existe.");
        }

        // Validar se documento já existe
        var existingByDocument = await _unitOfWork.Customers.GetByDocumentAsync(dto.Document, cancellationToken);
        if (existingByDocument != null)
        {
            throw new InvalidOperationException($"Cliente com documento '{dto.Document}' já existe.");
        }

        // Converter DTO para Entity
        var customer = _mapper.Map<Domain.Entities.Customer>(dto);

        // Criar cliente
        await _unitOfWork.Customers.CreateAsync(customer, cancellationToken);
        await _unitOfWork.SaveChangesAsync(cancellationToken);

        // Converter Entity para DTO
        return _mapper.Map<CustomerDto>(customer);
    }
}

