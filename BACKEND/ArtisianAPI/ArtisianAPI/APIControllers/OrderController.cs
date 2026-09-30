using System;
using System.Collections.Generic;
using System.Linq;
using System.Web;
using System.Web.Http;
using System.Web.Http.Cors;
using ArtisianAPI.Models;

namespace ArtisianAPI.APIControllers
{
    [EnableCors(origins: "http://localhost:5500", headers: "*", methods: "*", exposedHeaders: "SampleHeader")]
    public class OrderController : ApiController
    {
        ArtisianDBEntities db = new ArtisianDBEntities();

        // Get currently logged in user
        private int GetSessionUserId()
        {
            if (HttpContext.Current == null ||
                HttpContext.Current.Session == null ||
                HttpContext.Current.Session["UserId"] == null)
            {
                return 0;
            }

            int userId;

            if (int.TryParse(
                HttpContext.Current.Session["UserId"].ToString(),
                out userId))
            {
                return userId;
            }

            return 0;
        }

        // POST: api/Order/PlaceOrder
        [HttpPost]
        [Route("api/Order/PlaceOrder")]
        public object PlaceOrder()
        {
            int userId = GetSessionUserId();

            if (userId == 0)
            {
                return new
                {
                    Message = "Please login before placing an order."
                };
            }

            // Find user's cart
            Cart cart = db.Carts.FirstOrDefault(c => c.UserId == userId);

            if (cart == null)
            {
                return new
                {
                    Message = "Your cart is empty."
                };
            }

            // Get cart items
            List<CartItem> cartItems = db.CartItems
                .Where(c => c.CartId == cart.CartId)
                .ToList();

            if (cartItems.Count == 0)
            {
                return new
                {
                    Message = "Your cart is empty."
                };
            }

            // Check stock
            foreach (CartItem cartItem in cartItems)
            {
                Product product = db.Products.Find(cartItem.ProductId);

                if (product == null)
                {
                    return new
                    {
                        Message = "One of the paintings in your cart is no longer available."
                    };
                }

                if (product.Quantity < cartItem.Quantity)
                {
                    return new
                    {
                        Message = product.ProductName +
                                  " has only " +
                                  product.Quantity +
                                  " items available."
                    };
                }
            }

            // Create new Order
            Order order = new Order();
            order.UserId = userId;

            db.Orders.Add(order);
            db.SaveChanges();

            // Add CartItems to OrderItems
            foreach (CartItem cartItem in cartItems)
            {
                OrderItem orderItem = new OrderItem();

                orderItem.OrderId = order.OrderId;
                orderItem.ProductId = cartItem.ProductId;
                orderItem.Quantity = cartItem.Quantity;

                db.OrderItems.Add(orderItem);

                // Decrease stock ONLY after order is being placed
                Product product = db.Products.Find(cartItem.ProductId);

                product.Quantity = product.Quantity - cartItem.Quantity;
            }

            // Remove all items from cart
            db.CartItems.RemoveRange(cartItems);

            // Save order items, stock changes and cart removal
            db.SaveChanges();

            return new
            {
                Message = "Order placed successfully.",
                OrderId = order.OrderId
            };
        }

        // GET: api/Order/GetMyOrders
        [HttpGet]
        [Route("api/Order/GetMyOrders")]
        public object GetMyOrders()
        {
            int userId = GetSessionUserId();

            if (userId == 0)
            {
                return new
                {
                    Message = "Please login to view your orders."
                };
            }

            var orders = db.Orders
                .Where(o => o.UserId == userId)
                .Select(o => new
                {
                    o.OrderId,
                    o.UserId,

                    TotalAmount = db.OrderItems
                        .Where(oi => oi.OrderId == o.OrderId)
                        .Sum(oi => (int?)oi.Quantity *
                                   (int?)oi.Product.Price) ?? 0,

                    ItemCount = db.OrderItems
                        .Where(oi => oi.OrderId == o.OrderId)
                        .Sum(oi => (int?)oi.Quantity) ?? 0
                })
                .OrderByDescending(o => o.OrderId)
                .ToList();

            return orders;
        }

        // GET: api/Order/GetOrderDetails
        [Route("api/Order/GetOrderDetails")]
        public object GetOrderDetails(int orderId)
        {
            int userId = GetSessionUserId();

            if (userId == 0)
            {
                return new
                {
                    Message = "Please login to view this order."
                };
            }

            Order order = db.Orders.FirstOrDefault(
                o => o.OrderId == orderId &&
                     o.UserId == userId
            );

            if (order == null)
            {
                return new
                {
                    Message = "Order not found."
                };
            }

            var orderItems = db.OrderItems
                .Where(oi => oi.OrderId == orderId)
                .Select(oi => new
                {
                    oi.OrderItemId,
                    oi.OrderId,
                    oi.ProductId,
                    oi.Quantity,

                    ProductName = oi.Product.ProductName,
                    ProductImage = oi.Product.Image,
                    ProductDescription = oi.Product.Description,
                    ProductPrice = oi.Product.Price,
                    CategoryId = oi.Product.CategoryId
                })
                .ToList();

            int totalAmount = orderItems.Sum(
                item => item.ProductPrice * item.Quantity
            );

            return new
            {
                order.OrderId,
                order.UserId,
                TotalAmount = totalAmount,
                Items = orderItems
            };
        }

        // GET: api/Order/GetAllOrders
        [HttpGet]
        [Route("api/Order/GetAllOrders")]
        public object GetAllOrders()
        {
            int userId = GetSessionUserId();

            if (userId == 0)
            {
                return new
                {
                    Message = "Please login."
                };
            }

            User admin = db.Users.FirstOrDefault(u => u.UserId == userId);

            if (admin == null || admin.UserType.TypeName != "Admin")
            {
                return new
                {
                    Message = "Access denied."
                };
            }

            var orders = db.Orders
                .Select(o => new
                {
                    o.OrderId,
                    o.UserId,

                    CustomerName = o.User.FullName,
                    CustomerEmail = o.User.Email,

                    TotalAmount = db.OrderItems
                        .Where(oi => oi.OrderId == o.OrderId)
                        .Sum(oi => (int?)oi.Quantity *
                                   (int?)oi.Product.Price) ?? 0,

                    ItemCount = db.OrderItems
                        .Where(oi => oi.OrderId == o.OrderId)
                        .Sum(oi => (int?)oi.Quantity) ?? 0
                })
                .OrderByDescending(o => o.OrderId)
                .ToList();

            return orders;
        }

        // GET: api/Order/GetAdminOrderDetails?orderId=1
        [HttpGet]
        [Route("api/Order/GetAdminOrderDetails")]
        public object GetAdminOrderDetails(int orderId)
        {
            int userId = GetSessionUserId();

            if (userId == 0)
            {
                return new
                {
                    Message = "Please login."
                };
            }

            User admin = db.Users.FirstOrDefault(u => u.UserId == userId);

            if (admin == null || admin.UserType.TypeName != "Admin")
            {
                return new
                {
                    Message = "Access denied."
                };
            }

            Order order = db.Orders.FirstOrDefault(
                o => o.OrderId == orderId
            );

            if (order == null)
            {
                return new
                {
                    Message = "Order not found."
                };
            }

            var orderItems = db.OrderItems
                .Where(oi => oi.OrderId == orderId)
                .Select(oi => new
                {
                    oi.OrderItemId,
                    oi.OrderId,
                    oi.ProductId,
                    oi.Quantity,

                    ProductName = oi.Product.ProductName,
                    ProductImage = oi.Product.Image,
                    ProductDescription = oi.Product.Description,
                    ProductPrice = oi.Product.Price,
                    CategoryId = oi.Product.CategoryId
                })
                .ToList();

            int totalAmount = orderItems.Sum(
                item => item.ProductPrice * item.Quantity
            );

            return new
            {
                order.OrderId,
                order.UserId,

                CustomerName = order.User.FullName,
                CustomerEmail = order.User.Email,

                TotalAmount = totalAmount,

                Items = orderItems
            };
        }
    }
}