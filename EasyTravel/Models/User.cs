using System;
using System.Collections.Generic;
using System.Linq;
using System.Web;

namespace EasyTravel.Models
{
    public class User
    {
        public string Name { get; set; }
        public string Surname { get; set; }
        public string Mobile { get; set; }
        public int Range { get; set; }
        public byte[] Image { get; set; }
        public string Token { get; set; }
    }
}