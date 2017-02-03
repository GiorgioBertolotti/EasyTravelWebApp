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
    public class LoginController : ApiController
    {
        LoginModel oUser;
        public LoginController()
        {
            oUser = new LoginModel();
        }
        public string getIP()
        {
            oUser.getIP(out oUser);
            string ret = JsonConvert.SerializeObject(oUser);
            return ret;
        }
        [HttpGet]
        public string setIP(string ip)
        {
            oUser.setIP(out oUser, ip);
            string ret = JsonConvert.SerializeObject(oUser);
            return ret;
        }
        [HttpGet]
        public string loginUser(string mobile,string pass)
        {
            oUser.login(out oUser, mobile, pass);
            string ret = JsonConvert.SerializeObject(oUser);
            return ret;
        }
    }
}
