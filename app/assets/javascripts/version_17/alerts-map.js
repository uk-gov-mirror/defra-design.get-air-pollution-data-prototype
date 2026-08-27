// app/assets/javascripts/version_17/alerts-map.js
// Alerts map: shows local authorities under a DAQI alert (London = High,
// Yorkshire and the Humber = Very High), with checkboxes to filter which
// alert level(s) are displayed.

import maplibregl from 'maplibre-gl';
import 'maplibre-gl/dist/maplibre-gl.css';

const LOCAL_AUTHORITY_GEOJSON_URL = '/version-16/data/local-authority-districts.geojson';

// DAQI 1-10 colour scale, matching the station/forecast maps.
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

function isLondonAuthority(area) {
  const id = String(area.id || '').toUpperCase();
  const name = String(area.name || '').toLowerCase();

  // LAD London borough codes are E09*, with a safe name fallback for other datasets.
  return id.startsWith('E09') || name.includes('london borough') || name.includes('city of london') || name.includes('westminster');
}

// LAD23 codes for the Yorkshire and the Humber local authorities.
const YORKSHIRE_AND_HUMBER_LAD_CODES = new Set([
  'E06000010', // Kingston upon Hull, City of
  'E06000011', // East Riding of Yorkshire
  'E06000012', // North East Lincolnshire
  'E06000013', // North Lincolnshire
  'E06000014', // York
  'E06000065', // North Yorkshire
  'E08000016', // Barnsley
  'E08000017', // Doncaster
  'E08000018', // Rotherham
  'E08000019', // Sheffield
  'E08000032', // Bradford
  'E08000033', // Calderdale
  'E08000034', // Kirklees
  'E08000035', // Leeds
  'E08000036'  // Wakefield
]);

function isYorkshireAndHumberAuthority(area) {
  return YORKSHIRE_AND_HUMBER_LAD_CODES.has(String(area.id || '').toUpperCase());
}

// ---------------------------
// Alert radius (interactive circle around a station)
// ---------------------------

// Reuses the Birmingham Ladywood station shown on the monitoring stations map.
const ALERT_RADIUS_STATION = {
  name: 'Birmingham Ladywood',
  lat: 52.481346,
  lng: -1.918235,
  authority: 'Birmingham City Council',
  radiusMiles: 25,
  radiusKm: 25 * 1.60934,
  daqi: 8,
  pollutants: ['Ozone']
};

function createCirclePolygon(center, radiusKm, points = 64) {
  const [lng, lat] = center;
  const distanceX = radiusKm / (111.320 * Math.cos((lat * Math.PI) / 180));
  const distanceY = radiusKm / 110.574;

  const coords = [];
  for (let i = 0; i <= points; i++) {
    const theta = (i / points) * (2 * Math.PI);
    coords.push([lng + distanceX * Math.cos(theta), lat + distanceY * Math.sin(theta)]);
  }
  return [coords];
}

function getTextColorForBg(hex) {
  const c = String(hex || '').replace('#', '');
  const r = parseInt(c.substring(0, 2), 16);
  const g = parseInt(c.substring(2, 4), 16);
  const b = parseInt(c.substring(4, 6), 16);
  const luminance = (0.299 * r + 0.587 * g + 0.114 * b) / 255;
  return luminance > 0.6 ? '#0b0c0c' : '#ffffff';
}

function showAlertRadiusInfo() {
  const panel = document.getElementById('alert-radius-info');
  const content = document.getElementById('alert-radius-info-content');
  if (!panel || !content) return;

  const { name, authority, radiusMiles, daqi, pollutants } = ALERT_RADIUS_STATION;
  const band = QUALITY_LEVELS[daqi];

  content.innerHTML = `
    <h2 class="govuk-heading-m govuk-!-margin-bottom-0">${name}</h2>
    <p class="govuk-body-s" style="color:#505a5f;">${radiusMiles} mile alert radius</p>
    <p class="govuk-!-margin-bottom-3 govuk-!-margin-top-1"><a href="#" class="govuk-link">View alert information</a></p>

    <dl class="govuk-body-s station-info-list">
      <div class="station-info-row">
        <dt>DAQI:</dt>
        <dd><strong class="govuk-tag" style="background-color:${band.color}; color:${getTextColorForBg(band.color)};">${daqi} (${band.name.toLowerCase()})</strong></dd>
      </div>
      <div class="station-info-row">
        <dt>Local authority:</dt>
        <dd>${authority}</dd>
      </div>
      <div class="station-info-row">
        <dt>Pollutants:</dt>
        <dd>${pollutants.join(', ')}</dd>
      </div>
    </dl>

    <p class="govuk-body-s govuk-!-margin-top-3">People within this radius are advised to follow the health advice for the current DAQI band.</p>

    <p class="govuk-!-margin-bottom-0 govuk-!-margin-top-3"><a href="/version-17/station/birmingham-ladywood.html" class="govuk-link">View station summary</a></p>
  `;

  hideKeyOverlay({ byUser: false });
  panel.classList.add('visible');
  panel.setAttribute('aria-label', `Alert information for ${name}`);
  panel.focus();

  if (map.getLayer(ALERT_RADIUS_LINE_LAYER_ID)) {
    map.setPaintProperty(ALERT_RADIUS_LINE_LAYER_ID, 'line-color', '#0b0c0c');
    map.setPaintProperty(ALERT_RADIUS_LINE_LAYER_ID, 'line-width', 4);
  }
}

function hideAlertRadiusInfo() {
  const panel = document.getElementById('alert-radius-info');
  if (!panel) return;
  panel.classList.remove('visible');

  if (map.getLayer(ALERT_RADIUS_LINE_LAYER_ID)) {
    map.setPaintProperty(ALERT_RADIUS_LINE_LAYER_ID, 'line-color', ['get', 'fillColor']);
    map.setPaintProperty(ALERT_RADIUS_LINE_LAYER_ID, 'line-width', 2);
  }
}

function setupAlertRadiusInfoControls() {
  document.getElementById('close-alert-radius-info')?.addEventListener('click', hideAlertRadiusInfo);
}

let alertAreas = [];

async function loadAlertAreas() {
  try {
    const response = await fetch(LOCAL_AUTHORITY_GEOJSON_URL, { cache: 'no-cache' });
    if (!response.ok) throw new Error(`HTTP ${response.status}`);

    const geojson = await response.json();
    const features = Array.isArray(geojson?.features) ? geojson.features : [];
    const allAreas = features
      .map((feature, index) => normalizeGeoJsonArea(feature, index))
      .filter(Boolean);

    // London is under a High alert; Yorkshire and the Humber is under a Very High alert.
    const londonAreas = allAreas.filter(isLondonAuthority).map(area => ({ ...area, daqi: 8 }));
    const yorkshireAreas = allAreas.filter(isYorkshireAndHumberAuthority).map(area => ({ ...area, daqi: 10 }));

    alertAreas = [...londonAreas, ...yorkshireAreas];
  } catch (error) {
    console.warn('Unable to load local authority GeoJSON for alerts map.', error);
    alertAreas = [];
  }
}

// ---------------------------
// Key overlay (matches station/forecast maps)
// ---------------------------

function ensureLegendStylesOnce() {
  if (document.getElementById('aq-legend-styles')) return;
  const style = document.createElement('style');
  style.id = 'aq-legend-styles';
  style.textContent = `
    .aq-daqi-scale { font-family: "GDS Transport", Arial, sans-serif; width: 100%; }
    .aq-daqi-scale__bands { display: flex; width: 100%; border-radius: 4px; overflow: hidden; height: 36px; }
    .aq-daqi-scale__band { display: flex; align-items: center; justify-content: center; flex: 1; font-size: 15px; font-weight: 700; color: #ffffff; line-height: 1; }
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
    .aq-daqi-scale__labels { display: flex; width: 100%; margin-top: 6px; }
    .aq-daqi-scale__label-group { display: flex; flex-direction: column; align-items: flex-start; }
    .aq-daqi-scale__label-group--low      { flex: 3; }
    .aq-daqi-scale__label-group--moderate { flex: 3; }
    .aq-daqi-scale__label-group--high     { flex: 3; }
    .aq-daqi-scale__label-group--veryhigh { flex: 1; }
    .aq-daqi-scale__level { font-size: 16px; font-weight: 700; color: #0b0c0c; line-height: 1.2; }
    .aq-daqi-scale__range { font-size: 15px; color: #505a5f; line-height: 1.2; }
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
  document.getElementById('mobile-key-reopen')?.setAttribute('hidden', '');
}

function hideKeyOverlay({ byUser = false } = {}) {
  const panel = document.getElementById('map-key-overlay');
  if (!panel) return;
  panel.classList.remove('visible');
  if (byUser) {
    document.getElementById('key-button')?.removeAttribute('hidden');
    if (window.innerWidth < 520) document.getElementById('mobile-key-reopen')?.removeAttribute('hidden');
  }
}

// ---------------------------
// Map initialisation
// ---------------------------

let map;
const ALERT_POLYGONS_SOURCE_ID = 'alert-polygons';
const ALERT_POLYGONS_FILL_LAYER_ID = 'alert-polygons-fill';
const ALERT_RADIUS_SOURCE_ID = 'alert-radius';
const ALERT_RADIUS_FILL_LAYER_ID = 'alert-radius-fill';
const ALERT_RADIUS_LINE_LAYER_ID = 'alert-radius-line';

function buildAlertPolygonFeatureCollection() {
  return {
    type: 'FeatureCollection',
    features: alertAreas.map(area => {
      const daqi = area.daqi;
      return {
        type: 'Feature',
        properties: {
          id: area.id,
          name: area.name,
          daqi,
          band: QUALITY_LEVELS[daqi].band,
          fillColor: QUALITY_LEVELS[daqi].color
        },
        geometry: area.geometry
      };
    })
  };
}

function setupAlertLayers() {
  map.addSource(ALERT_POLYGONS_SOURCE_ID, {
    type: 'geojson',
    data: buildAlertPolygonFeatureCollection()
  });

  map.addLayer({
    id: ALERT_POLYGONS_FILL_LAYER_ID,
    type: 'fill',
    source: ALERT_POLYGONS_SOURCE_ID,
    paint: {
      'fill-color': ['get', 'fillColor'],
      'fill-opacity': 0.6
    }
  });

  map.on('mouseenter', ALERT_POLYGONS_FILL_LAYER_ID, () => { map.getCanvas().style.cursor = 'pointer'; });
  map.on('mouseleave', ALERT_POLYGONS_FILL_LAYER_ID, () => { map.getCanvas().style.cursor = ''; });
}

function setupAlertRadiusLayer() {
  const { lng, lat, radiusKm, daqi } = ALERT_RADIUS_STATION;

  map.addSource(ALERT_RADIUS_SOURCE_ID, {
    type: 'geojson',
    data: {
      type: 'Feature',
      properties: { fillColor: QUALITY_LEVELS[daqi].color },
      geometry: { type: 'Polygon', coordinates: createCirclePolygon([lng, lat], radiusKm) }
    }
  });

  map.addLayer({
    id: ALERT_RADIUS_FILL_LAYER_ID,
    type: 'fill',
    source: ALERT_RADIUS_SOURCE_ID,
    paint: {
      'fill-color': ['get', 'fillColor'],
      'fill-opacity': 0.35
    }
  });

  map.addLayer({
    id: ALERT_RADIUS_LINE_LAYER_ID,
    type: 'line',
    source: ALERT_RADIUS_SOURCE_ID,
    paint: {
      'line-color': ['get', 'fillColor'],
      'line-width': 2
    }
  });

  map.on('mouseenter', ALERT_RADIUS_FILL_LAYER_ID, () => { map.getCanvas().style.cursor = 'pointer'; });
  map.on('mouseleave', ALERT_RADIUS_FILL_LAYER_ID, () => { map.getCanvas().style.cursor = ''; });
  map.on('click', ALERT_RADIUS_FILL_LAYER_ID, () => { showAlertRadiusInfo(); });
}

// Filters the map layers to only show bands whose checkbox is ticked.
function applyAlertLevelFilter() {
  const showVeryHigh = document.getElementById('alert-very-high')?.checked ?? true;
  const showHigh = document.getElementById('alert-high')?.checked ?? true;

  const allowedBands = [];
  if (showVeryHigh) allowedBands.push('Very High');
  if (showHigh) allowedBands.push('High');

  const filter = allowedBands.length
    ? ['in', ['get', 'band'], ['literal', allowedBands]]
    : ['==', ['get', 'band'], '__none__'];

  if (map.getLayer(ALERT_POLYGONS_FILL_LAYER_ID)) map.setFilter(ALERT_POLYGONS_FILL_LAYER_ID, filter);
}

function setupAlertCheckboxes() {
  ['alert-very-high', 'alert-high'].forEach(id => {
    document.getElementById(id)?.addEventListener('change', applyAlertLevelFilter);
  });
}

function initMap() {
  map = new maplibregl.Map({
    container: 'map-viewport',
    style: 'https://basemaps.cartocdn.com/gl/positron-gl-style/style.json',
    center: [-0.9, 53.0],
    zoom: 6,
    minZoom: 5,
    maxZoom: 16,
    pitchWithRotate: false,
    dragRotate: false
  });
  window.AQMap = map;

  map.on('load', () => {
    loadAlertAreas().then(() => {
      setupAlertLayers();
      applyAlertLevelFilter();
      setupAlertRadiusLayer();
      createKeyOverlay();
      renderKeyOverlay();
      showKeyOverlay();
      if (window.innerWidth < 520) {
        hideKeyOverlay({ byUser: false });
        document.getElementById('mobile-key-reopen')?.removeAttribute('hidden');
      }
    });

    const flyToRaw = sessionStorage.getItem('mapFlyTo');
    if (flyToRaw) {
      try {
        const { lat, lng, zoom } = JSON.parse(flyToRaw);
        map.jumpTo({ center: [lng, lat], zoom: zoom || 9 });
      } catch (e) {}
      sessionStorage.removeItem('mapFlyTo');
    }
  });

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
}

// ---------------------------
// Panel toggle (desktop + mobile)
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

function setupMobilePanelControls() {
  const mobilePanel   = document.getElementById('mobile-key-panel-bottom');
  const mobileClose   = document.getElementById('panel-close-mobile');
  const mobileMenuBtn = document.getElementById('mobile-menu-reopen');
  const mobileKeyBtn  = document.getElementById('mobile-key-reopen');

  function openMobilePanel() {
    if (!mobilePanel || !mobileMenuBtn) return;
    hideKeyOverlay({ byUser: false });
    mobileKeyBtn?.removeAttribute('hidden');
    mobilePanel.style.display = 'block';
    mobileMenuBtn.hidden = true;
  }
  function closeMobilePanel() {
    if (!mobilePanel || !mobileMenuBtn) return;
    mobilePanel.style.display = 'none';
    mobileMenuBtn.hidden = false;
  }
  function openMobileKey() {
    if (mobilePanel) mobilePanel.style.display = 'none';
    mobileMenuBtn?.removeAttribute('hidden');
    showKeyOverlay();
  }

  mobileClose?.addEventListener('click',   (e) => { e.preventDefault(); closeMobilePanel(); });
  mobileMenuBtn?.addEventListener('click', (e) => { e.preventDefault(); openMobilePanel();  });
  mobileKeyBtn?.addEventListener('click',  (e) => { e.preventDefault(); openMobileKey();    });

  if (window.innerWidth < 520 && mobilePanel) {
    mobilePanel.style.display = 'block';
    if (mobileMenuBtn) mobileMenuBtn.hidden = true;
    hideKeyOverlay({ byUser: false });
    if (mobileKeyBtn) mobileKeyBtn.removeAttribute('hidden');
  }
}

// ---------------------------
// Initialisation
// ---------------------------

document.addEventListener('DOMContentLoaded', () => {
  setupPanelControls();
  setupMobilePanelControls();
  setupAlertCheckboxes();
  setupAlertRadiusInfoControls();
  initMap();
});
