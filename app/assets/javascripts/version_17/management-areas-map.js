// Management Areas Map – Version 16
// Displays Air Quality Management Area (AQMA) polygons from GeoJSON

import maplibregl from 'maplibre-gl';
import 'maplibre-gl/dist/maplibre-gl.css';

(function () {
  const AQMA_GEOJSON_URL = '/version-16/data/air-quality-management-areas.geojson';
  const AQMA_LOOKUP_URL  = '/version-16/data/aqma-lookup.json';
  const SCA_GEOJSON_URL  = '/version-16/data/smoke-control-areas.geojson';
  const AQMA_SOURCE_ID   = 'aqma-polygons';
  const SCA_SOURCE_ID    = 'sca-polygons';
  const AQMA_FILL_LAYER      = 'aqma-fill';
  const AQMA_LINE_LAYER      = 'aqma-line';
  const AQMA_HIGHLIGHT_LAYER = 'aqma-highlight';
  const SCA_FILL_LAYER       = 'sca-fill';
  const SCA_LINE_LAYER       = 'sca-line';
  const SCA_HIGHLIGHT_LAYER  = 'sca-highlight';

  let selectedScaFeatureId = null;

  let selectedFeatureId = null;
  let aqmaLookup = {};

  // Load AQMA metadata lookup (local authority, pollutants, dates)
  fetch(AQMA_LOOKUP_URL, { cache: 'no-cache' })
    .then(function (r) { return r.ok ? r.json() : {}; })
    .then(function (data) { aqmaLookup = data; })
    .catch(function () {});

  // --- Map initialisation ---
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

  map.on('load', () => {
    // Restore position from sessionStorage (map switcher)
    const flyToRaw = sessionStorage.getItem('mapFlyTo');
    if (flyToRaw) {
      try {
        const { lat, lng, zoom } = JSON.parse(flyToRaw);
        map.jumpTo({ center: [lng, lat], zoom: zoom || 6 });
      } catch (e) {}
      sessionStorage.removeItem('mapFlyTo');
    }

    // Restore active layer from sessionStorage
    const savedLayer = sessionStorage.getItem('mapLayer');
    if (savedLayer === 'sca') {
      const radio = document.getElementById('layer-sca');
      if (radio) radio.checked = true;
    }
    sessionStorage.removeItem('mapLayer');

    // Load and display AQMA polygons
    fetch(AQMA_GEOJSON_URL, { cache: 'no-cache' })
      .then(function (r) { return r.ok ? r.json() : Promise.reject(r.status); })
      .then(function (geojson) {
        map.addSource(AQMA_SOURCE_ID, { type: 'geojson', data: geojson, generateId: true });

        // Fill layer
        map.addLayer({
          id: AQMA_FILL_LAYER,
          type: 'fill',
          source: AQMA_SOURCE_ID,
          paint: {
            'fill-color': '#1d70b8',
            'fill-opacity': 0.2
          }
        });

        // Outline layer
        map.addLayer({
          id: AQMA_LINE_LAYER,
          type: 'line',
          source: AQMA_SOURCE_ID,
          paint: {
            'line-color': '#0b0c0c',
            'line-width': 1.5,
            'line-opacity': 0.8
          }
        });

        // Highlight layer – thicker blue outline on selected polygon
        map.addLayer({
          id: AQMA_HIGHLIGHT_LAYER,
          type: 'line',
          source: AQMA_SOURCE_ID,
          paint: {
            'line-color': '#1d70b8',
            'line-width': 4,
            'line-opacity': 1
          },
          filter: ['==', ['id'], -1]  // nothing selected initially
        });

        // Hover cursor
        map.on('mouseenter', AQMA_FILL_LAYER, () => { map.getCanvas().style.cursor = 'pointer'; });
        map.on('mouseleave', AQMA_FILL_LAYER, () => { map.getCanvas().style.cursor = ''; });

        // Click handler – highlight polygon and show AQMA info panel
        map.on('click', AQMA_FILL_LAYER, (e) => {
          const feature = e.features && e.features[0];
          if (!feature) return;
          selectedFeatureId = feature.id;
          map.setFilter(AQMA_HIGHLIGHT_LAYER, ['==', ['id'], selectedFeatureId]);
          showAqmaInfo(feature.properties || {});
        });
      })
      .catch(function (e) { console.warn('AQMA GeoJSON unavailable', e); });

    // Load and display SCA polygons (hidden initially)
    fetch(SCA_GEOJSON_URL, { cache: 'no-cache' })
      .then(function (r) { return r.ok ? r.json() : Promise.reject(r.status); })
      .then(function (geojson) {
        map.addSource(SCA_SOURCE_ID, { type: 'geojson', data: geojson, generateId: true });

        map.addLayer({
          id: SCA_FILL_LAYER,
          type: 'fill',
          source: SCA_SOURCE_ID,
          layout: { visibility: 'none' },
          paint: { 'fill-color': '#00703c', 'fill-opacity': 0.2 }
        });

        map.addLayer({
          id: SCA_LINE_LAYER,
          type: 'line',
          source: SCA_SOURCE_ID,
          layout: { visibility: 'none' },
          paint: { 'line-color': '#0b0c0c', 'line-width': 1.5, 'line-opacity': 0.8 }
        });

        // SCA highlight layer
        map.addLayer({
          id: SCA_HIGHLIGHT_LAYER,
          type: 'line',
          source: SCA_SOURCE_ID,
          layout: { visibility: 'none' },
          paint: { 'line-color': '#00703c', 'line-width': 4, 'line-opacity': 1 },
          filter: ['==', ['id'], -1]
        });

        // Hover cursor for SCA
        map.on('mouseenter', SCA_FILL_LAYER, () => { map.getCanvas().style.cursor = 'pointer'; });
        map.on('mouseleave', SCA_FILL_LAYER, () => { map.getCanvas().style.cursor = ''; });

        // Click handler for SCA
        map.on('click', SCA_FILL_LAYER, (e) => {
          const feature = e.features && e.features[0];
          if (!feature) return;
          selectedScaFeatureId = feature.id;
          map.setFilter(SCA_HIGHLIGHT_LAYER, ['==', ['id'], selectedScaFeatureId]);
          showScaInfo(feature.properties || {});
        });
        // Apply initial visibility based on saved/default layer choice
        const activeLayer = (document.getElementById('layer-sca') && document.getElementById('layer-sca').checked) ? 'sca' : 'aqma';
        const scaVisible = activeLayer === 'sca' ? 'visible' : 'none';
        map.setLayoutProperty(SCA_FILL_LAYER,      'visibility', scaVisible);
        map.setLayoutProperty(SCA_LINE_LAYER,      'visibility', scaVisible);
        map.setLayoutProperty(SCA_HIGHLIGHT_LAYER, 'visibility', scaVisible);
        if (activeLayer === 'sca') {
          map.setLayoutProperty(AQMA_FILL_LAYER,      'visibility', 'none');
          map.setLayoutProperty(AQMA_LINE_LAYER,      'visibility', 'none');
          map.setLayoutProperty(AQMA_HIGHLIGHT_LAYER, 'visibility', 'none');
        }
      })
      .catch(function (e) { console.warn('SCA GeoJSON unavailable', e); });
  });

  // --- Layer switcher (radio buttons) ---
  document.querySelectorAll('input[name="map-layer"]').forEach(function (radio) {
    radio.addEventListener('change', function () {
      const isAqma = this.value === 'aqma';
      closeAqmaInfo();
      closeScaInfo();
      if (map.getLayer(AQMA_FILL_LAYER)) {
        map.setLayoutProperty(AQMA_FILL_LAYER,      'visibility', isAqma ? 'visible' : 'none');
        map.setLayoutProperty(AQMA_LINE_LAYER,      'visibility', isAqma ? 'visible' : 'none');
        map.setLayoutProperty(AQMA_HIGHLIGHT_LAYER, 'visibility', isAqma ? 'visible' : 'none');
      }
      if (map.getLayer(SCA_FILL_LAYER)) {
        map.setLayoutProperty(SCA_FILL_LAYER,      'visibility', isAqma ? 'none' : 'visible');
        map.setLayoutProperty(SCA_LINE_LAYER,      'visibility', isAqma ? 'none' : 'visible');
        map.setLayoutProperty(SCA_HIGHLIGHT_LAYER, 'visibility', isAqma ? 'none' : 'visible');
      }
    });
  });

  // --- AQMA info panel ---
  const aqmaInfo        = document.getElementById('aqma-info');
  const aqmaInfoContent = document.getElementById('aqma-info-content');
  const closeAqmaBtn    = document.getElementById('close-aqma-info');

  function showAqmaInfo(props) {
    if (!aqmaInfo || !aqmaInfoContent) return;

    const name    = props.name || 'Air Quality Management Area';
    const docUrl  = props['documentation-url'] || '';
    const endDate = props['end-date'] || '';

    // Merge GeoJSON properties with lookup data
    const meta = aqmaLookup[name] || {};
    const localAuthority  = meta.localAuthority  || '';
    const pollutants      = meta.pollutants && meta.pollutants.length ? meta.pollutants.join(', ') : '';
    const declarationDate = meta.declarationDate || props['start-date'] || '';
    const amendmentDate   = meta.amendmentDate   || '';
    const isRevoked       = endDate && endDate !== '';
    const statusTag       = isRevoked
      ? '<strong class="govuk-tag govuk-tag--red">Revoked</strong>'
      : '<strong class="govuk-tag govuk-tag--green">Active</strong>';

    aqmaInfoContent.innerHTML = `
      <div class="station-header">
        <h2 class="govuk-heading-m govuk-!-margin-bottom-0">${name}</h2>
        <span class="govuk-!-margin-top-1" style="display:block">${statusTag}</span>
      </div>
      <dl class="govuk-body-s station-info-list">
        ${localAuthority ? `<div class="station-info-row"><dt>Local authority:</dt><dd>${localAuthority}</dd></div>` : ''}
        ${pollutants ? `<div class="station-info-row"><dt>Pollutant${meta.pollutants && meta.pollutants.length > 1 ? 's' : ''}:</dt><dd>${pollutants}</dd></div>` : ''}
        ${declarationDate ? `<div class="station-info-row"><dt>Start date:</dt><dd>${declarationDate}</dd></div>` : ''}
        ${amendmentDate ? `<div class="station-info-row"><dt>Last amended:</dt><dd>${amendmentDate}</dd></div>` : ''}
        ${isRevoked ? `<div class="station-info-row"><dt>Date revoked:</dt><dd>${endDate}</dd></div>` : ''}
      </dl>
      <p class="govuk-!-margin-top-3 govuk-!-margin-bottom-0">
        <a href="/version-16/station/aqmas/birmingham-city-centre.html" class="govuk-link">More information about this AQMA</a>
      </p>
    `;

    aqmaInfo.classList.add('visible');
    aqmaInfo.setAttribute('aria-label', `Information for ${name}`);
    aqmaInfo.focus();
  }

  function closeAqmaInfo() {
    if (!aqmaInfo) return;
    aqmaInfo.classList.remove('visible');
    // Clear highlight
    selectedFeatureId = null;
    if (window.AQMap && window.AQMap.getLayer(AQMA_HIGHLIGHT_LAYER)) {
      window.AQMap.setFilter(AQMA_HIGHLIGHT_LAYER, ['==', ['id'], -1]);
    }
  }

  function closeScaInfo() {
    if (!aqmaInfo) return;
    aqmaInfo.classList.remove('visible');
    selectedScaFeatureId = null;
    if (window.AQMap && window.AQMap.getLayer(SCA_HIGHLIGHT_LAYER)) {
      window.AQMap.setFilter(SCA_HIGHLIGHT_LAYER, ['==', ['id'], -1]);
    }
  }

  function showScaInfo(props) {
    if (!aqmaInfo || !aqmaInfoContent) return;
    const name = props.LAD23NM || 'Smoke Control Area';
    aqmaInfoContent.innerHTML = `
      <div class="station-header">
        <h2 class="govuk-heading-m govuk-!-margin-bottom-0">${name}</h2>
        <span class="govuk-!-margin-top-1" style="display:block"><strong class="govuk-tag govuk-tag--green">Active</strong></span>
      </div>
      <dl class="govuk-body-s station-info-list">
        <div class="station-info-row">
          <dt>Type:</dt>
          <dd>Smoke Control Area</dd>
        </div>
      </dl>
      <p class="govuk-!-margin-top-3 govuk-!-margin-bottom-0">
        <a href="/version-16/station/scas/birmingham-city-centre.html" class="govuk-link">More information about this SCA</a>
      </p>
    `;
    aqmaInfo.classList.add('visible');
    aqmaInfo.setAttribute('aria-label', `Information for ${name}`);
    aqmaInfo.focus();
  }

  if (closeAqmaBtn) {
    closeAqmaBtn.addEventListener('click', () => {
      closeAqmaInfo();
      closeScaInfo();
    });
  }

  // --- Controls ---
  const zoomInBtn  = document.getElementById('zoomIn');
  const zoomOutBtn = document.getElementById('zoomOut');
  const exitBtn    = document.getElementById('exit-map');
  const panelCloseBtn = document.getElementById('panel-close');
  const menuButton = document.getElementById('menu-button');
  const floatingPanel = document.getElementById('floating-panel');

  if (zoomInBtn)  zoomInBtn.addEventListener('click',  () => map.zoomIn());
  if (zoomOutBtn) zoomOutBtn.addEventListener('click', () => map.zoomOut());

  if (exitBtn) {
    exitBtn.addEventListener('click', () => { window.history.back(); });
  }

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

})();
