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
using System.Drawing.Imaging;

namespace EasyTravel.Controllers
{
    public class HomeController : ApiController
    {
        public List<Autostoppista> autostoppisti;
        public List<ActiveUser> attivi;
        public List<UnseenContact> nuovicontatti;
        public bool isError { get; set; }
        public string errorMessage { get; set; }
        [HttpPost]
        public string updateFeedback(UserContact model)
        {
            try
            {
                using (var client = new WebClient())
                {
                    var values = new NameValueCollection();
                    values["api_method"] = "updateFeedback";
                    values["api_data"] = JsonConvert.SerializeObject(new { caller = model.caller, receiver = model.receiver, datetime = model.datetime, feedback = model.rating });
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
        [HttpGet]
        public string getNewContacts(string ip, string mobile)
        {
            try
            {
                using (var client = new WebClient())
                {
                    var values = new NameValueCollection();
                    values["api_method"] = "getNewContacts";
                    values["api_data"] = JsonConvert.SerializeObject(new { mobile = mobile });
                    var response = client.UploadValues(ip, values);
                    var responseString = Encoding.Default.GetString(response);
                    dynamic result = JsonConvert.DeserializeObject(responseString);
                    if (!(bool)result.IsError)
                    {
                        nuovicontatti = new List<UnseenContact>();
                        foreach (var tmp in result.Message)
                        {
                            UnseenContact utmp = new UnseenContact() { mobile = tmp.Mobile, name = tmp.Name, surname=tmp.Surname, datetime = tmp.Datetime, type = tmp.Type };
                            nuovicontatti.Add(utmp);
                        }
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
            return JsonConvert.SerializeObject(nuovicontatti);
        }
        [HttpPost]
        public string getRating(UserMobile model)
        {
            try
            {
                using (var client = new WebClient())
                {
                    var values = new NameValueCollection();
                    values["api_method"] = "getRating";
                    values["api_data"] = JsonConvert.SerializeObject(new { mobile = model.Mobile });
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
        public string countContacts(UserMobile model)
        {
            try
            {
                using (var client = new WebClient())
                {
                    var values = new NameValueCollection();
                    values["api_method"] = "countContacts";
                    values["api_data"] = JsonConvert.SerializeObject(new { mobile = model.Mobile });
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
        public string countRides(UserMobile model)
        {
            try
            {
                using (var client = new WebClient())
                {
                    var values = new NameValueCollection();
                    values["api_method"] = "countRides";
                    values["api_data"] = JsonConvert.SerializeObject(new { mobile = model.Mobile });
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
        public string addContact(UserContact model)
        {
            try
            {
                using (var client = new WebClient())
                {
                    var values = new NameValueCollection();
                    values["api_method"] = "addContact";
                    values["api_data"] = JsonConvert.SerializeObject(new { caller = model.caller,receiver=model.receiver,type=model.type});
                    var response = client.UploadValues(model.ip, values);
                    var responseString = Encoding.Default.GetString(response);
                    this.errorMessage = responseString;
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
                this.errorMessage += e.Message;
            }
            return JsonConvert.SerializeObject(new { isError = this.isError, errorMessage = this.errorMessage });
        }
        [HttpPost]
        public string unsetUserType(UserMobile model)
        {
            try
            {
                using (var client = new WebClient())
                {
                    var values = new NameValueCollection();
                    values["api_method"] = "removeUser_Type";
                    values["api_data"] = JsonConvert.SerializeObject(new { mobile = model.Mobile });
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
        public string setUserType(UserType model)
        {
            try
            {
                using (var client = new WebClient())
                {
                    var values = new NameValueCollection();
                    values["api_method"] = "User_Type";
                    values["api_data"] = JsonConvert.SerializeObject(new { mobile = model.Mobile, type = model.Type });
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
        public string setUserDestination(UserPosition model)
        {
            try
            {
                using (var client = new WebClient())
                {
                    var values = new NameValueCollection();
                    values["api_method"] = "User_Destination";
                    values["api_data"] = JsonConvert.SerializeObject(new { mobile = model.Mobile, Latitude = model.Latitude, Longitude = model.Longitude });
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
        public string updateUserPosition(UserPosition model)
        {
            try
            {
                using (var client = new WebClient())
                {
                    var values = new NameValueCollection();
                    values["api_method"] = "setGPSLocation";
                    values["api_data"] = JsonConvert.SerializeObject(new { mobile = model.Mobile, lat = model.Latitude, lon=model.Longitude,date= DateTime.Now.ToString("yyyy-MM-dd HH:mm:ss") });
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
        [HttpGet]
        public string getActiveUsers(string ip)
        {
            try
            {
                using (var client = new WebClient())
                {
                    var values = new NameValueCollection();
                    values["api_method"] = "getActiveUsers";
                    values["api_data"] = JsonConvert.SerializeObject(new {});
                    var response = client.UploadValues(ip, values);
                    var responseString = Encoding.Default.GetString(response);
                    dynamic result = JsonConvert.DeserializeObject(responseString);
                    if (!(bool)result.IsError)
                    {
                        attivi = new List<ActiveUser>();
                        foreach (var atmp in result.Message)
                        {
                            ActiveUser tmp = new ActiveUser() { Name = atmp.Name, Surname = atmp.Surname, Mail = atmp.Mail, Mobile = atmp.Mobile, Type = atmp.Type_id, Range = atmp.Range, Latitude = atmp.Latitude, Longitude = atmp.Longitude, Date = atmp.Date, Rating=atmp.Rating };
                            tmp.Image = Encoding.Default.GetBytes(atmp.Image.Value);
                            attivi.Add(tmp);
                        }
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
            return JsonConvert.SerializeObject(attivi);
        }
        [HttpGet]
        public string getAutostoppisti(string ip, string mobile, string lat, string lon, string range)
        {
            try
            {
                using (var client = new WebClient())
                {
                    var values = new NameValueCollection();
                    values["api_method"] = "getAS";
                    values["api_data"] = JsonConvert.SerializeObject(new { mobile = mobile, lat = lat, lon = lon, range = range });
                    var response = client.UploadValues(ip, values);
                    var responseString = Encoding.Default.GetString(response);
                    dynamic result = JsonConvert.DeserializeObject(responseString);
                    if (!(bool)result.IsError)
                    {
                        autostoppisti = new List<Autostoppista>();
                        foreach (var atmp in result.Message)
                        {
                            Autostoppista tmp = new Autostoppista() { Name = atmp.Name, Surname = atmp.Surname, Mail = atmp.Mail, Mobile = atmp.Mobile, Type = 1, Range = atmp.Range, Destlat = atmp.Destlat, Destlon = atmp.Destlon, Latitude = atmp.Latitude, Longitude = atmp.Longitude, Date = atmp.Date, Rating=atmp.Rating };
                            tmp.evaluateDestination();
                            tmp.Image = Encoding.Default.GetBytes(atmp.Image.Value);
                            autostoppisti.Add(tmp);
                        }
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
            return JsonConvert.SerializeObject(autostoppisti);
        }
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
        [HttpGet]
        public string editRange(string ip, string mobile, int range)
        {
            try
            {
                using (var client = new WebClient())
                {
                    if (range != LoginController.loggedUser.Range)
                    {
                        var values = new NameValueCollection();
                        values["api_method"] = "setRange";
                        values["api_data"] = JsonConvert.SerializeObject(new { mobile = mobile, range = range });
                        var response = client.UploadValues(ip, values);
                        var responseString = Encoding.Default.GetString(response);
                        dynamic result = JsonConvert.DeserializeObject(responseString);
                        if (!(bool)result.IsError)
                        {
                            LoginController.loggedUser.Range = range;
                            this.isError = false;
                            this.errorMessage = result.Message;
                        }
                        else
                        {
                            this.isError = true;
                            this.errorMessage = result.Message;
                        }
                    }
                    else
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
