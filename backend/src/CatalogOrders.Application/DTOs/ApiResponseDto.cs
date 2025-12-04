namespace CatalogOrders.Application.DTOs;

public class ApiResponseDto<T>
{
    public int CodRetorno { get; set; }
    public string? Mensagem { get; set; }
    public T? Data { get; set; }

    public static ApiResponseDto<T> Success(T data, string? mensagem = null)
    {
        return new ApiResponseDto<T>
        {
            CodRetorno = 0,
            Mensagem = mensagem,
            Data = data
        };
    }

    public static ApiResponseDto<T> Error(string mensagem)
    {
        return new ApiResponseDto<T>
        {
            CodRetorno = 1,
            Mensagem = mensagem,
            Data = default
        };
    }
}

