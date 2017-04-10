using System;
using System.Collections.Generic;
using System.Linq;
using System.Web;

namespace EasyTravel.Models
{
    public class ActiveUser : User
    {
        public string Longitude { get; set; }
        public string Latitude { get; set; }
        public DateTime Date { get; set; }
    }
}