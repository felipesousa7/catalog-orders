using CatalogOrders.Application.DTOs;
using CatalogOrders.Application.UseCases.Customers;
using Microsoft.AspNetCore.Mvc;

namespace CatalogOrders.Api.Controllers;

[ApiController]
[Route("api/[controller]")]
public class CustomersController : ControllerBase
{
    private readonly CreateCustomerUseCase _createUseCase;
    private readonly UpdateCustomerUseCase _updateUseCase;
    private readonly GetCustomerUseCase _getUseCase;
    private readonly ListCustomersUseCase _listUseCase;
    private readonly DeleteCustomerUseCase _deleteUseCase;

    public CustomersController(
        CreateCustomerUseCase createUseCase,
        UpdateCustomerUseCase updateUseCase,
        GetCustomerUseCase getUseCase,
        ListCustomersUseCase listUseCase,
        DeleteCustomerUseCase deleteUseCase)
    {
        _createUseCase = createUseCase;
        _updateUseCase = updateUseCase;
        _getUseCase = getUseCase;
        _listUseCase = listUseCase;
        _deleteUseCase = deleteUseCase;
    }

    [HttpPost]
    public async Task<ActionResult<ApiResponseDto<CustomerDto>>> Create([FromBody] CreateCustomerDto dto)
    {
        try
        {
            var result = await _createUseCase.Execute(dto);
            return Ok(ApiResponseDto<CustomerDto>.Success(result));
        }
        catch (InvalidOperationException ex)
        {
            return BadRequest(ApiResponseDto<CustomerDto>.Error(ex.Message));
        }
        catch (Exception ex)
        {
            return StatusCode(500, ApiResponseDto<CustomerDto>.Error($"Erro ao criar cliente: {ex.Message}"));
        }
    }

    [HttpGet("{id}")]
    public async Task<ActionResult<ApiResponseDto<CustomerDto>>> GetById(int id)
    {
        try
        {
            var result = await _getUseCase.Execute(id);
            return Ok(ApiResponseDto<CustomerDto>.Success(result));
        }
        catch (KeyNotFoundException ex)
        {
            return NotFound(ApiResponseDto<CustomerDto>.Error(ex.Message));
        }
        catch (Exception ex)
        {
            return StatusCode(500, ApiResponseDto<CustomerDto>.Error($"Erro ao buscar cliente: {ex.Message}"));
        }
    }

    [HttpGet]
    public async Task<ActionResult<ApiResponseDto<PagedResultDto<CustomerListDto>>>> GetAll(
        [FromQuery] int pageNumber = 1,
        [FromQuery] int pageSize = 10,
        [FromQuery] string? searchTerm = null,
        [FromQuery] string? sortBy = null,
        [FromQuery] bool sortDescending = false)
    {
        try
        {
            var pagination = new PaginationDto
            {
                PageNumber = pageNumber,
                PageSize = pageSize,
                SearchTerm = searchTerm,
                SortBy = sortBy,
                SortDescending = sortDescending
            };

            var result = await _listUseCase.Execute(pagination);
            return Ok(ApiResponseDto<PagedResultDto<CustomerListDto>>.Success(result));
        }
        catch (Exception ex)
        {
            return StatusCode(500, ApiResponseDto<PagedResultDto<CustomerListDto>>.Error($"Erro ao listar clientes: {ex.Message}"));
        }
    }

    [HttpPut("{id}")]
    public async Task<ActionResult<ApiResponseDto<CustomerDto>>> Update(int id, [FromBody] UpdateCustomerDto dto)
    {
        try
        {
            var result = await _updateUseCase.Execute(id, dto);
            return Ok(ApiResponseDto<CustomerDto>.Success(result));
        }
        catch (KeyNotFoundException ex)
        {
            return NotFound(ApiResponseDto<CustomerDto>.Error(ex.Message));
        }
        catch (InvalidOperationException ex)
        {
            return BadRequest(ApiResponseDto<CustomerDto>.Error(ex.Message));
        }
        catch (Exception ex)
        {
            return StatusCode(500, ApiResponseDto<CustomerDto>.Error($"Erro ao atualizar cliente: {ex.Message}"));
        }
    }

    [HttpDelete("{id}")]
    public async Task<ActionResult<ApiResponseDto<object?>>> Delete(int id)
    {
        try
        {
            var deleted = await _deleteUseCase.Execute(id);
            if (deleted)
            {
                return Ok(ApiResponseDto<object?>.Success(null, "Cliente excluído com sucesso"));
            }
            return BadRequest(ApiResponseDto<object?>.Error("Erro ao excluir cliente"));
        }
        catch (KeyNotFoundException ex)
        {
            return NotFound(ApiResponseDto<object?>.Error(ex.Message));
        }
        catch (InvalidOperationException ex)
        {
            return BadRequest(ApiResponseDto<object?>.Error(ex.Message));
        }
        catch (Exception ex)
        {
            return StatusCode(500, ApiResponseDto<object?>.Error($"Erro ao excluir cliente: {ex.Message}"));
        }
    }
}

