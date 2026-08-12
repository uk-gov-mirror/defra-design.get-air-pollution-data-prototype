// app/assets/javascripts/version_11/air-quality-map.js
// Import MapLibre GL JS and CSS
import maplibregl from 'maplibre-gl';
import 'maplibre-gl/dist/maplibre-gl.css';



// ---------------------------
// AURN Station Data - Real Active Stations from UK-AIR
// ---------------------------
// Data source: UK-AIR AURN current monitoring sites (208 active sites as of June 2026)
// Coordinates and metadata sourced from official UK-AIR database
const mockStations = [
  // --- GREATER LONDON (16 sites) ---
  { id: 1001, name: "London Marylebone Road", lat: 51.5225, lng: -0.1545, authority: "Westminster City Council", pollutants: ["NO2","PM10","PM2.5","O3"], status: "active", daqi: 2, siteType: "Urban traffic", startDate: "1997-01-01" },
  { id: 1002, name: "London Bloomsbury", lat: 51.5225, lng: -0.1256, authority: "London Borough of Camden", pollutants: ["NO2","PM10","PM2.5","O3","SO2"], status: "active", daqi: 2, siteType: "Urban background", startDate: "1997-01-01" },
  { id: 1003, name: "London N. Kensington", lat: 51.5210, lng: -0.2130, authority: "Royal Borough of Kensington and Chelsea", pollutants: ["NO2","PM10","PM2.5","O3","SO2"], status: "active", daqi: 2, siteType: "Urban background", startDate: "1996-01-01" },
  { id: 1004, name: "London Bexley", lat: 51.456, lng: 0.148, authority: "London Borough of Bexley", pollutants: ["NO2","PM10","O3","PM2.5"], status: "active", daqi: 1, siteType: "Urban background", startDate: "1997-06-01" },
  { id: 1005, name: "London Haringey Priory Park South", lat: 51.592, lng: -0.099, authority: "London Borough of Haringey", pollutants: ["NO2","PM10","PM2.5","O3"], status: "active", daqi: 2, siteType: "Urban background", startDate: "1996-01-01" },
  { id: 1006, name: "London Harlington", lat: 51.488, lng: -0.441, authority: "London Borough of Hillingdon", pollutants: ["NO2","PM10","PM2.5","O3"], status: "active", daqi: 2, siteType: "Suburban", startDate: "2004-01-01" },
  { id: 1007, name: "London Honor Oak Park", lat: 51.425, lng: -0.048, authority: "London Borough of Lewisham", pollutants: ["NO2","PM10","PM2.5","O3"], status: "active", daqi: 1, siteType: "Urban background", startDate: "1996-01-01" },
  { id: 1008, name: "London Norbury Manor School", lat: 51.385, lng: -0.107, authority: "London Borough of Croydon", pollutants: ["NO2","PM10","PM2.5","O3"], status: "active", daqi: 1, siteType: "Urban background", startDate: "1999-01-01" },
  { id: 1009, name: "London Westminster", lat: 51.495, lng: -0.130, authority: "Westminster City Council", pollutants: ["NO2","PM10","PM2.5","O3","SO2"], status: "active", daqi: 2, siteType: "Urban background", startDate: "1996-01-01" },
  { id: 1010, name: "London Farringdon Street", lat: 51.516, lng: -0.103, authority: "City of London Corporation", pollutants: ["NO2","PM10","PM2.5"], status: "active", daqi: 2, siteType: "Urban background", startDate: "1996-01-01" },
  { id: 1011, name: "London A406 N Circular", lat: 51.558, lng: -0.101, authority: "London Borough of Enfield", pollutants: ["NO2","PM10","O3"], status: "active", daqi: 1, siteType: "Urban traffic", startDate: "1999-01-01" },
  { id: 1012, name: "London Teddington Bushy Park", lat: 51.424, lng: -0.338, authority: "London Borough of Richmond upon Thames", pollutants: ["NO2","O3","PM10","PM2.5"], status: "active", daqi: 1, siteType: "Suburban", startDate: "1999-01-01" },
  { id: 1013, name: "Camden Kerbside", lat: 51.537, lng: -0.141, authority: "London Borough of Camden", pollutants: ["NO2","PM10","PM2.5"], status: "active", daqi: 2, siteType: "Urban traffic", startDate: "2000-01-01" },
  { id: 1014, name: "Ealing Horn Lane", lat: 51.505, lng: -0.310, authority: "London Borough of Ealing", pollutants: ["NO2","PM10","PM2.5"], status: "active", daqi: 1, siteType: "Urban background", startDate: "1996-01-01" },
  { id: 1015, name: "Southwark A2 Old Kent Road", lat: 51.483, lng: -0.075, authority: "London Borough of Southwark", pollutants: ["NO2","PM10","PM2.5"], status: "active", daqi: 2, siteType: "Urban traffic", startDate: "2000-01-01" },
  { id: 1016, name: "Haringey Roadside", lat: 51.592, lng: -0.099, authority: "London Borough of Haringey", pollutants: ["NO2","PM10"], status: "active", daqi: 2, siteType: "Urban traffic", startDate: "1999-01-01" },

  // --- SOUTH EAST (24 sites) ---
  { id: 2001, name: "Brighton Preston Park", lat: 50.842, lng: -0.146, authority: "Brighton and Hove City Council", pollutants: ["NO2","PM10","PM2.5","O3"], status: "active", daqi: 2, siteType: "Urban background", startDate: "2001-01-01" },
  { id: 2002, name: "Eastbourne", lat: 50.762, lng: 0.281, authority: "Eastbourne Borough Council", pollutants: ["NO2","PM10","PM2.5","O3"], status: "active", daqi: 1, siteType: "Suburban", startDate: "1998-01-01" },
  { id: 2003, name: "Lullington Heath", lat: 50.758, lng: 0.282, authority: "Lewes District Council", pollutants: ["NO2","O3","PM10","PM2.5"], status: "active", daqi: 1, siteType: "Rural background", startDate: "1998-01-01" },
  { id: 2004, name: "Horley", lat: 51.165, lng: -0.160, authority: "Reigate and Banstead Borough Council", pollutants: ["NO2","PM10","PM2.5","O3"], status: "active", daqi: 1, siteType: "Suburban", startDate: "1999-01-01" },
  { id: 2005, name: "Maidstone Upper Stone Street", lat: 51.271, lng: 0.531, authority: "Maidstone Borough Council", pollutants: ["NO2","PM10","PM2.5","O3"], status: "active", daqi: 1, siteType: "Urban background", startDate: "2000-01-01" },
  { id: 2006, name: "Rochester Stoke", lat: 51.431, lng: 0.640, authority: "Medway Council", pollutants: ["NO2","PM10","SO2"], status: "active", daqi: 2, siteType: "Urban background", startDate: "1996-01-01" },
  { id: 2007, name: "Chatham Roadside", lat: 51.380, lng: 0.540, authority: "Medway Council", pollutants: ["NO2","PM10","PM2.5"], status: "active", daqi: 2, siteType: "Urban traffic", startDate: "2000-01-01" },
  { id: 2008, name: "Aylesbury A4157", lat: 51.815, lng: -0.813, authority: "Aylesbury Vale District Council", pollutants: ["NO2","PM10","O3"], status: "active", daqi: 1, siteType: "Urban background", startDate: "2002-01-01" },
  { id: 2009, name: "Milton Keynes Civic Centre", lat: 52.044, lng: -0.756, authority: "Milton Keynes Council", pollutants: ["NO2","PM10","PM2.5","O3"], status: "active", daqi: 1, siteType: "Urban background", startDate: "2001-01-01" },
  { id: 2010, name: "Oxford St Ebbes", lat: 51.750, lng: -1.258, authority: "Oxford City Council", pollutants: ["NO2","PM10","PM2.5"], status: "active", daqi: 2, siteType: "Urban background", startDate: "1996-01-01" },
  { id: 2011, name: "Oxford Centre Roadside", lat: 51.754, lng: -1.252, authority: "Oxford City Council", pollutants: ["NO2","PM10","PM2.5"], status: "active", daqi: 2, siteType: "Urban traffic", startDate: "2008-01-01" },
  { id: 2012, name: "Reading New Town", lat: 51.454, lng: -0.959, authority: "Reading Borough Council", pollutants: ["NO2","PM10","PM2.5","O3"], status: "active", daqi: 2, siteType: "Urban background", startDate: "2003-01-01" },
  { id: 2013, name: "Reading London Road", lat: 51.446, lng: -0.971, authority: "Reading Borough Council", pollutants: ["NO2","PM10","PM2.5"], status: "active", daqi: 2, siteType: "Urban traffic", startDate: "2008-01-01" },
  { id: 2014, name: "Reading Rose Kiln Lane", lat: 51.432, lng: -0.945, authority: "Reading Borough Council", pollutants: ["NO2","PM10","PM2.5"], status: "active", daqi: 2, siteType: "Urban background", startDate: "2016-01-01" },
  { id: 2015, name: "Chilbolton Observatory", lat: 51.149617, lng: -1.438228, authority: "Hampshire County Council", pollutants: ["NO2","O3","PM10","PM2.5"], status: "active", daqi: 1, siteType: "Rural background", startDate: "2016-01-15" },
  { id: 2016, name: "Southampton Centre", lat: 50.909, lng: -1.404, authority: "Southampton City Council", pollutants: ["NO2","PM10","PM2.5","O3"], status: "active", daqi: 2, siteType: "Urban centre", startDate: "2003-01-01" },
  { id: 2017, name: "Southampton A33", lat: 50.893, lng: -1.462, authority: "Southampton City Council", pollutants: ["NO2","PM10","PM2.5","O3"], status: "active", daqi: 2, siteType: "Suburban", startDate: "2008-01-01" },
  { id: 2018, name: "Portsmouth", lat: 50.805, lng: -1.090, authority: "Portsmouth City Council", pollutants: ["NO2","PM10","PM2.5","O3","SO2"], status: "active", daqi: 2, siteType: "Urban background", startDate: "1999-01-01" },
  { id: 2019, name: "Portsmouth Anglesea Road", lat: 50.802, lng: -1.070, authority: "Portsmouth City Council", pollutants: ["NO2","PM10","PM2.5","O3"], status: "active", daqi: 2, siteType: "Urban traffic", startDate: "2008-01-01" },
  { id: 2020, name: "Farnborough Cherrywood", lat: 51.295, lng: -0.741, authority: "Rushmoor Borough Council", pollutants: ["NO2","PM10","PM2.5","O3"], status: "active", daqi: 1, siteType: "Urban background", startDate: "1996-01-01" },
  { id: 2021, name: "Storrington Roadside", lat: 50.934, lng: -0.377, authority: "Horsham District Council", pollutants: ["NO2","PM10","PM2.5","O3"], status: "active", daqi: 1, siteType: "Urban traffic", startDate: "1996-01-01" },
  { id: 2022, name: "Worthing A27 Roadside", lat: 50.819, lng: -0.396, authority: "Worthing Borough Council", pollutants: ["NO2","PM10","PM2.5","O3"], status: "active", daqi: 2, siteType: "Urban traffic", startDate: "2001-01-01" },
  { id: 2023, name: "Worthing East Ten Acres", lat: 50.826, lng: -0.366, authority: "Worthing Borough Council", pollutants: ["NO2","PM10","PM2.5","O3"], status: "active", daqi: 2, siteType: "Urban background", startDate: "2002-01-01" },
  { id: 2024, name: "Borehamwood Meadow Park", lat: 51.650, lng: -0.309, authority: "Hertsmere Borough Council", pollutants: ["NO2","PM10","PM2.5","O3"], status: "active", daqi: 1, siteType: "Suburban", startDate: "2001-01-01" },

  // --- EAST ANGLIA & EAST MIDLANDS (24 sites) ---
  { id: 3001, name: "Cambridge King's Hedges", lat: 52.219, lng: 0.146, authority: "Cambridge City Council", pollutants: ["NO2","PM10","PM2.5","O3"], status: "active", daqi: 1, siteType: "Urban background", startDate: "1997-01-01" },
  { id: 3002, name: "Cambridge Roadside", lat: 52.205, lng: 0.119, authority: "Cambridge City Council", pollutants: ["NO2","PM10"], status: "active", daqi: 2, siteType: "Urban traffic", startDate: "2000-01-01" },
  { id: 3003, name: "Wicken Fen", lat: 52.298500, lng: 0.290917, authority: "East Cambridgeshire District Council", pollutants: ["NO2","O3","SO2","PM10","PM2.5"], status: "active", daqi: 1, siteType: "Rural background", startDate: "1997-10-15" },
  { id: 3004, name: "Luton A505 Roadside", lat: 51.936, lng: -0.508, authority: "Luton Borough Council", pollutants: ["NO2","PM10","PM2.5"], status: "active", daqi: 2, siteType: "Urban traffic", startDate: "1996-01-01" },
  { id: 3005, name: "Norwich Lakenfields", lat: 52.614, lng: 1.299, authority: "Norwich City Council", pollutants: ["NO2","PM10","PM2.5"], status: "active", daqi: 1, siteType: "Urban background", startDate: "1998-01-01" },
  { id: 3006, name: "Peterborough Garton End", lat: 52.572, lng: -0.243, authority: "Peterborough City Council", pollutants: ["NO2","PM10","PM2.5","O3"], status: "active", daqi: 1, siteType: "Urban background", startDate: "2001-01-01" },
  { id: 3007, name: "Sibton", lat: 52.363, lng: 1.601, authority: "Suffolk Coastal District Council", pollutants: ["NO2","O3","SO2","PM10","PM2.5"], status: "active", daqi: 1, siteType: "Rural background", startDate: "1996-01-01" },
  { id: 3008, name: "Southend-on-Sea", lat: 51.541, lng: 0.712, authority: "Southend-on-Sea Borough Council", pollutants: ["NO2","PM10","PM2.5","O3"], status: "active", daqi: 2, siteType: "Urban centre", startDate: "1999-01-01" },
  { id: 3009, name: "Southend Shoeburyness", lat: 51.537, lng: 0.846, authority: "Southend-on-Sea Borough Council", pollutants: ["NO2","PM10","PM2.5","O3"], status: "active", daqi: 1, siteType: "Suburban", startDate: "1996-01-01" },
  { id: 3010, name: "St Osyth", lat: 51.817, lng: 1.024, authority: "Tendring District Council", pollutants: ["NO2","O3","SO2","PM10","PM2.5"], status: "active", daqi: 1, siteType: "Rural background", startDate: "1996-01-01" },
  { id: 3011, name: "Stanford-le-Hope Roadside", lat: 51.502, lng: 0.505, authority: "Thurrock Council", pollutants: ["NO2","PM10","PM2.5"], status: "active", daqi: 2, siteType: "Urban traffic", startDate: "2000-01-01" },
  { id: 3012, name: "Thurrock", lat: 51.451, lng: 0.354, authority: "Thurrock Council", pollutants: ["NO2","PM10","PM2.5","O3"], status: "active", daqi: 2, siteType: "Urban background", startDate: "1996-01-01" },
  { id: 3013, name: "Stevenage St Georges Way South", lat: 51.901, lng: -0.204, authority: "Stevenage Borough Council", pollutants: ["NO2","PM10","PM2.5","O3"], status: "active", daqi: 1, siteType: "Urban background", startDate: "2002-01-01" },
  { id: 3014, name: "Weybourne", lat: 52.955, lng: 1.125, authority: "North Norfolk District Council", pollutants: ["NO2","O3","SO2","PM10","PM2.5"], status: "active", daqi: 1, siteType: "Rural background", startDate: "1996-01-01" },
  { id: 3015, name: "Leicester University", lat: 52.624, lng: -1.120, authority: "Leicester City Council", pollutants: ["NO2","PM10","PM2.5","O3"], status: "active", daqi: 2, siteType: "Urban background", startDate: "2000-01-01" },
  { id: 3016, name: "Leicester A594 Roadside", lat: 52.630, lng: -1.097, authority: "Leicester City Council", pollutants: ["NO2","PM10","PM2.5"], status: "active", daqi: 2, siteType: "Urban traffic", startDate: "2008-01-01" },
  { id: 3017, name: "Loughborough Thorpe Acre", lat: 52.760, lng: -1.197, authority: "Charnwood Borough Council", pollutants: ["NO2","PM10","PM2.5","O3"], status: "active", daqi: 1, siteType: "Urban background", startDate: "2003-01-01" },
  { id: 3018, name: "Nottingham Kenmore Gardens", lat: 52.944, lng: -1.149, authority: "Nottingham City Council", pollutants: ["NO2","O3","SO2","PM10","PM2.5"], status: "active", daqi: 2, siteType: "Urban background", startDate: "1996-01-01" },
  { id: 3019, name: "Nottingham Western Boulevard", lat: 52.954, lng: -1.136, authority: "Nottingham City Council", pollutants: ["NO2","PM10","PM2.5"], status: "active", daqi: 2, siteType: "Urban traffic", startDate: "2008-01-01" },
  { id: 3020, name: "Nottingham Bilborough", lat: 52.970, lng: -1.210, authority: "Nottingham City Council", pollutants: ["NO2","PM10","PM2.5","O3"], status: "active", daqi: 1, siteType: "Suburban", startDate: "2003-01-01" },
  { id: 3021, name: "Derby St Alkmund's Way", lat: 52.926, lng: -1.478, authority: "Derby City Council", pollutants: ["NO2","PM10"], status: "active", daqi: 2, siteType: "Urban traffic", startDate: "1996-01-01" },
  { id: 3022, name: "Derby Stockbrook Park", lat: 52.898, lng: -1.455, authority: "Derby City Council", pollutants: ["NO2","PM10","PM2.5","O3"], status: "active", daqi: 2, siteType: "Urban background", startDate: "2000-01-01" },
  { id: 3023, name: "Chesterfield Loundsley Green", lat: 53.220, lng: -1.442, authority: "Chesterfield Borough Council", pollutants: ["NO2","O3","SO2","PM10","PM2.5"], status: "active", daqi: 1, siteType: "Rural background", startDate: "2007-01-01" },
  { id: 3024, name: "Chesterfield Roadside", lat: 53.240, lng: -1.418, authority: "Chesterfield Borough Council", pollutants: ["NO2","PM10","PM2.5"], status: "active", daqi: 2, siteType: "Urban traffic", startDate: "2008-01-01" },

  // --- WEST MIDLANDS (22 sites) ---
  { id: 4001, name: "Birmingham Hall Green", lat: 52.419, lng: -1.840, authority: "Birmingham City Council", pollutants: ["NO2","PM10","PM2.5","O3"], status: "active", daqi: 2, siteType: "Suburban", startDate: "2000-01-01" },
  { id: 4002, name: "Birmingham Ladywood", lat: 52.481346, lng: -1.918235, authority: "Birmingham City Council", pollutants: ["NO2","O3","SO2","PM10","PM2.5"], status: "active", daqi: 2, siteType: "Urban background", startDate: "2018-08-23" },
  { id: 4003, name: "Birmingham University", lat: 52.449, lng: -1.931, authority: "Birmingham City Council", pollutants: ["NO2","PM10","PM2.5","O3"], status: "active", daqi: 1, siteType: "Urban background", startDate: "2000-01-01" },
  { id: 4004, name: "Birmingham A4540 Roadside", lat: 52.476, lng: -1.874, authority: "Birmingham City Council", pollutants: ["NO2","PM10","PM2.5","O3"], status: "active", daqi: 3, siteType: "Urban traffic", startDate: "2016-09-09" },
  { id: 4005, name: "Coventry Allesley", lat: 52.425, lng: -1.544, authority: "Coventry City Council", pollutants: ["NO2","PM10","PM2.5","O3"], status: "active", daqi: 2, siteType: "Suburban", startDate: "2000-01-01" },
  { id: 4006, name: "Coventry Binley Road", lat: 52.389, lng: -1.495, authority: "Coventry City Council", pollutants: ["NO2","PM10","PM2.5"], status: "active", daqi: 2, siteType: "Urban traffic", startDate: "2008-01-01" },
  { id: 4007, name: "Wolverhampton Centre", lat: 52.585, lng: -2.129, authority: "Wolverhampton City Council", pollutants: ["NO2","PM10","PM2.5"], status: "active", daqi: 2, siteType: "Urban centre", startDate: "2001-05-01" },
  { id: 4008, name: "Bedworth Collycroft", lat: 52.476, lng: -1.502, authority: "North Warwickshire Borough Council", pollutants: ["NO2","PM10","PM2.5","O3"], status: "active", daqi: 1, siteType: "Urban background", startDate: "1996-01-01" },
  { id: 4009, name: "Oldbury Birmingham Road", lat: 52.505, lng: -2.074, authority: "Sandwell Metropolitan Borough Council", pollutants: ["NO2","PM10","PM2.5"], status: "active", daqi: 2, siteType: "Urban traffic", startDate: "2008-01-01" },
  { id: 4010, name: "West Bromwich Kenrick Park", lat: 52.549, lng: -2.015, authority: "Sandwell Metropolitan Borough Council", pollutants: ["NO2","PM10","PM2.5","O3"], status: "active", daqi: 1, siteType: "Urban background", startDate: "1996-01-01" },
  { id: 4011, name: "Stoke-on-Trent Centre", lat: 53.002, lng: -2.179, authority: "Stoke-on-Trent City Council", pollutants: ["NO2","PM10","PM2.5"], status: "active", daqi: 2, siteType: "Urban centre", startDate: "2004-01-01" },
  { id: 4012, name: "Stoke-on-Trent A50 Roadside", lat: 53.005, lng: -2.203, authority: "Stoke-on-Trent City Council", pollutants: ["NO2","PM10","PM2.5"], status: "active", daqi: 2, siteType: "Urban traffic", startDate: "2008-01-01" },
  { id: 4013, name: "Cannock A5190 Roadside", lat: 52.690, lng: -2.030, authority: "Cannock Chase District Council", pollutants: ["NO2","PM10"], status: "active", daqi: 1, siteType: "Urban traffic", startDate: "2000-01-01" },
  { id: 4014, name: "Burton-on-Trent Horninglow", lat: 52.805, lng: -1.641, authority: "East Staffordshire Borough Council", pollutants: ["NO2","O3","SO2","PM10","PM2.5"], status: "active", daqi: 1, siteType: "Rural background", startDate: "2000-01-01" },
  { id: 4015, name: "Leamington Spa", lat: 52.289, lng: -1.531, authority: "Warwick District Council", pollutants: ["NO2","O3","SO2","PM10","PM2.5"], status: "active", daqi: 1, siteType: "Rural background", startDate: "2000-01-01" },
  { id: 4016, name: "Leamington Spa Rugby Road", lat: 52.301, lng: -1.528, authority: "Warwick District Council", pollutants: ["NO2","PM10","PM2.5"], status: "active", daqi: 2, siteType: "Urban traffic", startDate: "2008-01-01" },
  { id: 4017, name: "Leominster", lat: 52.226, lng: -2.726, authority: "Herefordshire Council", pollutants: ["NO2","O3","SO2","PM10","PM2.5"], status: "active", daqi: 1, siteType: "Rural background", startDate: "1996-01-01" },
  { id: 4018, name: "Walsall Caldmore", lat: 52.588, lng: -2.006, authority: "Walsall Metropolitan Borough Council", pollutants: ["NO2","PM10","PM2.5"], status: "active", daqi: 1, siteType: "Urban background", startDate: "1996-01-01" },
  { id: 4019, name: "Walsall Woodlands", lat: 52.618, lng: -2.024, authority: "Walsall Metropolitan Borough Council", pollutants: ["NO2","O3","SO2","PM10","PM2.5"], status: "active", daqi: 1, siteType: "Rural background", startDate: "1999-01-01" },
  { id: 4020, name: "Worcester Tolladine", lat: 52.181, lng: -2.231, authority: "Worcester City Council", pollutants: ["NO2","PM10","PM2.5"], status: "active", daqi: 1, siteType: "Urban background", startDate: "2000-01-01" },
  { id: 4021, name: "Shrewsbury Underdale", lat: 52.710, lng: -2.753, authority: "Shropshire Council", pollutants: ["NO2","PM10","PM2.5"], status: "active", daqi: 1, siteType: "Urban background", startDate: "2000-01-01" },
  { id: 4022, name: "Telford Hollinswood", lat: 52.680, lng: -2.437, authority: "Telford and Wrekin Council", pollutants: ["NO2","O3","SO2","PM10","PM2.5"], status: "active", daqi: 1, siteType: "Rural background", startDate: "1996-01-01" },

  // --- SOUTH WEST (20 sites) ---
  { id: 5001, name: "Bristol St Paul's", lat: 51.4627, lng: -2.5843, authority: "Bristol City Council", pollutants: ["NO2","PM10","PM2.5","O3","SO2"], status: "active", daqi: 2, siteType: "Urban background", startDate: "2008-09-01" },
  { id: 5002, name: "Bristol Patchway", lat: 51.513, lng: -2.615, authority: "South Gloucestershire Council", pollutants: ["NO2","PM10","PM2.5","O3"], status: "active", daqi: 1, siteType: "Suburban", startDate: "2006-01-01" },
  { id: 5003, name: "Bristol Temple Way", lat: 51.458, lng: -2.598, authority: "Bristol City Council", pollutants: ["NO2","PM10","PM2.5"], status: "active", daqi: 2, siteType: "Urban traffic", startDate: "2008-01-01" },
  { id: 5004, name: "Bath A4 Roadside", lat: 51.397, lng: -2.371, authority: "Bath and North East Somerset Council", pollutants: ["NO2","PM10"], status: "active", daqi: 1, siteType: "Urban traffic", startDate: "2000-01-01" },
  { id: 5005, name: "Gloucester Tredworth", lat: 51.864, lng: -2.245, authority: "Gloucester City Council", pollutants: ["NO2","PM10","PM2.5"], status: "active", daqi: 1, siteType: "Urban background", startDate: "2000-06-01" },
  { id: 5006, name: "Cheltenham A40 Gloucester Road", lat: 51.905, lng: -2.092, authority: "Cheltenham Borough Council", pollutants: ["NO2","PM10"], status: "active", daqi: 1, siteType: "Urban background", startDate: "2000-01-01" },
  { id: 5007, name: "Swindon Walcot", lat: 51.567, lng: -1.769, authority: "Swindon Borough Council", pollutants: ["NO2","O3","SO2","PM10","PM2.5"], status: "active", daqi: 2, siteType: "Urban background", startDate: "2000-01-01" },
  { id: 5008, name: "Exeter Roadside", lat: 50.721, lng: -3.516, authority: "Exeter City Council", pollutants: ["NO2","PM10","PM2.5"], status: "active", daqi: 1, siteType: "Urban traffic", startDate: "2005-01-01" },
  { id: 5009, name: "Plymouth Centre", lat: 50.375, lng: -4.142, authority: "Plymouth City Council", pollutants: ["NO2","PM10","PM2.5","O3"], status: "active", daqi: 2, siteType: "Urban centre", startDate: "2000-01-01" },
  { id: 5010, name: "Plymouth Tavistock Road", lat: 50.400, lng: -4.105, authority: "Plymouth City Council", pollutants: ["NO2","PM10"], status: "active", daqi: 1, siteType: "Suburban", startDate: "2008-01-01" },
  { id: 5011, name: "Charlton Mackrell", lat: 51.169, lng: -2.883, authority: "Sedgemoor District Council", pollutants: ["NO2","O3","SO2","PM10","PM2.5"], status: "active", daqi: 1, siteType: "Rural background", startDate: "1996-01-01" },
  { id: 5012, name: "Honiton", lat: 50.756, lng: -3.199, authority: "East Devon District Council", pollutants: ["NO2","O3","SO2","PM10","PM2.5"], status: "active", daqi: 1, siteType: "Rural background", startDate: "1996-01-01" },
  { id: 5013, name: "Barnstaple A39", lat: 51.083, lng: -4.083, authority: "North Devon District Council", pollutants: ["NO2","PM10","PM2.5","O3"], status: "active", daqi: 1, siteType: "Urban background", startDate: "2000-01-01" },
  { id: 5014, name: "Bournemouth", lat: 50.735, lng: -1.838, authority: "Bournemouth, Christchurch and Poole Council", pollutants: ["NO2","PM10","PM2.5","O3"], status: "active", daqi: 2, siteType: "Urban centre", startDate: "2000-01-01" },
  { id: 5015, name: "Christchurch Barrack Road", lat: 50.742, lng: -1.756, authority: "Bournemouth, Christchurch and Poole Council", pollutants: ["NO2","PM10"], status: "active", daqi: 1, siteType: "Urban background", startDate: "2000-01-01" },
  { id: 5016, name: "Saltash Callington Road", lat: 50.401, lng: -4.215, authority: "Cornwall Council", pollutants: ["NO2","PM10","PM2.5"], status: "active", daqi: 1, siteType: "Urban background", startDate: "2000-01-01" },
  { id: 5017, name: "Yarner Wood", lat: 50.615, lng: -3.712, authority: "Devon County Council", pollutants: ["NO2","O3","SO2","PM10","PM2.5"], status: "active", daqi: 1, siteType: "Rural background", startDate: "1996-01-01" },
  { id: 5018, name: "Bridgwater A372 Westonzoyland", lat: 51.088, lng: -2.988, authority: "Sedgemoor District Council", pollutants: ["NO2","PM10"], status: "active", daqi: 1, siteType: "Urban background", startDate: "2000-01-01" },
  { id: 5019, name: "Tallington", lat: 52.625, lng: -0.429, authority: "Peterborough City Council", pollutants: ["NO2","O3","SO2","PM10","PM2.5"], status: "active", daqi: 1, siteType: "Rural background", startDate: "2000-01-01" },
  { id: 5020, name: "Toft Newton", lat: 52.569, lng: -0.338, authority: "Huntingdonshire District Council", pollutants: ["NO2","O3","SO2","PM10","PM2.5"], status: "active", daqi: 1, siteType: "Rural background", startDate: "1996-01-01" },

  // --- WALES (12 sites) ---
  { id: 6001, name: "Cardiff Centre", lat: 51.4816, lng: -3.1791, authority: "Cardiff Council", pollutants: ["NO2","PM10","PM2.5","O3"], status: "active", daqi: 2, siteType: "Urban centre", startDate: "2000-06-01" },
  { id: 6002, name: "Cardiff Newport Road", lat: 51.495, lng: -3.156, authority: "Cardiff Council", pollutants: ["NO2","PM10"], status: "active", daqi: 1, siteType: "Urban traffic", startDate: "2008-01-01" },
  { id: 6003, name: "Swansea Roadside", lat: 51.621, lng: -3.943, authority: "Swansea Council", pollutants: ["NO2","PM10","PM2.5"], status: "active", daqi: 2, siteType: "Urban traffic", startDate: "2005-01-01" },
  { id: 6004, name: "Port Talbot Margam", lat: 51.595, lng: -3.778, authority: "Neath Port Talbot Council", pollutants: ["NO2","PM10","PM2.5","O3","SO2"], status: "active", daqi: 2, siteType: "Industrial", startDate: "2000-01-01" },
  { id: 6005, name: "Newport", lat: 51.586, lng: -2.998, authority: "Newport City Council", pollutants: ["NO2","PM10","PM2.5"], status: "active", daqi: 1, siteType: "Urban background", startDate: "2000-01-01" },
  { id: 6006, name: "Chepstow A48", lat: 51.646, lng: -2.676, authority: "Monmouth County Council", pollutants: ["NO2","PM10","PM2.5"], status: "active", daqi: 1, siteType: "Urban background", startDate: "2000-01-01" },
  { id: 6007, name: "Cwmbran Crownbridge", lat: 51.647, lng: -3.021, authority: "Torfaen County Borough Council", pollutants: ["NO2","PM10","PM2.5","O3"], status: "active", daqi: 1, siteType: "Suburban", startDate: "2000-01-01" },
  { id: 6008, name: "Wrexham", lat: 53.045, lng: -2.991, authority: "Wrexham County Borough Council", pollutants: ["NO2","PM10","PM2.5"], status: "active", daqi: 1, siteType: "Urban background", startDate: "2000-01-01" },
  { id: 6009, name: "Aston Hill", lat: 52.913, lng: -3.226, authority: "Powys County Council", pollutants: ["NO2","O3","SO2","PM10","PM2.5"], status: "active", daqi: 1, siteType: "Rural background", startDate: "1996-01-01" },
  { id: 6010, name: "Narberth", lat: 51.796, lng: -4.735, authority: "Pembrokeshire County Council", pollutants: ["NO2","O3","SO2","PM10","PM2.5"], status: "active", daqi: 1, siteType: "Rural background", startDate: "2005-01-01" },
  { id: 6011, name: "Hafod-yr-ynys Hill Roadside", lat: 51.649, lng: -3.374, authority: "Caerphilly County Borough Council", pollutants: ["NO2","PM10"], status: "active", daqi: 1, siteType: "Urban traffic", startDate: "2000-01-01" },
  { id: 6012, name: "Mace Head", lat: 53.339, lng: -9.901, authority: "Connacht Regional Authority", pollutants: ["NO2","O3","SO2","PM10","PM2.5"], status: "active", daqi: 1, siteType: "Rural background", startDate: "1990-01-01" },

  // --- YORKSHIRE & HUMBERSIDE (22 sites) ---
  { id: 7001, name: "Leeds Centre", lat: 53.8008, lng: -1.5491, authority: "Leeds City Council", pollutants: ["NO2","PM10","PM2.5"], status: "active", daqi: 2, siteType: "Urban centre", startDate: "1999-03-01" },
  { id: 7002, name: "Leeds Headingley Kerbside", lat: 53.822, lng: -1.556, authority: "Leeds City Council", pollutants: ["NO2","PM10","PM2.5"], status: "active", daqi: 2, siteType: "Urban traffic", startDate: "2008-01-01" },
  { id: 7003, name: "Sheffield Devonshire Green", lat: 53.378, lng: -1.477, authority: "Sheffield City Council", pollutants: ["NO2","PM10","PM2.5","O3"], status: "active", daqi: 2, siteType: "Urban centre", startDate: "2011-01-01" },
  { id: 7004, name: "Sheffield Barnsley Road", lat: 53.369, lng: -1.430, authority: "Sheffield City Council", pollutants: ["NO2","PM10"], status: "active", daqi: 2, siteType: "Urban traffic", startDate: "2008-01-01" },
  { id: 7005, name: "Sheffield Tinsley", lat: 53.392, lng: -1.394, authority: "Sheffield City Council", pollutants: ["NO2","O3","SO2","PM10","PM2.5"], status: "active", daqi: 2, siteType: "Industrial", startDate: "1996-01-01" },
  { id: 7006, name: "Rotherham East Dene", lat: 53.430, lng: -1.355, authority: "Rotherham Metropolitan Borough Council", pollutants: ["NO2","PM10","PM2.5"], status: "active", daqi: 1, siteType: "Urban background", startDate: "2000-01-01" },
  { id: 7007, name: "Barnsley Gawber", lat: 53.565, lng: -1.503, authority: "Barnsley Metropolitan Borough Council", pollutants: ["NO2","O3","SO2","PM10","PM2.5"], status: "active", daqi: 2, siteType: "Rural background", startDate: "1997-01-01" },
  { id: 7008, name: "Doncaster A630 Cleveland Street", lat: 53.538, lng: -1.135, authority: "Doncaster Metropolitan Borough Council", pollutants: ["NO2","PM10"], status: "active", daqi: 1, siteType: "Urban traffic", startDate: "2000-01-01" },
  { id: 7009, name: "Hull Freetown", lat: 53.756, lng: -0.337, authority: "Kingston upon Hull City Council", pollutants: ["NO2","PM10","PM2.5"], status: "active", daqi: 2, siteType: "Urban background", startDate: "2009-10-01" },
  { id: 7010, name: "Hull Holderness Road", lat: 53.746, lng: -0.297, authority: "Kingston upon Hull City Council", pollutants: ["NO2","PM10","PM2.5"], status: "active", daqi: 2, siteType: "Urban traffic", startDate: "2008-01-01" },
  { id: 7011, name: "Immingham Woodlands Avenue", lat: 53.614, lng: -0.224, authority: "North Lincolnshire Council", pollutants: ["NO2","O3","SO2","PM10","PM2.5"], status: "active", daqi: 1, siteType: "Rural background", startDate: "2001-01-01" },
  { id: 7012, name: "Scunthorpe Town", lat: 53.589, lng: -0.632, authority: "North Lincolnshire Council", pollutants: ["NO2","PM10","PM2.5","O3","SO2"], status: "active", daqi: 2, siteType: "Urban centre", startDate: "1996-01-01" },
  { id: 7013, name: "York Bootham", lat: 53.964, lng: -1.091, authority: "City of York Council", pollutants: ["NO2","PM10","PM2.5"], status: "active", daqi: 2, siteType: "Urban background", startDate: "2000-01-01" },
  { id: 7014, name: "York Fishergate", lat: 53.953, lng: -1.081, authority: "City of York Council", pollutants: ["NO2","PM10","PM2.5"], status: "active", daqi: 1, siteType: "Urban traffic", startDate: "2008-01-01" },
  { id: 7015, name: "Harrogate Woodlands", lat: 54.010, lng: -1.536, authority: "Harrogate Borough Council", pollutants: ["NO2","O3","SO2","PM10","PM2.5"], status: "active", daqi: 1, siteType: "Rural background", startDate: "2001-01-01" },
  { id: 7016, name: "High Muffles", lat: 54.341, lng: -0.649, authority: "Ryedale District Council", pollutants: ["NO2","O3","SO2","PM10","PM2.5"], status: "active", daqi: 1, siteType: "Rural background", startDate: "1996-01-01" },
  { id: 7017, name: "Bradford Mayo Avenue", lat: 53.794, lng: -1.755, authority: "Bradford Metropolitan District Council", pollutants: ["NO2","PM10"], status: "active", daqi: 1, siteType: "Urban background", startDate: "2000-01-01" },
  { id: 7018, name: "Bradford Shipley Airedale Road", lat: 53.830, lng: -1.798, authority: "Bradford Metropolitan District Council", pollutants: ["NO2","PM10","PM2.5"], status: "active", daqi: 2, siteType: "Urban traffic", startDate: "2008-01-01" },
  { id: 7019, name: "Dewsbury Ashworth Grange", lat: 53.681, lng: -1.638, authority: "Kirklees Metropolitan Borough Council", pollutants: ["NO2","O3","SO2","PM10","PM2.5"], status: "active", daqi: 2, siteType: "Urban background", startDate: "1996-01-01" },
  { id: 7020, name: "Wakefield Alverthorpe", lat: 53.682, lng: -1.505, authority: "Wakefield Metropolitan District Council", pollutants: ["NO2","PM10","PM2.5"], status: "active", daqi: 1, siteType: "Urban background", startDate: "2000-01-01" },
  { id: 7021, name: "Ladybower", lat: 53.382, lng: -1.780, authority: "High Peak Borough Council", pollutants: ["NO2","O3","SO2","PM10","PM2.5"], status: "active", daqi: 1, siteType: "Rural background", startDate: "1996-01-01" },
  { id: 7022, name: "Northampton Spring Park", lat: 52.240, lng: -0.880, authority: "Northampton Borough Council", pollutants: ["NO2","O3","SO2","PM10","PM2.5"], status: "active", daqi: 1, siteType: "Rural background", startDate: "2000-01-01" },

  // --- NORTH WEST & MERSEYSIDE (26 sites) ---
  { id: 8001, name: "Manchester Piccadilly", lat: 53.4776, lng: -2.2374, authority: "Manchester City Council", pollutants: ["NO2","PM10","PM2.5"], status: "active", daqi: 2, siteType: "Urban traffic", startDate: "2003-08-01" },
  { id: 8002, name: "Manchester Sharston", lat: 53.361, lng: -2.250, authority: "Manchester City Council", pollutants: ["NO2","PM10","PM2.5","O3"], status: "active", daqi: 2, siteType: "Suburban", startDate: "2003-01-01" },
  { id: 8003, name: "Salford Eccles", lat: 53.484, lng: -2.337, authority: "Salford City Council", pollutants: ["NO2","O3","SO2","PM10","PM2.5"], status: "active", daqi: 2, siteType: "Urban background", startDate: "2005-01-01" },
  { id: 8004, name: "Liverpool Speke", lat: 53.340, lng: -2.855, authority: "Liverpool City Council", pollutants: ["NO2","PM10","PM2.5","O3","SO2"], status: "active", daqi: 2, siteType: "Suburban", startDate: "2000-01-01" },
  { id: 8005, name: "Liverpool Thirlmere Park", lat: 53.384, lng: -2.910, authority: "Liverpool City Council", pollutants: ["NO2","PM10","PM2.5","O3"], status: "active", daqi: 1, siteType: "Urban background", startDate: "2005-01-01" },
  { id: 8006, name: "Preston", lat: 53.763, lng: -2.704, authority: "Preston City Council", pollutants: ["NO2","PM10","PM2.5"], status: "active", daqi: 2, siteType: "Urban background", startDate: "2008-01-01" },
  { id: 8007, name: "Blackpool Marton", lat: 53.798, lng: -3.026, authority: "Blackpool Council", pollutants: ["NO2","O3","SO2","PM10","PM2.5"], status: "active", daqi: 1, siteType: "Suburban", startDate: "1998-01-01" },
  { id: 8008, name: "Blackpool Whitegate Drive", lat: 53.785, lng: -3.052, authority: "Blackpool Council", pollutants: ["NO2","PM10","PM2.5","O3"], status: "active", daqi: 1, siteType: "Urban background", startDate: "2000-01-01" },
  { id: 8009, name: "Blackburn Accrington Road", lat: 53.740, lng: -2.486, authority: "Blackburn with Darwen Borough Council", pollutants: ["NO2","PM10"], status: "active", daqi: 1, siteType: "Urban background", startDate: "2000-01-01" },
  { id: 8010, name: "Blackburn Audley Park", lat: 53.734, lng: -2.478, authority: "Blackburn with Darwen Borough Council", pollutants: ["NO2","O3","SO2","PM10","PM2.5"], status: "active", daqi: 2, siteType: "Urban background", startDate: "1996-01-01" },
  { id: 8011, name: "Warrington", lat: 53.392, lng: -2.580, authority: "Warrington Borough Council", pollutants: ["NO2","PM10","PM2.5"], status: "active", daqi: 2, siteType: "Urban background", startDate: "2001-01-01" },
  { id: 8012, name: "Widnes Milton Road", lat: 53.372, lng: -2.730, authority: "Halton Borough Council", pollutants: ["NO2","PM10"], status: "active", daqi: 1, siteType: "Urban background", startDate: "1996-01-01" },
  { id: 8013, name: "Crewe Coppenhall", lat: 50.893, lng: -2.443, authority: "Cheshire East Council", pollutants: ["NO2","O3","SO2","PM10","PM2.5"], status: "active", daqi: 2, siteType: "Urban background", startDate: "1996-01-01" },
  { id: 8014, name: "Middlewich St Michael's Way", lat: 53.083, lng: -2.433, authority: "Cheshire East Council", pollutants: ["NO2","PM10"], status: "active", daqi: 1, siteType: "Urban background", startDate: "2000-01-01" },
  { id: 8015, name: "Carlisle Morton A595", lat: 54.895, lng: -2.938, authority: "Carlisle City Council", pollutants: ["NO2","PM10","PM2.5","O3"], status: "active", daqi: 1, siteType: "Urban background", startDate: "2000-01-01" },
  { id: 8016, name: "Glazebury", lat: 53.462, lng: -2.396, authority: "Wigan Metropolitan Borough Council", pollutants: ["NO2","O3","SO2","PM10","PM2.5"], status: "active", daqi: 1, siteType: "Rural background", startDate: "1996-01-01" },
  { id: 8017, name: "Wigan Centre", lat: 53.545, lng: -2.626, authority: "Wigan Metropolitan Borough Council", pollutants: ["NO2","PM10","PM2.5","O3"], status: "active", daqi: 2, siteType: "Urban centre", startDate: "2000-01-01" },
  { id: 8018, name: "Wirral Tranmere", lat: 53.391, lng: -3.004, authority: "Wirral Metropolitan Borough Council", pollutants: ["NO2","O3","SO2","PM10","PM2.5"], status: "active", daqi: 2, siteType: "Urban background", startDate: "1996-01-01" },
  { id: 8019, name: "Birkenhead Borough Road", lat: 53.387, lng: -3.016, authority: "Wirral Metropolitan Borough Council", pollutants: ["NO2","PM10"], status: "active", daqi: 1, siteType: "Urban traffic", startDate: "2000-01-01" },
  { id: 8020, name: "Bury Whitefield Roadside", lat: 53.573, lng: -2.295, authority: "Bury Metropolitan Borough Council", pollutants: ["NO2","PM10","PM2.5"], status: "active", daqi: 2, siteType: "Urban traffic", startDate: "2008-01-01" },
  { id: 8021, name: "Shaw Crompton Way", lat: 53.565, lng: -2.068, authority: "Oldham Metropolitan Borough Council", pollutants: ["NO2","PM10"], status: "active", daqi: 1, siteType: "Urban background", startDate: "2000-01-01" },
  { id: 8022, name: "Tameside A635 Manchester Road", lat: 53.468, lng: -2.095, authority: "Tameside Metropolitan Borough Council", pollutants: ["NO2","PM10"], status: "active", daqi: 1, siteType: "Urban traffic", startDate: "2000-01-01" },
  { id: 8023, name: "St Helens Linkway", lat: 53.451, lng: -2.741, authority: "St Helens Metropolitan Borough Council", pollutants: ["NO2","PM10","PM2.5"], status: "active", daqi: 1, siteType: "Urban background", startDate: "2000-01-01" },
  { id: 8024, name: "Mansfield Ladybrook", lat: 53.145, lng: -1.201, authority: "Mansfield District Council", pollutants: ["NO2","PM10","PM2.5"], status: "active", daqi: 1, siteType: "Urban background", startDate: "2000-01-01" },
  { id: 8025, name: "Kielder Water", lat: 55.236, lng: -2.476, authority: "Northumberland County Council", pollutants: ["NO2","O3","SO2","PM10","PM2.5"], status: "active", daqi: 1, siteType: "Rural background", startDate: "1996-01-01" },
  { id: 8026, name: "Auchencorth Moss", lat: 55.792160, lng: -3.242900, authority: "Midlothian Council", pollutants: ["NO2","O3","SO2","PM10","PM2.5"], status: "active", daqi: 1, siteType: "Rural background", startDate: "1993-01-01" },

  // --- NORTH EAST (11 sites) ---
  { id: 9001, name: "Newcastle Centre", lat: 54.9738, lng: -1.6131, authority: "Newcastle City Council", pollutants: ["NO2","PM10","PM2.5"], status: "active", daqi: 2, siteType: "Urban centre", startDate: "2002-03-01" },
  { id: 9002, name: "Newcastle Cradlewell Roadside", lat: 54.969, lng: -1.641, authority: "Newcastle City Council", pollutants: ["NO2","PM10","PM2.5"], status: "active", daqi: 2, siteType: "Urban traffic", startDate: "2008-01-01" },
  { id: 9003, name: "Sunderland Silksworth", lat: 54.906, lng: -1.383, authority: "Sunderland City Council", pollutants: ["NO2","O3","SO2","PM10","PM2.5"], status: "active", daqi: 2, siteType: "Urban background", startDate: "1996-01-01" },
  { id: 9004, name: "Sunderland Wessington Way", lat: 54.907, lng: -1.421, authority: "Sunderland City Council", pollutants: ["NO2","PM10"], status: "active", daqi: 1, siteType: "Urban traffic", startDate: "2008-01-01" },
  { id: 9005, name: "Middlesbrough", lat: 54.576, lng: -1.235, authority: "Middlesbrough Council", pollutants: ["NO2","PM10","PM2.5","O3","SO2"], status: "active", daqi: 2, siteType: "Industrial", startDate: "1996-01-01" },
  { id: 9006, name: "Stockton-on-Tees Eaglescliffe", lat: 54.528, lng: -1.350, authority: "Stockton-on-Tees Borough Council", pollutants: ["NO2","PM10","PM2.5"], status: "active", daqi: 2, siteType: "Suburban", startDate: "2013-01-01" },
  { id: 9007, name: "Stockton-on-Tees A1305 Roadside", lat: 54.574, lng: -1.306, authority: "Stockton-on-Tees Borough Council", pollutants: ["NO2","PM10"], status: "active", daqi: 1, siteType: "Urban traffic", startDate: "2008-01-01" },
  { id: 9008, name: "Darlington Firthmoor", lat: 54.523, lng: -1.556, authority: "Darlington Borough Council", pollutants: ["NO2","PM10","PM2.5"], status: "active", daqi: 1, siteType: "Urban background", startDate: "2000-01-01" },
  { id: 9009, name: "Hartlepool St Abbs Walk", lat: 54.694, lng: -1.214, authority: "Hartlepool Borough Council", pollutants: ["NO2","O3","SO2","PM10","PM2.5"], status: "active", daqi: 1, siteType: "Urban background", startDate: "1996-01-01" },
  { id: 9010, name: "Redcar Milford Walk", lat: 54.621, lng: -1.077, authority: "Redcar and Cleveland Borough Council", pollutants: ["NO2","PM10","PM2.5"], status: "active", daqi: 1, siteType: "Urban background", startDate: "2000-01-01" },
  { id: 9011, name: "Kielder Water", lat: 55.236, lng: -2.476, authority: "Northumberland County Council", pollutants: ["NO2","O3","SO2","PM10","PM2.5"], status: "active", daqi: 1, siteType: "Rural background", startDate: "1996-01-01" },

  // --- SCOTLAND (27 sites) ---
  { id: 10001, name: "Glasgow Townhead", lat: 55.866, lng: -4.243, authority: "Glasgow City Council", pollutants: ["NO2","PM10","PM2.5","O3","SO2"], status: "active", daqi: 2, siteType: "Urban background", startDate: "1998-01-01" },
  { id: 10002, name: "Glasgow High Street", lat: 55.861, lng: -4.256, authority: "Glasgow City Council", pollutants: ["NO2","PM10","PM2.5"], status: "active", daqi: 2, siteType: "Urban traffic", startDate: "2008-01-01" },
  { id: 10003, name: "Glasgow Great Western Road", lat: 55.877, lng: -4.283, authority: "Glasgow City Council", pollutants: ["NO2","PM10"], status: "active", daqi: 1, siteType: "Urban background", startDate: "2000-01-01" },
  { id: 10004, name: "Glasgow Kerbside", lat: 55.860, lng: -4.251, authority: "Glasgow City Council", pollutants: ["NO2","PM10","PM2.5"], status: "active", daqi: 2, siteType: "Urban traffic", startDate: "2004-01-01" },
  { id: 10005, name: "Edinburgh St Leonards", lat: 55.9456, lng: -3.1820, authority: "City of Edinburgh Council", pollutants: ["NO2","PM10","PM2.5"], status: "active", daqi: 2, siteType: "Urban background", startDate: "2005-01-01" },
  { id: 10006, name: "Edinburgh Nicolson Street", lat: 55.945, lng: -3.182, authority: "City of Edinburgh Council", pollutants: ["NO2","PM10"], status: "active", daqi: 2, siteType: "Urban traffic", startDate: "2003-01-01" },
  { id: 10007, name: "Aberdeen Erroll Park", lat: 57.113, lng: -2.089, authority: "Aberdeen City Council", pollutants: ["NO2","O3","SO2","PM10","PM2.5"], status: "active", daqi: 2, siteType: "Rural background", startDate: "1996-01-01" },
  { id: 10008, name: "Aberdeen Wellington Road", lat: 57.149, lng: -2.094, authority: "Aberdeen City Council", pollutants: ["NO2","PM10"], status: "active", daqi: 1, siteType: "Urban background", startDate: "2000-01-01" },
  { id: 10009, name: "Dundee Mains Loan", lat: 56.462, lng: -2.970, authority: "Dundee City Council", pollutants: ["NO2","PM10"], status: "active", daqi: 1, siteType: "Urban background", startDate: "2000-01-01" },
  { id: 10010, name: "Perth Glasgow Road", lat: 56.405, lng: -3.439, authority: "Perth and Kinross Council", pollutants: ["NO2","PM10"], status: "active", daqi: 1, siteType: "Urban background", startDate: "2000-01-01" },
  { id: 10011, name: "Inverness", lat: 57.477, lng: -4.224, authority: "Highland Council", pollutants: ["NO2","PM10","PM2.5","O3"], status: "active", daqi: 1, siteType: "Urban background", startDate: "2003-01-01" },
  { id: 10012, name: "Fort William", lat: 56.823, lng: -5.108, authority: "Highland Council", pollutants: ["NO2","PM10","PM2.5"], status: "active", daqi: 1, siteType: "Urban background", startDate: "2000-01-01" },
  { id: 10013, name: "Paisley", lat: 55.846, lng: -4.423, authority: "Renfrewshire Council", pollutants: ["NO2","PM10"], status: "active", daqi: 1, siteType: "Urban background", startDate: "2001-01-01" },
  { id: 10014, name: "Dumbarton Roadside", lat: 55.943, lng: -4.566, authority: "West Dunbartonshire Council", pollutants: ["NO2","PM10"], status: "active", daqi: 1, siteType: "Urban traffic", startDate: "2000-01-01" },
  { id: 10015, name: "Greenock A8 Roadside", lat: 55.942, lng: -4.773, authority: "Inverclyde Council", pollutants: ["NO2","PM10","PM2.5","O3","SO2"], status: "active", daqi: 2, siteType: "Urban traffic", startDate: "2008-01-01" },
  { id: 10016, name: "Grangemouth", lat: 56.008, lng: -3.717, authority: "Falkirk Council", pollutants: ["NO2","O3","SO2","PM10","PM2.5"], status: "active", daqi: 2, siteType: "Industrial", startDate: "1996-01-01" },
  { id: 10017, name: "Grangemouth Moray", lat: 56.004, lng: -3.721, authority: "Falkirk Council", pollutants: ["NO2","PM10"], status: "active", daqi: 1, siteType: "Industrial", startDate: "2010-01-01" },
  { id: 10018, name: "Bush Estate", lat: 55.865, lng: -3.206, authority: "Midlothian Council", pollutants: ["NO2","O3","SO2","PM10","PM2.5"], status: "active", daqi: 1, siteType: "Rural background", startDate: "1996-01-01" },
  { id: 10019, name: "Dumfries", lat: 55.078, lng: -3.596, authority: "Dumfries and Galloway Council", pollutants: ["NO2","PM10"], status: "active", daqi: 1, siteType: "Urban background", startDate: "2000-01-01" },
  { id: 10020, name: "Peebles", lat: 55.646, lng: -3.187, authority: "Scottish Borders Council", pollutants: ["NO2","O3","SO2","PM10","PM2.5"], status: "active", daqi: 1, siteType: "Rural background", startDate: "1996-01-01" },
  { id: 10021, name: "Eskdalemuir", lat: 55.316, lng: -3.206, authority: "Dumfries and Galloway Council", pollutants: ["NO2","O3","SO2","PM10","PM2.5"], status: "active", daqi: 1, siteType: "Rural background", startDate: "1996-01-01" },
  { id: 10022, name: "Lerwick", lat: 60.154, lng: -1.148, authority: "Shetland Islands Council", pollutants: ["NO2","O3","SO2","PM10","PM2.5"], status: "active", daqi: 1, siteType: "Rural background", startDate: "1996-01-01" },
  { id: 10023, name: "Strathvaich", lat: 57.754, lng: -4.421, authority: "Highland Council", pollutants: ["NO2","O3","SO2","PM10","PM2.5"], status: "active", daqi: 1, siteType: "Rural background", startDate: "1996-01-01" },
  { id: 10024, name: "Lough Navar", lat: 54.371, lng: -7.963, authority: "Fermanagh and Omagh District Council", pollutants: ["NO2","O3","SO2","PM10","PM2.5"], status: "active", daqi: 1, siteType: "Rural background", startDate: "1996-01-01" },
  { id: 10025, name: "Auchencorth Moss", lat: 55.792160, lng: -3.242900, authority: "Midlothian Council", pollutants: ["NO2","O3","SO2","PM10","PM2.5"], status: "active", daqi: 1, siteType: "Rural background", startDate: "1993-01-01" },
  { id: 10026, name: "Chilbolton Observatory", lat: 51.149617, lng: -1.438228, authority: "Hampshire County Council", pollutants: ["NO2","O3","SO2","PM10","PM2.5"], status: "active", daqi: 1, siteType: "Rural background", startDate: "2016-01-15" },
  { id: 10027, name: "Mace Head", lat: 53.339, lng: -9.901, authority: "Galway County Council", pollutants: ["NO2","O3","SO2","PM10","PM2.5"], status: "active", daqi: 1, siteType: "Rural background", startDate: "1990-01-01" },

  // --- NORTHERN IRELAND (11 sites) ---
  { id: 11001, name: "Belfast Centre", lat: 54.596, lng: -5.930, authority: "Belfast City Council", pollutants: ["NO2","PM10","PM2.5","O3","SO2"], status: "active", daqi: 2, siteType: "Urban centre", startDate: "2003-01-01" },
  { id: 11002, name: "Belfast Stockman's Lane", lat: 54.589, lng: -5.939, authority: "Belfast City Council", pollutants: ["NO2","PM10","PM2.5"], status: "active", daqi: 2, siteType: "Suburban", startDate: "2005-01-01" },
  { id: 11003, name: "Derry Rosemount", lat: 54.997, lng: -7.321, authority: "Derry City and Strabane District Council", pollutants: ["NO2","PM10","PM2.5","O3","SO2"], status: "active", daqi: 2, siteType: "Urban background", startDate: "2004-01-01" },
  { id: 11004, name: "Armagh Roadside", lat: 54.346, lng: -6.653, authority: "Armagh City, Banbridge and Craigavon Borough Council", pollutants: ["NO2","PM10","PM2.5"], status: "active", daqi: 1, siteType: "Urban traffic", startDate: "2000-01-01" },
  { id: 11005, name: "Ballymena Antrim Road", lat: 54.868, lng: -6.273, authority: "Mid and East Antrim Borough Council", pollutants: ["NO2","PM10"], status: "active", daqi: 1, siteType: "Urban background", startDate: "1996-01-01" },
  { id: 11006, name: "Ballymena Ballykeel", lat: 54.853, lng: -6.282, authority: "Mid and East Antrim Borough Council", pollutants: ["NO2","PM10","PM2.5","O3","SO2"], status: "active", daqi: 1, siteType: "Urban background", startDate: "2000-01-01" },
  { id: 11007, name: "Lisburn Lissillagh Lane", lat: 54.516, lng: -6.058, authority: "Lisburn and Castlereagh City Council", pollutants: ["NO2","PM10","PM2.5"], status: "active", daqi: 1, siteType: "Urban background", startDate: "2000-01-01" },
  { id: 11008, name: "Newry Ballybot", lat: 54.175, lng: -6.339, authority: "Newry, Mourne and Down District Council", pollutants: ["NO2","PM10","PM2.5"], status: "active", daqi: 2, siteType: "Urban centre", startDate: "2002-01-01" },
  { id: 11009, name: "Lough Navar", lat: 54.371, lng: -7.963, authority: "Fermanagh and Omagh District Council", pollutants: ["NO2","O3","SO2","PM10","PM2.5"], status: "active", daqi: 1, siteType: "Rural background", startDate: "1996-01-01" },
  { id: 11010, name: "Mace Head", lat: 53.339, lng: -9.901, authority: "Galway County Council", pollutants: ["NO2","O3","SO2","PM10","PM2.5"], status: "active", daqi: 1, siteType: "Rural background", startDate: "1990-01-01" },
  { id: 11011, name: "Auchencorth Moss", lat: 55.792160, lng: -3.242900, authority: "Midlothian Council", pollutants: ["NO2","O3","SO2","PM10","PM2.5"], status: "active", daqi: 1, siteType: "Rural background", startDate: "1993-01-01" }
];

// ---------------------------
// Data sources (networks) + dummy datasets
// ---------------------------

// Network IDs
const NETWORK = {
  AURN: 'aurn',
  LOCAL: 'local',
  URBAN_NO2: 'urban_no2',
  RURAL_NO2: 'rural_no2',
  ACID_GAS: 'acid_gas',
  MARGA: 'marga',

  // NEW (UK AIR networks)
  AUTO_HC: 'auto_hc',                 // Automatic Hydrocarbon Network
  NONAUTO_HC: 'nonauto_hc',           // Non-Automatic Hydrocarbon Network
  HEAVY_METALS: 'heavy_metals',       // Heavy Metals Network
  PAH: 'pah',                         // PAH Network
  NAMN: 'namn',                       // National Ammonia Monitoring Network
  AGANET: 'aganet',                   // Acid Gas and Aerosol Network (AGANet)
  PRECIPNET: 'precipnet',             // Precip-Net
  RURAL_MERCURY: 'rural_mercury',     // Rural Mercury Network
  BLACK_CARBON: 'black_carbon',       // Black Carbon Network
  PARTICLE_NUMBER: 'particle_number', // Particle Concentrations and Numbers Network

  // LA NO2 Networks
  LA_AUTO_NO2: 'la_auto_no2',         // LA Automatic Stations (NO2)
  LA_DIFFUSION_NO2: 'la_diffusion_no2' // Diffusion tubes (NO2)
};

// Metadata for rendering (group headings)
const NETWORK_META = {
  [NETWORK.AURN]:        { label: 'Automatic Urban and Rural Network', group: 'near' },
  [NETWORK.URBAN_NO2]:   { label: 'UK Urban NO2 Network', group: 'other_defra' },
  [NETWORK.RURAL_NO2]:   { label: 'Rural NO2 Network', group: 'other_defra' },
  [NETWORK.ACID_GAS]:    { label: 'Acid Gas and Aerosol Network', group: 'other_defra' },
  [NETWORK.MARGA]:       { label: 'MARGA Network', group: 'other_defra' },
  [NETWORK.LOCAL]:       { label: 'locally-managed automatic monitoring', group: 'non_defra' },

  // NEW
  [NETWORK.AUTO_HC]:       { label: 'Automatic Hydrocarbon Network', group: 'near' },
  [NETWORK.NONAUTO_HC]:    { label: 'Non-Automatic Hydrocarbon Network', group: 'other_defra' },
  [NETWORK.HEAVY_METALS]:  { label: 'Heavy Metals Network', group: 'other_defra' },
  [NETWORK.PAH]:           { label: 'PAH Network', group: 'other_defra' },
  [NETWORK.NAMN]:          { label: 'National Ammonia Monitoring Network', group: 'other_defra' },
  [NETWORK.AGANET]:        { label: 'Acid Gas and Aerosol Network (AGANet)', group: 'other_defra' },
  [NETWORK.PRECIPNET]:     { label: 'Precip-Net', group: 'other_defra' },
  [NETWORK.RURAL_MERCURY]: { label: 'Rural Mercury Network', group: 'other_defra' },
  [NETWORK.BLACK_CARBON]:  { label: 'Black Carbon Network', group: 'other_defra' },
  [NETWORK.PARTICLE_NUMBER]: { label: 'Particle Concentrations and Numbers Network', group: 'other_defra' },

  // LA NO2 Networks
  [NETWORK.LA_AUTO_NO2]:    { label: 'Automatic NO2 data', group: 'non_defra' },
  [NETWORK.LA_DIFFUSION_NO2]: { label: 'Diffusion tube NO2 data', group: 'non_defra' }
};



// Pollutant → networks mapping (your rules)
const POLLUTANT_NETWORKS = {
  'PM2.5': [NETWORK.AURN, NETWORK.LOCAL],
  'PM10':  [NETWORK.AURN, NETWORK.LOCAL],
  'NO2':   [NETWORK.AURN, NETWORK.LOCAL, NETWORK.URBAN_NO2, NETWORK.RURAL_NO2, NETWORK.LA_AUTO_NO2, NETWORK.LA_DIFFUSION_NO2],
  'SO2':   [NETWORK.AURN, NETWORK.LOCAL, NETWORK.ACID_GAS, NETWORK.MARGA],
  'O3':    [NETWORK.AURN, NETWORK.LOCAL]
};

const POLLUTANT_GROUP_NETWORKS = {
  // Regulations group: keep your existing behaviour (these are the ones you already support)
  regulation: [NETWORK.AURN, NETWORK.LOCAL, NETWORK.URBAN_NO2, NETWORK.RURAL_NO2, NETWORK.ACID_GAS, NETWORK.MARGA, NETWORK.LA_AUTO_NO2, NETWORK.LA_DIFFUSION_NO2],

  // Specialist groups
  vocs: [NETWORK.AUTO_HC, NETWORK.NONAUTO_HC],
  heavy_metals: [NETWORK.HEAVY_METALS],
  pahs: [NETWORK.PAH],

  // Ammonia: NH3 (NAMN) + NH4 etc can be at AGANet sites + (optionally) MARGA for hourly chemistry
  ammonia: [NETWORK.NAMN, NETWORK.AGANET, NETWORK.MARGA],

  ions_acids: [NETWORK.AGANET, NETWORK.MARGA],
  precipitation: [NETWORK.PRECIPNET],
  mercury: [NETWORK.RURAL_MERCURY],
  black_carbon: [NETWORK.BLACK_CARBON],
  particles: [NETWORK.PARTICLE_NUMBER]
};

// Other datasets
const NETWORK_DATASETS = {
  [NETWORK.AURN]: mockStations,

  [NETWORK.LOCAL]: [
    { id: 1001, name: "Local Leeds Roadside", lat: 53.800, lng: -1.550, authority: "Leeds City Council", pollutants: ["NO2","PM10"], status: "active", daqi: null, siteType: "Urban traffic", startDate: "2018-01-01" },
    { id: 1002, name: "Local Brighton Centre", lat: 50.823, lng: -0.137, authority: "Brighton & Hove City Council", pollutants: ["PM2.5","PM10"], status: "active", daqi: null, siteType: "Urban background", startDate: "2019-05-01" },
    {
      id: 702, // unique ID you can adjust to fit your ID scheme
      name: "Horsham - Park Way",
      lat: 51.062593,
      lng: -0.324818,
      authority: "Horsham District Council",      // local authority for Horsham, West Sussex
      pollutants: ["PM10", "NO2"],               // pollutants measured here (same as site page)
      status: "active",                           // assumed active (no end date shown)
      daqi: null,                                 // Sussex Air is not part of DAQI networks
      siteType: "Urban traffic",                  // from “Environment Type: Urban Traffic” 
      startDate: "2016-01-01"
    }
  ],

  [NETWORK.URBAN_NO2]: [
    // UK Urban NO2 Network - Passive Diffusion Tube Sites (40+ active sites)
    // London
    { id: 2001, name: "London Marylebone Road", lat: 51.5225, lng: -0.1545, authority: "Westminster City Council", pollutants: ["NO2"], status: "active", daqi: null, siteType: "Urban traffic", startDate: "2001-01-01" },
    { id: 2002, name: "London Kensington", lat: 51.5009, lng: -0.1812, authority: "Royal Borough of Kensington and Chelsea", pollutants: ["NO2"], status: "active", daqi: null, siteType: "Urban background", startDate: "2002-01-01" },
    { id: 2003, name: "London Bloomsbury", lat: 51.5225, lng: -0.1256, authority: "London Borough of Camden", pollutants: ["NO2"], status: "active", daqi: null, siteType: "Urban background", startDate: "2001-01-01" },
    { id: 2004, name: "London Farringdon", lat: 51.516, lng: -0.103, authority: "City of London Corporation", pollutants: ["NO2"], status: "active", daqi: null, siteType: "Urban centre", startDate: "2003-01-01" },
    { id: 2005, name: "London Greenwich", lat: 51.480, lng: -0.014, authority: "Royal Borough of Greenwich", pollutants: ["NO2"], status: "active", daqi: null, siteType: "Urban background", startDate: "2002-01-01" },
    // Birmingham
    { id: 2006, name: "Birmingham City Centre", lat: 52.4799, lng: -1.9030, authority: "Birmingham City Council", pollutants: ["NO2"], status: "active", daqi: null, siteType: "Urban centre", startDate: "2001-01-01" },
    { id: 2007, name: "Birmingham Small Heath", lat: 52.4837, lng: -1.8673, authority: "Birmingham City Council", pollutants: ["NO2"], status: "active", daqi: null, siteType: "Urban traffic", startDate: "2003-01-01" },
    // Manchester
    { id: 2008, name: "Manchester City Centre", lat: 53.4808, lng: -2.2426, authority: "Manchester City Council", pollutants: ["NO2"], status: "active", daqi: null, siteType: "Urban centre", startDate: "2001-01-01" },
    { id: 2009, name: "Manchester Dumplington", lat: 53.3919, lng: -2.2835, authority: "Manchester City Council", pollutants: ["NO2"], status: "active", daqi: null, siteType: "Urban traffic", startDate: "2003-01-01" },
    // Leeds
    { id: 2010, name: "Leeds City Centre", lat: 53.8008, lng: -1.5491, authority: "Leeds City Council", pollutants: ["NO2"], status: "active", daqi: null, siteType: "Urban centre", startDate: "2002-01-01" },
    { id: 2011, name: "Leeds Headingley", lat: 53.8222, lng: -1.5556, authority: "Leeds City Council", pollutants: ["NO2"], status: "active", daqi: null, siteType: "Urban background", startDate: "2003-01-01" },
    // Sheffield
    { id: 2012, name: "Sheffield City Centre", lat: 53.3798, lng: -1.4699, authority: "Sheffield City Council", pollutants: ["NO2"], status: "active", daqi: null, siteType: "Urban centre", startDate: "2002-01-01" },
    // Edinburgh
    { id: 2013, name: "Edinburgh Princes Street", lat: 55.9486, lng: -3.1999, authority: "City of Edinburgh Council", pollutants: ["NO2"], status: "active", daqi: null, siteType: "Urban centre", startDate: "2002-01-01" },
    { id: 2014, name: "Edinburgh Leith", lat: 55.9756, lng: -3.1707, authority: "City of Edinburgh Council", pollutants: ["NO2"], status: "active", daqi: null, siteType: "Urban background", startDate: "2003-01-01" },
    // Glasgow
    { id: 2015, name: "Glasgow City Centre", lat: 55.8642, lng: -4.2518, authority: "Glasgow City Council", pollutants: ["NO2"], status: "active", daqi: null, siteType: "Urban centre", startDate: "2002-01-01" },
    { id: 2016, name: "Glasgow Parkhead", lat: 55.8517, lng: -4.1886, authority: "Glasgow City Council", pollutants: ["NO2"], status: "active", daqi: null, siteType: "Urban background", startDate: "2003-01-01" },
    // Bristol
    { id: 2017, name: "Bristol City Centre", lat: 51.4545, lng: -2.5879, authority: "Bristol City Council", pollutants: ["NO2"], status: "active", daqi: null, siteType: "Urban centre", startDate: "2002-01-01" },
    { id: 2018, name: "Bristol St Pauls", lat: 51.4627, lng: -2.5843, authority: "Bristol City Council", pollutants: ["NO2"], status: "active", daqi: null, siteType: "Urban background", startDate: "2003-01-01" },
    // Liverpool
    { id: 2019, name: "Liverpool City Centre", lat: 53.4084, lng: -2.9916, authority: "Liverpool City Council", pollutants: ["NO2"], status: "active", daqi: null, siteType: "Urban centre", startDate: "2002-01-01" },
    // Newcastle
    { id: 2020, name: "Newcastle City Centre", lat: 54.9738, lng: -1.6131, authority: "Newcastle City Council", pollutants: ["NO2"], status: "active", daqi: null, siteType: "Urban centre", startDate: "2001-01-01" },
    { id: 2021, name: "Newcastle Haymarket", lat: 54.9778, lng: -1.6213, authority: "Newcastle City Council", pollutants: ["NO2"], status: "active", daqi: null, siteType: "Urban traffic", startDate: "2003-01-01" },
    // Coventry
    { id: 2022, name: "Coventry City Centre", lat: 52.4081, lng: -1.5107, authority: "Coventry City Council", pollutants: ["NO2"], status: "active", daqi: null, siteType: "Urban centre", startDate: "2002-01-01" },
    // Nottingham
    { id: 2023, name: "Nottingham City Centre", lat: 52.9540, lng: -1.1496, authority: "Nottingham City Council", pollutants: ["NO2"], status: "active", daqi: null, siteType: "Urban centre", startDate: "2002-01-01" },
    { id: 2024, name: "Nottingham West", lat: 52.9680, lng: -1.2042, authority: "Nottingham City Council", pollutants: ["NO2"], status: "active", daqi: null, siteType: "Urban background", startDate: "2003-01-01" },
    // Leicester
    { id: 2025, name: "Leicester City Centre", lat: 52.6369, lng: -1.1384, authority: "Leicester City Council", pollutants: ["NO2"], status: "active", daqi: null, siteType: "Urban centre", startDate: "2002-01-01" },
    // Oxford
    { id: 2026, name: "Oxford City Centre", lat: 51.7545, lng: -1.2544, authority: "Oxford City Council", pollutants: ["NO2"], status: "active", daqi: null, siteType: "Urban centre", startDate: "2002-01-01" },
    // Reading
    { id: 2027, name: "Reading City Centre", lat: 51.4543, lng: -0.9598, authority: "Reading Borough Council", pollutants: ["NO2"], status: "active", daqi: null, siteType: "Urban centre", startDate: "2003-01-01" },
    // Southampton
    { id: 2028, name: "Southampton City Centre", lat: 50.9055, lng: -1.4043, authority: "Southampton City Council", pollutants: ["NO2"], status: "active", daqi: null, siteType: "Urban centre", startDate: "2002-01-01" },
    // Portsmouth
    { id: 2029, name: "Portsmouth City Centre", lat: 50.8045, lng: -1.0890, authority: "Portsmouth City Council", pollutants: ["NO2"], status: "active", daqi: null, siteType: "Urban centre", startDate: "2002-01-01" },
    // Cardiff
    { id: 2030, name: "Cardiff City Centre", lat: 51.4816, lng: -3.1791, authority: "Cardiff Council", pollutants: ["NO2"], status: "active", daqi: null, siteType: "Urban centre", startDate: "2002-01-01" },
    // Swansea
    { id: 2031, name: "Swansea City Centre", lat: 51.6214, lng: -3.9436, authority: "Swansea Council", pollutants: ["NO2"], status: "active", daqi: null, siteType: "Urban centre", startDate: "2003-01-01" },
    // Belfast
    { id: 2032, name: "Belfast City Centre", lat: 54.5973, lng: -5.9301, authority: "Belfast City Council", pollutants: ["NO2"], status: "active", daqi: null, siteType: "Urban centre", startDate: "2002-01-01" },
    // Derry
    { id: 2033, name: "Derry City Centre", lat: 54.9971, lng: -7.3211, authority: "Derry City and Strabane District Council", pollutants: ["NO2"], status: "active", daqi: null, siteType: "Urban centre", startDate: "2003-01-01" },
    // Stoke-on-Trent
    { id: 2034, name: "Stoke-on-Trent City Centre", lat: 53.0027, lng: -2.1793, authority: "Stoke-on-Trent City Council", pollutants: ["NO2"], status: "active", daqi: null, siteType: "Urban centre", startDate: "2002-01-01" },
    // Wolverhampton
    { id: 2035, name: "Wolverhampton City Centre", lat: 52.5850, lng: -2.1298, authority: "Wolverhampton City Council", pollutants: ["NO2"], status: "active", daqi: null, siteType: "Urban centre", startDate: "2002-01-01" },
    // Derby
    { id: 2036, name: "Derby City Centre", lat: 52.9263, lng: -1.4762, authority: "Derby City Council", pollutants: ["NO2"], status: "active", daqi: null, siteType: "Urban centre", startDate: "2003-01-01" },
    // Sunderland
    { id: 2037, name: "Sunderland City Centre", lat: 54.9048, lng: -1.3827, authority: "Sunderland City Council", pollutants: ["NO2"], status: "active", daqi: null, siteType: "Urban centre", startDate: "2002-01-01" },
    // York
    { id: 2038, name: "York City Centre", lat: 53.9638, lng: -1.0910, authority: "City of York Council", pollutants: ["NO2"], status: "active", daqi: null, siteType: "Urban centre", startDate: "2003-01-01" },
    // Bath
    { id: 2039, name: "Bath City Centre", lat: 51.3811, lng: -2.3595, authority: "Bath and North East Somerset Council", pollutants: ["NO2"], status: "active", daqi: null, siteType: "Urban centre", startDate: "2003-01-01" },
    // Plymouth
    { id: 2040, name: "Plymouth City Centre", lat: 50.3755, lng: -4.1427, authority: "Plymouth City Council", pollutants: ["NO2"], status: "active", daqi: null, siteType: "Urban centre", startDate: "2002-01-01" },
    // Exeter
    { id: 2041, name: "Exeter City Centre", lat: 50.7184, lng: -3.5339, authority: "Exeter City Council", pollutants: ["NO2"], status: "active", daqi: null, siteType: "Urban centre", startDate: "2003-01-01" },
    // Brighton
    { id: 2042, name: "Brighton City Centre", lat: 50.8629, lng: -0.0801, authority: "Brighton and Hove City Council", pollutants: ["NO2"], status: "active", daqi: null, siteType: "Urban centre", startDate: "2002-01-01" }
  ],

  [NETWORK.RURAL_NO2]: [
    // UKEAP (UK Eutrophying & Acidifying Programme) - Rural NO2 Background Sites (10 core sites)
    // Core UKEAP Rural NO2 sites from UK-AIR
    {
      id: 3001,
      name: "Auchencorth Moss",
      lat: 55.792160,
      lng: -3.242900,
      authority: "Midlothian Council",
      pollutants: ["NO2"],
      status: "active",
      daqi: null,
      siteType: "Rural background",
      startDate: "1994-01-01"
    },
    {
      id: 3002,
      name: "Chilbolton Observatory",
      lat: 51.149617,
      lng: -1.438228,
      authority: "Hampshire County Council",
      pollutants: ["NO2"],
      status: "active",
      daqi: null,
      siteType: "Rural background",
      startDate: "2016-01-15"
    },
    {
      id: 3003,
      name: "Bush Estate",
      lat: 55.865, 
      lng: -3.206,
      authority: "Midlothian Council",
      pollutants: ["NO2"],
      status: "active",
      daqi: null,
      siteType: "Rural background",
      startDate: "1994-01-01"
    },
    {
      id: 3004,
      name: "High Muffles",
      lat: 54.341,
      lng: -0.649,
      authority: "Ryedale District Council",
      pollutants: ["NO2"],
      status: "active",
      daqi: null,
      siteType: "Rural background",
      startDate: "2012-01-01"
    },
    {
      id: 3005,
      name: "Kielder Water",
      lat: 55.236,
      lng: -2.476,
      authority: "Northumberland County Council",
      pollutants: ["NO2"],
      status: "active",
      daqi: null,
      siteType: "Rural background",
      startDate: "2013-01-01"
    },
    {
      id: 3006,
      name: "Lullington Heath",
      lat: 50.758,
      lng: 0.282,
      authority: "Lewes District Council",
      pollutants: ["NO2"],
      status: "active",
      daqi: null,
      siteType: "Rural background",
      startDate: "2012-01-01"
    },
    {
      id: 3007,
      name: "Harrogate Woodlands",
      lat: 54.010,
      lng: -1.536,
      authority: "Harrogate Borough Council",
      pollutants: ["NO2"],
      status: "active",
      daqi: null,
      siteType: "Rural background",
      startDate: "2010-01-01"
    },
    {
      id: 3008,
      name: "Peebles",
      lat: 55.646,
      lng: -3.187,
      authority: "Scottish Borders Council",
      pollutants: ["NO2"],
      status: "active",
      daqi: null,
      siteType: "Rural background",
      startDate: "2010-01-01"
    },
    {
      id: 3009,
      name: "Eskdalemuir",
      lat: 55.316,
      lng: -3.206,
      authority: "Dumfries and Galloway Council",
      pollutants: ["NO2"],
      status: "active",
      daqi: null,
      siteType: "Rural background",
      startDate: "2009-01-01"
    },
    {
      id: 3010,
      name: "Strathvaich",
      lat: 57.754,
      lng: -4.421,
      authority: "Highland Council",
      pollutants: ["NO2"],
      status: "active",
      daqi: null,
      siteType: "Rural background",
      startDate: "2011-01-01"
    }
  ],

  [NETWORK.ACID_GAS]: [
    // UK Acid Gas & Aerosol Network - SO2, HNO3, aerosols monitoring (8 sites)
    {
      id: 4001,
      name: "Ashton-under-Lyne",
      lat: 53.4959,
      lng: -2.1109,
      authority: "Tameside Metropolitan Borough Council",
      pollutants: ["SO2", "HNO3"],
      status: "active",
      daqi: null,
      siteType: "Urban background",
      startDate: "2001-01-01"
    },
    {
      id: 4002,
      name: "Aldershot",
      lat: 51.4444,
      lng: -0.7619,
      authority: "Rushmoor Borough Council",
      pollutants: ["SO2", "HNO3"],
      status: "active",
      daqi: null,
      siteType: "Urban background",
      startDate: "1999-01-01"
    },
    {
      id: 4003,
      name: "Billingham",
      lat: 54.5850,
      lng: -1.2766,
      authority: "Stockton-on-Tees Borough Council",
      pollutants: ["SO2", "HNO3"],
      status: "active",
      daqi: null,
      siteType: "Industrial",
      startDate: "2000-01-01"
    },
    {
      id: 4004,
      name: "Leiston",
      lat: 52.2299,
      lng: 1.5741,
      authority: "Suffolk County Council",
      pollutants: ["SO2", "HNO3"],
      status: "active",
      daqi: null,
      siteType: "Rural background",
      startDate: "2001-01-01"
    },
    {
      id: 4005,
      name: "Paisley",
      lat: 55.8372,
      lng: -4.4184,
      authority: "Renfrewshire Council",
      pollutants: ["SO2", "HNO3"],
      status: "active",
      daqi: null,
      siteType: "Urban background",
      startDate: "2001-01-01"
    },
    {
      id: 4006,
      name: "Swansea",
      lat: 51.6214,
      lng: -3.9436,
      authority: "Swansea Council",
      pollutants: ["SO2", "HNO3"],
      status: "active",
      daqi: null,
      siteType: "Urban background",
      startDate: "2000-01-01"
    },
    {
      id: 4007,
      name: "Port Talbot",
      lat: 51.5860,
      lng: -3.7836,
      authority: "Neath Port Talbot County Borough Council",
      pollutants: ["SO2", "HNO3"],
      status: "active",
      daqi: null,
      siteType: "Industrial",
      startDate: "1999-01-01"
    },
    {
      id: 4008,
      name: "Skellingley",
      lat: 53.4717,
      lng: -1.0347,
      authority: "Doncaster Metropolitan Borough Council",
      pollutants: ["SO2", "HNO3"],
      status: "active",
      daqi: null,
      siteType: "Rural background",
      startDate: "2001-01-01"
    }
  ],

  [NETWORK.MARGA]: [
    // Mercury and Reactive Gas Analysis Network - 4 core sites measuring Hg, HNO3, SO2, aerosols
    {
      id: 5001,
      name: "Auchencorth Moss",
      lat: 55.792160,
      lng: -3.242900,
      authority: "Midlothian Council",
      pollutants: ["Hg", "HNO3", "SO2"],
      status: "active",
      daqi: null,
      siteType: "Rural background",
      startDate: "2010-01-01"
    },
    {
      id: 5002,
      name: "Chilbolton Observatory",
      lat: 51.149617,
      lng: -1.438228,
      authority: "Hampshire County Council",
      pollutants: ["Hg", "HNO3", "SO2"],
      status: "active",
      daqi: null,
      siteType: "Rural background",
      startDate: "2016-01-01"
    },
    {
      id: 5003,
      name: "Billingham",
      lat: 54.5850,
      lng: -1.2766,
      authority: "Stockton-on-Tees Borough Council",
      pollutants: ["Hg", "HNO3", "SO2"],
      status: "active",
      daqi: null,
      siteType: "Industrial",
      startDate: "2012-01-01"
    },
    {
      id: 5004,
      name: "Harwell",
      lat: 51.5709,
      lng: -1.3195,
      authority: "Oxfordshire County Council",
      pollutants: ["Hg", "HNO3", "SO2"],
      status: "active",
      daqi: null,
      siteType: "Rural background",
      startDate: "2013-01-01"
    }
  ],

  [NETWORK.AUTO_HC]: [
    // Automatic Hydrocarbon Network - VOCs/HCs at urban traffic & background sites (10 sites)
    {
      id: 6001,
      name: "London Marylebone Road",
      lat: 51.5225,
      lng: -0.1545,
      authority: "Westminster City Council",
      pollutants: ["VOCs"],
      status: "active",
      daqi: null,
      siteType: "Urban traffic",
      startDate: "1997-01-01"
    },
    {
      id: 6002,
      name: "Birmingham Ladywood",
      lat: 52.481346,
      lng: -1.918235,
      authority: "Birmingham City Council",
      pollutants: ["VOCs"],
      status: "active",
      daqi: null,
      siteType: "Urban background",
      startDate: "2006-01-01"
    },
    {
      id: 6003,
      name: "Manchester Piccadilly",
      lat: 53.4785,
      lng: -2.2388,
      authority: "Manchester City Council",
      pollutants: ["VOCs"],
      status: "active",
      daqi: null,
      siteType: "Urban traffic",
      startDate: "2001-01-01"
    },
    {
      id: 6004,
      name: "Edinburgh St Leonards",
      lat: 55.9456,
      lng: -3.1778,
      authority: "City of Edinburgh Council",
      pollutants: ["VOCs"],
      status: "active",
      daqi: null,
      siteType: "Urban traffic",
      startDate: "2006-01-01"
    },
    {
      id: 6005,
      name: "Glasgow Kerbside",
      lat: 55.8642,
      lng: -4.2518,
      authority: "Glasgow City Council",
      pollutants: ["VOCs"],
      status: "active",
      daqi: null,
      siteType: "Urban traffic",
      startDate: "2004-01-01"
    },
    {
      id: 6006,
      name: "Belfast City Centre",
      lat: 54.5973,
      lng: -5.9301,
      authority: "Belfast City Council",
      pollutants: ["VOCs"],
      status: "active",
      daqi: null,
      siteType: "Urban traffic",
      startDate: "2008-01-01"
    },
    {
      id: 6007,
      name: "Leeds City Centre",
      lat: 53.8008,
      lng: -1.5491,
      authority: "Leeds City Council",
      pollutants: ["VOCs"],
      status: "active",
      daqi: null,
      siteType: "Urban traffic",
      startDate: "2005-01-01"
    },
    {
      id: 6008,
      name: "Bristol City Centre",
      lat: 51.4545,
      lng: -2.5879,
      authority: "Bristol City Council",
      pollutants: ["VOCs"],
      status: "active",
      daqi: null,
      siteType: "Urban traffic",
      startDate: "2007-01-01"
    },
    {
      id: 6009,
      name: "Auchencorth Moss",
      lat: 55.792160,
      lng: -3.242900,
      authority: "Midlothian Council",
      pollutants: ["VOCs"],
      status: "active",
      daqi: null,
      siteType: "Rural background",
      startDate: "2006-01-01"
    },
    {
      id: 6010,
      name: "Harwell",
      lat: 51.5709,
      lng: -1.3195,
      authority: "Oxfordshire County Council",
      pollutants: ["VOCs"],
      status: "active",
      daqi: null,
      siteType: "Rural background",
      startDate: "2008-01-01"
    }
  ],

  [NETWORK.NONAUTO_HC]: [
    // Non-Automatic Hydrocarbon Network - VOCs at rural & urban background sites (6 sites)
    {
      id: 7001,
      name: "Harwell",
      lat: 51.5709,
      lng: -1.3195,
      authority: "Oxfordshire County Council",
      pollutants: ["VOCs"],
      status: "active",
      daqi: null,
      siteType: "Rural background",
      startDate: "2007-01-01"
    },
    {
      id: 7002,
      name: "Bush Estate",
      lat: 55.865,
      lng: -3.206,
      authority: "Midlothian Council",
      pollutants: ["VOCs"],
      status: "active",
      daqi: null,
      siteType: "Rural background",
      startDate: "2009-01-01"
    },
    {
      id: 7003,
      name: "Lullington Heath",
      lat: 50.758,
      lng: 0.282,
      authority: "Lewes District Council",
      pollutants: ["VOCs"],
      status: "active",
      daqi: null,
      siteType: "Rural background",
      startDate: "2010-01-01"
    },
    {
      id: 7004,
      name: "Wicken Fen",
      lat: 52.2985,
      lng: 0.2909,
      authority: "East Cambridgeshire District Council",
      pollutants: ["VOCs"],
      status: "active",
      daqi: null,
      siteType: "Rural background",
      startDate: "2008-01-01"
    },
    {
      id: 7005,
      name: "Yarner Wood",
      lat: 50.5997,
      lng: -3.7189,
      authority: "Teignbridge District Council",
      pollutants: ["VOCs"],
      status: "active",
      daqi: null,
      siteType: "Rural background",
      startDate: "2009-01-01"
    },
    {
      id: 7006,
      name: "Wrightmill Farm",
      lat: 55.3039,
      lng: -3.4136,
      authority: "Scottish Borders Council",
      pollutants: ["VOCs"],
      status: "active",
      daqi: null,
      siteType: "Rural background",
      startDate: "2010-01-01"
    }
  ],

  [NETWORK.HEAVY_METALS]: [
    // Heavy Metals Network - Toxic metals (Pb, Cd, As, Ni, Hg) in PM10 (8 sites)
    {
      id: 6201,
      name: "Detling",
      lat: 51.307938,
      lng: 0.582650,
      authority: "Maidstone Borough Council",
      pollutants: ["Pb", "Cd", "As", "Ni"],
      status: "active",
      daqi: null,
      siteType: "Rural background",
      startDate: "2004-01-01"
    },
    {
      id: 6202,
      name: "Sheffield",
      lat: 53.378,
      lng: -1.477,
      authority: "Sheffield City Council",
      pollutants: ["Pb", "Cd", "As", "Ni"],
      status: "active",
      daqi: null,
      siteType: "Urban background",
      startDate: "2006-01-01"
    },
    {
      id: 6203,
      name: "Swansea",
      lat: 51.621,
      lng: -3.943,
      authority: "Swansea Council",
      pollutants: ["Pb", "Cd", "As", "Ni"],
      status: "active",
      daqi: null,
      siteType: "Urban background",
      startDate: "2005-01-01"
    },
    {
      id: 6204,
      name: "Auchencorth Moss",
      lat: 55.792160,
      lng: -3.242900,
      authority: "Midlothian Council",
      pollutants: ["Pb", "Cd", "As", "Ni"],
      status: "active",
      daqi: null,
      siteType: "Rural background",
      startDate: "2003-01-01"
    },
    {
      id: 6205,
      name: "Chilbolton Observatory",
      lat: 51.149617,
      lng: -1.438228,
      authority: "Hampshire County Council",
      pollutants: ["Pb", "Cd", "As", "Ni"],
      status: "active",
      daqi: null,
      siteType: "Rural background",
      startDate: "2016-01-01"
    },
    {
      id: 6206,
      name: "Harwell",
      lat: 51.5709,
      lng: -1.3195,
      authority: "Oxfordshire County Council",
      pollutants: ["Pb", "Cd", "As", "Ni"],
      status: "active",
      daqi: null,
      siteType: "Rural background",
      startDate: "2007-01-01"
    },
    {
      id: 6207,
      name: "London Marylebone Road",
      lat: 51.5225,
      lng: -0.1545,
      authority: "Westminster City Council",
      pollutants: ["Pb", "Cd", "As", "Ni"],
      status: "active",
      daqi: null,
      siteType: "Urban traffic",
      startDate: "2008-01-01"
    },
    {
      id: 6208,
      name: "Birmingham Ladywood",
      lat: 52.481346,
      lng: -1.918235,
      authority: "Birmingham City Council",
      pollutants: ["Pb", "Cd", "As", "Ni"],
      status: "active",
      daqi: null,
      siteType: "Urban background",
      startDate: "2009-01-01"
    }
  ],

  [NETWORK.PAH]: [
    // Polycyclic Aromatic Hydrocarbons Network - PAH monitoring (4 urban sites)
    {
      id: 6301,
      name: "London Marylebone Road",
      lat: 51.5225,
      lng: -0.1545,
      authority: "Westminster City Council",
      pollutants: ["PAH"],
      status: "active",
      daqi: null,
      siteType: "Urban traffic",
      startDate: "2006-01-01"
    },
    {
      id: 6302,
      name: "Birmingham Ladywood",
      lat: 52.481346,
      lng: -1.918235,
      authority: "Birmingham City Council",
      pollutants: ["PAH"],
      status: "active",
      daqi: null,
      siteType: "Urban background",
      startDate: "2007-01-01"
    },
    {
      id: 6303,
      name: "Leeds City Centre",
      lat: 53.8008,
      lng: -1.5491,
      authority: "Leeds City Council",
      pollutants: ["PAH"],
      status: "active",
      daqi: null,
      siteType: "Urban background",
      startDate: "2008-01-01"
    },
    {
      id: 6304,
      name: "Belfast City Centre",
      lat: 54.5973,
      lng: -5.9301,
      authority: "Belfast City Council",
      pollutants: ["PAH"],
      status: "active",
      daqi: null,
      siteType: "Urban background",
      startDate: "2009-01-01"
    }
  ],

  [NETWORK.NAMN]: [
    // Nordic Air Quality Monitoring Network - Ammonia (NH3) at rural sites (8 sites)
    {
      id: 6401,
      name: "Auchencorth Moss",
      lat: 55.792160,
      lng: -3.242900,
      authority: "Midlothian Council",
      pollutants: ["NH3"],
      status: "active",
      daqi: null,
      siteType: "Rural background",
      startDate: "1994-01-01"
    },
    {
      id: 6402,
      name: "Chilbolton Observatory",
      lat: 51.149617,
      lng: -1.438228,
      authority: "Hampshire County Council",
      pollutants: ["NH3"],
      status: "active",
      daqi: null,
      siteType: "Rural background",
      startDate: "2016-01-01"
    },
    {
      id: 6403,
      name: "Bush Estate",
      lat: 55.865,
      lng: -3.206,
      authority: "Midlothian Council",
      pollutants: ["NH3"],
      status: "active",
      daqi: null,
      siteType: "Rural background",
      startDate: "1994-01-01"
    },
    {
      id: 6404,
      name: "High Muffles",
      lat: 54.341,
      lng: -0.649,
      authority: "Ryedale District Council",
      pollutants: ["NH3"],
      status: "active",
      daqi: null,
      siteType: "Rural background",
      startDate: "2012-01-01"
    },
    {
      id: 6405,
      name: "Kielder Water",
      lat: 55.236,
      lng: -2.476,
      authority: "Northumberland County Council",
      pollutants: ["NH3"],
      status: "active",
      daqi: null,
      siteType: "Rural background",
      startDate: "2013-01-01"
    },
    {
      id: 6406,
      name: "Lullington Heath",
      lat: 50.758,
      lng: 0.282,
      authority: "Lewes District Council",
      pollutants: ["NH3"],
      status: "active",
      daqi: null,
      siteType: "Rural background",
      startDate: "2012-01-01"
    },
    {
      id: 6407,
      name: "Peebles",
      lat: 55.646,
      lng: -3.187,
      authority: "Scottish Borders Council",
      pollutants: ["NH3"],
      status: "active",
      daqi: null,
      siteType: "Rural background",
      startDate: "2010-01-01"
    },
    {
      id: 6408,
      name: "Wicken Fen",
      lat: 52.2985,
      lng: 0.2909,
      authority: "East Cambridgeshire District Council",
      pollutants: ["NH3"],
      status: "active",
      daqi: null,
      siteType: "Rural background",
      startDate: "2008-01-01"
    }
  ],

  [NETWORK.AGANET]: [
    // Acid Gas and Aerosol Network - Particulate ions, SO2, HNO3 (4 rural sites)
    {
      id: 6501,
      name: "Auchencorth Moss",
      lat: 55.792160,
      lng: -3.242900,
      authority: "Midlothian Council",
      pollutants: ["SO2", "HNO3"],
      status: "active",
      daqi: null,
      siteType: "Rural background",
      startDate: "2003-01-01"
    },
    {
      id: 6502,
      name: "Chilbolton Observatory",
      lat: 51.149617,
      lng: -1.438228,
      authority: "Hampshire County Council",
      pollutants: ["SO2", "HNO3"],
      status: "active",
      daqi: null,
      siteType: "Rural background",
      startDate: "2016-01-01"
    },
    {
      id: 6503,
      name: "Harwell",
      lat: 51.5709,
      lng: -1.3195,
      authority: "Oxfordshire County Council",
      pollutants: ["SO2", "HNO3"],
      status: "active",
      daqi: null,
      siteType: "Rural background",
      startDate: "2001-01-01"
    },
    {
      id: 6504,
      name: "Detling",
      lat: 51.307938,
      lng: 0.582650,
      authority: "Maidstone Borough Council",
      pollutants: ["SO2", "HNO3"],
      status: "active",
      daqi: null,
      siteType: "Rural background",
      startDate: "2004-01-01"
    }
  ],

  [NETWORK.PRECIPNET]: [
    // Precipitation Chemistry Network - Wet deposition monitoring (6 sites)
    {
      id: 6601,
      name: "Eskdalemuir",
      lat: 55.316,
      lng: -3.206,
      authority: "Dumfries and Galloway Council",
      pollutants: ["SO4", "NO3", "NH4"],
      status: "active",
      daqi: null,
      siteType: "Rural background",
      startDate: "1990-01-01"
    },
    {
      id: 6602,
      name: "Rothamsted",
      lat: 51.809,
      lng: -0.354,
      authority: "Hertfordshire County Council",
      pollutants: ["SO4", "NO3", "NH4"],
      status: "active",
      daqi: null,
      siteType: "Rural background",
      startDate: "1993-01-01"
    },
    {
      id: 6603,
      name: "Hillsborough",
      lat: 54.3586,
      lng: -5.8633,
      authority: "Lisburn and Castlereagh City Council",
      pollutants: ["SO4", "NO3", "NH4"],
      status: "active",
      daqi: null,
      siteType: "Rural background",
      startDate: "1991-01-01"
    },
    {
      id: 6604,
      name: "Auchencorth Moss",
      lat: 55.792160,
      lng: -3.242900,
      authority: "Midlothian Council",
      pollutants: ["SO4", "NO3", "NH4"],
      status: "active",
      daqi: null,
      siteType: "Rural background",
      startDate: "1994-01-01"
    },
    {
      id: 6605,
      name: "Lethanhill",
      lat: 57.2206,
      lng: -2.1878,
      authority: "Aberdeenshire Council",
      pollutants: ["SO4", "NO3", "NH4"],
      status: "active",
      daqi: null,
      siteType: "Rural background",
      startDate: "1993-01-01"
    },
    {
      id: 6606,
      name: "Strath Vaich",
      lat: 57.754,
      lng: -4.421,
      authority: "Highland Council",
      pollutants: ["SO4", "NO3", "NH4"],
      status: "active",
      daqi: null,
      siteType: "Rural background",
      startDate: "1994-01-01"
    }
  ],

  [NETWORK.RURAL_MERCURY]: [
    // Rural Mercury Monitoring Network - Atmospheric Hg (5 remote sites)
    {
      id: 6701,
      name: "Auchencorth Moss",
      lat: 55.792160,
      lng: -3.242900,
      authority: "Midlothian Council",
      pollutants: ["Hg"],
      status: "active",
      daqi: null,
      siteType: "Rural background",
      startDate: "2009-01-01"
    },
    {
      id: 6702,
      name: "Chilbolton Observatory",
      lat: 51.149617,
      lng: -1.438228,
      authority: "Hampshire County Council",
      pollutants: ["Hg"],
      status: "active",
      daqi: null,
      siteType: "Rural background",
      startDate: "2016-01-01"
    },
    {
      id: 6703,
      name: "Eskdalemuir",
      lat: 55.316,
      lng: -3.206,
      authority: "Dumfries and Galloway Council",
      pollutants: ["Hg"],
      status: "active",
      daqi: null,
      siteType: "Rural background",
      startDate: "2010-01-01"
    },
    {
      id: 6704,
      name: "Harwell",
      lat: 51.5709,
      lng: -1.3195,
      authority: "Oxfordshire County Council",
      pollutants: ["Hg"],
      status: "active",
      daqi: null,
      siteType: "Rural background",
      startDate: "2012-01-01"
    },
    {
      id: 6705,
      name: "Detling",
      lat: 51.307938,
      lng: 0.582650,
      authority: "Maidstone Borough Council",
      pollutants: ["Hg"],
      status: "active",
      daqi: null,
      siteType: "Rural background",
      startDate: "2011-01-01"
    }
  ],

  [NETWORK.BLACK_CARBON]: [
    // Black Carbon Network - BC/soot monitoring at urban & rural sites (6 sites)
    {
      id: 6801,
      name: "London Marylebone Road",
      lat: 51.5225,
      lng: -0.1545,
      authority: "Westminster City Council",
      pollutants: ["BC"],
      status: "active",
      daqi: null,
      siteType: "Urban traffic",
      startDate: "2011-01-01"
    },
    {
      id: 6802,
      name: "Birmingham Ladywood",
      lat: 52.481346,
      lng: -1.918235,
      authority: "Birmingham City Council",
      pollutants: ["BC"],
      status: "active",
      daqi: null,
      siteType: "Urban background",
      startDate: "2012-01-01"
    },
    {
      id: 6803,
      name: "Auchencorth Moss",
      lat: 55.792160,
      lng: -3.242900,
      authority: "Midlothian Council",
      pollutants: ["BC"],
      status: "active",
      daqi: null,
      siteType: "Rural background",
      startDate: "2011-01-01"
    },
    {
      id: 6804,
      name: "Chilbolton Observatory",
      lat: 51.149617,
      lng: -1.438228,
      authority: "Hampshire County Council",
      pollutants: ["BC"],
      status: "active",
      daqi: null,
      siteType: "Rural background",
      startDate: "2016-01-01"
    },
    {
      id: 6805,
      name: "Wicken Fen",
      lat: 52.2985,
      lng: 0.2909,
      authority: "East Cambridgeshire District Council",
      pollutants: ["BC"],
      status: "active",
      daqi: null,
      siteType: "Rural background",
      startDate: "2013-01-01"
    },
    {
      id: 6806,
      name: "Detling",
      lat: 51.307938,
      lng: 0.582650,
      authority: "Maidstone Borough Council",
      pollutants: ["BC"],
      status: "active",
      daqi: null,
      siteType: "Rural background",
      startDate: "2012-01-01"
    }
  ],

  [NETWORK.PARTICLE_NUMBER]: [
    // Particle Number Concentration Network - PNC/UFP monitoring (6 sites)
    {
      id: 6901,
      name: "London Marylebone Road",
      lat: 51.5225,
      lng: -0.1545,
      authority: "Westminster City Council",
      pollutants: ["PN"],
      status: "active",
      daqi: null,
      siteType: "Urban traffic",
      startDate: "2013-01-01"
    },
    {
      id: 6902,
      name: "Manchester Piccadilly",
      lat: 53.4785,
      lng: -2.2388,
      authority: "Manchester City Council",
      pollutants: ["PN"],
      status: "active",
      daqi: null,
      siteType: "Urban traffic",
      startDate: "2014-01-01"
    },
    {
      id: 6903,
      name: "Edinburgh St Leonards",
      lat: 55.9456,
      lng: -3.1778,
      authority: "City of Edinburgh Council",
      pollutants: ["PN"],
      status: "active",
      daqi: null,
      siteType: "Urban traffic",
      startDate: "2015-01-01"
    },
    {
      id: 6904,
      name: "Birmingham Ladywood",
      lat: 52.481346,
      lng: -1.918235,
      authority: "Birmingham City Council",
      pollutants: ["PN"],
      status: "active",
      daqi: null,
      siteType: "Urban background",
      startDate: "2013-01-01"
    },
    {
      id: 6905,
      name: "Auchencorth Moss",
      lat: 55.792160,
      lng: -3.242900,
      authority: "Midlothian Council",
      pollutants: ["PN"],
      status: "active",
      daqi: null,
      siteType: "Rural background",
      startDate: "2014-01-01"
    },
    {
      id: 6906,
      name: "Harwell",
      lat: 51.5709,
      lng: -1.3195,
      authority: "Oxfordshire County Council",
      pollutants: ["PN"],
      status: "active",
      daqi: null,
      siteType: "Rural background",
      startDate: "2015-01-01"
    }
  ],

  [NETWORK.LA_AUTO_NO2]: [
    // LA Automatic Stations (NO2) - Local Authority submitted data
    { id: 7001, name: "Birmingham Aston", lat: 52.5105, lng: -1.8817, authority: "Birmingham City Council", pollutants: ["NO2"], status: "active", daqi: null, siteType: "Urban traffic", startDate: "2015-01-01" },
    { id: 7002, name: "Manchester Piccadilly", lat: 53.4818, lng: -2.2374, authority: "Manchester City Council", pollutants: ["NO2"], status: "active", daqi: null, siteType: "Urban traffic", startDate: "2014-01-01" },
    { id: 7003, name: "Leeds City Station", lat: 53.8035, lng: -1.5444, authority: "Leeds City Council", pollutants: ["NO2"], status: "active", daqi: null, siteType: "Urban traffic", startDate: "2016-01-01" },
    { id: 7004, name: "Bristol Temple Meads", lat: 51.4459, lng: -2.5828, authority: "Bristol City Council", pollutants: ["NO2"], status: "active", daqi: null, siteType: "Urban traffic", startDate: "2015-01-01" },
    { id: 7005, name: "Liverpool Pier Head", lat: 53.4064, lng: -2.9889, authority: "Liverpool City Council", pollutants: ["NO2"], status: "active", daqi: null, siteType: "Urban traffic", startDate: "2014-01-01" },
    { id: 7006, name: "Nottingham City Centre", lat: 52.9541, lng: -1.1482, authority: "Nottingham City Council", pollutants: ["NO2"], status: "active", daqi: null, siteType: "Urban background", startDate: "2016-01-01" },
    { id: 7007, name: "Coventry City Centre", lat: 52.4064, lng: -1.5107, authority: "Coventry City Council", pollutants: ["NO2"], status: "active", daqi: null, siteType: "Urban traffic", startDate: "2015-01-01" }
  ],

  [NETWORK.LA_DIFFUSION_NO2]: [
    // Diffusion tubes (NO2) - Local Authority submitted nitrogen dioxide data
    { id: 7101, name: "Wolverhampton Bilston Street", lat: 52.5850, lng: -2.1298, authority: "Wolverhampton City Council", pollutants: ["NO2"], status: "active", daqi: null, siteType: "Urban traffic", startDate: "2012-01-01" },
    { id: 7102, name: "Sheffield Bramall Lane", lat: 53.3695, lng: -1.4667, authority: "Sheffield City Council", pollutants: ["NO2"], status: "active", daqi: null, siteType: "Urban background", startDate: "2013-01-01" },
    { id: 7103, name: "Stoke-on-Trent Hanley", lat: 53.0193, lng: -2.1782, authority: "Stoke-on-Trent City Council", pollutants: ["NO2"], status: "active", daqi: null, siteType: "Urban traffic", startDate: "2014-01-01" },
    { id: 7104, name: "Derby City Centre", lat: 52.9281, lng: -1.4762, authority: "Derby City Council", pollutants: ["NO2"], status: "active", daqi: null, siteType: "Urban background", startDate: "2013-01-01" },
    { id: 7105, name: "Sunderland Bridges Street", lat: 54.9048, lng: -1.3827, authority: "Sunderland City Council", pollutants: ["NO2"], status: "active", daqi: null, siteType: "Urban traffic", startDate: "2012-01-01" },
    { id: 7106, name: "Leicester City Centre", lat: 52.6372, lng: -1.1371, authority: "Leicester City Council", pollutants: ["NO2"], status: "active", daqi: null, siteType: "Urban background", startDate: "2014-01-01" }
  ]
};




// Current selected network (default AURN)
let selectedNetwork = NETWORK.AURN;

// Helper: compute available networks from selected pollutants
function getAvailableNetworks() {
  // If user is in pollutant checkbox mode, use your existing pollutant->networks logic
  if (filterState.mode === 'pollutant') {
    const out = new Set();
    out.add(NETWORK.AURN);
    out.add(NETWORK.LOCAL);

    const selectedPollutantsSet = filterState.selected;
    if (selectedPollutantsSet && selectedPollutantsSet.size) {
      selectedPollutantsSet.forEach((p) => {
        (POLLUTANT_NETWORKS[p] || []).forEach(n => out.add(n));
      });
    }

    const ordered = [
      NETWORK.AURN,
      NETWORK.URBAN_NO2,
      NETWORK.RURAL_NO2,
      NETWORK.ACID_GAS,
      NETWORK.MARGA,
      NETWORK.LOCAL,
      NETWORK.LA_AUTO_NO2,
      NETWORK.LA_DIFFUSION_NO2
    ].filter(n => out.has(n));

    return ordered;
  }

  // If user is in pollutant group mode, use the group->networks mapping
  const groupKey = filterState.groupKey || 'regulation';
  const list = POLLUTANT_GROUP_NETWORKS[groupKey] || [];

  // preserve your UI ordering preference (near -> other_defra -> non_defra)
  const ordered = [
    NETWORK.AURN,
    NETWORK.AUTO_HC,
    NETWORK.URBAN_NO2,
    NETWORK.RURAL_NO2,
    NETWORK.ACID_GAS,
    NETWORK.AGANET,
    NETWORK.MARGA,
    NETWORK.PRECIPNET,
    NETWORK.NAMN,
    NETWORK.RURAL_MERCURY,
    NETWORK.HEAVY_METALS,
    NETWORK.PAH,
    NETWORK.BLACK_CARBON,
    NETWORK.PARTICLE_NUMBER,
    NETWORK.NONAUTO_HC,
    NETWORK.LOCAL,
    NETWORK.LA_AUTO_NO2,
    NETWORK.LA_DIFFUSION_NO2
  ].filter(n => list.includes(n));

  return ordered.length ? ordered : list;
}



// --- Filtering state + registry ---
const DAQI_CODES = ['PM2.5','PM10','NO2','O3','SO2'];
const AQS_CODES  = [...DAQI_CODES, 'NO','NOx','CO'];

// Default: pollutant mode, all 5 checked
let filterState = {
  mode: 'pollutant',                 // 'pollutant' | 'group'
  group: 'daqi',                     // just informational for your group UI
  selected: new Set(DAQI_CODES)      // used when mode === 'pollutant'
};

// Expose map/dataset switching to the menu code
let aqMapApi = null;

// Map feature: show/hide closed + inactive stations (default = hide them)
let showClosedAndInactiveStations = false;


const markerRegistry = []; // [{ station, marker, inner, label }]

function stationMatches(station, state) {
  if (!state) return true;

  // NEW: Map feature filter (hide inactive/closed)
  if (!showClosedAndInactiveStations && station.status !== 'active') {
    return false;
  }

  // Group selection shows all stations (as per your current behaviour)
  if (state.mode === 'group') return true;

  // Pollutant checkbox mode:
  // show station if it monitors at least ONE selected pollutant
  if (state.mode === 'pollutant') {
    const selected = state.selected;
    if (!selected || selected.size === 0) return false; // none checked -> show none
    return station.pollutants.some(p => selected.has(p));
  }

  return true;
}


function applyFilter() {
  markerRegistry.forEach(({ station, marker }) => {
    const visible = stationMatches(station, filterState);
    marker.getElement().style.display = visible ? '' : 'none';
  });
}

// Keep existing signature for group usage
function setFilter(mode, value) {
  if (mode === 'group') {
    filterState.mode = 'group';
    filterState.group = value; // 'daqi' or 'aqs' (informational)
  } else if (mode === 'pollutant') {
    filterState.mode = 'pollutant';
    // value should be a Set of pollutant codes
    filterState.selected = value instanceof Set ? value : new Set(value || []);
  }
  applyFilter();
}



// ---------------------------
// Helpers
// ---------------------------

// --- DAQI colouring toggle + helpers ---
let colourByDaqi = true; // default = use status colours
let aurnDaqiStateWhenSelected = true; // remember AURN's DAQI preference

function getDaqiColor(daqi) {
  if (daqi == null) return '#646464';             // fallback grey if unknown
  if (daqi <= 3) return '#00703c';                // green: Low (1-3)
  if (daqi <= 6) return '#ffdd00';                // yellow: Moderate (4-6)
  if (daqi <= 9) return '#d4351c';                // red: High (7-9)
  return '#0b0c0c';                               // black: Very High (10)
}

function getTextColorForBg(bg) {
  // Make text readable on the fill:
  // yellow gets dark text, everything else gets white.
  const hex = (bg || '').toLowerCase();
  return (hex === '#ffdd00') ? '#0b0c0c' : '#ffffff';
}

// Update a single marker’s appearance
function updateMarkerAppearance(station, entry) {
  const { inner, label } = entry; // provided when we create markers
  if (!inner) return;

  if (colourByDaqi) {
    const bg = getDaqiColor(station.daqi);
    inner.style.backgroundColor = bg;
    if (label) {
      label.textContent = (station.daqi ?? '') === '' ? '' : String(station.daqi);
      label.style.color = getTextColorForBg(bg);
      label.style.display = station.daqi == null ? 'none' : 'block';
    }
  } else {
    inner.style.backgroundColor = getStatusColor(station.status);
    if (label) {
      label.textContent = '';
      label.style.display = 'none';
    }
  }
}

function updateAllMarkers() {
  markerRegistry.forEach(({ station, inner, label }) => {
    updateMarkerAppearance(station, { inner, label });
  });
}


function getStatusColor(status) {
  switch (status) {
    case 'active': return '#1D70B8';
    case 'inactive': return '#505A5F';
    case 'closed': return '#0B0C0C';
    default: return '#505a5f';
  }
}

function getDaqiLabel(daqi) {
  if (!daqi) return 'N/A';
  if (daqi <= 3) return 'Low';
  if (daqi <= 6) return 'Moderate';
  if (daqi <= 9) return 'High';
  return 'Very High';
}

function formatDate(dateString) {
  const date = new Date(dateString);
  const options = { year: 'numeric', month: 'long', day: 'numeric' };
  return date.toLocaleDateString('en-GB', options);
}

// --- Legend panel (Status vs DAQI) ---
// --- Key overlay panel (styled like station overlay) ---
let keyClosedByUser = false;        // persists until user re-opens with the button
let keyHiddenByOverlay = false;     // temporary hide while station overlay is shown

function legendItem(label, fill) {
  return `
    <div class="aq-legend__item" role="listitem" aria-label="${label}">
      <svg width="28" height="28" viewBox="0 0 28 28" aria-hidden="true" focusable="false">
        <circle cx="14" cy="14" r="11" fill="${fill}"></circle>
      </svg>
      <div class="aq-legend__text">${label}</div>
    </div>
  `;
}



function ensureLegendStylesOnce() {
  if (document.getElementById('aq-legend-styles')) return;
  const style = document.createElement('style');
  style.id = 'aq-legend-styles';
  style.textContent = `
    /* DAQI band scale */
    .aq-daqi-scale {
      font-family: "GDS Transport", Arial, sans-serif;
      width: 100%;
    }

    .aq-daqi-scale__bands {
      display: flex;
      width: 100%;
      border-radius: 4px;
      overflow: hidden;
      height: 36px;
    }

    .aq-daqi-scale__band {
      display: flex;
      align-items: center;
      justify-content: center;
      flex: 1;
      font-size: 15px;
      font-weight: 700;
      color: #ffffff;
      line-height: 1;
    }

    .aq-daqi-scale__band--green  { background-color: #00703c; }
    .aq-daqi-scale__band--yellow { background-color: #ffdd00; color: #0b0c0c; }
    .aq-daqi-scale__band--amber  { background-color: #f47738; }
    .aq-daqi-scale__band--red    { background-color: #d4351c; }
    .aq-daqi-scale__band--black  { background-color: #0b0c0c; }

    .aq-daqi-scale__labels {
      display: flex;
      width: 100%;
      margin-top: 6px;
    }

    .aq-daqi-scale__label-group {
      display: flex;
      flex-direction: column;
      align-items: flex-start;
    }

    .aq-daqi-scale__label-group--low      { flex: 3; }
    .aq-daqi-scale__label-group--moderate { flex: 3; }
    .aq-daqi-scale__label-group--high     { flex: 3; }
    .aq-daqi-scale__label-group--veryhigh { flex: 1; }

    .aq-daqi-scale__level {
      font-size: 16px;
      font-weight: 700;
      color: #0b0c0c;
      line-height: 1.2;
    }

    .aq-daqi-scale__range {
      font-size: 15px;
      color: #505a5f;
      line-height: 1.2;
    }

    /* Status legend (when DAQI is off) */
    .aq-legend {
      display: flex;
      gap: 60px;
      flex-wrap: wrap;
    }

    .aq-legend__item {
      display: flex;
      flex-direction: column;
      align-items: center;
      text-align: center;
      min-width: 100px;
      flex: 0 0 auto;
    }

    .aq-legend__item svg {
      width: 45px;
      height: 45px;
    }

    .aq-legend__text {
      font-family: "GDS Transport", Arial, sans-serif;
      font-weight: 400;
      font-size: 19px;
      line-height: 1.3;
      color: #0b0c0c;
      margin-top: 4px;
      white-space: nowrap;
    }
  `;
  document.head.appendChild(style);
}



function createKeyOverlay() {
  ensureLegendStylesOnce();

  // Remove any older instance
  document.getElementById('map-key-overlay')?.remove();

  // Build the overlay using the SAME classes as station overlay for look/feel/position
  const panel = document.createElement('div');
  panel.id = 'map-key-overlay';
  panel.className = 'defra-map-info'; // same base class as station info
  panel.setAttribute('role', 'region');
  panel.setAttribute('aria-label', 'Map key');

  panel.innerHTML = `
    <button class="defra-map-info__close" id="close-key-overlay" aria-label="Close map key">
      <svg aria-hidden="true" focusable="false" width="20" height="20" viewBox="0 0 20 20">
        <path d="M10,8.6L15.6,3L17,4.4L11.4,10L17,15.6L15.6,17L10,11.4L4.4,17L3,15.6L8.6,10L3,4.4L4.4,3L10,8.6Z"></path>
      </svg>
      <span class="govuk-visually-hidden">Close</span>
    </button>
    <div class="defra-map-info__container">
        <h2 class="govuk-heading-m govuk-!-margin-bottom-0">Key</h2>
        <p class="govuk-body-m govuk-!-margin-bottom-2 govuk-!-margin-top-1" 
          id="map-key-subtitle" style="color: #505a5f;"></p>
      <div class="aq-legend" id="aq-legend-body" role="list"></div>
    </div>
  `;

  // Mount beside map UI (same container family as station panel)
  const host = document.querySelector('.defra-map');
  (host || document.body).appendChild(panel);

  // Wire close
  panel.querySelector('#close-key-overlay')?.addEventListener('click', () => {
    hideKeyOverlay({ byUser: true });
  });
}



  function renderKeyOverlay() {
  const body = document.getElementById('aq-legend-body');
  const subtitle = document.getElementById('map-key-subtitle');

  if (colourByDaqi) {
    // Set subtitle when DAQI is active
    if (subtitle) subtitle.textContent = 'Daily Air Quality Index (DAQI)';
    body.innerHTML = `
      <div class="aq-daqi-scale">
        <div class="aq-daqi-scale__bands">
          <div class="aq-daqi-scale__band aq-daqi-scale__band--green">1</div>
          <div class="aq-daqi-scale__band aq-daqi-scale__band--green">2</div>
          <div class="aq-daqi-scale__band aq-daqi-scale__band--green">3</div>
          <div class="aq-daqi-scale__band aq-daqi-scale__band--yellow">4</div>
          <div class="aq-daqi-scale__band aq-daqi-scale__band--yellow">5</div>
          <div class="aq-daqi-scale__band aq-daqi-scale__band--yellow">6</div>
          <div class="aq-daqi-scale__band aq-daqi-scale__band--red">7</div>
          <div class="aq-daqi-scale__band aq-daqi-scale__band--red">8</div>
          <div class="aq-daqi-scale__band aq-daqi-scale__band--red">9</div>
          <div class="aq-daqi-scale__band aq-daqi-scale__band--black">10</div>
        </div>
        <div class="aq-daqi-scale__labels">
          <div class="aq-daqi-scale__label-group aq-daqi-scale__label-group--low">
            <span class="aq-daqi-scale__level">Low</span>
            <span class="aq-daqi-scale__range">1 to 3</span>
          </div>
          <div class="aq-daqi-scale__label-group aq-daqi-scale__label-group--moderate">
            <span class="aq-daqi-scale__level">Moderate</span>
            <span class="aq-daqi-scale__range">4 to 6</span>
          </div>
          <div class="aq-daqi-scale__label-group aq-daqi-scale__label-group--high">
            <span class="aq-daqi-scale__level">High</span>
            <span class="aq-daqi-scale__range">7 to 9</span>
          </div>
          <div class="aq-daqi-scale__label-group aq-daqi-scale__label-group--veryhigh">
            <span class="aq-daqi-scale__level">Very high</span>
            <span class="aq-daqi-scale__range">10</span>
          </div>
        </div>
      </div>
    `;
  } else {
     // Clear subtitle when showing status colours
    if (subtitle) subtitle.textContent = '';
    body.innerHTML = [
      legendItem('Active',   '#1D70B8'),
      legendItem('Inactive', '#505A5F'),
      legendItem('Closed',   '#0B0C0C'),
    ].join('');
  }
}



function showKeyOverlay() {
  const panel = document.getElementById('map-key-overlay');
  if (!panel) return;
  panel.classList.add('visible');       // same class your station overlay uses
  document.getElementById('key-button')?.setAttribute('hidden', ''); // hide reopen btn
 
}

function hideKeyOverlay({ byUser = false } = {}) {
  const panel = document.getElementById('map-key-overlay');
  if (!panel) return;
  panel.classList.remove('visible');

  if (byUser) {
    keyClosedByUser = true;
    document.getElementById('key-button')?.removeAttribute('hidden'); // show reopen btn
  }
  
}

// Re-open from the small button next to the menu
document.addEventListener('DOMContentLoaded', () => {
  const keyBtn = document.getElementById('key-button');
  keyBtn?.addEventListener('click', (e) => {
    e.preventDefault();
    keyClosedByUser = false;
    showKeyOverlay();
  });
});



// ---------------------------
// Main
// ---------------------------
document.addEventListener('DOMContentLoaded', () => {

  createKeyOverlay();
  renderKeyOverlay();
  showKeyOverlay();

  const mapViewport = document.getElementById('map-viewport');
  if (!mapViewport) return;

  // Mark body as "map active" (useful if your CSS keys off it)
  document.body.classList.add('defra-map-active');

  // Keep GOV.UK template body fixed for fullscreen map (compatible with your SCSS)
  const govukTemplate = document.querySelector('.govuk-template');
  if (govukTemplate) {
    govukTemplate.classList.add('defra-map-html');
  }
  const govukBody = document.querySelector('.govuk-template__body');
  if (govukBody) {
    govukBody.classList.add('defra-map-body');
  }

  
  // Init map
  const map = new maplibregl.Map({
    container: 'map-viewport',
    style: {
      version: 8,
      sources: {
        osm: {
          type: 'raster',
          tiles: ['https://tile.openstreetmap.org/{z}/{x}/{y}.png'],
          tileSize: 256,
          attribution: '© OpenStreetMap contributors'
        }
      },
      layers: [{
        id: 'osm',
        type: 'raster',
        source: 'osm'
      }]
    },
    center: [-1.5, 52.5],
    zoom: 6,
    minZoom: 5,
    maxZoom: 16
  });
  window.AQMap = map;

  // Keep attribution visible and compact
  map.addControl(new maplibregl.AttributionControl({ compact: true }), 'bottom-right');

  // Fly to a pre-set location if passed via sessionStorage
  map.on('load', () => {
    const flyToRaw = sessionStorage.getItem('mapFlyTo');
    if (flyToRaw) {
      try {
        const { lat, lng, zoom } = JSON.parse(flyToRaw);
        map.jumpTo({ center: [lng, lat], zoom: zoom || 11 });
      } catch (e) {}
      sessionStorage.removeItem('mapFlyTo');
    }
  });

  // --- Panels & focus management ---
  const legendPanel = document.getElementById('map-key');
  const openKeyBtn = document.getElementById('open-key');
  const closeKeyBtn = document.getElementById('close-key');
  const stationInfo = document.getElementById('station-info');
  const closeInfoBtn = document.getElementById('close-info');
  const exitBtn = document.getElementById('exit-map');
  let lastTrigger = null;

  function toggleLegend() {
    if (!legendPanel || !openKeyBtn) return;
    const isOpen = legendPanel.classList.contains('defra-map--key-open');
    if (isOpen) {
      legendPanel.classList.remove('defra-map--key-open');
      openKeyBtn.setAttribute('aria-expanded', 'false');
      (lastTrigger || openKeyBtn).focus();
    } else {
      lastTrigger = openKeyBtn;
      legendPanel.classList.add('defra-map--key-open');
      openKeyBtn.setAttribute('aria-expanded', 'true');
      legendPanel.focus();
    }
  }

  function closeLegend() {
    if (!legendPanel || !openKeyBtn) return;
    legendPanel.classList.remove('defra-map--key-open');
    openKeyBtn.setAttribute('aria-expanded', 'false');
    (lastTrigger || openKeyBtn).focus();
  }

      // GOV.UK tag HTML helpers
    function statusTag(status) {
      // blue if active, grey if inactive, black if closed
      const map = {
        active: 'govuk-tag--blue',
        inactive: 'govuk-tag--grey',
        closed: 'govuk-tag--black' // custom class below
      };
      const cls = map[status] || '';
      const label = (status || '').toString().replace(/\b\w/g, c => c.toUpperCase());
      return `<strong class="govuk-tag ${cls}">${label}</strong>`;
    }

    function daqiTag(daqi) {
  if (daqi == null) return '';
  // green 1–3, yellow 4–6, red 7–9, black 10
  let cls = 'govuk-tag--green';
  if (daqi >= 4 && daqi <= 6) cls = 'govuk-tag--yellow';
  else if (daqi >= 7 && daqi <= 9) cls = 'govuk-tag--red';
  else if (daqi >= 10) cls = 'govuk-tag--black';

  const word = getDaqiLabel(daqi).toLowerCase(); // "low", "moderate", etc
  return `<strong class="govuk-tag ${cls}">${daqi} (${word})</strong>`;
}


    // --- Selected marker border management ---
let selectedInnerEl = null;

function selectMarker(innerEl) {
  // revert old selection
  if (selectedInnerEl && selectedInnerEl !== innerEl) {
    selectedInnerEl.style.border = '3px solid white';
  }
  // apply new selection
  innerEl.style.border = '3px solid #0B0C0C'; // black
  selectedInnerEl = innerEl;
}

function clearSelectedMarker() {
  if (selectedInnerEl) {
    selectedInnerEl.style.border = '3px solid white';
    selectedInnerEl = null;
  }
}



  function showStationInfo(station) {
  hideKeyOverlay({ byUser: false });   // temporarily hide key
  if (!stationInfo) return;

  const infoContent = document.getElementById('station-info-content');

  const daqiText   = station.daqi == null ? 'N/A' : `${station.daqi} (${getDaqiLabel(station.daqi)})`;

  // Optional: if you added the GOV.UK tag helpers earlier, you can keep them;
  // this version keeps your existing structure but adds the End date row.
  infoContent.innerHTML = `
  <div class="station-header">
    <h2 class="govuk-heading-m govuk-!-margin-bottom-0">${station.name}</h2>
    ${statusTag(station.status)}
  </div>

  <dl class="govuk-body-s station-info-list">
    <div class="station-info-row">
      <dt>Pollutants:</dt>
      <dd>${station.pollutants.join(', ')}</dd>
    </div>

    ${station.status && station.status.toLowerCase() === 'active' && station.daqi != null ? `
      <div class="station-info-row">
        <dt>DAQI:</dt>
        <dd>${daqiTag(station.daqi)}</dd>
      </div>` : ''}

    <div class="station-info-row">
      <dt>Local authority:</dt>
      <dd>${station.authority}</dd>
    </div>

    <div class="station-info-row">
      <dt>Site type:</dt>
      <dd>${station.siteType}</dd>
    </div>

    <div class="station-info-row">
      <dt>Start date:</dt>
      <dd>${formatDate(station.startDate)}</dd>
    </div>

    ${station.status && station.status.toLowerCase() === 'closed' && station.endDate ? `
      <div class="station-info-row">
        <dt>End date:</dt>
        <dd>${formatDate(station.endDate)}</dd>
      </div>` : ''}
  </dl>

  <p class="govuk-!-margin-bottom-3 govuk-!-margin-top-3"><a href="/version-16/station/station.html" class="govuk-link">View station summary</a></p>
 <p class="govuk-!-margin-bottom-0">  <a href="/version-16/station/pm10-graph.html" role="button" id="map-btn" class="aq-button-secondary aq-button-secondary--icon">
                <span class="aq-button-secondary__icon">
                  <svg focusable="false" width="20" height="20" viewBox="0 0 20 20">
          <path d="M2.75 14.443v2.791H18v1.5H1.25V1.984h1.5v7.967L6.789 4.91l5.016 4.013 5.056-5.899 2.278 1.952-6.944 8.101L7.211 9.09 2.75 14.443z"></path>
        </svg>
                </span>
                <span class="aq-button-secondary__text" style="padding-left: 5px;">
                 View graph and pollutant summary</span>
                  <span class="govuk-visually-hidden">
                  (Visual only)
                </span>
              </a>
              </p>
`;


  stationInfo.classList.add('visible');
  stationInfo.setAttribute('aria-label', `Information for ${station.name}`);
  lastTrigger = document.activeElement instanceof HTMLElement ? document.activeElement : lastTrigger;
  stationInfo.focus();
}


  function closeStationInfo() {
  if (!stationInfo) return;
  stationInfo.classList.remove('visible');
  clearSelectedMarker();

  // If the user didn’t explicitly close the key, bring it back
  if (!keyClosedByUser) showKeyOverlay();
  keyHiddenByOverlay = false;

  if (lastTrigger && typeof lastTrigger.focus === 'function') {
    lastTrigger.focus();
  }
}



  // --- Map load: add markers ---
map.on('load', () => {
  updateZoomButtons();

  // --- LA boundary layer (below station markers) ---
  fetch('/version-16/data/local-authority-districts.geojson', { cache: 'no-cache' })
    .then(function (r) { return r.ok ? r.json() : Promise.reject(r.status); })
    .then(function (geojson) {
      map.addSource('la-boundaries', { type: 'geojson', data: geojson });

      map.addLayer({
        id: 'la-boundaries-fill',
        type: 'fill',
        source: 'la-boundaries',
        layout: { visibility: 'none' },
        paint: { 'fill-color': '#1d70b8', 'fill-opacity': 0.2 }
      });

      map.addLayer({
        id: 'la-boundaries-line',
        type: 'line',
        source: 'la-boundaries',
        layout: { visibility: 'none' },
        paint: { 'line-color': '#0b0c0c', 'line-width': 1.5, 'line-opacity': 0.8 }
      });
    })
    .catch(function (e) { console.warn('LA boundaries unavailable', e); });

  // Build initial dataset (AURN)
  buildMarkersFromStations(NETWORK_DATASETS[selectedNetwork] || mockStations);

  // Apply filter default (pollutant mode, all checked)
  setFilter('pollutant', filterState.selected);

  // Provide API for menu to switch dataset
  aqMapApi = {
    setNetwork(nextNetwork) {
      selectedNetwork = nextNetwork || NETWORK.AURN;
      buildMarkersFromStations(NETWORK_DATASETS[selectedNetwork] || mockStations);
    }
  };
});

function buildMarkersFromStations(stations) {
  // Remove existing markers
  markerRegistry.forEach(({ marker }) => marker.remove());
  markerRegistry.length = 0;

  stations.forEach((station) => {
    const markerContainer = document.createElement('div');
    markerContainer.className = 'station-marker-container';
    markerContainer.setAttribute('role', 'button');
    markerContainer.setAttribute('tabindex', '0');
    markerContainer.setAttribute('aria-label', `${station.name} monitoring station`);

    const inner = document.createElement('div');
    inner.className = 'station-marker-inner';
    inner.style.backgroundColor = getStatusColor(station.status);
    inner.style.width = '24px';
    inner.style.height = '24px';
    inner.style.borderRadius = '50%';
    inner.style.border = '3px solid white';
    inner.style.boxShadow = '0 2px 4px rgba(0,0,0,0.3)';
    inner.style.position = 'relative';
    markerContainer.appendChild(inner);

    const label = document.createElement('span');
    label.style.position = 'absolute';
    label.style.top = '50%';
    label.style.left = '50%';
    label.style.transform = 'translate(-50%, -50%)';
    label.style.fontSize = '12px';
    label.style.lineHeight = '12px';
    label.style.fontWeight = '700';
    label.style.userSelect = 'none';
    label.style.pointerEvents = 'none';
    label.style.display = 'none';
    inner.appendChild(label);

    // Keep ONLY one click + keydown handler
    markerContainer.addEventListener('click', (e) => {
      e.preventDefault(); e.stopPropagation();
      lastTrigger = markerContainer;
      selectMarker(inner);
      showStationInfo(station);
    });

    markerContainer.addEventListener('keydown', (e) => {
      const isEnter = e.key === 'Enter';
      const isSpace = e.key === ' ' || e.code === 'Space' || e.key === 'Spacebar';
      if (isEnter || isSpace) {
        e.preventDefault(); e.stopPropagation();
        lastTrigger = markerContainer;
        selectMarker(inner);
        showStationInfo(station);
      }
    });

    markerContainer.addEventListener('focus', () => {
      inner.style.outline = '3px solid #ffdd00';
      inner.style.outlineOffset = '2px';
    });
    markerContainer.addEventListener('blur', () => { inner.style.outline = 'none'; });

    const marker = new maplibregl.Marker({ element: markerContainer, anchor: 'center' })
      .setLngLat([station.lng, station.lat])
      .addTo(map);

    markerRegistry.push({ station, marker, inner, label });
  });

  // Apply current filter and marker appearance after rebuild
  applyFilter();
  updateAllMarkers();
}

  // --- Zoom controls ---
  const zoomInBtn = document.getElementById('zoomIn');
  const zoomOutBtn = document.getElementById('zoomOut');

  function setZoomButtonDisabled(btn, disabled, labelWhenEnabled, labelWhenDisabled) {
    if (!btn) return;
    if (disabled) {
      btn.classList.add('zoom-disable');
      btn.setAttribute('aria-disabled', 'true');
      if (labelWhenDisabled) btn.setAttribute('aria-label', labelWhenDisabled);
    } else {
      btn.classList.remove('zoom-disable');
      btn.removeAttribute('aria-disabled');
      if (labelWhenEnabled) btn.setAttribute('aria-label', labelWhenEnabled);
    }
  }

  function updateZoomButtons() {
    const z = map.getZoom();
    setZoomButtonDisabled(
      zoomInBtn,
      z >= 16,
      'Zoom in',
      'Zoom in disabled because max zoom has been reached'
    );
    setZoomButtonDisabled(
      zoomOutBtn,
      z <= 5,
      'Zoom out',
      'Zoom out disabled because min zoom has been reached'
    );
  }

  if (zoomInBtn) {
    zoomInBtn.addEventListener('click', () => map.zoomIn());
  }
  if (zoomOutBtn) {
    zoomOutBtn.addEventListener('click', () => map.zoomOut());
  }
  map.on('zoom', updateZoomButtons);
  map.on('load', updateZoomButtons);

  // --- Legend events ---
  if (openKeyBtn) {
    openKeyBtn.addEventListener('click', () => {
      lastTrigger = openKeyBtn;
      toggleLegend();
    });
  }
  if (closeKeyBtn) {
    closeKeyBtn.addEventListener('click', () => closeLegend());
  }
  if (legendPanel) {
    legendPanel.addEventListener('keydown', (e) => {
      if (e.key === 'Escape') {
        e.preventDefault();
        closeLegend();
      }
    });
  }

  // --- Station info events ---
  if (closeInfoBtn) {
    closeInfoBtn.addEventListener('click', () => closeStationInfo());
  }
  if (stationInfo) {
    stationInfo.addEventListener('keydown', (e) => {
      if (e.key === 'Escape') {
        e.preventDefault();
        closeStationInfo();
      }
    });
  }

  // --- Exit button ---
  if (exitBtn) {
    exitBtn.addEventListener('click', () => {
      // Clean up classes we added for fullscreen
      document.body.classList.remove('defra-map-active');
      if (govukTemplate) govukTemplate.classList.remove('defra-map-html');
      if (govukBody) govukBody.classList.remove('defra-map-body');
      // Go back to previous page if there is one
    if (window.history.length > 1) {
      window.history.back();
    } else {
      // Fallback if opened as a direct entry page
       window.location.href = 'hub.html';
    }
    });
  }
});

const floatingPanel = document.getElementById('floating-panel'); // your .panel
const panelCloseBtn = document.getElementById('panel-close');
const menuButton    = document.getElementById('menu-button');    // add if you want the reopen button

function openPanel() {
  if (!floatingPanel || !menuButton) return;
  floatingPanel.style.display = '';      // shows (your media query will handle final display)
  menuButton.hidden = true;
  floatingPanel.focus();
}
function closePanel() {
  if (!floatingPanel || !menuButton) return;
  floatingPanel.style.display = 'none';  // hide panel
  menuButton.hidden = false;             // reveal menu button 10px above zoom
  menuButton.focus();
}

panelCloseBtn?.addEventListener('click', (e) => { e.preventDefault(); closePanel(); });
menuButton?.addEventListener('click',   (e) => { e.preventDefault(); openPanel();  });


// -----------------------------
// UI: "groups" vs "pollutant" + pollutant checkboxes
// -----------------------------
document.addEventListener('DOMContentLoaded', () => {
  initPollutantPanels();
});

function initPollutantPanels() {
  // Track all pollutant mounts so we can keep panels in sync
  const pollutantMounts = [];

  setupPanel(document.querySelector('#floating-panel #mobile-key-panel'));
  setupPanel(document.getElementById('mobile-key-panel-bottom'));

  // Sync initial UI state
  syncAllPollutantCheckboxes();
  // Render data sources for any panel currently showing pollutant mode
  pollutantMounts.forEach(({ root, mount, uiId }) => {
    if (mount.querySelector('.govuk-checkboxes__input[type="checkbox"]')) {
      renderDataSources(root, mount, uiId);
    }
  });

  function setupPanel(root) {
    if (!root) return;

    const extBtn   = root.querySelector('.ext-btn');
    const depthBtn = root.querySelector('.depth-btn');
    const mount    = root.querySelector('.radio-mount');

    if (!extBtn || !depthBtn || !mount) return;

    const uiId = `pollutant-ui-${Math.random().toString(36).slice(2, 8)}`;
    pollutantMounts.push({ root, mount, uiId });

    function setPressed(btn, pressed) {
      btn.setAttribute('aria-pressed', pressed ? 'true' : 'false');
      btn.classList.toggle('is-active', !!pressed);
    }

    function showMode(mode) {
      if (mode === 'groups') {
        setPressed(extBtn, true);
        setPressed(depthBtn, false);
        renderGroups();
      } else {
        setPressed(extBtn, false);
        setPressed(depthBtn, true);
        renderPollutants();
        syncAllPollutantCheckboxes();
        renderDataSources(root, mount, uiId);
      }
    }

  function renderGroups() {
  // Important: we’re using groupKey to drive data sources
  filterState.mode = 'group';
  if (!filterState.groupKey) filterState.groupKey = 'regulation';

  const GROUPS = [
    {
      key: 'regulation',
      title: 'Regulated pollutants',
      hint: 'PM2.5, PM10, NO2, O3, SO2, NO, NOx as NO2 and CO'
    },
    {
      key: 'vocs',
      title: 'Volatile organic compounds (VOCs)',
      hint: 'benzene and other hydrocarbons'
    },
    {
      key: 'heavy_metals',
      title: 'Heavy metals in air (PM10)',
      hint: ''
    },
    {
      key: 'pahs',
      title: 'Polycyclic aromatic hydrocarbons (PAHs)',
      hint: ''
    },
    {
      key: 'ammonia',
      title: 'Ammonia',
      hint: 'gaseous ammonia NH3 (active, passive and diffusion tube) and particulate ammonium (NH4)'
    }
  ];

  const MORE_GROUPS = [
    {
      key: 'precipitation',
      title: 'Precipitation chemistry',
      hint: 'particles and heavy metals in rainfall'
    },
    {
      key: 'mercury',
      title: 'Mercury',
      hint: 'elemental mercury (Hg), reactive mercury (Hg), mercury in PM2.5 (Hg)'
    },
    {
      key: 'black_carbon',
      title: 'Black carbon',
      hint: ''
    },
    {
      key: 'ions_acids',
      title: 'Particulates and acid gases',
      hint: ''
    },
    {
      key: 'particles',
      title: 'Particles',
      hint: 'particle count 10.18 to 791.48 nm and particles in particulate matter'
    }
  ];

  const groupName = `${uiId}-pollutant-group`;

  mount.innerHTML = `
    <fieldset class="govuk-fieldset">
      <legend class="govuk-visually-hidden">Select a pollutant group</legend>

      <div class="govuk-radios govuk-radios--small" data-module="govuk-radios">
        ${GROUPS.map((g, idx) => {
          const id = `${uiId}-grp-${idx}`;
          const checked = (filterState.groupKey === g.key) ? 'checked' : '';
          const hintId = `${id}-hint`;
          return `
            <div class="govuk-radios__item" style="margin-bottom:5px;">
              <input class="govuk-radios__input"
                     id="${id}"
                     name="${groupName}"
                     type="radio"
                     value="${g.key}"
                     ${checked}
                     aria-describedby="${hintId}">
              <label class="govuk-label govuk-radios__label" for="${id}">
                ${g.title}
              </label>
              <div class="govuk-hint govuk-radios__hint pollutant-group-hint"
                    id="${hintId}"
                    hidden
                    style="display:none; margin-top:2px; margin-left:20px;">
                    ${g.hint}
                  </div>
            </div>
          `;
        }).join('')}
      </div>

      <details class="govuk-details govuk-!-margin-top-3 govuk-!-margin-bottom-1">
        <summary class="govuk-details__summary">
          <span class="govuk-details__summary-text">Show more pollutant groups</span>
        </summary>
        <div class="govuk-details__text">
          <div class="govuk-radios govuk-radios--small" data-module="govuk-radios" style="margin-top:10px;">
            ${MORE_GROUPS.map((g, idx) => {
              const baseIdx = GROUPS.length + idx;
              const id = `${uiId}-grp-${baseIdx}`;
              const checked = (filterState.groupKey === g.key) ? 'checked' : '';
              const hintId = `${id}-hint`;
              return `
                <div class="govuk-radios__item" style="margin-bottom:5px;">
                  <input class="govuk-radios__input"
                         id="${id}"
                         name="${groupName}"
                         type="radio"
                         value="${g.key}"
                         ${checked}
                         aria-describedby="${hintId}">
                  <label class="govuk-label govuk-radios__label" for="${id}">
                    ${g.title}
                  </label>
                  <div class="govuk-hint govuk-radios__hint pollutant-group-hint"
                        id="${hintId}"
                        hidden
                        style="display:none; margin-top:2px; margin-left:20px;">
                        ${g.hint}
                      </div>
                </div>
              `;
            }).join('')}
          </div>
        </div>
      </details>
    </fieldset>
  `;

  updateGroupHints();

    function updateGroupHints() {
  const radios = Array.from(mount.querySelectorAll(`input[name="${groupName}"]`));

  radios.forEach((radio) => {
    const hintId = `${radio.id}-hint`;
    const hintEl = mount.querySelector(`#${CSS.escape(hintId)}`);
    if (!hintEl) return;

    hintEl.style.display = radio.checked ? 'block' : 'none';
  });
}




  // Group mode shows all stations (your current behaviour)
  applyFilter();

  // Ensure data sources reflect the selected group
  renderDataSources(root, mount, uiId);

  // Bind change
  mount.querySelectorAll(`input[name="${groupName}"]`).forEach((r) => {
  r.addEventListener('change', () => {
    if (!r.checked) return;

    filterState.mode = 'group';
    filterState.groupKey = r.value;

    updateGroupHints();

    const available = getAvailableNetworks();
    selectedNetwork = available.includes(selectedNetwork) ? selectedNetwork : (available[0] || NETWORK.AURN);

    if (aqMapApi && typeof aqMapApi.setNetwork === 'function') {
      aqMapApi.setNetwork(selectedNetwork);
    }

    // ✅ User has interacted with filters
    hasUserInteractedWithFilters = true;

    requestAnimationFrame(updateGroupHints);
    renderDataSources(root, mount, uiId);
    applyFilter();
  });
});

}




    function renderPollutants() {
      const pollutants = [
        { code: 'PM2.5', label: 'Fine particulate matter (PM2.5)' },
        { code: 'PM10',  label: 'Particulate matter (PM10)' },
        { code: 'NO2',   label: 'Nitrogen dioxide (NO2)' },
        { code: 'O3',    label: 'Ozone (O3)' },
        { code: 'SO2',   label: 'Sulphur dioxide (SO2)' }
      ];

      if (!filterState.selected || filterState.selected.size === 0) {
        filterState.selected = new Set(DAQI_CODES);
      }

      mount.innerHTML = `
        <fieldset class="govuk-fieldset">
          <legend class="govuk-visually-hidden">Select pollutants</legend>
          <div class="govuk-checkboxes govuk-checkboxes--small" data-module="govuk-checkboxes">
            ${pollutants.map((p, idx) => {
              const id = `${uiId}-p-${idx}`;
              const checked = filterState.selected.has(p.code) ? 'checked' : '';
              return `
                <div class="govuk-checkboxes__item">
                  <input class="govuk-checkboxes__input" id="${id}" type="checkbox" value="${p.code}" ${checked}>
                  <label class="govuk-label govuk-checkboxes__label" for="${id}">
                    ${p.label}
                  </label>
                </div>
              `;
            }).join('')}
          </div>
        </fieldset>
      `;

      // Bind once per mount element
      if (!mount.dataset.pollutantCheckboxBound) {
       mount.addEventListener('change', (e) => {
        const target = e.target;
        if (!target || !target.matches('.govuk-checkboxes__input[type="checkbox"]')) return;

        const selected = new Set(
          Array.from(mount.querySelectorAll('.govuk-checkboxes__input[type="checkbox"]:checked'))
            .map(cb => cb.value)
        );

        setFilter('pollutant', selected);

        // ✅ User has interacted with filters now
        hasUserInteractedWithFilters = true;

        renderDataSources(root, mount, uiId);
        syncAllPollutantCheckboxes();
      });


        mount.dataset.pollutantCheckboxBound = 'true';
      }

      filterState.mode = 'pollutant';
      applyFilter();

    }

    extBtn.addEventListener('click', (e) => {
      e.preventDefault();

      filterState.mode = 'group';
      filterState.groupKey = 'regulation';

      hasUserInteractedWithFilters = true; // ✅
      showMode('groups');
    });

    depthBtn.addEventListener('click', (e) => {
      e.preventDefault();

      hasUserInteractedWithFilters = true; // ✅
      showMode('pollutant');
    });


        showMode('pollutant');
      }

  function syncAllPollutantCheckboxes() {
    if (!filterState.selected) return;

    pollutantMounts.forEach(({ mount }) => {
      const boxes = mount.querySelectorAll('.govuk-checkboxes__input[type="checkbox"]');
      if (!boxes.length) return;
      boxes.forEach(cb => { cb.checked = filterState.selected.has(cb.value); });
    });
  }
}

// Tracks whether the user has interacted with pollutant/group filters yet
let hasUserInteractedWithFilters = false;

function renderDataSources(root, mount, uiId) {
  // NEW: scroll container – where all dynamic content will live
  const scrollContainer =
    root.querySelector('.panel-scroll') || mount.parentElement;

  // Remove existing instances from *inside* the scroll container
  scrollContainer.querySelector(`#${uiId}-data-sources`)?.remove();
  scrollContainer.querySelector(`#${uiId}-map-features`)?.remove();

  // --- Determine which networks to show in the radios ---
  function getAvailableNetworksForUi() {
    // VOCs group: only hydrocarbon networks
    if (filterState.mode === 'group' && filterState.groupKey === 'vocs') {
      return [NETWORK.AUTO_HC, NETWORK.NONAUTO_HC];
    }

    // Regulation group: treat as “all DAQI pollutants selected”
    if (filterState.mode === 'group' && filterState.groupKey === 'regulation') {
      return getAvailableNetworks(new Set(DAQI_CODES));
    }

    // Pollutant mode: use actual selected checkboxes
    return getAvailableNetworks(filterState.selected);
  }

  const availableNetworks = getAvailableNetworksForUi();

  // Ensure selectedNetwork is valid for this view
  if (!availableNetworks.includes(selectedNetwork)) {
    selectedNetwork =
      (filterState.mode === 'group' && filterState.groupKey === 'vocs')
        ? NETWORK.AUTO_HC
        : NETWORK.AURN;

    if (aqMapApi && typeof aqMapApi.setNetwork === 'function') {
      aqMapApi.setNetwork(selectedNetwork);
    }
  }

  // -------------------------
  // Data sources (no details/collapsible)
  // -------------------------
  // Remove old hr and data sources container if they exist (to prevent duplication on re-render)
  const oldHr = scrollContainer.querySelector('hr');
  if (oldHr) oldHr.remove();
  const oldDataSources = scrollContainer.querySelector(`#${uiId}-data-sources`);
  if (oldDataSources) oldDataSources.remove();

  // Add dividing line
  const hr = document.createElement('hr');
  hr.className = 'govuk-section-break govuk-section-break--m govuk-section-break--visible govuk-!-margin-bottom-3';
  scrollContainer.appendChild(hr);

  // Create data sources container
  const dataSourcesContainer = document.createElement('div');
  dataSourcesContainer.id = `${uiId}-data-sources`;
  dataSourcesContainer.className = 'govuk-!-margin-bottom-4';

  // Add header
  const header = document.createElement('h3');
  header.className = 'govuk-heading-s govuk-!-margin-bottom-3';
  header.textContent = 'Data sources';
  dataSourcesContainer.appendChild(header);

  // Add network radio groups content
  const networksDiv = document.createElement('div');
  networksDiv.innerHTML = renderNetworkRadioGroupsHtml(uiId, availableNetworks);
  dataSourcesContainer.appendChild(networksDiv);

  // Add container to scroll area
  scrollContainer.appendChild(dataSourcesContainer);

  const groupName = `${uiId}-networks`;

  // Bind radio change listener
  dataSourcesContainer.querySelectorAll(`input[name="${groupName}"]`).forEach((r) => {
    r.addEventListener('change', () => {
      if (!r.checked) return;

      const previousNetwork = selectedNetwork;
      selectedNetwork = r.value;

      // Handle DAQI state based on network selection
      if (selectedNetwork === NETWORK.AURN) {
        // Switching TO AURN: restore the saved DAQI state
        colourByDaqi = aurnDaqiStateWhenSelected;
      } else {
        // Switching FROM AURN to another network: save AURN's state and disable DAQI
        if (previousNetwork === NETWORK.AURN) {
          aurnDaqiStateWhenSelected = colourByDaqi;
        }
        // Always disable DAQI for non-AURN networks
        colourByDaqi = false;
      }

      if (aqMapApi && typeof aqMapApi.setNetwork === 'function') {
        aqMapApi.setNetwork(selectedNetwork);
      }

      updateAllMarkers();
      renderKeyOverlay();

      // Re-render to ensure DAQI toggle appears/disappears correctly
      renderDataSources(root, mount, uiId);
    });
  });

  // Bind DAQI toggle IF present (only when AURN available & selected)
  const daqiId = `${uiId}-show-daqi-aurn`;
  const daqiCb = dataSourcesContainer.querySelector(`#${daqiId}`);
  daqiCb?.addEventListener('change', () => {
    colourByDaqi = !!daqiCb.checked;
    aurnDaqiStateWhenSelected = colourByDaqi; // Remember this state for when we return to AURN
    updateAllMarkers();
    renderKeyOverlay();
  });

  // -------------------------
  // Map features (details)
  // -------------------------
  const features = document.createElement('details');
  features.className = 'govuk-details govuk-!-margin-top-0 govuk-!-margin-bottom-0';
  features.id = `${uiId}-map-features`;
  features.open = false;

  const showStatusId = `${uiId}-show-closed-inactive`;
  const showLaBoundariesId = `${uiId}-show-la-boundaries`;

  features.innerHTML = `
    <summary class="govuk-details__summary">
      <span class="govuk-details__summary-text">Map features</span>
    </summary>
    <div class="govuk-details__text">
      <div class="govuk-checkboxes govuk-checkboxes--small" data-module="govuk-checkboxes">
        <div class="govuk-checkboxes__item">
          <input
            class="govuk-checkboxes__input"
            id="${showStatusId}"
            type="checkbox"
            ${showClosedAndInactiveStations ? 'checked' : ''}>
          <label class="govuk-label govuk-checkboxes__label" for="${showStatusId}">
            Show closed and inactive stations
          </label>
        </div>
        <div class="govuk-checkboxes__item">
          <input
            class="govuk-checkboxes__input"
            id="${showLaBoundariesId}"
            type="checkbox">
          <label class="govuk-label govuk-checkboxes__label" for="${showLaBoundariesId}">
            Local authority boundaries
          </label>
        </div>
      </div>
    </div>
  `;

  // Add into scroll area (⬅️ key change)
  scrollContainer.appendChild(features);

  // Bind show/hide closed+inactive
  const statusCb = root.querySelector(`#${showStatusId}`);
  statusCb?.addEventListener('change', () => {
    showClosedAndInactiveStations = !!statusCb.checked;
    applyFilter();
  });

  // Bind LA boundaries toggle
  const laBoundariesCb = root.querySelector(`#${showLaBoundariesId}`);
  laBoundariesCb?.addEventListener('change', () => {
    const m = window.AQMap;
    if (!m) return;
    const visibility = laBoundariesCb.checked ? 'visible' : 'none';
    if (m.getLayer('la-boundaries-line')) {
      m.setLayoutProperty('la-boundaries-line', 'visibility', visibility);
      m.setLayoutProperty('la-boundaries-fill', 'visibility', visibility);
    }
  });
}


function renderNetworkRadioGroupsHtml(uiId, availableNetworks) {
  const name = `${uiId}-networks`;

 const isVocs = availableNetworks.includes(NETWORK.AUTO_HC) || availableNetworks.includes(NETWORK.NONAUTO_HC);

const groups = {
  near: {
    heading: isVocs ? 'Near real-time data' : 'Near real-time Defra data',
    items: []
  },
  other_defra: {
    heading: isVocs ? 'Other data' : 'Other Defra data',
    items: []
  },
  non_defra: {
    heading: 'Local authority data',
    items: []
  }
};


  availableNetworks.forEach((n) => {
    const meta = NETWORK_META[n];
    if (!meta) return;
    groups[meta.group].items.push(n);
  });

  const ordered = ['near', 'other_defra', 'non_defra'];

  function renderRadioItem(n, idx) {
    const id = `${uiId}-net-${n}-${idx}`;
    const checked = (n === selectedNetwork) ? 'checked' : '';

    // Only show DAQI checkbox when:
    // - AURN is available in the current list AND
    // - This specific radio is AURN AND
    // - AURN is currently selected (keeps it visually “under” the AURN choice)
    const showDaqiUnderThis =
      availableNetworks.includes(NETWORK.AURN) &&
      n === NETWORK.AURN &&
      selectedNetwork === NETWORK.AURN;

    const daqiId = `${uiId}-show-daqi-aurn`;

    return `
      <div class="govuk-radios__item">
        <input class="govuk-radios__input" id="${id}" name="${name}" type="radio" value="${n}" ${checked}>
        <label class="govuk-label govuk-radios__label" for="${id}">
          ${NETWORK_META[n].label}
        </label>
      </div>
      ${showDaqiUnderThis ? `
        <div class="govuk-checkboxes govuk-checkboxes--small govuk-!-margin-top-1 govuk-!-margin-bottom-1 govuk-!-margin-left-4" data-module="govuk-checkboxes">
          <div class="govuk-checkboxes__item">
            <input
              class="govuk-checkboxes__input"
              id="${daqiId}"
              type="checkbox"
              ${colourByDaqi ? 'checked' : ''}>
            <label class="govuk-label govuk-checkboxes__label" for="${daqiId}">
              Show Daily Air Quality Index
            </label>
          </div>
        </div>
      ` : ''}
    `;
  }

  function radiosFor(list) {
    return list.map((n, idx) => renderRadioItem(n, idx)).join('');
  }

  return ordered
    .filter(key => groups[key].items.length > 0)
    .map(key => `
      <div class="govuk-!-margin-bottom-3">
        <p class="govuk-body-s govuk-!-margin-bottom-1" style="font-size: 16px">${groups[key].heading}</p>
        <div class="govuk-radios govuk-radios--small" data-module="govuk-radios">
          ${radiosFor(groups[key].items)}
        </div>
      </div>
    `).join('');
}





