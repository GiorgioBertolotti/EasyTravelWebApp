﻿using System;
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
using System.Globalization;

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
                        loggedUser.Mail = result.Message[0].Mail.Value;
                        loggedUser.Mobile = result.Message[0].Mobile.Value;
                        loggedUser.Type = null;
                        loggedUser.Range = Convert.ToInt32(result.Message[0].Range.Value);
                        loggedUser.Image = Encoding.Default.GetBytes(result.Message[0].Image.Value);
                        loggedUser.Token = result.Message[0].Token.Value;
                        loggedUser.Rating = float.Parse(result.Message[0].Rating.Value, CultureInfo.InvariantCulture);
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
            return JsonConvert.SerializeObject(loggedUser);
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
                        loggedUser.Mail = result.Message[0].Mail.Value;
                        loggedUser.Mobile = result.Message[0].Mobile.Value;
                        loggedUser.Type = null;
                        loggedUser.Range = Convert.ToInt32(result.Message[0].Range.Value);
                        loggedUser.Image = Encoding.Default.GetBytes(result.Message[0].Image.Value);
                        loggedUser.Token = token;
                        loggedUser.Rating = float.Parse(result.Message[0].Rating.Value, CultureInfo.InvariantCulture);
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
    }
}
