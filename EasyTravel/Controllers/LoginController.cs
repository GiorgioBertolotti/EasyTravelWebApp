using System;
using System.Collections.Generic;
using System.Linq;
using System.Net;
using System.Net.Http;
using System.Web.Http;
using System.IO;
using EasyTravel.Properties;
namespace EasyTravel.Controllers
{
    public class LoginController : ApiController
    {
        [HttpGet]
        public string setIP(string ip)
        {
            string result = "ok";
            try
            {
                string json = File.ReadAllText("../Content/Setting.json");
                dynamic jsonObj = Newtonsoft.Json.JsonConvert.DeserializeObject(json);
                jsonObj["ip"] = ip;
                string output = Newtonsoft.Json.JsonConvert.SerializeObject(jsonObj, Newtonsoft.Json.Formatting.Indented);
                File.WriteAllText("../Content/Setting.json", output);
            }
            catch(Exception e)
            {
                result = e.Message;
            }
            return result;
        }
    }
}
