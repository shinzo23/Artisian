using System;
using System.Collections.Generic;
using System.Linq;
using System.Net;
using System.Net.Http;
using System.Web.Http;
using System.Web;
using ArtisianAPI.Models;
using System.Web.Http.Cors;

namespace ArtisianAPI.APIControllers
{
    [EnableCors(origins: "http://localhost:5500", headers: "*", methods: "*", exposedHeaders: "SampleHeader")]
    public class ProductController : ApiController
    {
        ArtisianDBEntities db = new ArtisianDBEntities();

        // GET: Fetch Products
        public List<Product> GetProduct()
        {
            List<Product> product = db.Products.ToList();
            return product;
        }

        // POST: Add new product
        [HttpPost]
        [Route("api/Product/PostProduct")]

        public Product PostProduct(Product product)
        {
            db.Products.Add(product);
            db.SaveChanges();
            return product;   
        }
    }
}
