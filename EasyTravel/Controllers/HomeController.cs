using System;
using System.Collections.Generic;
using System.Linq;
using System.Net;
using System.Net.Http;
using System.Web.Http;
using System.IO;
using EasyTravel.Models;
using Newtonsoft.Json;
namespace EasyTravel.Controllers
{
    public class HomeController : ApiController
    {
        LoginModel oUser;
        public HomeController()
        {
            oUser = new LoginModel();
        }
        [HttpGet]
        public string logoutUser(string mobile)
        {
            oUser.logout(out oUser, mobile);
            string ret = JsonConvert.SerializeObject(oUser);
            return ret;
        }
    }
}
