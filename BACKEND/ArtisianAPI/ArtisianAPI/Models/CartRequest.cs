
namespace ArtisianAPI.Models
{
    public class CartRequest
    {
        public int userId { get; set; }
        public int productId { get; set; }
        public int quantity { get; set; }
    }
}