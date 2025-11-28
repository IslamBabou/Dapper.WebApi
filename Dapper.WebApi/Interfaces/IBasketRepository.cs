public interface IBasketRepository
{
    Task<int> GetOrCreateBasketIdAsync(int userId);

    Task AddItemAsync(int basktId, int productId, int quantity);

    Task<IEnumerable<dynamic>> GetBasketItemsAsync(int basketId);

    Task ClearBasketAsync(int basketId);
}