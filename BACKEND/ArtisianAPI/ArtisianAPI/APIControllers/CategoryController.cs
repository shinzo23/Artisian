using System;
using System.Collections.Generic;
using System.Linq;
using System.Net;
using System.Net.Http;
using System.Web.Http;
using ArtisianAPI.Models;
using System.Web.Http.Cors;

namespace ArtisianAPI.APIControllers
{
    [EnableCors(origins: "http://localhost:5500", headers: "*", methods: "*", exposedHeaders: "SampleHeader")]
    public class CategoryController : ApiController
    {
        ArtisianDBEntities db = new ArtisianDBEntities();
        
        // GET: Fetch Category
        [HttpGet]
        [Route("api/Category")]
        public List<Category> GetCategory()
        {
            List<Category> categories = db.Categories.ToList();
            return categories;
        }

        // POST: Add new category
        [HttpPost]
        [Route("api/Category/AddCategory")]
        public Category AddCategory(Category category)
        {
            db.Categories.Add(category);
            db.SaveChanges();
            return category;
        }
    }
}
