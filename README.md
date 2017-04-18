# Weacast

Weather prediction data are now available from the major meteorological agencies and institutions on a day-to-day basis. Current weather observations serve as input to numerical computer models, through a process known as data assimilation, to produce a forecast of the future state of weather. These models output hundreds of other meteorological elements from the oceans to the top of the atmosphere such as temperature, precipitation, icing conditions, etc. As an example, the following animated image represents a typical output of the [GFS weather forecast model](https://www.ncdc.noaa.gov/data-access/model-data/model-datasets/global-forcast-system-gfs) from NOAA.

![GFS animated image](https://www.ncdc.noaa.gov/sites/default/files/GFS%20-%2020120712_0000-small.gif)

**Weacast** (a shortcut for **Wea**ther for**cast**) aims at providing web services to expose weather forecast data in a simple manner and format (JSON). Indeed, although publicly available weather forecast data come from many different sources, in many different and dedicated formats (such as [WCS](https://en.wikipedia.org/wiki/Web_Coverage_Service), [GeoTIFF](https://en.wikipedia.org/wiki/GeoTIFF), [GRIB](http://en.wikipedia.org/wiki/GRIB), etc.), making consumption in web applications not so easy, particularly on the client-side. Last but not least, forecast data are in essence dynamic so that keeping your application up-to-date with the lastly available data is always a tedious task.

Weacast is **weather forecast model agnostic**, i.e. it mainly exposes a minimalistic framework where forecast data sources can be added on-demand to extend its capabilities in a plugin-like architecture.
