using System;
using System.Collections.Generic;
using System.Linq;
using System.Web;

namespace System
{
    public static class ObjExtensions
    {
        public static string ToJSON(this Object obj)
        {
            return Newtonsoft.Json.JsonConvert.SerializeObject(obj);
        }
    } 
}