using CatalogOrders.Application.DTOs;
using CatalogOrders.Application.UseCases.Orders;
using Microsoft.AspNetCore.Mvc;

namespace CatalogOrders.Api.Controllers;

[ApiController]
[Route("api/[controller]")]
public class OrdersController : ControllerBase
{
    private readonly CreateOrderUseCase _createUseCase;
    private readonly GetOrderUseCase _getUseCase;
    private readonly ListOrdersUseCase _listUseCase;
    private readonly UpdateOrderStatusUseCase _updateStatusUseCase;

    public OrdersController(
        CreateOrderUseCase createUseCase,
        GetOrderUseCase getUseCase,
        ListOrdersUseCase listUseCase,
        UpdateOrderStatusUseCase updateStatusUseCase)
    {
        _createUseCase = createUseCase;
        _getUseCase = getUseCase;
        _listUseCase = listUseCase;
        _updateStatusUseCase = updateStatusUseCase;
    }

    [HttpPost]
    public async Task<ActionResult<ApiResponseDto<OrderDto>>> Create([FromBody] CreateOrderDto dto)
    {
        try
        {
            var result = await _createUseCase.Execute(dto);
            return Ok(ApiResponseDto<OrderDto>.Success(result));
        }
        catch (KeyNotFoundException ex)
        {
            return NotFound(ApiResponseDto<OrderDto>.Error(ex.Message));
        }
        catch (InvalidOperationException ex)
        {
            return BadRequest(ApiResponseDto<OrderDto>.Error(ex.Message));
        }
        catch (Exception ex)
        {
            return StatusCode(500, ApiResponseDto<OrderDto>.Error($"Erro ao criar pedido: {ex.Message}"));
        }
    }

    [HttpGet("{id}")]
    public async Task<ActionResult<ApiResponseDto<OrderDto>>> GetById(int id)
    {
        try
        {
            var result = await _getUseCase.Execute(id);
            return Ok(ApiResponseDto<OrderDto>.Success(result));
        }
        catch (KeyNotFoundException ex)
        {
            return NotFound(ApiResponseDto<OrderDto>.Error(ex.Message));
        }
        catch (Exception ex)
        {
            return StatusCode(500, ApiResponseDto<OrderDto>.Error($"Erro ao buscar pedido: {ex.Message}"));
        }
    }

    [HttpGet]
    public async Task<ActionResult<ApiResponseDto<PagedResultDto<OrderListDto>>>> GetAll(
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
            return Ok(ApiResponseDto<PagedResultDto<OrderListDto>>.Success(result));
        }
        catch (Exception ex)
        {
            return StatusCode(500, ApiResponseDto<PagedResultDto<OrderListDto>>.Error($"Erro ao listar pedidos: {ex.Message}"));
        }
    }

    [HttpPatch("{id}/status")]
    public async Task<ActionResult<ApiResponseDto<OrderDto>>> UpdateStatus(int id, [FromBody] UpdateOrderStatusDto dto)
    {
        try
        {
            var result = await _updateStatusUseCase.Execute(id, dto);
            return Ok(ApiResponseDto<OrderDto>.Success(result));
        }
        catch (KeyNotFoundException ex)
        {
            return NotFound(ApiResponseDto<OrderDto>.Error(ex.Message));
        }
        catch (InvalidOperationException ex)
        {
            return BadRequest(ApiResponseDto<OrderDto>.Error(ex.Message));
        }
        catch (Exception ex)
        {
            return StatusCode(500, ApiResponseDto<OrderDto>.Error($"Erro ao atualizar status do pedido: {ex.Message}"));
        }
    }
}

