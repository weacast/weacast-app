module.exports = {
    baseLayers: [
        {
            type: 'tileLayer',
            arguments: [
                'https://{s}.tile.openstreetmap.fr/osmfr/{z}/{x}/{y}.png',
                {
                    maxZoom: 20,
                    label: 'Streets',
                    attribution: 'Map data © <a href="http://openstreetmap.org">OpenStreetMap</a> contributors'
                }
            ]
        },
        {
            type: 'tileLayer',
            arguments: [
                'http://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}.png',
                {
                    maxZoom: 20,
                    label: 'Satellite',
                    attribution: 'Tiles &copy; Esri &mdash; Source: Esri, i-cubed, USDA, USGS, ' +
                                'AEX, GeoEye, Getmapping, Aerogrid, IGN, IGP, UPR-EGP, and the GIS User Community'
                }
            ]
        },
        {
            type: 'tileLayer',
            arguments: [
                'http://{s}.sm.mapstack.stamen.com/(toner-lite,$fff[difference],$fff[@23],$fff[hsl-saturation@20])/{z}/{x}/{y}.png',
                {
                    maxZoom: 20,
                    label: 'Neutral',
                    attribution: 'Tiles &copy; Esri &mdash; Esri, DeLorme, NAVTEQ, TomTom, Intermap, iPC, USGS, FAO, ' +
                                 'NPS, NRCAN, GeoBase, Kadaster NL, Ordnance Survey, Esri Japan, METI, Esri China (Hong Kong), and the GIS User Community'
                }
            ]
        }
    ]
}
