using CatalogOrders.Application.DTOs;
using CatalogOrders.Application.UseCases.Products;
using Microsoft.AspNetCore.Mvc;

namespace CatalogOrders.Api.Controllers;

[ApiController]
[Route("api/[controller]")]
public class ProductsController : ControllerBase
{
    private readonly CreateProductUseCase _createUseCase;
    private readonly UpdateProductUseCase _updateUseCase;
    private readonly GetProductUseCase _getUseCase;
    private readonly ListProductsUseCase _listUseCase;
    private readonly DeleteProductUseCase _deleteUseCase;

    public ProductsController(
        CreateProductUseCase createUseCase,
        UpdateProductUseCase updateUseCase,
        GetProductUseCase getUseCase,
        ListProductsUseCase listUseCase,
        DeleteProductUseCase deleteUseCase)
    {
        _createUseCase = createUseCase;
        _updateUseCase = updateUseCase;
        _getUseCase = getUseCase;
        _listUseCase = listUseCase;
        _deleteUseCase = deleteUseCase;
    }

    [HttpPost]
    public async Task<ActionResult<ApiResponseDto<ProductDto>>> Create([FromBody] CreateProductDto dto)
    {
        try
        {
            var result = await _createUseCase.Execute(dto);
            return Ok(ApiResponseDto<ProductDto>.Success(result));
        }
        catch (InvalidOperationException ex)
        {
            return BadRequest(ApiResponseDto<ProductDto>.Error(ex.Message));
        }
        catch (Exception ex)
        {
            return StatusCode(500, ApiResponseDto<ProductDto>.Error($"Erro ao criar produto: {ex.Message}"));
        }
    }

    [HttpGet("{id}")]
    public async Task<ActionResult<ApiResponseDto<ProductDto>>> GetById(int id)
    {
        try
        {
            var result = await _getUseCase.Execute(id);
            return Ok(ApiResponseDto<ProductDto>.Success(result));
        }
        catch (KeyNotFoundException ex)
        {
            return NotFound(ApiResponseDto<ProductDto>.Error(ex.Message));
        }
        catch (Exception ex)
        {
            return StatusCode(500, ApiResponseDto<ProductDto>.Error($"Erro ao buscar produto: {ex.Message}"));
        }
    }

    [HttpGet]
    public async Task<ActionResult<ApiResponseDto<PagedResultDto<ProductListDto>>>> GetAll(
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
            return Ok(ApiResponseDto<PagedResultDto<ProductListDto>>.Success(result));
        }
        catch (Exception ex)
        {
            return StatusCode(500, ApiResponseDto<PagedResultDto<ProductListDto>>.Error($"Erro ao listar produtos: {ex.Message}"));
        }
    }

    [HttpPut("{id}")]
    public async Task<ActionResult<ApiResponseDto<ProductDto>>> Update(int id, [FromBody] UpdateProductDto dto)
    {
        try
        {
            var result = await _updateUseCase.Execute(id, dto);
            return Ok(ApiResponseDto<ProductDto>.Success(result));
        }
        catch (KeyNotFoundException ex)
        {
            return NotFound(ApiResponseDto<ProductDto>.Error(ex.Message));
        }
        catch (Exception ex)
        {
            return StatusCode(500, ApiResponseDto<ProductDto>.Error($"Erro ao atualizar produto: {ex.Message}"));
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
                return Ok(ApiResponseDto<object?>.Success(null, "Produto excluído com sucesso"));
            }
            return BadRequest(ApiResponseDto<object?>.Error("Erro ao excluir produto"));
        }
        catch (KeyNotFoundException ex)
        {
            return NotFound(ApiResponseDto<object?>.Error(ex.Message));
        }
        catch (Exception ex)
        {
            return StatusCode(500, ApiResponseDto<object?>.Error($"Erro ao excluir produto: {ex.Message}"));
        }
    }
}

