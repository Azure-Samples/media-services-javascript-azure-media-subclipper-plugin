using System;
using System.Collections.Generic;
using System.Linq;
using System.Web.Http;

namespace AMVE
{
    public static class WebApiConfig
    {
        public static void Register(HttpConfiguration config)
        {
            config.MapHttpAttributeRoutes();

            config.Routes.MapHttpRoute(
                name: "DefaultApi",
                routeTemplate: "api/{controller}/{action}",
                defaults: null,
                constraints: new { action = @"[a-zA-Z]+" }
            );
        }
    }
}
