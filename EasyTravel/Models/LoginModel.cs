using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.IO;
using System.Net;
using System.Collections.Specialized;
using Newtonsoft.Json;
namespace EasyTravel.Models
{
    public class LoginModel
    {
        public User loggedUser { get; set; }
        public string IP { get; set; }
        public bool isError { get; set; }
        public string errorMessage { get; set; }
        public void getIP(out LoginModel OUTModel)
        {
            LoginModel model = this;
            try
            {
                string json = File.ReadAllText(System.Web.HttpContext.Current.Server.MapPath("~/Content/Settings.json"));
                dynamic jsonObj = Newtonsoft.Json.JsonConvert.DeserializeObject(json);
                model.IP = jsonObj["ip"];
                model.isError = false;
                model.errorMessage = "";
            }
            catch (Exception e)
            {
                model.isError = true;
                model.errorMessage = e.Message;
            }
            OUTModel = model;
            return;
        }
        public void setIP(out LoginModel OUTModel, string ip)
        {
            LoginModel model = this;
            try
            {
                string json = File.ReadAllText(System.Web.HttpContext.Current.Server.MapPath("~/Content/Settings.json"));
                dynamic jsonObj = Newtonsoft.Json.JsonConvert.DeserializeObject(json);
                jsonObj["ip"] = ip;
                string output = Newtonsoft.Json.JsonConvert.SerializeObject(jsonObj, Newtonsoft.Json.Formatting.Indented);
                File.WriteAllText(System.Web.HttpContext.Current.Server.MapPath("~/Content/Settings.json"), output);
                model.isError = false;
                model.errorMessage = "";
            }
            catch (Exception e)
            {
                model.isError = true;
                model.errorMessage = e.Message;
            }
            OUTModel = model;
            return;
        }
        public void login(out LoginModel OUTModel, string mobile, string pass)
        {
            LoginModel model = this;
            try
            {
                //LOGIN
                using (var client = new WebClient())
                {
                    model.getIP(out model);
                    var values = new NameValueCollection();
                    values["api_method"] = "loginUser";
                    values["api_data"] = JsonConvert.SerializeObject(new { mobile=mobile,password=pass });
                    var response = client.UploadValues(model.IP, values);
                    var responseString = Encoding.Default.GetString(response);
                    dynamic result = JsonConvert.DeserializeObject(responseString);
                    if (!(bool)result.IsError)
                    {
                        loggedUser = new User();
                        loggedUser.Name = result.Message[0].Name.Value;
                        loggedUser.Surname = result.Message[0].Surname.Value;
                        loggedUser.Mobile = result.Message[0].Mobile.Value;
                        loggedUser.Range = Convert.ToInt32(result.Message[0].Range.Value);
                        loggedUser.Image = Encoding.Default.GetBytes(result.Message[0].Image.Value);
                    }
                    else
                    {
                        model.isError = true;
                        model.errorMessage = result.Message;
                    }
                }
            }
            catch (Exception e)
            {
                model.isError = true;
                model.errorMessage = e.Message;
            }
            OUTModel = model;
            return;
        }
    }
}