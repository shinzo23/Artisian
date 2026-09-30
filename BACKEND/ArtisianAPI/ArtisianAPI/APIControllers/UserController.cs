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
    public class UserController : ApiController
    {
        ArtisianDBEntities db = new ArtisianDBEntities();

        [HttpGet]
        [Route("api/User/GetUser")]
        public User GetUser(string email, string password)
        {
            User user = db.Users.FirstOrDefault(
                x => x.Email == email &&
                     x.Password == password
            );

            if (user != null)
            {
                HttpContext.Current.Session["UserId"] = user.UserId;
                HttpContext.Current.Session["Email"] = user.Email;
                HttpContext.Current.Session["UserType"] = user.TypeId;
            }

            return user;
        }

        [HttpGet]
        [Route("api/User/GetCurrentUser")]
        public User GetCurrentUser()
        {
            if (HttpContext.Current.Session["UserId"] == null)
            {
                return null;
            }

            int userId = Convert.ToInt32(
                HttpContext.Current.Session["UserId"]
            );

            User user = db.Users.FirstOrDefault(
                x => x.UserId == userId
            );

            return user;
        }

        [HttpPost]
        [Route("api/User/PostUser")]
        public List<User> PostUser(User user)
        {
            UserType userType = db.UserTypes.FirstOrDefault(
                x => x.TypeName == "User"
            );

            user.TypeId = userType.TypeId;

            db.Users.Add(user);
            db.SaveChanges();

            List<User> users = db.Users.ToList();

            return users;
        }

        [HttpGet]
        [Route("api/User/GetAllUsers")]
        public object GetAllUsers()
        {
            if (HttpContext.Current.Session["UserId"] == null)
            {
                return new
                {
                    Message = "Please login first."
                };
            }


            int userId = Convert.ToInt32(
                HttpContext.Current.Session["UserId"]
            );


            User admin = db.Users.FirstOrDefault(
                x => x.UserId == userId
            );

            if (admin == null || admin.TypeId != 1)
            {
                return new
                {
                    Message = "Access denied."
                };
            }

            var users = db.Users.Select(
                x => new
                {
                    x.UserId,
                    x.FullName,
                    x.Email,
                    x.TypeId
                }
            ).ToList();
            return users;
        }

        [HttpGet]
        [Route("api/User/Logout")]
        public string Logout()
        {
            HttpContext.Current.Session.Clear();
            HttpContext.Current.Session.Abandon();
            return "Signed out successfully.";
        }
    }
}
