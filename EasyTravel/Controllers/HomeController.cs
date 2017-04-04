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
using System.Drawing.Drawing2D;

namespace EasyTravel.Controllers
{
    public class HomeController : ApiController
    {
        public bool isError { get; set; }
        public string errorMessage { get; set; }
        [HttpGet]
        public string logoutUser(string ip, string mobile, string token)
        {
            try
            {
                using (var client = new WebClient())
                {
                    var values = new NameValueCollection();
                    values["api_method"] = "logoutUser";
                    values["api_data"] = JsonConvert.SerializeObject(new { mobile = mobile, token = token });
                    var response = client.UploadValues(ip, values);
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
            return JsonConvert.SerializeObject(new { isError = this.isError, errorMessage = this.errorMessage });
        }
        [HttpPost]
        public string editImage(EditImage model)
        {
            try
            {
                using (var client = new WebClient())
                {
                    //CONVERTO IL BASE64 IN IMMAGINE
                    StringBuilder sbText = new StringBuilder(model.Image, model.Image.Length);
                    sbText.Replace("\r\n", String.Empty);
                    sbText.Replace(" ", String.Empty);
                    Byte[] bitmapData = Convert.FromBase64String(sbText.ToString().Replace("data:image/jpeg;base64,", String.Empty));
                    MemoryStream streamBitmap = new MemoryStream(bitmapData);
                    Bitmap bitImage = new Bitmap((Bitmap)Image.FromStream(streamBitmap));
                    //SCALO LE DIMENSIONI DELL'IMMAGINE
                    Bitmap b = new Bitmap(256, 256);
                    Graphics g = Graphics.FromImage((Image)b);
                    g.InterpolationMode = InterpolationMode.HighQualityBicubic;
                    g.DrawImage(bitImage, 0, 0, 256, 256);
                    g.Dispose();
                    MemoryStream ms = new MemoryStream();
                    b.Save(ms, System.Drawing.Imaging.ImageFormat.Jpeg);
                    byte[] byteImage = ms.ToArray();
                    var SigBase64 = Convert.ToBase64String(byteImage);
                    //CARICO L'IMMAGINE RIMPICCIOLITA
                    var values = new NameValueCollection();
                    values["api_method"] = "setImage";
                    values["api_data"] = JsonConvert.SerializeObject(new { mobile = model.Mobile, img = SigBase64 });
                    var response = client.UploadValues(model.ip, values);
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
            return JsonConvert.SerializeObject(new { isError = this.isError, errorMessage = this.errorMessage });
        }
        [HttpPost]
        public string editPassword(EditPassword model)
        {
            try
            {
                using (var client = new WebClient())
                {
                    var values = new NameValueCollection();
                    values["api_method"] = "setPassword";
                    values["api_data"] = JsonConvert.SerializeObject(new { mobile = model.Mobile, oldpwd = model.OldPassword, newpwd = model.NewPassword });
                    var response = client.UploadValues(model.ip, values);
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
            return JsonConvert.SerializeObject(new { isError = this.isError, errorMessage = this.errorMessage });
        }
    }
}
