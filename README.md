![Weacast Logo](https://avatars3.githubusercontent.com/u/27728487?v=3&s=200)

#  Weacast

**This is a WIP, not yet ready for production use**

Weather prediction data are now available from the major meteorological agencies and institutions on a day-to-day basis. Current weather observations serve as input to numerical computer models, through a process known as data assimilation, to produce a forecast of the future state of weather. These models output hundreds of other meteorological elements from the oceans to the top of the atmosphere such as temperature, precipitation, icing conditions, etc. As an example, the following animated image represents a typical output of the [GFS weather forecast model](https://www.ncdc.noaa.gov/data-access/model-data/model-datasets/global-forcast-system-gfs) from NOAA.

![GFS animated image](https://www.ncdc.noaa.gov/sites/default/files/GFS%20-%2020120712_0000-small.gif)

**Weacast** (a shortcut for **Wea**ther for**cast**) aims at providing web services to expose weather forecast data in a simple manner and format. Indeed, although publicly available weather forecast data come from many different sources, in many different and dedicated protocols/formats (such as [WCS](https://en.wikipedia.org/wiki/Web_Coverage_Service), [GeoTIFF](https://en.wikipedia.org/wiki/GeoTIFF), [GRIB](http://en.wikipedia.org/wiki/GRIB), etc.), making consumption in web applications not so easy, particularly on the client-side. Moreover, forecast data often contain hundred of elements such as temperature, wind, etc. but a few are usually required by a specific business use case. Last but not least, forecast data are in essence dynamic so that keeping your application up-to-date with the lastly available data is always a tedious task.

Weacast is **weather forecast model agnostic**, i.e. it mainly exposes a minimalistic framework where forecast data sources can be added on-demand to extend its capabilities in a plugin-like architecture. These data are then available in Weacast through simple REST services in JSON format and can be visualized using the built-in web app.

Currently supported plugins are the following:
* [ARPEGE](https://github.com/weacast/weacast-arpege) model from [Meteo France](http://www.meteofrance.com/simulations-numeriques-meteorologiques/monde)
* [AROME](https://github.com/weacast/weacast-arome) model from [Meteo France](http://www.meteofrance.com/simulations-numeriques-meteorologiques/monde)
* [GFS](https://github.com/weacast/weacast-gfs) model from [NOAA](https://www.ncdc.noaa.gov/data-access/model-data/model-datasets/global-forcast-system-gfs)

## Documentation

The [Weacast docs](https://weacast.gitbooks.io/weacast-docs/) are loaded with awesome stuff and tell you every thing you need to know about using and configuring Weacast.

## What is inside ?

Weacast is powered by the following stack:
* [Feathers](https://feathersjs.com/) on the backend side
* [Quasar](http://quasar-framework.org/) on the frontend side

If you are not familiar with those technologies, in addition to read the dedicated documentation, I recommand reading https://github.com/claustres/quasar-feathers-tutorial. Indeed, Weacast itself is a template web application based on the [Quasar wrapper for Feathers](https://github.com/quasarframework/quasar-wrapper-feathersjs-api), while Weacast plugins are [Feathers plugins](https://docs.feathersjs.com/guides/advanced/creating-a-plugin.html). 



