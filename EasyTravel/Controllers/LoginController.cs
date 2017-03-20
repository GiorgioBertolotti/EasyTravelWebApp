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
using System.Drawing;
using System.Drawing.Imaging;
namespace EasyTravel.Controllers
{
    public class LoginController : ApiController
    {
        public User loggedUser { get; set; }
        public string IP { get; set; }
        public bool isError { get; set; }
        public string errorMessage { get; set; }
        public string getIP()
        {
            try
            {
                string json = File.ReadAllText(System.Web.HttpContext.Current.Server.MapPath("~/Content/Settings.json"));
                dynamic jsonObj = Newtonsoft.Json.JsonConvert.DeserializeObject(json);
                this.IP = jsonObj["ip"];
                this.isError = false;
                this.errorMessage = "";
            }
            catch (Exception e)
            {
                this.isError = true;
                this.errorMessage = e.Message;
            }
            string ret = JsonConvert.SerializeObject(new { IP = this.IP, isError = this.isError, errorMessage = this.errorMessage });
            return ret;
        }
        [HttpGet]
        public string setIP(string ip)
        {
            try
            {
                string json = File.ReadAllText(System.Web.HttpContext.Current.Server.MapPath("~/Content/Settings.json"));
                dynamic jsonObj = Newtonsoft.Json.JsonConvert.DeserializeObject(json);
                jsonObj["ip"] = ip;
                this.IP = ip;
                string output = Newtonsoft.Json.JsonConvert.SerializeObject(jsonObj, Newtonsoft.Json.Formatting.Indented);
                File.WriteAllText(System.Web.HttpContext.Current.Server.MapPath("~/Content/Settings.json"), output);
                this.isError = false;
                this.errorMessage = "";
            }
            catch (Exception e)
            {
                this.isError = true;
                this.errorMessage = e.Message;
            }
            string ret = JsonConvert.SerializeObject(new { IP = this.IP, isError = this.isError, errorMessage = this.errorMessage });
            return ret;
        }
        [HttpGet]
        public string loginUser(string mobile,string pass)
        {
            try
            {
                using (var client = new WebClient())
                {
                    string json = File.ReadAllText(System.Web.HttpContext.Current.Server.MapPath("~/Content/Settings.json"));
                    dynamic jsonObj = Newtonsoft.Json.JsonConvert.DeserializeObject(json);
                    string IPtmp = jsonObj["ip"];
                    var values = new NameValueCollection();
                    values["api_method"] = "loginUser";
                    values["api_data"] = JsonConvert.SerializeObject(new { mobile = mobile, password = pass });
                    var response = client.UploadValues(IPtmp, values);
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
                        if (loggedUser.Image != null)
                        {
                            StringBuilder sbText = new StringBuilder(result.Message[0].Image.Value, result.Message[0].Image.Value.Length);
                            sbText.Replace("\r\n", String.Empty);
                            sbText.Replace(" ", String.Empty);
                            Byte[] bitmapData = Convert.FromBase64String(sbText.ToString().Replace("data:image/png;base64,", String.Empty));
                            MemoryStream streamBitmap = new MemoryStream(bitmapData);
                            Bitmap bitImage = new Bitmap((Bitmap)Image.FromStream(streamBitmap));
                            bitImage.Save(System.Web.HttpContext.Current.Server.MapPath("~/Images/profileimage.jpg"), ImageFormat.Jpeg);
                            bitImage = (Bitmap)Models.User.CropToCircle(bitImage, ColorTranslator.FromHtml("#b71c1c"));
                            bitImage.Save(System.Web.HttpContext.Current.Server.MapPath("~/Images/profileimagemini.jpg"), ImageFormat.Jpeg);
                            loggedUser.isImg = true;
                        }
                        else
                        {
                            loggedUser.isImg = false;
                        }
                        loggedUser.Token = result.Message[0].Token.Value;
                        this.isError = false;
                        this.errorMessage = "";
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
            string ret = JsonConvert.SerializeObject(loggedUser);
            return ret;
        }

        [HttpGet]
        public string loginWithToken(string token)
        {
            try
            {
                using (var client = new WebClient())
                {
                    string json = File.ReadAllText(System.Web.HttpContext.Current.Server.MapPath("~/Content/Settings.json"));
                    dynamic jsonObj = Newtonsoft.Json.JsonConvert.DeserializeObject(json);
                    string IPtmp = jsonObj["ip"];
                    var values = new NameValueCollection();
                    values["api_method"] = "loginWToken";
                    values["api_data"] = JsonConvert.SerializeObject(new { token = token });
                    var response = client.UploadValues(IPtmp, values);
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
                        if (loggedUser.Image != null)
                        {
                            StringBuilder sbText = new StringBuilder(result.Message[0].Image.Value, result.Message[0].Image.Value.Length);
                            sbText.Replace("\r\n", String.Empty); sbText.Replace(" ", String.Empty);
                            Byte[] bitmapData = Convert.FromBase64String(sbText.ToString().Replace("data:image/png;base64,", String.Empty));
                            MemoryStream streamBitmap = new MemoryStream(bitmapData);
                            Bitmap bitImage = new Bitmap((Bitmap)Image.FromStream(streamBitmap));
                            bitImage.Save(System.Web.HttpContext.Current.Server.MapPath("~/Images/profileimage.jpg"), ImageFormat.Jpeg);
                            bitImage = (Bitmap)Models.User.CropToCircle(bitImage, ColorTranslator.FromHtml("#b71c1c"));
                            bitImage.Save(System.Web.HttpContext.Current.Server.MapPath("~/Images/profileimagemini.jpg"), ImageFormat.Jpeg);
                            loggedUser.isImg = true;
                        }
                        else
                        {
                            loggedUser.isImg = false;
                        }
                        loggedUser.Token = token;
                        this.isError = false;
                        this.errorMessage = "";
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
            string ret = JsonConvert.SerializeObject(loggedUser);
            return ret;
        }
        [HttpGet]
        public string registerUser(string nome, string cognome, string mail, string mobile, string password)
        {
            try
            {
                //LOGIN
                using (var client = new WebClient())
                {
                    string json = File.ReadAllText(System.Web.HttpContext.Current.Server.MapPath("~/Content/Settings.json"));
                    dynamic jsonObj = JsonConvert.DeserializeObject(json);
                    string IPtmp = jsonObj["ip"];
                    var values = new NameValueCollection();
                    values["api_method"] = "registerUser";
                    values["api_data"] = JsonConvert.SerializeObject(new { name = nome, surname = cognome, email = mail, mobile = mobile, password = password });
                    var response = client.UploadValues(IPtmp, values);
                    var responseString = Encoding.Default.GetString(response);
                    dynamic result = JsonConvert.DeserializeObject(responseString);
                    this.isError = (bool)result.IsError;
                    this.errorMessage = result.Message;
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
