module.exports = {
  gfs1:  {
    name: 'gfs-world-low',
    label: 'GFS - 1°',
    description: 'World-wide',
    attribution: 'Forecast data from <a href="http://www.emc.ncep.noaa.gov/index.php?branch=GFS">NCEP</a>',
    model: 'gfs',
    baseUrl: 'http://nomads.ncep.noaa.gov/cgi-bin/filter_gfs_1p00.pl',
    bounds: [0, -90, 360, 90],
    origin: [0, 90],
    size: [360, 181],
    resolution: [1, 1],
    runInterval: 6 * 3600,          // Produced every 6h
    oldestRunInterval: 24 * 3600,   // Don't go back in time older than 1 day
    interval: 3 * 3600,             // Steps of 3h
    lowerLimit: 0,                  // From T0
    upperLimit: 240 * 3600,         // Up to T0+240
    updateInterval: process.env.USE_LOADER ? -1 : 15 * 60,        // Check for update every 15 minutes
    elements: [
      {
        name: 'u-wind',
        variable: 'var_UGRD',
        levels: ['lev_10_m_above_ground'],
        bucket: 0
      },
      {
        name: 'v-wind',
        variable: 'var_VGRD',
        levels: ['lev_10_m_above_ground'],
        bucket: 1
      },
      {
        name: 'gust',
        variable: 'var_GUST',
        levels: ['surface'],
        bucket: 0
      },
      {
        name: 'precipitations',
        variable: 'var_APCP',
        levels: ['surface'],
        bucket: 1,
        lowerLimit: 3 * 3600, // Accumulation from T to T-3H
        // For forecast hours evenly divisible by 6, the accumulation period is from T-6h to T,
        // while for other forecast hours (divisible by 3 but not 6) it is from T-3h to T.
        // We unify everything to 3H accumulation period.
        transform: (options) => (options.forecastTime.hours() % 6 === 0 ? 0.5 * options.value : options.value)
      }
    ]
  },
  gfs05: {
    name: 'gfs-world',
    label: 'GFS - 0.5°',
    description: 'World-wide',
    attribution: 'Forecast data from <a href="http://www.emc.ncep.noaa.gov/index.php?branch=GFS">NCEP</a>',
    model: 'gfs',
    baseUrl: 'http://nomads.ncep.noaa.gov/cgi-bin/filter_gfs_0p50.pl',
    bounds: [0, -90, 360, 90],
    origin: [0, 90],
    size: [720, 361],
    resolution: [0.5, 0.5],
    tileResolution: [20, 20],
    timeseries: false,
    runInterval: 6 * 3600,          // Produced every 6h
    oldestRunInterval: 24 * 3600,   // Don't go back in time older than 1 day
    interval: 3 * 3600,             // Steps of 3h
    lowerLimit: 0,                  // From T0
    upperLimit: 240 * 3600,         // Up to T0+240
    updateInterval: process.env.USE_LOADER ? -1 : 15 * 60,        // Check for update every 15 minutes
    elements: [
      {
        name: 'u-wind',
        variable: 'var_UGRD',
        levels: ['lev_10_m_above_ground'],
        bucket: 0
      },
      {
        name: 'v-wind',
        variable: 'var_VGRD',
        levels: ['lev_10_m_above_ground'],
        bucket: 1
      },
      {
        name: 'gust',
        variable: 'var_GUST',
        levels: ['surface'],
        bucket: 0
      },
      {
        name: 'precipitations',
        variable: 'var_APCP',
        levels: ['surface'],
        bucket: 1,
        lowerLimit: 3 * 3600, // Accumulation from T to T-3H
        // For forecast hours evenly divisible by 6, the accumulation period is from T-6h to T,
        // while for other forecast hours (divisible by 3 but not 6) it is from T-3h to T.
        // We unify everything to 3H accumulation period.
        transform: (options) => (options.forecastTime.hours() % 6 === 0 ? 0.5 * options.value : options.value)
      }
    ]
  },
  gfs025: {
    name: 'gfs-world-high',
    label: 'GFS - 0.25°',
    description: 'World-wide',
    attribution: 'Forecast data from <a href="http://www.emc.ncep.noaa.gov/index.php?branch=GFS">NCEP</a>',
    model: 'gfs',
    baseUrl: 'http://nomads.ncep.noaa.gov/cgi-bin/filter_gfs_0p25.pl',
    bounds: [0, -90, 360, 90],
    origin: [0, 90],
    size: [1440, 721],
    resolution: [0.25, 0.25],
    tileResolution: [10, 10],
    runInterval: 6 * 3600,          // Produced every 6h
    oldestRunInterval: 24 * 3600,   // Don't go back in time older than 1 day
    interval: 1 * 3600,             // Steps of 1h
    lowerLimit: 0,                  // From T0
    upperLimit: 16 * 3600,          // Up to T0+16
    updateInterval: process.env.USE_LOADER ? -1 : 15 * 60,        // Check for update every 15 minutes
    elements: [
      {
        name: 'u-wind',
        variable: 'var_UGRD',
        levels: ['lev_10_m_above_ground'],
        bucket: 0
      },
      {
        name: 'v-wind',
        variable: 'var_VGRD',
        levels: ['lev_10_m_above_ground'],
        bucket: 1
      },
      {
        name: 'gust',
        variable: 'var_GUST',
        levels: ['surface'],
        bucket: 0
      },
      {
        name: 'precipitations',
        variable: 'var_APCP',
        levels: ['surface'],
        bucket: 1,
        lowerLimit: 3 * 3600, // Accumulation from T to T-3H
        // For forecast hours evenly divisible by 6, the accumulation period is from T-6h to T,
        // while for other forecast hours (divisible by 3 but not 6) it is from T-3h to T.
        // We unify everything to 3H accumulation period.
        transform: (options) => (options.forecastTime.hours() % 6 === 0 ? 0.5 * options.value : options.value)
      }
    ]
  },
  arpege05: {
    name: 'arpege-world',
    label: 'ARPEGE - 0.5°',
    description: 'World-wide',
    model: 'arpege',
    token: process.env.METEO_FRANCE_TOKEN || '__qEMDoIC2ogPRlSoRQLGUBOomaxJyxdEd__',
    wcsBaseUrl: 'https://geoservices.meteofrance.fr/services/MF-NWP-GLOBAL-ARPEGE-05-GLOBE-WCS?SERVICE=WCS&version=2.0.1',
    bounds: [0, -90, 360, 90],
    origin: [0, 90],
    size: [720, 361],
    resolution: [0.5, 0.5],
    tileResolution: [20, 20],
    timeseries: false,
    runInterval: 6 * 3600,          // Produced every 6h
    oldestRunInterval: 24 * 3600,   // Don't go back in time older than 1 day
    interval: 3 * 3600,             // Steps of 3h
    lowerLimit: 0,                  // From T0
    upperLimit: 102 * 3600,         // Up to T0+102
    updateInterval: process.env.USE_LOADER ? -1 : 15 * 60,        // Check for update every 15 minutes
    elements: [
      {
        name: 'u-wind',
        // Use 'db' (or remove this property as it is default) to store data directly as JSON object in DB instead of files
        //dataStore: 'fs',
        coverageid: 'U_COMPONENT_OF_WIND__SPECIFIC_HEIGHT_LEVEL_ABOVE_GROUND',
        subsets: {
          height: 10,
          long: [0, 360],
          lat: [-90, 90]
        },
        bucket: 0
      },
      {
        name: 'v-wind',
        coverageid: 'V_COMPONENT_OF_WIND__SPECIFIC_HEIGHT_LEVEL_ABOVE_GROUND',
        subsets: {
          height: 10,
          long: [0, 360],
          lat: [-90, 90]
        },
        bucket: 1
      },
      {
        name: 'gust',
        coverageid: 'WIND_SPEED_GUST__SPECIFIC_HEIGHT_LEVEL_ABOVE_GROUND',
        subsets: {
          height: 10,
          long: [0, 360],
          lat: [-90, 90]
        },
        bucket: 0
      },
      {
        name: 'precipitations',
        coverageid: 'TOTAL_PRECIPITATION__GROUND_OR_WATER_SURFACE',
        subsets: {
          long: [0, 360],
          lat: [-90, 90]
        },
        bucket: 1,
        lowerLimit: 3 * 3600, // Accumulation from T to T-3H
        accumulationPeriod: 3 * 3600
      }
    ]
  },
  arpege01: {
    name: 'arpege-europe',
    isDefault: true,
    label: 'ARPEGE - 0.1°',
    description: 'Europe',
    attribution: 'Forecast data from <a href="http://www.meteofrance.com">Météo-France</a>',
    model: 'arpege',
    token: '__qEMDoIC2ogPRlSoRQLGUBOomaxJyxdEd__',
    wcsBaseUrl: 'https://geoservices.meteofrance.fr/services/MF-NWP-GLOBAL-ARPEGE-01-EUROPE-WCS?SERVICE=WCS&version=2.0.1',
    bounds: [-32, 20, 42, 72],
    origin: [-32, 72],
    size: [741, 521],
    resolution: [0.1, 0.1],
    tileResolution: [4, 4],
    runInterval: 6 * 3600,            // Produced every 6h
    oldestRunInterval: 24 * 3600,     // Don't go back in time older than 1 day
    interval: 1 * 3600,               // Steps of 1h
    lowerLimit: 0,                    // From T0
    upperLimit: 102 * 3600,           // Up to T0+102
    updateInterval: process.env.USE_LOADER ? -1 : 15 * 60,          // Check for update every 15 minutes
    elements: [
      {
        name: 'u-wind',
        coverageid: 'U_COMPONENT_OF_WIND__SPECIFIC_HEIGHT_LEVEL_ABOVE_GROUND',
        subsets: {
          height: 10,
          long: [-32, 42],
          lat: [20, 72]
        },
        bucket: 0
      },
      {
        name: 'v-wind',
        coverageid: 'V_COMPONENT_OF_WIND__SPECIFIC_HEIGHT_LEVEL_ABOVE_GROUND',
        subsets: {
          height: 10,
          long: [-32, 42],
          lat: [20, 72]
        },
        bucket: 1
      },
      {
        name: 'gust',
        coverageid: 'WIND_SPEED_GUST__SPECIFIC_HEIGHT_LEVEL_ABOVE_GROUND',
        subsets: {
          height: 10,
          long: [-32, 42],
          lat: [20, 72]
        },
        bucket: 0
      },
      {
        name: 'precipitations',
        coverageid: 'TOTAL_PRECIPITATION__GROUND_OR_WATER_SURFACE',
        subsets: {
          long: [-32, 42],
          lat: [20, 72]
        },
        bucket: 1,
        lowerLimit: 3 * 3600, // Accumulation from T to T-3H
        accumulationPeriod: 3 * 3600
      }
    ]
  },
  arome025: {
    name: 'arome-france',
    label: 'AROME - 0.025°',
    description: 'France',
    model: 'arome',
    token: process.env.METEO_FRANCE_TOKEN || '__qEMDoIC2ogPRlSoRQLGUBOomaxJyxdEd__',
    wcsBaseUrl: 'https://geoservices.meteofrance.fr/services/MF-NWP-HIGHRES-AROME-0025-FRANCE-WCS?SERVICE=WCS&version=2.0.1',
    bounds: [-8, 38, 12, 53],
    origin: [-8, 53],
    size: [801, 601],
    resolution: [0.025, 0.025],
    tileResolution: [1, 1],
    runInterval: 3 * 3600,            // Produced every 3h
    oldestRunInterval: 24 * 3600,     // Don't go back in time older than 1 day
    interval: 1 * 3600,               // Steps of 1h
    lowerLimit: 0,                    // From T0
    upperLimit: 42 * 3600,            // Up to T0+42
    updateInterval: process.env.USE_LOADER ? -1 : 15 * 60,          // Check for update every 15 minutes
    elements: [
      {
        name: 'u-wind',
        coverageid: 'U_COMPONENT_OF_WIND__SPECIFIC_HEIGHT_LEVEL_ABOVE_GROUND',
        subsets: {
          height: 10,
          long: [-8, 12],
          lat: [38, 53]
        },
        bucket: 0
      },
      {
        name: 'v-wind',
        coverageid: 'V_COMPONENT_OF_WIND__SPECIFIC_HEIGHT_LEVEL_ABOVE_GROUND',
        subsets: {
          height: 10,
          long: [-8, 12],
          lat: [38, 53]
        },
        bucket: 1
      },
      {
        name: 'gust',
        coverageid: 'WIND_SPEED_GUST__SPECIFIC_HEIGHT_LEVEL_ABOVE_GROUND',
        subsets: {
          height: 10,
          long: [-8, 12],
          lat: [38, 53]
        },
        bucket: 0
      },
      {
        name: 'precipitations',
        coverageid: 'TOTAL_PRECIPITATION__GROUND_OR_WATER_SURFACE',
        subsets: {
          long: [-8, 12],
          lat: [38, 53]
        },
        bucket: 1,
        lowerLimit: 3 * 3600, // Accumulation from T to T-3H
        accumulationPeriod: 3 * 3600
      }
    ]
  },
  // This model generates too much data to be stored in MongoDB documents (limited to 16 MB)
  // It requires the use of the 'gridfs' data store
  arome01: {
    name: 'arome-france-high',
    label: 'AROME - 0.01°',
    description: 'France',
    model: 'arome',
    token: process.env.METEO_FRANCE_TOKEN || '__qEMDoIC2ogPRlSoRQLGUBOomaxJyxdEd__',
    wcsBaseUrl: 'https://geoservices.meteofrance.fr/services/MF-NWP-HIGHRES-AROME-001-FRANCE-WCS?SERVICE=WCS&version=2.0.1',
    bounds: [-8, 38, 12, 53],
    origin: [-8, 53],
    size: [2001, 1501],
    resolution: [0.01, 0.01],
    tileResolution: [1, 1],
    runInterval: 3 * 3600,            // Produced every 3h
    oldestRunInterval: 24 * 3600,     // Don't go back in time older than 1 day
    interval: 1 * 3600,               // Steps of 1h
    lowerLimit: 0,                    // From T0
    upperLimit: 42 * 3600,            // Up to T0+42
    updateInterval: process.env.USE_LOADER ? -1 : 15 * 60,          // Check for update every 15 minutes
    elements: [
      {
        name: 'u-wind',
        dataStore: 'gridfs',
        coverageid: 'U_COMPONENT_OF_WIND__SPECIFIC_HEIGHT_LEVEL_ABOVE_GROUND',
        subsets: {
          height: 10,
          long: [-8, 12],
          lat: [38, 53]
        },
        bucket: 0
      },
      {
        name: 'v-wind',
        dataStore: 'gridfs',
        coverageid: 'V_COMPONENT_OF_WIND__SPECIFIC_HEIGHT_LEVEL_ABOVE_GROUND',
        subsets: {
          height: 10,
          long: [-8, 12],
          lat: [38, 53]
        },
        bucket: 1
      },
      {
        name: 'gust',
        dataStore: 'gridfs',
        coverageid: 'WIND_SPEED_GUST__SPECIFIC_HEIGHT_LEVEL_ABOVE_GROUND',
        subsets: {
          height: 10,
          long: [-8, 12],
          lat: [38, 53]
        },
        bucket: 0
      },
      {
        name: 'precipitations',
        dataStore: 'gridfs',
        coverageid: 'TOTAL_PRECIPITATION__GROUND_OR_WATER_SURFACE',
        subsets: {
          long: [-8, 12],
          lat: [38, 53]
        },
        bucket: 1,
        lowerLimit: 3 * 3600, // Accumulation from T to T-3H
        accumulationPeriod: 3 * 3600
      }
    ]
  }
}
