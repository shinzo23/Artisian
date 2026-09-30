using System;
using System.Collections.Generic;
using System.Linq;
using System.Web;
using System.Web.Http;
using System.Web.Http.Cors;
using ArtisianAPI.Models;

namespace ArtisianAPI.APIControllers
{
    [EnableCors(
    origins: "http://localhost:5500",
    headers: "*",
    methods: "*",
    exposedHeaders: "SampleHeader"
    )]
    public class CartController : ApiController
    {

        ArtisianDBEntities db = new ArtisianDBEntities();

        [HttpGet]
        [Route("api/Cart/GetCart")]
        public Cart GetCart(int userId)
        {
            Cart cart = db.Carts.FirstOrDefault(
                x => x.UserId == userId
            );

            return cart;
        }


        [HttpGet]
        [Route("api/Cart/GetCartItems")]
        public object GetCartItems(int userId)
        {
            Cart cart = db.Carts.FirstOrDefault(
                x => x.UserId == userId
            );

            if (cart == null)
            {
                return new List<object>();
            }


            var items = db.CartItems
                .Where(x => x.CartId == cart.CartId)
                .Select(x => new
                {
                    x.CartItemId,
                    x.ProductId,
                    x.Quantity,

                    ProductName = x.Product.ProductName,
                    Price = x.Product.Price,
                    Image = x.Product.Image,
                    Description = x.Product.Description,
                    Stock = x.Product.Quantity
                })
                .ToList();


            return items;
        }



        [HttpPost]
        [Route("api/Cart/PostCart")]
        public object PostCart(CartRequest request)
        {
            if (request == null)
            {
                return new
                {
                    Success = false,
                    Message = "Invalid request."
                };
            }

            if (request.quantity <= 0)
            {
                return new
                {
                    Success = false,
                    Message = "Quantity must be greater than zero."
                };
            }

            User user = db.Users.FirstOrDefault(
                x => x.UserId == request.userId
            );

            if (user == null)
            {
                return new
                {
                    Success = false,
                    Message = "User not found."
                };
            }

            Product product = db.Products.FirstOrDefault(
                x => x.ProductId == request.productId
            );

            if (product == null)
            {
                return new
                {
                    Success = false,
                    Message = "Painting not found."
                };
            }

            Cart cart = db.Carts.FirstOrDefault(
                x => x.UserId == request.userId
            );

            if (cart == null)
            {
                cart = new Cart();

                cart.UserId = request.userId;

                db.Carts.Add(cart);

                db.SaveChanges();
            }

            CartItem cartItem = db.CartItems.FirstOrDefault(
                x => x.CartId == cart.CartId &&
                     x.ProductId == request.productId
            );

            int newQuantity = request.quantity;

            if (cartItem != null)
            {
                newQuantity = cartItem.Quantity + request.quantity;
            }

            if (newQuantity > product.Quantity)
            {
                return new
                {
                    Success = false,
                    Message =
                        "Only " +
                        product.Quantity +
                        " painting available in stock."
                };
            }

            if (cartItem == null)
            {
                cartItem = new CartItem();

                cartItem.CartId = cart.CartId;
                cartItem.ProductId = request.productId;
                cartItem.Quantity = request.quantity;

                db.CartItems.Add(cartItem);
            }
            else
            {
                cartItem.Quantity = newQuantity;
            }

            db.SaveChanges();

            return new
            {
                Success = true,
                Message = "Painting added to cart successfully.",
                CartItemId = cartItem.CartItemId,
                ProductId = cartItem.ProductId,
                Quantity = cartItem.Quantity
            };
        }

        [HttpPut]
        [Route("api/Cart/UpdateCart")]
        public object UpdateCart(
            int userId,
            int productId,
            int quantity
        )
        {
            if (quantity <= 0)
            {
                return new
                {
                    Success = false,
                    Message = "Quantity must be greater than zero."
                };
            }


            Cart cart = db.Carts.FirstOrDefault(
                x => x.UserId == userId
            );

            if (cart == null)
            {
                return new
                {
                    Success = false,
                    Message = "Cart not found."
                };
            }


            CartItem cartItem = db.CartItems.FirstOrDefault(
                x => x.CartId == cart.CartId &&
                     x.ProductId == productId
            );

            if (cartItem == null)
            {
                return new
                {
                    Success = false,
                    Message = "Cart item not found."
                };
            }


            Product product = db.Products.FirstOrDefault(
                x => x.ProductId == productId
            );

            if (product == null)
            {
                return new
                {
                    Success = false,
                    Message = "Painting not found."
                };
            }


            if (quantity > product.Quantity)
            {
                return new
                {
                    Success = false,
                    Message =
                        "Only " +
                        product.Quantity +
                        " painting(s) available in stock."
                };
            }


            cartItem.Quantity = quantity;

            db.SaveChanges();


            return new
            {
                Success = true,
                Message = "Cart updated successfully."
            };
        }

        [HttpDelete]
        [Route("api/Cart/DeleteCartItem")]
        public object DeleteCartItem(
            int userId,
            int cartItemId
        )
        {
            Cart cart = db.Carts.FirstOrDefault(
                x => x.UserId == userId
            );

            if (cart == null)
            {
                return new
                {
                    Success = false,
                    Message = "Cart not found."
                };
            }


            CartItem cartItem = db.CartItems.FirstOrDefault(
                x => x.CartItemId == cartItemId &&
                     x.CartId == cart.CartId
            );

            if (cartItem == null)
            {
                return new
                {
                    Success = false,
                    Message = "Cart item not found."
                };
            }


            db.CartItems.Remove(cartItem);

            db.SaveChanges();


            return new
            {
                Success = true,
                Message = "Painting removed from cart."
            };
        }


        [HttpDelete]
        [Route("api/Cart/ClearCart")]
        public object ClearCart(int userId)
        {
            Cart cart = db.Carts.FirstOrDefault(
                x => x.UserId == userId
            );

            if (cart == null)
            {
                return new
                {
                    Success = true,
                    Message = "Cart is already empty."
                };
            }


            List<CartItem> items = db.CartItems
                .Where(x => x.CartId == cart.CartId)
                .ToList();


            db.CartItems.RemoveRange(items);

            db.SaveChanges();


            return new
            {
                Success = true,
                Message = "Cart cleared successfully."
            };
        }
    }

}
