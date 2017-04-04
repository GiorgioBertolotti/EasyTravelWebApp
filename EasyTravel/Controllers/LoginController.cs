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
        public static User loggedUser { get; set; }
        public string IP { get; set; }
        public bool isError { get; set; }
        public string errorMessage { get; set; }
        [HttpGet]
        public string loginUser(string ip, string mobile, string pass)
        {
            try
            {
                using (var client = new WebClient())
                {
                    var values = new NameValueCollection();
                    values["api_method"] = "loginUser";
                    values["api_data"] = JsonConvert.SerializeObject(new { mobile = mobile, password = pass });
                    var response = client.UploadValues(ip, values);
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
                        if (loggedUser.Image != null && loggedUser.Image.Length>0)
                        {
                            StringBuilder sbText = new StringBuilder(result.Message[0].Image.Value, result.Message[0].Image.Value.Length);
                            sbText.Replace("\r\n", String.Empty);
                            sbText.Replace(" ", String.Empty);
                            Byte[] bitmapData = Convert.FromBase64String(sbText.ToString().Replace("data:image/jpeg;base64,", String.Empty));
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
                        return JsonConvert.SerializeObject(new { isError = this.isError, errorMessage = this.errorMessage });
                    }
                }
            }
            catch (Exception e)
            {
                this.isError = true;
                this.errorMessage = e.Message;
                return JsonConvert.SerializeObject(new { isError = this.isError, errorMessage = this.errorMessage });
            }
            string ret = JsonConvert.SerializeObject(loggedUser);
            return ret;
        }
        [HttpGet]
        public string loginWithToken(string ip, string token)
        {
            try
            {
                using (var client = new WebClient())
                {
                    var values = new NameValueCollection();
                    values["api_method"] = "loginWToken";
                    values["api_data"] = JsonConvert.SerializeObject(new { token = token });
                    var response = client.UploadValues(ip, values);
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
                        if (loggedUser.Image != null && loggedUser.Image.Length>0)
                        {
                            StringBuilder sbText = new StringBuilder(result.Message[0].Image.Value, result.Message[0].Image.Value.Length);
                            sbText.Replace("\r\n", String.Empty); sbText.Replace(" ", String.Empty);
                            Byte[] bitmapData = Convert.FromBase64String(sbText.ToString().Replace("data:image/jpeg;base64,", String.Empty));
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
                        return JsonConvert.SerializeObject(new { isError = this.isError, errorMessage = this.errorMessage });
                    }
                }
            }
            catch (Exception e)
            {
                this.isError = true;
                this.errorMessage = e.Message;
                return JsonConvert.SerializeObject(new { isError = this.isError, errorMessage = this.errorMessage });
            }
            string ret = JsonConvert.SerializeObject(loggedUser);
            return ret;
        }
        [HttpGet]
        public string registerUser(string ip, string nome, string cognome, string mail, string mobile, string password)
        {
            try
            {
                //LOGIN
                using (var client = new WebClient())
                {
                    var values = new NameValueCollection();
                    values["api_method"] = "registerUser";
                    values["api_data"] = JsonConvert.SerializeObject(new { name = nome, surname = cognome, email = mail, mobile = mobile, password = password });
                    var response = client.UploadValues(ip, values);
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
        [HttpGet]
        public string editRange(string ip, string mobile, int range)
        {
            try
            {
                using (var client = new WebClient())
                {
                    if (range != loggedUser.Range) { 
                        var values = new NameValueCollection();
                        values["api_method"] = "setRange";
                        values["api_data"] = JsonConvert.SerializeObject(new { mobile = mobile, range = range });
                        var response = client.UploadValues(ip, values);
                        var responseString = Encoding.Default.GetString(response);
                        dynamic result = JsonConvert.DeserializeObject(responseString);
                        if (!(bool)result.IsError)
                        {
                            loggedUser.Range = range;
                            this.isError = false;
                            this.errorMessage = result.Message;
                        }
                        else
                        {
                            this.isError = true;
                            this.errorMessage = result.Message;
                        }
                    }else
                    {
                        this.isError = true;
                        this.errorMessage = "Il range è uguale";
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
