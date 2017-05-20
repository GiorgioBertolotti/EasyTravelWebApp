using Newtonsoft.Json;
using System;
using System.Collections.Generic;
using System.Collections.Specialized;
using System.IO;
using System.Linq;
using System.Net;
using System.Text;
using System.Web;
using System.Xml;
using System.Xml.Linq;

namespace EasyTravel.Models
{
    public class Autostoppista : User
    {
        public void evaluateDestination()
        {
            HttpWebRequest request = (HttpWebRequest)HttpWebRequest.Create("https://maps.googleapis.com/maps/api/geocode/json?latlng=" + this.Destlat + "," + this.Destlon + "&result_type=street_address&key=AIzaSyDkRH6z8BJwNkijUKOUODvzvaja_6D0l3w");
            request.Method = "GET";
            using (HttpWebResponse response = (HttpWebResponse)request.GetResponse())
            {
                Stream dataStream = response.GetResponseStream();
                StreamReader reader = new StreamReader(dataStream);
                dynamic result = JsonConvert.DeserializeObject(reader.ReadToEnd());
                reader.Close();
                dataStream.Close();
                if (result.status=="OK")
                    this.Destination = result.results[0].formatted_address;
                else
                    this.Destination = this.Destlat + ", " + this.Destlon;
            }
        }
        public string Destlat { get; set; }
        public string Destlon { get; set; }
        public string Longitude { get; set; }
        public string Latitude { get; set; }
        public string Destination { get; set; }
        public DateTime Date { get; set; }
    }
}