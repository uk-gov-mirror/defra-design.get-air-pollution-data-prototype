// app/assets/javascripts/version_17/forecast-map.js
// Forecast map with dynamic date selection and polygon-based air quality visualization

import maplibregl from 'maplibre-gl';
import 'maplibre-gl/dist/maplibre-gl.css';

// ---------------------------
// Mock Forecast Data
// ---------------------------

// Realistic UK forecast zone polygons approximating Defra's DAQI regional boundaries.
// Coordinates are [longitude, latitude] pairs forming organic shapes across the UK.
// Zones are ordered south-to-north; later zones render on top of earlier ones.
const UK_REGIONS = [
  {
    id: 'south_west',
    name: 'South West England',
    coordinates: [[
      [-5.72, 50.07], [-5.25, 49.92], [-4.65, 50.02],
      [-3.92, 50.18], [-3.02, 50.48], [-2.10, 50.62],
      [-1.78, 50.88], [-1.55, 51.12], [-1.85, 51.45],
      [-2.25, 51.70], [-2.70, 51.62], [-3.48, 51.72],
      [-4.00, 51.65], [-4.60, 51.72], [-5.12, 51.52],
      [-5.25, 51.12], [-5.72, 50.07]
    ]]
  },
  {
    id: 'south_east',
    name: 'South East England',
    coordinates: [[
      [-1.78, 50.88], [-1.35, 50.62], [-0.05, 50.72],
      [0.60, 50.85], [1.45, 51.08], [1.78, 51.38],
      [1.12, 51.92], [0.52, 51.78], [0.00, 51.88],
      [-0.52, 51.75], [-0.92, 51.60], [-1.32, 51.52],
      [-1.60, 51.35], [-1.55, 51.12], [-1.78, 50.88]
    ]]
  },
  {
    id: 'london',
    name: 'London',
    coordinates: [[
      [-0.52, 51.28], [0.35, 51.32], [0.55, 51.52],
      [0.20, 51.72], [-0.52, 51.75], [-0.92, 51.60],
      [-0.95, 51.42], [-0.52, 51.28]
    ]]
  },
  {
    id: 'east_of_england',
    name: 'East of England',
    coordinates: [[
      [0.00, 51.88], [0.52, 51.78], [1.12, 51.92],
      [1.78, 51.38], [1.72, 52.12], [1.75, 52.50],
      [0.85, 52.95], [0.12, 53.15], [-0.35, 52.82],
      [-0.52, 52.52], [-0.22, 52.10], [0.00, 51.88]
    ]]
  },
  {
    id: 'east_midlands',
    name: 'East Midlands',
    coordinates: [[
      [-1.60, 51.35], [-0.92, 51.60], [-0.52, 51.75],
      [-0.22, 52.10], [-0.52, 52.52], [-0.35, 52.82],
      [-1.05, 53.22], [-1.48, 52.98], [-1.75, 53.22],
      [-2.05, 52.55], [-2.22, 52.10], [-2.25, 51.70],
      [-1.85, 51.45], [-1.60, 51.35]
    ]]
  },
  {
    id: 'west_midlands',
    name: 'West Midlands',
    coordinates: [[
      [-3.48, 51.72], [-2.70, 51.62], [-2.25, 51.70],
      [-2.22, 52.10], [-2.05, 52.55], [-1.75, 53.22],
      [-2.45, 53.40], [-2.95, 53.22], [-3.22, 52.72],
      [-3.05, 52.10], [-2.72, 51.88], [-3.48, 51.72]
    ]]
  },
  {
    id: 'yorkshire',
    name: 'Yorkshire and the Humber',
    coordinates: [[
      [-1.05, 53.22], [-0.35, 52.82], [0.12, 53.15],
      [0.10, 53.55], [-0.08, 54.10], [-0.62, 54.45],
      [-1.15, 54.62], [-1.82, 54.45], [-2.15, 53.95],
      [-1.92, 53.55], [-1.75, 53.22], [-1.48, 52.98],
      [-1.05, 53.22]
    ]]
  },
  {
    id: 'north_west',
    name: 'North West England',
    coordinates: [[
      [-2.95, 53.22], [-2.45, 53.40], [-2.15, 53.95],
      [-1.82, 54.45], [-2.05, 54.52], [-2.45, 54.38],
      [-3.10, 54.68], [-3.42, 54.42], [-3.62, 53.98],
      [-3.52, 53.55], [-3.22, 53.18], [-3.08, 52.92],
      [-2.95, 53.22]
    ]]
  },
  {
    id: 'north_east',
    name: 'North East England',
    coordinates: [[
      [-1.82, 54.45], [-0.62, 54.45], [-0.08, 54.10],
      [-0.05, 55.00], [-1.05, 55.48], [-1.78, 55.68],
      [-2.05, 55.82], [-2.02, 55.55], [-2.08, 55.12],
      [-2.45, 54.72], [-2.05, 54.52], [-1.82, 54.45]
    ]]
  },
  {
    id: 'wales',
    name: 'Wales',
    coordinates: [[
      [-2.72, 51.88], [-2.25, 51.70], [-3.48, 51.72],
      [-4.00, 51.65], [-4.60, 51.72], [-4.98, 51.62],
      [-5.22, 51.75], [-5.08, 52.02], [-4.65, 52.08],
      [-4.72, 52.42], [-4.68, 52.78], [-4.65, 53.42],
      [-4.32, 53.35], [-3.42, 53.35], [-2.98, 53.05],
      [-2.95, 52.72], [-2.72, 51.88]
    ]]
  },
  {
    id: 'south_scotland',
    name: 'Southern Scotland',
    coordinates: [[
      [-2.05, 55.82], [-1.78, 55.68], [-1.05, 55.48],
      [-0.05, 55.00], [-0.12, 55.42], [-1.18, 55.92],
      [-2.22, 56.12], [-2.62, 55.95], [-3.20, 55.98],
      [-4.25, 55.88], [-4.28, 55.72], [-3.52, 55.52],
      [-3.10, 54.68], [-2.45, 54.38], [-2.08, 55.12],
      [-2.02, 55.55], [-2.05, 55.82]
    ]]
  },
  {
    id: 'central_scotland',
    name: 'Central Scotland',
    coordinates: [[
      [-2.22, 56.12], [-1.18, 55.92], [-0.12, 55.42],
      [0.00, 55.88], [-0.52, 56.42], [-1.15, 56.72],
      [-2.42, 56.85], [-3.25, 56.72], [-3.82, 56.42],
      [-4.02, 56.10], [-3.48, 55.92], [-3.20, 55.98],
      [-2.62, 55.95], [-2.22, 56.12]
    ]]
  },
  {
    id: 'ne_scotland',
    name: 'North East Scotland',
    coordinates: [[
      [-0.52, 56.42], [0.00, 55.88], [0.25, 56.22],
      [0.05, 56.72], [-0.52, 57.15], [-1.25, 57.55],
      [-2.12, 57.68], [-2.85, 57.52], [-3.62, 56.95],
      [-3.25, 56.72], [-2.42, 56.85], [-1.15, 56.72],
      [-0.52, 56.42]
    ]]
  },
  {
    id: 'highlands',
    name: 'Scottish Highlands',
    coordinates: [[
      [-3.62, 56.95], [-2.85, 57.52], [-2.12, 57.68],
      [-1.25, 57.55], [-0.75, 57.85], [-1.45, 58.22],
      [-2.12, 58.55], [-3.38, 58.65], [-4.98, 58.62],
      [-5.65, 57.98], [-5.85, 57.32], [-5.42, 56.98],
      [-5.72, 56.18], [-5.48, 55.72], [-5.75, 55.38],
      [-4.65, 55.42], [-4.28, 55.72], [-4.25, 55.88],
      [-4.02, 56.10], [-3.82, 56.42], [-3.62, 56.95]
    ]]
  },
  {
    id: 'northern_ireland',
    name: 'Northern Ireland',
    coordinates: [[
      [-7.38, 55.35], [-6.50, 55.25], [-5.75, 55.02],
      [-5.45, 54.58], [-5.88, 54.18], [-6.35, 54.15],
      [-7.28, 54.32], [-7.85, 54.52], [-8.18, 54.72],
      [-7.98, 55.12], [-7.38, 55.35]
    ]]
  }
];

const LOCAL_AUTHORITY_GEOJSON_URL = '/version-15/data/local-authority-districts.geojson';

function buildFallbackAreas() {
  return UK_REGIONS.map(region => ({
    id: region.id,
    name: region.name,
    geometry: {
      type: 'Polygon',
      coordinates: region.coordinates
    }
  }));
}

let forecastAreas = buildFallbackAreas();

function normalizeGeoJsonArea(feature, index) {
  const props = feature?.properties || {};
  const geometry = feature?.geometry;

  if (!geometry || (geometry.type !== 'Polygon' && geometry.type !== 'MultiPolygon')) {
    return null;
  }

  const id = (
    props.LAD23CD || props.LADCD || props.lad23cd || props.ladcd || props.code || props.id || `lad-${index}`
  );
  const name = (
    props.LAD23NM || props.LADNM || props.lad23nm || props.ladnm || props.name || `Local authority ${index + 1}`
  );

  return {
    id: String(id),
    name: String(name),
    geometry
  };
}

async function loadLocalAuthorityAreas() {
  try {
    const response = await fetch(LOCAL_AUTHORITY_GEOJSON_URL, { cache: 'no-cache' });
    if (!response.ok) throw new Error(`HTTP ${response.status}`);

    const geojson = await response.json();
    const features = Array.isArray(geojson?.features) ? geojson.features : [];
    const loaded = features
      .map((feature, index) => normalizeGeoJsonArea(feature, index))
      .filter(Boolean);

    if (loaded.length > 0) {
      forecastAreas = loaded;
      return;
    }

    console.warn('Local authority GeoJSON loaded but no polygon features found; using fallback regions.');
  } catch (error) {
    console.warn('Unable to load local authority GeoJSON; using fallback regions.', error);
  }

  forecastAreas = buildFallbackAreas();
}

// DAQI 1–10 color scale matching Defra's forecast map
const QUALITY_LEVELS = {
  1:  { name: 'Low',       band: 'Low',       color: '#9cff9c' },
  2:  { name: 'Low',       band: 'Low',       color: '#31ff00' },
  3:  { name: 'Low',       band: 'Low',       color: '#31cf00' },
  4:  { name: 'Moderate',  band: 'Moderate',  color: '#ffff00' },
  5:  { name: 'Moderate',  band: 'Moderate',  color: '#ffcf00' },
  6:  { name: 'Moderate',  band: 'Moderate',  color: '#ff9a00' },
  7:  { name: 'High',      band: 'High',      color: '#ff9292' },
  8:  { name: 'High',      band: 'High',      color: '#ff0000' },
  9:  { name: 'High',      band: 'High',      color: '#990000' },
  10: { name: 'Very High', band: 'Very High', color: '#ce30ff' }
};

// Scenario profile by day (Today to +4 days).
// First 2 days have wider moderate coverage, then forecast improves to low nationwide.
const FORECAST_SCENARIOS = [
  {
    londonModerateThreshold: 100,
    nationalModerateThreshold: 24,
    text: 'Levels of air pollution are moderate today for many areas of the UK due to warmer temperatures and low winds.'
  },
  {
    londonModerateThreshold: 100,
    nationalModerateThreshold: 18,
    text: 'The current warm temperatures will continue, causing air pollution levels to remain at moderate across many areas'
  },
  {
    londonModerateThreshold: 0,
    nationalModerateThreshold: 0,
    text: 'Unsettled and breezy weather will help to keep air pollution levels Low for the whole of the UK.'
  },
  {
    londonModerateThreshold: 0,
    nationalModerateThreshold: 0,
    text: 'Unsettled and breezy weather will help to keep air pollution levels Low for the whole of the UK.'
  },
  {
    londonModerateThreshold: 0,
    nationalModerateThreshold: 0,
    text: 'Unsettled and breezy weather will help to keep air pollution levels Low for the whole of the UK.'
  }
];

function getScenarioForDay(dateIndex) {
  const safeIndex = Math.max(0, Math.min(FORECAST_SCENARIOS.length - 1, dateIndex));
  return FORECAST_SCENARIOS[safeIndex];
}

function hashString(value) {
  let hash = 0;
  for (let i = 0; i < value.length; i++) {
    hash = ((hash << 5) - hash + value.charCodeAt(i)) | 0;
  }
  return Math.abs(hash);
}

function baselineLowValueForArea(area, dateIndex) {
  // Keep most authorities on DAQI 2 while preserving a little variation.
  const score = hashString(`${area.id}-${dateIndex}-baseline`) % 100;
  if (score < 12) return 1;
  if (score < 88) return 2;
  return 3;
}

function isLondonAuthority(area) {
  const id = String(area.id || '').toUpperCase();
  const name = String(area.name || '').toLowerCase();

  // LAD London borough codes are E09*, with a safe name fallback for other datasets.
  return id.startsWith('E09') || name.includes('london borough') || name.includes('city of london') || name.includes('westminster');
}

// Generate deterministic mock DAQI forecast data (1-10) for a specific date.
// Most authorities stay low (1-3), while London follows day-by-day scenario overrides.
function generateForecastData(dateIndex) {
  const scenario = getScenarioForDay(dateIndex);
  const data = {};

  // Start with low values everywhere.
  forecastAreas.forEach(area => {
    data[area.id] = baselineLowValueForArea(area, dateIndex);
  });

  // Apply broader UK moderate pattern for first two days.
  forecastAreas.forEach(area => {
    if (isLondonAuthority(area)) return;

    const score = hashString(`${area.id}-${dateIndex}-national-moderate`) % 100;
    if (score < scenario.nationalModerateThreshold) {
      data[area.id] = 4 + (hashString(`${area.id}-${dateIndex}-national-level`) % 3); // 4-6
    }
  });

  // Apply London-specific moderate pattern.
  const londonAreas = forecastAreas.filter(isLondonAuthority);

  londonAreas.forEach(area => {
    const score = hashString(`${area.id}-${dateIndex}-moderate`) % 100;
    if (score < scenario.londonModerateThreshold) {
      data[area.id] = 4 + (hashString(`${area.id}-${dateIndex}-mod-level`) % 3); // 4-6
    }
  });

  return data;
}

// Generate national forecast summary text
function generateNationalForecast(dateIndex) {
  const forecastData = generateForecastData(dateIndex);
  const scenario = getScenarioForDay(dateIndex);
  const values = Object.values(forecastData);

  const low      = values.filter(v => v <= 3).length;
  const moderate = values.filter(v => v >= 4 && v <= 6).length;
  const high     = values.filter(v => v >= 7 && v <= 9).length;
  const veryHigh = values.filter(v => v === 10).length;

  const dominant = moderate + high + veryHigh > low ? QUALITY_LEVELS[5] : QUALITY_LEVELS[2];

  return {
    dominant,
    text: scenario.text,
    distribution: { low, moderate, high, veryHigh }
  };
}

// Update national forecast display
function updateNationalForecastDisplay(dateIndex) {
  const forecast = generateNationalForecast(dateIndex);
  const container = document.getElementById('national-forecast');

  if (!container) return;

  const forecastHTML = `
    <div>
      <p class="govuk-body govuk-!-margin-bottom-0">${forecast.text}</p>
    </div>
  `;

  container.innerHTML = forecastHTML;
}

// ---------------------------
// Key Overlay (matches station map exactly)
// ---------------------------

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

    .aq-daqi-scale__band--1  { background-color: #9cff9c; color: #0b0c0c; }
    .aq-daqi-scale__band--2  { background-color: #31ff00; color: #0b0c0c; }
    .aq-daqi-scale__band--3  { background-color: #31cf00; color: #0b0c0c; }
    .aq-daqi-scale__band--4  { background-color: #ffff00; color: #0b0c0c; }
    .aq-daqi-scale__band--5  { background-color: #ffcf00; color: #0b0c0c; }
    .aq-daqi-scale__band--6  { background-color: #ff9a00; color: #0b0c0c; }
    .aq-daqi-scale__band--7  { background-color: #ff9292; color: #0b0c0c; }
    .aq-daqi-scale__band--8  { background-color: #ff0000; color: #ffffff; }
    .aq-daqi-scale__band--9  { background-color: #990000; color: #ffffff; }
    .aq-daqi-scale__band--10 { background-color: #ce30ff; color: #ffffff; }

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
  `;
  document.head.appendChild(style);
}

function createKeyOverlay() {
  ensureLegendStylesOnce();

  document.getElementById('map-key-overlay')?.remove();

  const panel = document.createElement('div');
  panel.id = 'map-key-overlay';
  panel.className = 'defra-map-info';
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
         id="map-key-subtitle" style="color: #505a5f;">Daily Air Quality Index (DAQI)</p>
      <div class="aq-legend" id="aq-legend-body" role="list"></div>
    </div>
  `;

  const host = document.querySelector('.defra-map');
  (host || document.body).appendChild(panel);

  panel.querySelector('#close-key-overlay')?.addEventListener('click', () => {
    hideKeyOverlay({ byUser: true });
  });
}

function renderKeyOverlay() {
  const body = document.getElementById('aq-legend-body');
  if (!body) return;

  body.innerHTML = `
    <div class="aq-daqi-scale">
      <div class="aq-daqi-scale__bands">
        <div class="aq-daqi-scale__band aq-daqi-scale__band--1">1</div>
        <div class="aq-daqi-scale__band aq-daqi-scale__band--2">2</div>
        <div class="aq-daqi-scale__band aq-daqi-scale__band--3">3</div>
        <div class="aq-daqi-scale__band aq-daqi-scale__band--4">4</div>
        <div class="aq-daqi-scale__band aq-daqi-scale__band--5">5</div>
        <div class="aq-daqi-scale__band aq-daqi-scale__band--6">6</div>
        <div class="aq-daqi-scale__band aq-daqi-scale__band--7">7</div>
        <div class="aq-daqi-scale__band aq-daqi-scale__band--8">8</div>
        <div class="aq-daqi-scale__band aq-daqi-scale__band--9">9</div>
        <div class="aq-daqi-scale__band aq-daqi-scale__band--10">10</div>
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
}

function showKeyOverlay() {
  const panel = document.getElementById('map-key-overlay');
  if (!panel) return;
  panel.classList.add('visible');
  document.getElementById('key-button')?.setAttribute('hidden', '');
}

function hideKeyOverlay({ byUser = false } = {}) {
  const panel = document.getElementById('map-key-overlay');
  if (!panel) return;
  panel.classList.remove('visible');
  if (byUser) {
    document.getElementById('key-button')?.removeAttribute('hidden');
  }
}

// ---------------------------
// Map Initialization
// ---------------------------

let map;
let currentDateIndex = 0;
const FORECAST_DAYS = 5;
const FORECAST_POINT_ZOOM_THRESHOLD = 11;
const FORECAST_POLYGONS_SOURCE_ID = 'forecast-polygons';
const FORECAST_POLYGONS_FILL_LAYER_ID = 'forecast-polygons-fill';
const FORECAST_POLYGONS_OUTLINE_LAYER_ID = 'forecast-polygons-outline';
const forecastPointMarkers = [];

function collectCoordinates(geometry) {
  if (!geometry || !geometry.coordinates) return [];

  const coords = [];
  const walk = (node) => {
    if (!Array.isArray(node)) return;
    if (typeof node[0] === 'number' && typeof node[1] === 'number') {
      coords.push(node);
      return;
    }
    node.forEach(walk);
  };

  walk(geometry.coordinates);
  return coords;
}

function getGeometryCenter(geometry) {
  const coords = collectCoordinates(geometry);
  if (!coords.length) return [0, 0];

  const sum = coords.reduce((acc, coord) => {
    acc.lng += coord[0];
    acc.lat += coord[1];
    return acc;
  }, { lng: 0, lat: 0 });

  return [sum.lng / coords.length, sum.lat / coords.length];
}

function buildForecastPolygonFeatureCollection(forecastData) {
  return {
    type: 'FeatureCollection',
    features: forecastAreas.map(area => {
      const daqi = forecastData[area.id] || 1;
      return {
        type: 'Feature',
        properties: {
          id: area.id,
          name: area.name,
          daqi,
          fillColor: QUALITY_LEVELS[daqi].color
        },
        geometry: area.geometry
      };
    })
  };
}

function createForecastPointMarkers() {
  forecastPointMarkers.forEach(({ marker }) => marker.remove());
  forecastPointMarkers.length = 0;

  forecastAreas.forEach(region => {
    const [lng, lat] = getGeometryCenter(region.geometry);

    const markerContainer = document.createElement('div');
    markerContainer.className = 'station-marker-container';
    markerContainer.setAttribute('aria-label', `${region.name} forecast point`);

    const inner = document.createElement('div');
    inner.className = 'station-marker-inner';
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
    inner.appendChild(label);

    const marker = new maplibregl.Marker({ element: markerContainer, anchor: 'center' })
      .setLngLat([lng, lat])
      .addTo(map);

    forecastPointMarkers.push({ regionId: region.id, markerContainer, inner, label, marker });
  });
}

function syncForecastLayerVisibility() {
  const showPoints = map.getZoom() >= FORECAST_POINT_ZOOM_THRESHOLD;

  if (map.getLayer(FORECAST_POLYGONS_FILL_LAYER_ID)) {
    map.setLayoutProperty(FORECAST_POLYGONS_FILL_LAYER_ID, 'visibility', showPoints ? 'none' : 'visible');
  }

  if (map.getLayer(FORECAST_POLYGONS_OUTLINE_LAYER_ID)) {
    map.setLayoutProperty(FORECAST_POLYGONS_OUTLINE_LAYER_ID, 'visibility', showPoints ? 'none' : 'visible');
  }

  forecastPointMarkers.forEach(({ markerContainer }) => {
    markerContainer.style.display = showPoints ? 'block' : 'none';
  });
}

function initMap() {
  map = new maplibregl.Map({
    container: 'map-viewport',
    style: 'https://basemaps.cartocdn.com/gl/positron-gl-style/style.json',
    center: [-3.5, 54],
    zoom: 5,
    minZoom: 4,
    maxZoom: 16,
    pitchWithRotate: false,
    dragRotate: false
  });
  window.AQMap = map;

  map.on('load', () => {
    loadLocalAuthorityAreas().then(() => {
      setupRegionLayers();
      createForecastPointMarkers();
      updateForecastMap(0);
      syncForecastLayerVisibility();
      createKeyOverlay();
      renderKeyOverlay();
      showKeyOverlay();
    });

    const flyToRaw = sessionStorage.getItem('mapFlyTo');
    if (flyToRaw) {
      try {
        const { lat, lng, zoom } = JSON.parse(flyToRaw);
        map.jumpTo({ center: [lng, lat], zoom: zoom || 6 });
      } catch (e) {}
      sessionStorage.removeItem('mapFlyTo');
    }
  });

  map.on('zoom', () => {
    syncForecastLayerVisibility();
  });

  // Setup zoom controls
  const zoomInBtn = document.getElementById('zoomIn');
  const zoomOutBtn = document.getElementById('zoomOut');
  const exitBtn = document.getElementById('exit-map');
  const keyBtn = document.getElementById('key-button');

  if (zoomInBtn) zoomInBtn.addEventListener('click', () => map.zoomIn());
  if (zoomOutBtn) zoomOutBtn.addEventListener('click', () => map.zoomOut());

  if (exitBtn) {
    exitBtn.addEventListener('click', () => {
      window.history.back();
    });
  }

  if (keyBtn) {
    keyBtn.addEventListener('click', () => {
      showKeyOverlay();
    });
    keyBtn.removeAttribute('hidden');
  }

  // Panel controls
  const panelCloseBtn = document.getElementById('panel-close');
  const menuButton = document.getElementById('menu-button');
  const floatingPanel = document.getElementById('floating-panel');

  if (panelCloseBtn) {
    panelCloseBtn.addEventListener('click', (e) => {
      e.preventDefault();
      floatingPanel.style.display = 'none';
      if (menuButton) menuButton.removeAttribute('hidden');
    });
  }

  if (menuButton) {
    menuButton.addEventListener('click', (e) => {
      e.preventDefault();
      floatingPanel.style.display = 'block';
      menuButton.setAttribute('hidden', '');
    });
  }
}

function setupRegionLayers() {
  map.addSource(FORECAST_POLYGONS_SOURCE_ID, {
    type: 'geojson',
    data: buildForecastPolygonFeatureCollection(generateForecastData(0))
  });

  map.addLayer({
    id: FORECAST_POLYGONS_FILL_LAYER_ID,
    type: 'fill',
    source: FORECAST_POLYGONS_SOURCE_ID,
    paint: {
      'fill-color': ['get', 'fillColor'],
      'fill-opacity': 0.6
    }
  });

  map.addLayer({
    id: FORECAST_POLYGONS_OUTLINE_LAYER_ID,
    type: 'line',
    source: FORECAST_POLYGONS_SOURCE_ID,
    paint: {
      'line-color': '#333333',
      'line-width': 0,
      'line-opacity': 0
    }
  });

  map.on('mouseenter', FORECAST_POLYGONS_FILL_LAYER_ID, () => {
    map.getCanvas().style.cursor = 'pointer';
  });

  map.on('mouseleave', FORECAST_POLYGONS_FILL_LAYER_ID, () => {
    map.getCanvas().style.cursor = '';
  });
}

function updateForecastMap(dateIndex) {
  const forecastData = generateForecastData(dateIndex);

  const polygonSource = map.getSource(FORECAST_POLYGONS_SOURCE_ID);
  if (polygonSource) {
    polygonSource.setData(buildForecastPolygonFeatureCollection(forecastData));
  }

  forecastPointMarkers.forEach(({ regionId, inner, label }) => {
    const daqi = forecastData[regionId] || 1;
    inner.style.backgroundColor = QUALITY_LEVELS[daqi].color;
    label.textContent = String(daqi);
    label.style.color = daqi >= 8 ? '#ffffff' : '#0b0c0c';
    label.style.display = 'block';
  });

  syncForecastLayerVisibility();

  // Update national forecast summary
  updateNationalForecastDisplay(dateIndex);
}

// ---------------------------
// Date Button Controls
// ---------------------------

function createDateButtons() {
  const today = new Date();
  const btnGroup = document.getElementById('forecast-btn-group');

  if (!btnGroup) return;

  btnGroup.innerHTML = '';

  for (let i = 0; i < FORECAST_DAYS; i++) {
    const date = new Date(today);
    date.setDate(date.getDate() + i);

    const btn = document.createElement('button');
    btn.className = 'panel-btn depth-btn';
    btn.setAttribute('aria-pressed', i === 0 ? 'true' : 'false');
    if (i === 0) btn.classList.add('is-active');

    let dateLabel;
    if (i === 0) {
      dateLabel = 'Today';
    } else {
      const dayName = date.toLocaleDateString('en-GB', { weekday: 'short' });
      dateLabel = dayName;
    }

    btn.innerHTML = `<span>${dateLabel}</span>`;

    btn.addEventListener('click', () => {
      // Update button states
      document.querySelectorAll('#forecast-btn-group .panel-btn').forEach(b => {
        b.setAttribute('aria-pressed', 'false');
        b.classList.remove('is-active');
      });
      btn.setAttribute('aria-pressed', 'true');
      btn.classList.add('is-active');

      // Update map
      currentDateIndex = i;
      updateForecastMap(i);
    });

    btnGroup.appendChild(btn);
  }
}

// ---------------------------
// Panel Toggle
// ---------------------------

function setupPanelControls() {
  const floatingPanel = document.getElementById('floating-panel');
  const panelCloseBtn = document.getElementById('panel-close');
  const menuButton = document.getElementById('menu-button');

  if (panelCloseBtn && floatingPanel) {
    panelCloseBtn.addEventListener('click', () => {
      floatingPanel.style.display = 'none';
      if (menuButton) menuButton.removeAttribute('hidden');
    });
  }

  if (menuButton && floatingPanel) {
    menuButton.addEventListener('click', () => {
      floatingPanel.style.display = 'block';
      menuButton.setAttribute('hidden', '');
    });
  }
}

// ---------------------------
// Initialization
// ---------------------------

document.addEventListener('DOMContentLoaded', () => {
  // On mobile, close panel by default
  if (window.innerWidth < 768) {
    const floatingPanel = document.getElementById('floating-panel');
    const menuButton = document.getElementById('menu-button');
    if (floatingPanel && menuButton) {
      floatingPanel.style.display = 'none';
      menuButton.removeAttribute('hidden');
    }
  }

  createDateButtons();
  setupPanelControls();
  initMap();
});
