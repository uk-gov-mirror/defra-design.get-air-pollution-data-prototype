//
// For guidance on how to add JavaScript see:
// https://prototype-kit.service.gov.uk/docs/adding-css-javascript-and-images
//

window.GOVUKPrototypeKit.documentReady(() => {
  // no-op
});

/**
 * Monthly PM10 chart (limit = 50 μg/m3) with:
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
  const CONTAINER_ID = "no2-container-month";
  const CSV_PATH = "/public/javascripts/version_13/chart-data/past-month/no2.csv";
  const LIMIT = 200; // μg/m3 (threshold line + exceedance computation fallback)

  let focusPointsCreated = false;
  let keyboardNavigation = false;

  // Avoid stacking global listeners if this file is loaded more than once
  if (!window.__AQ_PM10_MONTH_LISTENERS__) {
    window.__AQ_PM10_MONTH_LISTENERS__ = true;

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

  function normaliseExceedance(ex, population) {
    // Use provided exceedance if valid, else compute from LIMIT
    const v = (ex ?? "").toString().trim().toUpperCase();
    if (v === "Y" || v === "N") return v;
    return population > LIMIT ? "Y" : "N";
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

  function drawChart() {
    // Remove any previous tooltip (avoid duplicates)
    d3.selectAll("body > .graph-tooltip").remove();

    // Clear previous chart
    d3.select(`#${CONTAINER_ID}`).selectAll("*").remove();

    const containerEl = document.getElementById(CONTAINER_ID);
    if (!containerEl) return;

    const margin = { top: 20, right: 10, bottom: 50, left: 40 };
    const width = containerEl.clientWidth - margin.left - margin.right;
    const height = 400 - margin.top - margin.bottom;

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

    d3.csv(CSV_PATH).then(function (raw) {
      const data = raw
        .map((d) => {
          const dt = parseISOish(d.date);
          const pop = +d.population;
          const population = Number.isFinite(pop) ? pop : 0;

          const status = normaliseStatus(d.status); // 'V' or 'U'
          const exceedance = normaliseExceedance(d.exceedance, population); // 'Y'/'N'

          return { date: dt, population, status, exceedance };
        })
        .filter((d) => d.date)
        .sort((a, b) => a.date - b.date);

      if (!data.length) return;

      x.domain(d3.extent(data, (d) => d.date));

      const maxPop = d3.max(data, (d) => d.population) || 0;
      const yMax = Math.max(150, LIMIT * 1.25, maxPop * 1.1);
      y.domain([0, yMax]);



      // Top/bottom borders
      svg
        .append("line")
        .attr("x1", 0)
        .attr("y1", 0)
        .attr("x2", width)
        .attr("y2", 0)
        .attr("stroke", "#505a5f")
        .attr("stroke-width", 1)
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
            .ticks(d3.timeDay.every(8))
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

     
      // Draw segmented line/area:
      // - red when exceedance=Y
      // - dotted when status != V
      const segments = splitByStatusAndExceedance(data);

      segments.forEach((seg) => {
        if (!seg.data || seg.data.length < 2) return;

        const isVerified = seg.status === "V";
        const isExceedance = seg.exceedance === "Y";
        const color = isExceedance ? "#d4351c" : "#1d70b8";

        if (isVerified) {
          svg
            .append("path")
            .datum(seg.data)
            .attr("fill", color)
            .attr("opacity", 0.1)
            .attr("stroke", "none")
            .attr("d", area);
        }

        svg
          .append("path")
          .datum(seg.data)
          .attr("fill", "none")
          .attr("stroke", color)
          .attr("stroke-width", 1.5)
          .attr("d", line);
      });

       const outerCircle = svg
        .append("circle")
        .attr("r", 0)
        .attr("fill", "#1d70b8")
        .style("stroke", "#1d70b8")
        .style("pointer-events", "none")
        .style("opacity", 0);

      const innerCircle = svg
        .append("circle")
        .attr("r", 0)
        .attr("fill", "#ffffff")
        .style("pointer-events", "none")
        .style("opacity", 0);

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

      function tooltipHtml(d) {
        return `
          <strong style="font-size:22px;">
            ${d.population === 0 ? "No data" : `${d.population.toFixed(0)} μg/m3`}
          </strong>
          ${
            d.exceedance === "Y"
              ? `<div style="margin-top: 8px; margin-bottom: 8px;">
                   <strong class="govuk-tag govuk-tag--red">Above limit</strong>
                 </div>`
              : ""
          }
          <div style="margin-top: 4px; font-size: 19px;">${formatDateTime(d.date)}</div>
          <div style="margin-top: 4px; font-size: 19px; color: #505a5f;">
            ${d.status === "V" ? "Verified" : "Unverified"}
          </div>
        `;
      }

      // Hover show/hide
      d3.select(`#${CONTAINER_ID}`)
        .attr("tabindex", 0)
        .on("mouseover", function () {
          tooltip.style("display", "block");
          verticalLine.style("opacity", 1);
          outerCircle.style("opacity", 1);
          innerCircle.style("opacity", 1);
          labelGroup.style("display", "none");
        })
        .on("mouseout", function () {
          tooltip.style("display", "none");
          verticalLine.style("opacity", 0);
          outerCircle.attr("r", 0).style("opacity", 0);
          innerCircle.attr("r", 0).style("opacity", 0);
          labelGroup.style("display", "block");
          d3.select("#chart-aria-live").text("");
        });

      listeningRect.on("mousemove", function (event) {
        const [xCoord] = d3.pointer(event, this);
        const bisectDate = d3.bisector((d) => d.date).left;
        const x0 = x.invert(xCoord);
        const i = bisectDate(data, x0, 1);
        const d0 = data[i - 1];
        const d1 = data[i];
        const d = !d1 ? d0 : x0 - d0.date > d1.date - x0 ? d1 : d0;

        const xPos = x(d.date);
        const yPos = y(d.population);

        const circleColor = d.exceedance === "Y" ? "#d4351c" : "#1d70b8";

        outerCircle
          .attr("cx", xPos)
          .attr("cy", yPos)
          .attr("fill", circleColor)
          .style("stroke", circleColor)
          .transition()
          .duration(50)
          .attr("r", 6);

        innerCircle
          .attr("cx", xPos)
          .attr("cy", yPos)
          .transition()
          .duration(50)
          .attr("r", 3);

        verticalLine
          .attr("x1", xPos)
          .attr("x2", xPos)
          .attr("y1", 0)
          .attr("y2", height);

        tooltip.style("display", "block").html(tooltipHtml(d));
        positionTooltip(xPos);

        const screenReaderText =
          `${d.population === 0 ? "No data" : `${d.population.toFixed(0)} micrograms per cubic metre`}, ` +
          `${d.exceedance === "Y" ? "Above limit. " : ""}` +
          `${formatDateTime(d.date)}, ` +
          `${d.status === "V" ? "Verified" : "Unverified"}`;

        d3.select("#chart-aria-live").text(screenReaderText);
      });

      // Keyboard focus mode
      function handleFocus(event, d) {
        const xPos = x(d.date);
        const yPos = y(d.population);
        const circleColor = d.exceedance === "Y" ? "#d4351c" : "#1d70b8";
        const innerFocusColor = d.exceedance === "Y" ? "#7d1a1a" : "#144e8c";

        outerCircle
          .attr("cx", xPos)
          .attr("cy", yPos)
          .attr("fill", circleColor)
          .style("stroke", circleColor)
          .attr("r", 6)
          .style("opacity", 1);

        innerCircle.attr("cx", xPos).attr("cy", yPos).attr("r", 3).style("opacity", 1);

        focusRing.attr("cx", xPos).attr("cy", yPos).style("opacity", 1);

        focusInnerCircle
          .attr("cx", xPos)
          .attr("cy", yPos)
          .attr("fill", innerFocusColor)
          .style("opacity", 1);

        verticalLine
          .attr("x1", xPos)
          .attr("x2", xPos)
          .attr("y1", 0)
          .attr("y2", height)
          .style("opacity", 1);

        tooltip.style("display", "block").html(tooltipHtml(d));
        positionTooltip(xPos);

        d3.select("#chart-aria-live").text(
          `${d.population === 0 ? "No data" : `${d.population.toFixed(0)} micrograms per cubic metre`} on ${formatDateTime(d.date)}.`
        );
      }

      function handleBlur() {
        outerCircle.attr("r", 0).style("opacity", 0);
        innerCircle.attr("r", 0).style("opacity", 0);
        verticalLine.style("opacity", 0);
        tooltip.style("display", "none");
        focusRing.style("opacity", 0);
        focusInnerCircle.style("opacity", 0);
        d3.select("#chart-aria-live").text("");
      }

      function handleKeydown(event) {
        const circles = document.querySelectorAll(
          `#${CONTAINER_ID} .focus-points circle`
        );
        const currentIndex = Array.prototype.indexOf.call(circles, this);

        if (event.key === "ArrowRight" && currentIndex < circles.length - 1) {
          circles[currentIndex + 1].focus();
          event.preventDefault();
        } else if (event.key === "ArrowLeft" && currentIndex > 0) {
          circles[currentIndex - 1].focus();
          event.preventDefault();
        }
      }

      d3.select(`#${CONTAINER_ID}`).on("focus", function () {
        if (!keyboardNavigation || focusPointsCreated) return;
        focusPointsCreated = true;

        handleBlur();

        const focusGroup = svg.append("g").attr("class", "focus-points");

        focusGroup
          .selectAll("circle")
          .data(data)
          .enter()
          .append("circle")
          .attr("cx", (d) => x(d.date))
          .attr("cy", (d) => y(d.population))
          .attr("r", 6)
          .attr("fill", (d) => (d.exceedance === "Y" ? "#d4351c" : "#1d70b8"))
          .attr("stroke", "#ffffff")
          .attr("stroke-width", 1)
          .attr("tabindex", 0)
          .attr("role", "button")
          .attr("aria-label", (d) => {
            const date = formatDateTime(d.date);
            return (
              `${d.population === 0 ? "No data" : d.population.toFixed(0)} micrograms per cubic metre on ${date}, ` +
              `${d.status === "V" ? "Verified" : "Unverified"}` +
              `${d.exceedance === "Y" ? ", above limit" : ""}`
            );
          })
          .on("focus", handleFocus)
          .on("blur", handleBlur)
          .on("keydown", handleKeydown);

        const allCircles = document.querySelectorAll(
          `#${CONTAINER_ID} .focus-points circle`
        );
        if (allCircles.length > 0) {
          allCircles[allCircles.length - 1].focus();
        }

        outerCircle.raise();
        verticalLine.raise();
        innerCircle.raise();
        focusRing.raise();
        focusInnerCircle.raise();
      });

      // Optional: click clears keyboard focus visuals on desktop
      if (!window.__AQ_PM10_MONTH_CLEAR_CLICK__) {
        window.__AQ_PM10_MONTH_CLEAR_CLICK__ = true;

        document.addEventListener("click", function () {
          if (window.innerWidth <= 768) return;

          handleBlur();
          d3.select(`#${CONTAINER_ID}`).select(".focus-points").remove();
          focusPointsCreated = false;
        });
      }
    });
  }



window.AQGraphs = window.AQGraphs || {};
window.AQGraphs.no2_month = drawChart;


  // Initial render
  if (document.getElementById(CONTAINER_ID)) {
    drawChart();
  }

  // Avoid stacking resize listeners if you redraw multiple times
  window.removeEventListener("resize", drawChart);
  window.addEventListener("resize", drawChart);
})();
