using System;
using System.Collections.Generic;
using System.Linq;
using System.Net;
using System.Web;
using System.Xml;
using System.Xml.Linq;

namespace EasyTravel.Models
{
    public class Autostoppista : User
    {
        public void evaluateDestination()
        {
            XmlDocument xDoc = new XmlDocument();
            xDoc.Load("https://maps.googleapis.com/maps/api/geocode/xml?latlng=" + this.Latitude + "," + this.Longitude + "&location_type=ROOFTOP&result_type=street_address&key=AIzaSyDkRH6z8BJwNkijUKOUODvzvaja_6D0l3w");
            XmlNodeList xNodelst = xDoc.GetElementsByTagName("result");
            XmlNode xNode = xNodelst.Item(0);
            this.Destination = xNode.SelectSingleNode("formatted_address").InnerText;
        }
        public string Destlat { get; set; }
        public string Destlon { get; set; }
        public string Longitude { get; set; }
        public string Latitude { get; set; }
        public string Destination { get; set; }
        public DateTime Date { get; set; }
    }
}