using System;
using System.Collections.Generic;
using System.Linq;
using System.Net;
using System.Net.Http;
using System.Web.Http;
using System.IO;
using EasyTravel.Models;
using Newtonsoft.Json;
using System.Text;
using System.Collections.Specialized;
namespace EasyTravel.Controllers
{
    public class HomeController : ApiController
    {
        public bool isError { get; set; }
        public string errorMessage { get; set; }
        [HttpGet]
        public string logoutUser(string mobile, string token)
        {
            try
            {
                using (var client = new WebClient())
                {
                    string getipres = (new LoginController()).getIP();
                    dynamic jsonobj = JsonConvert.DeserializeObject(getipres);
                    var values = new NameValueCollection();
                    values["api_method"] = "logoutUser";
                    values["api_data"] = JsonConvert.SerializeObject(new { mobile = mobile, token = token });
                    var response = client.UploadValues(jsonobj.IP.Value, values);
                    var responseString = Encoding.Default.GetString(response);
                    dynamic result = JsonConvert.DeserializeObject(responseString);
                    if (!(bool)result.IsError)
                    {
                        this.isError = false;
                        this.errorMessage = result.Message;
                    }
                    else
                    {
                        this.isError = true;
                        this.errorMessage = result.Message;
                    }
                }
            }
            catch (Exception e)
            {
                this.isError = true;
                this.errorMessage = e.Message;
            }
            string ret = JsonConvert.SerializeObject(new { isError = this.isError, errorMessage = this.errorMessage });
            return ret;
        }
        [HttpPost]
        public string editImage(EditImage model)
        {
            try
            {
                using (var client = new WebClient())
                {
                    string getipres = (new LoginController()).getIP();
                    dynamic jsonobj = JsonConvert.DeserializeObject(getipres);
                    var values = new NameValueCollection();
                    values["api_method"] = "setImage";
                    values["api_data"] = JsonConvert.SerializeObject(new { mobile = model.Mobile, img = model.Image });
                    var response = client.UploadValues(jsonobj.IP.Value, values);
                    var responseString = Encoding.Default.GetString(response);
                    dynamic result = JsonConvert.DeserializeObject(responseString);
                    if (!(bool)result.IsError)
                    {
                        this.isError = false;
                        this.errorMessage = result.Message;
                    }
                    else
                    {
                        this.isError = true;
                        this.errorMessage = result.Message;
                    }
                }
            }
            catch (Exception e)
            {
                this.isError = true;
                this.errorMessage = e.Message;
            }
            string ret = JsonConvert.SerializeObject(new { isError = this.isError, errorMessage = this.errorMessage });
            return ret;
        }
    }
}
