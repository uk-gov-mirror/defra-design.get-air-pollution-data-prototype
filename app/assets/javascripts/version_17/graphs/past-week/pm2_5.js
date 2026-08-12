//
// For guidance on how to add JavaScript see:
// https://prototype-kit.service.gov.uk/docs/adding-css-javascript-and-images
//

window.GOVUKPrototypeKit.documentReady(() => {
  // no-op
});

/**
 * Monthly pm25 chart (limit = 50 μg/m3) with:
 * - Uses CSV columns: date,population,status,exceedance
 * - status: 'V' = Verified (solid), anything else = Unverified (dotted)
 * - exceedance: 'Y'/'N' (if missing/blank, computed from limit=50)
 * - red segments + filled area when exceedance=Y
 * - tooltip + vertical cursor line + hover point
 * - aria-live announcements
 * - keyboard “focus points” mode (Tab into chart, then ArrowLeft/ArrowRight)
 *
 * NOTE: Supports timestamps like 2024-10-29T24:00:00 (rolled to next day 00:00:00)
 */

(function () {
  const CONTAINER_ID = "pm25-container-week";
  const CSV_PM25_PATH = "/public/javascripts/version_17/chart-data/past-week/pm2_5.csv";
  const CSV_PM10_PATH = "/public/javascripts/version_17/chart-data/past-week/pm10.csv";
  const CSV_O3_PATH = "/public/javascripts/version_17/chart-data/past-week/o3.csv";
  const CSV_NO2_PATH = "/public/javascripts/version_17/chart-data/past-week/no2.csv";
  const LIMIT_PM25 = 50; // μg/m3
  const LIMIT_PM10 = 50; // μg/m3
  const LIMIT_O3 = 50; // μg/m3
  const LIMIT_NO2 = 200; // μg/m3

  const CHART_COLOURS = {
    darkBlue: "#12436D",
    turquoise: "#28A197",
    darkPink: "#801650",
    orange: "#F46A25",
    darkGrey: "#3D3D3D",
    lightPurple: "#A285D1"
  };

  const POLLUTANT_COLOURS = {
    "PM2.5": CHART_COLOURS.darkBlue,
    "PM10":  CHART_COLOURS.turquoise,
    "O3":    CHART_COLOURS.lightPurple,
    "NO2":   CHART_COLOURS.darkPink
  };

  let focusPointsCreated = false;
  let keyboardNavigation = false;
  let kbPollutantIdx = 0;
  let kbPointIdx = 0;

  // Avoid stacking global listeners if this file is loaded more than once
  if (!window.__AQ_PM25_WEEK_LISTENERS__) {
    window.__AQ_PM25_WEEK_LISTENERS__ = true;

    document.addEventListener("keydown", function (event) {
      if (event.key === "Tab") keyboardNavigation = true;
    });

    document.addEventListener("mousedown", function () {
      keyboardNavigation = false;
    });
  }

  function parseISOish(ts) {
    // Handles "YYYY-MM-DDTHH:mm:ss" and fixes "24:00:00" -> next day 00:00:00
    if (!ts || typeof ts !== "string") return null;

    const m = ts.match(
      /^(\d{4})-(\d{2})-(\d{2})T(\d{2}):(\d{2}):(\d{2})$/
    );
    if (!m) return null;

    let year = +m[1];
    let month = +m[2] - 1;
    let day = +m[3];
    let hour = +m[4];
    let minute = +m[5];
    let second = +m[6];

    if (hour === 24) {
      hour = 0;
      const d = new Date(year, month, day, hour, minute, second);
      d.setDate(d.getDate() + 1);
      return d;
    }

    return new Date(year, month, day, hour, minute, second);
  }

  function normaliseStatus(s) {
    // Accept V/v as verified; anything else treat as unverified
    if (!s) return "U";
    return String(s).trim().toUpperCase() === "V" ? "V" : "U";
  }

  function normaliseExceedance(ex, population, limit) {
    // Use provided exceedance if valid, else compute from limit
    const v = (ex ?? "").toString().trim().toUpperCase();
    if (v === "Y" || v === "N") return v;
    return population > limit ? "Y" : "N";
  }

  function splitByStatusAndExceedance(data) {
    // First split by status, then within each segment split by exceedance (with continuity point)
    const statusSegments = [];
    let current = [];
    let currentStatus = data[0]?.status;

    data.forEach((d, i) => {
      if (d.status === currentStatus) {
        current.push(d);
      } else {
        statusSegments.push({ data: current, status: currentStatus });
        current = [d];
        currentStatus = d.status;
      }
      if (i === data.length - 1) {
        statusSegments.push({ data: current, status: currentStatus });
      }
    });

    function splitByExceedance(seg) {
      const chunks = [];
      let sub = [];
      let currentEx = seg.data[0]?.exceedance;

      seg.data.forEach((d, i) => {
        if (d.exceedance === currentEx) {
          sub.push(d);
        } else {
          if (sub.length > 0) {
            // continuity point
            sub.push(d);
            chunks.push({ data: sub, status: seg.status, exceedance: currentEx });
          }
          sub = [d];
          currentEx = d.exceedance;
        }
        if (i === seg.data.length - 1) {
          chunks.push({ data: sub, status: seg.status, exceedance: currentEx });
        }
      });

      return chunks;
    }

    return statusSegments.flatMap(splitByExceedance);
  }

  function findNearestIndex(data, date) {
    let minDiff = Infinity;
    let idx = 0;
    data.forEach(function (d, i) {
      const diff = Math.abs(d.date - date);
      if (diff < minDiff) { minDiff = diff; idx = i; }
    });
    return idx;
  }

  function drawChart() {
    // Remove any previous tooltip (avoid duplicates)
    d3.selectAll("body > .graph-tooltip").remove();

    // Clear previous chart
    d3.select(`#${CONTAINER_ID}`).selectAll("*").remove();

    const containerEl = document.getElementById(CONTAINER_ID);
    if (!containerEl) return;

    const margin = { top: 20, right: 10, bottom: 50, left: 40 };
    const width = containerEl.clientWidth - margin.left - margin.right;
    const height = 480 - margin.top - margin.bottom;

    const x = d3.scaleTime().range([0, width]);
    const y = d3.scaleLinear().range([height, 0]);

    const line = d3
      .line()
      .defined((d) => d.population !== 0 && d.date)
      .curve(d3.curveMonotoneX)

      .x((d) => x(d.date))
      .y((d) => y(d.population));

    const area = d3
      .area()
      .defined((d) => d.population !== 0 && d.date)
      .x((d) => x(d.date))
      .y1((d) => y(d.population))
      .y0(height);

    const svg = d3
      .select(`#${CONTAINER_ID}`)
      .append("svg")
      .attr("width", width + margin.left + margin.right)
      .attr("height", height + margin.top + margin.bottom)
      .append("g")
      .attr("transform", `translate(${margin.left},${margin.top})`);

    d3.csv(CSV_PM25_PATH).then(function (rawPM25) {
      // Load all pollutant data in parallel
      return Promise.all([
        Promise.resolve(rawPM25),
        d3.csv(CSV_PM10_PATH),
        d3.csv(CSV_O3_PATH),
        d3.csv(CSV_NO2_PATH)
      ]);
    }).then(function ([rawPM25, rawPM10, rawO3, rawNo2]) {
      // Parse PM2.5 data
      const dataPM25 = rawPM25
        .map((d) => {
          const dt = parseISOish(d.date);
          const pop = +d.population;
          const population = Number.isFinite(pop) ? pop : 0;

          const status = normaliseStatus(d.status);
          const exceedance = normaliseExceedance(d.exceedance, population, LIMIT_PM25);

          return { date: dt, population, status, exceedance, pollutant: "PM2.5" };
        })
        .filter((d) => d.date)
        .sort((a, b) => a.date - b.date);

      // Parse PM10 data
      const dataPM10 = rawPM10
        .map((d) => {
          const dt = parseISOish(d.date);
          const pop = +d.population;
          const population = Number.isFinite(pop) ? pop : 0;

          const status = normaliseStatus(d.status);
          const exceedance = normaliseExceedance(d.exceedance, population, LIMIT_PM10);

          return { date: dt, population, status, exceedance, pollutant: "PM10" };
        })
        .filter((d) => d.date)
        .sort((a, b) => a.date - b.date);

      // Parse O3 data
      const dataO3 = rawO3
        .map((d) => {
          const dt = parseISOish(d.date);
          const pop = +d.population;
          const population = Number.isFinite(pop) ? pop : 0;

          const status = normaliseStatus(d.status);
          const exceedance = normaliseExceedance(d.exceedance, population, LIMIT_O3);

          return { date: dt, population, status, exceedance, pollutant: "O3" };
        })
        .filter((d) => d.date)
        .sort((a, b) => a.date - b.date);

      // Parse NO2 data
      const dataNo2 = rawNo2
        .map((d) => {
          const dt = parseISOish(d.date);
          const pop = +d.population;
          const population = Number.isFinite(pop) ? pop : 0;

          const status = normaliseStatus(d.status);
          const exceedance = normaliseExceedance(d.exceedance, population, LIMIT_NO2);

          return { date: dt, population, status, exceedance, pollutant: "NO2" };
        })
        .filter((d) => d.date)
        .sort((a, b) => a.date - b.date);

      if (!dataPM25.length || !dataPM10.length || !dataO3.length || !dataNo2.length) return;

      // Merge data by date for domain calculations
      const dateSet = new Set();
      dataPM25.forEach((d) => dateSet.add(d.date.getTime()));
      dataPM10.forEach((d) => dateSet.add(d.date.getTime()));
      dataO3.forEach((d) => dateSet.add(d.date.getTime()));
      dataNo2.forEach((d) => dateSet.add(d.date.getTime()));

      const dates = Array.from(dateSet)
        .map((t) => new Date(t))
        .sort((a, b) => a - b);

      x.domain([dates[0], dates[dates.length - 1]]);

      const maxPM25 = d3.max(dataPM25, (d) => d.population) || 0;
      const maxPM10 = d3.max(dataPM10, (d) => d.population) || 0;
      const maxO3 = d3.max(dataO3, (d) => d.population) || 0;
      const maxNo2 = d3.max(dataNo2, (d) => d.population) || 0;
      const maxValue = Math.max(maxPM25, maxPM10, maxO3, maxNo2);
      // Keep the domain tight to observed values so points are easier to distinguish/hover.
      const yMax = Math.max(20, Math.ceil((maxValue * 1.15) / 10) * 10);
      y.domain([0, yMax]);

      // Top/bottom borders
      svg
        .append("line")
        .attr("x1", 0)
        .attr("y1", 0)
        .attr("x2", width)
        .attr("y2", 0)
        .attr("stroke", "#505a5f")
        .attr("stroke-width", 1.5)
        .attr("opacity", 0.5);

      svg
        .append("line")
        .attr("x1", 0)
        .attr("y1", height)
        .attr("x2", width)
        .attr("y2", height)
        .attr("stroke", "#505a5f")
        .attr("stroke-width", 1)
        .attr("opacity", 0.5);

      // X axis (same stacked tick style you had)
      const xAxis = svg
        .append("g")
        .attr("transform", `translate(0,${height})`)
        .style("font-size", "16px")
        .call(
          d3
            .axisBottom(x)
            .ticks(d3.timeDay.every(1))
            .tickFormat(() => "")
        );

      xAxis.call((g) => g.select(".domain").remove());
      xAxis.selectAll(".tick line").style("stroke-opacity", 0);

      xAxis.selectAll(".tick text").each(function (d) {
        const time = d3.timeFormat("%I%p")(d).replace(/^0/, "").toLowerCase();
        const date = d3.timeFormat("%e %b")(d);

        const text = d3.select(this);
        text.text("");

        text.append("tspan").attr("x", 0).attr("dy", 10).text(time);
        text.append("tspan").attr("x", 0).attr("dy", "1.2em").text(date);
      });

      // Gridlines
      svg
        .selectAll("xGrid")
        .data(x.ticks().slice(1))
        .join("line")
        .attr("x1", (d) => x(d))
        .attr("x2", (d) => x(d))
        .attr("y1", 0)
        .attr("y2", height)
        .attr("stroke", "#e0e0e0")
        .attr("stroke-width", 0.5);

      svg
        .append("g")
        .style("font-size", "16px")
        .call(
          d3
            .axisLeft(y)
            .ticks(4)
            .tickFormat((d) => d)
            .tickSize(0)
            .tickPadding(10)
        )
        .call((g) => g.select(".domain").remove())
        .selectAll(".tick text")
        .style("fill", "#000000")
        .style("visibility", (d, i) => (i === 0 ? "hidden" : "visible"));

      svg
        .selectAll("yGrid")
        .data(y.ticks(12).slice(1))
        .join("line")
        .attr("x1", 0)
        .attr("x2", width)
        .attr("y1", (d) => y(d))
        .attr("y2", (d) => y(d))
        .attr("stroke", "#e0e0e0")
        .attr("stroke-width", 0.5);

     

      // Tooltip + cursor visuals
      const tooltip = d3
        .select("body")
        .append("div")
        .attr("class", "graph-tooltip")
        .classed("tooltip-bg tooltip-text", true)
        .style("position", "absolute")
        .style("display", "none");

      const verticalLine = svg
        .append("line")
        .attr("stroke", "#000000")
        .attr("stroke-width", 0.5)
        .style("opacity", 0);

     
      // Draw segmented lines for all four pollutants using pollutant-specific colours.
      const segmentsPM25 = splitByStatusAndExceedance(dataPM25);
      const segmentsPM10 = splitByStatusAndExceedance(dataPM10);
      const segmentsO3 = splitByStatusAndExceedance(dataO3);
      const segmentsNo2 = splitByStatusAndExceedance(dataNo2);

      [segmentsPM25, segmentsPM10, segmentsO3, segmentsNo2].forEach((segments) => {
        segments.forEach((seg) => {
          if (!seg.data || seg.data.length < 2) return;

          const isVerified = seg.status === "V";
          const baseColor = POLLUTANT_COLOURS[seg.data[0].pollutant] || CHART_COLOURS.darkBlue;
          const color = baseColor;

          if (isVerified) {
            svg
              .append("path")
              .datum(seg.data)
              .attr("fill", color)
              .attr("opacity", 0.1)
              .attr("stroke", "none")
              .attr("d", area)
              .attr("class", `pollutant-path-${seg.data[0].pollutant}`);
          }

          svg
            .append("path")
            .datum(seg.data)
            .attr("fill", "none")
            .attr("stroke", color)
            .attr("stroke-width", 3)
            .attr("d", line)
            .attr("class", `pollutant-line-${seg.data[0].pollutant}`)
            .attr("data-pollutant", seg.data[0].pollutant);
        });
      });

       // One hover circle per pollutant
      const POLLUTANT_KEYS = ["PM2.5", "PM10", "O3", "NO2"];
      const hoverCircles = {};
      POLLUTANT_KEYS.forEach(function (key) {
        hoverCircles[key] = svg
          .append("circle")
          .attr("r", 0)
          .attr("fill", POLLUTANT_COLOURS[key])
          .attr("stroke", "#ffffff")
          .attr("stroke-width", 1.5)
          .style("pointer-events", "none")
          .style("opacity", 0);
      });

      const focusRing = svg
        .append("circle")
        .attr("r", 8)
        .attr("fill", "none")
        .attr("stroke", "#ffdd00")
        .attr("stroke-width", 3)
        .style("pointer-events", "none")
        .style("opacity", 0);

      const focusInnerCircle = svg
        .append("circle")
        .attr("r", 6)
        .attr("fill", "#003078")
        .style("pointer-events", "none")
        .style("opacity", 0);


      // Listening rect
      const listeningRect = svg
        .append("rect")
        .attr("width", width)
        .attr("height", height)
        .style("fill", "transparent");

      // Keep hover selection stable unless another line is clearly closer.
      // (Not used for multi-pollutant mode but kept for potential future single-line mode)

      function positionTooltip(xPos) {
        const tooltipWidth = tooltip.node().offsetWidth;
        const containerRect = containerEl.getBoundingClientRect();
        const pointOffset = xPos + containerRect.left;

        let left;
        if (xPos < width * 0.45) {
          left = pointOffset + 60;
        } else if (xPos > width * 0.55) {
          left = pointOffset - tooltipWidth + 30;
        } else {
          left = pointOffset - tooltipWidth / 2;
        }

        tooltip
          .style("left", `${left}px`)
          .style("top", `${containerRect.top + window.scrollY + 20}px`);
      }

      function formatDateTime(d) {
        const time = d3
          .timeFormat("%I:%M%p")(d)
          .replace(/^0/, "")
          .toLowerCase();
        const date = d3.timeFormat("%e %b")(d);
        return `${time}, ${date}`;
      }

      const POLLUTANT_FULL_NAMES = {
        "PM2.5": "PM2.5",
        "PM10": "PM10",
        "O3": "Ozone",
        "NO2": "Nitrogen dioxide"
      };

      function tooltipHtml(dataMap, datePoint) {
        const rows = [
          { key: "PM2.5", d: dataMap["PM2.5"] },
          { key: "PM10",  d: dataMap["PM10"] },
          { key: "NO2",   d: dataMap["NO2"] },
          { key: "O3",    d: dataMap["O3"] }
        ];
        let html = '';
        rows.forEach(function (row) {
          const label = POLLUTANT_FULL_NAMES[row.key];
          const val = row.d.population === 0 ? "No data" : `${row.d.population.toFixed(0)} μg/m³`;
          const excTag = row.d.exceedance === "Y"
            ? ' <strong class="govuk-tag govuk-tag--red govuk-!-font-size-14">Above limit</strong>'
            : '';
          const dotColour = POLLUTANT_COLOURS[row.key];
          const dot = `<svg width="18" height="18" viewBox="-1 -1 18 18" style="flex-shrink:0; margin-right:6px;" aria-hidden="true"><circle cx="8" cy="8" r="8" fill="${dotColour}" stroke="none"/></svg>`;
          html += `<div style="font-size:19px; margin-bottom:4px; display:flex; align-items:center;">${dot}<span><strong>${label}</strong> | ${val}${excTag}</span></div>`;
        });
        const anyUnverified = rows.some(function (r) { return r.d.status !== "V"; });
        html += `<div style="margin-top:8px; font-size:19px;">${formatDateTime(datePoint)}</div>`;
        html += `<div style="margin-top:4px; font-size:19px; color:#505a5f;">${anyUnverified ? "Unverified" : "Verified"}</div>`;
        return html;
      }

      function tooltipHtmlSingle(d) {
        const label = POLLUTANT_FULL_NAMES[d.pollutant] || d.pollutant;
        const val = d.population === 0 ? "No data" : `${d.population.toFixed(0)} μg/m³`;
        const excTag = d.exceedance === "Y"
          ? ' <strong class="govuk-tag govuk-tag--red govuk-!-font-size-14">Above limit</strong>'
          : '';
        const dotColour = POLLUTANT_COLOURS[d.pollutant] || CHART_COLOURS.darkBlue;
        const dot = `<svg width="18" height="18" viewBox="-1 -1 18 18" style="flex-shrink:0; margin-right:6px;" aria-hidden="true"><circle cx="8" cy="8" r="8" fill="${dotColour}" stroke="none"/></svg>`;
        let html = `<div style="font-size:19px; margin-bottom:4px; display:flex; align-items:center;">${dot}<span><strong>${label}</strong> | ${val}${excTag}</span></div>`;
        html += `<div style="margin-top:8px; font-size:19px;">${formatDateTime(d.date)}</div>`;
        html += `<div style="margin-top:4px; font-size:19px; color:#505a5f;">${d.status === "V" ? "Verified" : "Unverified"}</div>`;
        return html;
      }

      // Hover show/hide
      d3.select(`#${CONTAINER_ID}`)
        .attr("tabindex", 0)
        .style("outline", "none")
        .on("mouseover", function () {
          tooltip.style("display", "block");
          verticalLine.style("opacity", 1);
          POLLUTANT_KEYS.forEach(function (key) { hoverCircles[key].style("opacity", 1); });
          labelGroup.style("display", "none");
        })
        .on("mouseout", function () {
          tooltip.style("display", "none");
          verticalLine.style("opacity", 0);
          POLLUTANT_KEYS.forEach(function (key) { hoverCircles[key].attr("r", 0).style("opacity", 0); });
          labelGroup.style("display", "block");
          d3.select("#chart-aria-live").text("");
        });

      listeningRect.on("mousemove", function (event) {
        const [xCoord] = d3.pointer(event, this);
        const bisectDate = d3.bisector((d) => d.date).left;
        const x0 = x.invert(xCoord);

        // Find nearest point for each pollutant by x position
        function nearestPoint(data) {
          const i = bisectDate(data, x0, 1);
          const d0 = data[i - 1];
          const d1 = data[i];
          return !d1 ? d0 : x0 - d0.date > d1.date - x0 ? d1 : d0;
        }

        const d25  = nearestPoint(dataPM25);
        const d10  = nearestPoint(dataPM10);
        const dO3  = nearestPoint(dataO3);
        const dNo2 = nearestPoint(dataNo2);

        const dataMap = { "PM2.5": d25, "PM10": d10, "O3": dO3, "NO2": dNo2 };

        // Position a circle on each pollutant line
        POLLUTANT_KEYS.forEach(function (key) {
          const d = dataMap[key];
          const xPos = x(d.date);
          const yPos = y(d.population);
          const color = POLLUTANT_COLOURS[key];
          hoverCircles[key]
            .attr("cx", xPos)
            .attr("cy", yPos)
            .attr("fill", color)
            .attr("r", 6)
            .style("opacity", 1);
        });

        // Vertical line at x of PM2.5 (all pollutants share same timestamps)
        const xPos = x(d25.date);
        verticalLine
          .attr("x1", xPos)
          .attr("x2", xPos)
          .attr("y1", 0)
          .attr("y2", height);

        tooltip.style("display", "block").html(tooltipHtml(dataMap, d25.date));
        positionTooltip(xPos);

        const screenReaderText =
          `PM2.5: ${d25.population === 0 ? "No data" : `${d25.population.toFixed(0)} μg/m³`}, ` +
          `PM10: ${d10.population === 0 ? "No data" : `${d10.population.toFixed(0)} μg/m³`}, ` +
          `Nitrogen dioxide: ${dNo2.population === 0 ? "No data" : `${dNo2.population.toFixed(0)} μg/m³`}, ` +
          `Ozone: ${dO3.population === 0 ? "No data" : `${dO3.population.toFixed(0)} μg/m³`}. ` +
          `${formatDateTime(d25.date)}.`;

        d3.select("#chart-aria-live").text(screenReaderText);
      });

      // Keyboard focus mode
      function handleFocus(event, d) {
        const xPos = x(d.date);
        const yPos = y(d.population);
        const activePollutant = kbPollutants[kbPollutantIdx].name;

        svg.selectAll("path[data-pollutant]").style("opacity", function () {
          const pollutant = d3.select(this).attr("data-pollutant");
          return pollutant === activePollutant ? 1 : 0.2;
        });

        POLLUTANT_KEYS.forEach(function (key) {
          hoverCircles[key].attr("r", 0).style("opacity", 0);
        });

        hoverCircles[activePollutant]
          .attr("cx", xPos)
          .attr("cy", yPos)
          .attr("fill", POLLUTANT_COLOURS[activePollutant] || CHART_COLOURS.darkBlue)
          .attr("r", 6)
          .style("opacity", 1);

        focusRing.attr("cx", xPos).attr("cy", yPos).style("opacity", 1);
        focusInnerCircle
          .attr("cx", xPos)
          .attr("cy", yPos)
          .attr("fill", POLLUTANT_COLOURS[activePollutant] || CHART_COLOURS.darkBlue)
          .style("opacity", 1);

        verticalLine
          .attr("x1", xPos)
          .attr("x2", xPos)
          .attr("y1", 0)
          .attr("y2", height)
          .style("opacity", 1);

        hoverCircles[activePollutant].raise();
        focusRing.raise();
        focusInnerCircle.raise();
        verticalLine.raise();

        tooltip.style("display", "block").html(tooltipHtmlSingle(d));
        positionTooltip(xPos);

        d3.select("#chart-aria-live").text(
          `${POLLUTANT_FULL_NAMES[activePollutant] || activePollutant}: ` +
          `${d.population === 0 ? "No data" : `${d.population.toFixed(0)} micrograms per cubic metre`} on ${formatDateTime(d.date)}.`
        );
      }

      function handleBlur() {
        POLLUTANT_KEYS.forEach(function (key) { hoverCircles[key].attr("r", 0).style("opacity", 0); });
        verticalLine.style("opacity", 0);
        tooltip.style("display", "none");
        focusRing.style("opacity", 0);
        focusInnerCircle.style("opacity", 0);
        d3.select("#chart-aria-live").text("");
        svg.selectAll("path[data-pollutant]").style("opacity", 1);
        // Remove data point dots
        svg.select(".kb-data-points").selectAll("circle").remove();
      }

      const kbPollutants = [
        { name: "PM2.5", data: dataPM25 },
        { name: "PM10",  data: dataPM10 },
        { name: "O3",    data: dataO3 },
        { name: "NO2",   data: dataNo2 }
      ];

      const dataPointsGroup = svg.append("g").attr("class", "kb-data-points");

      function updateKeyboardFocus() {
        const activePoll = kbPollutants[kbPollutantIdx];
        const d = activePoll.data[kbPointIdx];
        if (!d) return;

        // Render dots at every point on the active pollutant's line
        dataPointsGroup.selectAll("circle").remove();
        activePoll.data.forEach(function (pt) {
          if (!pt.date || pt.population === 0) return;
          dataPointsGroup
            .append("circle")
            .attr("cx", x(pt.date))
            .attr("cy", y(pt.population))
            .attr("r", 6)
            .attr("fill", POLLUTANT_COLOURS[activePoll.name] || CHART_COLOURS.darkBlue)
            .attr("stroke", "#ffffff")
            .attr("stroke-width", 1)
            .style("pointer-events", "none");
        });

        handleFocus(null, d);
        // Ensure focus indicators sit above the data point dots
        hoverCircles[activePoll.name].raise();
        focusRing.raise();
        focusInnerCircle.raise();
        verticalLine.raise();
      }

      d3.select(`#${CONTAINER_ID}`)
        .attr("aria-label", "Air quality chart. Use arrow keys to navigate data points. Left and Right move along the current pollutant. Up and Down switch between pollutants.")
        .on("focus", function () {
          if (!keyboardNavigation) return;
          if (!focusPointsCreated) {
            focusPointsCreated = true;
            kbPollutantIdx = 0;
            kbPointIdx = 0;
          }
          updateKeyboardFocus();
        })
        .on("blur", function () {
          if (focusPointsCreated) {
            focusPointsCreated = false;
            handleBlur();
          }
        })
        .on("keydown", function (event) {
          if (!focusPointsCreated) return;

          const poll = kbPollutants[kbPollutantIdx];

          if (event.key === "ArrowRight") {
            if (kbPointIdx < poll.data.length - 1) {
              kbPointIdx++;
              updateKeyboardFocus();
            }
            event.preventDefault();
          } else if (event.key === "ArrowLeft") {
            if (kbPointIdx > 0) {
              kbPointIdx--;
              updateKeyboardFocus();
            }
            event.preventDefault();
          } else if (event.key === "ArrowDown") {
            if (kbPollutantIdx > 0) {
              const currentDate = poll.data[kbPointIdx].date;
              kbPollutantIdx--;
              kbPointIdx = findNearestIndex(kbPollutants[kbPollutantIdx].data, currentDate);
              updateKeyboardFocus();
            }
            event.preventDefault();
          } else if (event.key === "ArrowUp") {
            if (kbPollutantIdx < kbPollutants.length - 1) {
              const currentDate = poll.data[kbPointIdx].date;
              kbPollutantIdx++;
              kbPointIdx = findNearestIndex(kbPollutants[kbPollutantIdx].data, currentDate);
              updateKeyboardFocus();
            }
            event.preventDefault();
          }
        });

      // Optional: click clears keyboard focus visuals on desktop
      if (!window.__AQ_PM25_WEEK_CLEAR_CLICK__) {
        window.__AQ_PM25_WEEK_CLEAR_CLICK__ = true;

        document.addEventListener("click", function () {
          if (window.innerWidth <= 768) return;

          focusPointsCreated = false;
          handleBlur();
        });
      }
    });
  }

  // Expose redraw hook
  window.AQGraphs = window.AQGraphs || {};
  window.AQGraphs.pm25_week = drawChart;

  // Initial render
  if (document.getElementById(CONTAINER_ID)) {
    drawChart();
  }

  // Avoid stacking resize listeners if you redraw multiple times
  window.removeEventListener("resize", drawChart);
  window.addEventListener("resize", drawChart);
})();
