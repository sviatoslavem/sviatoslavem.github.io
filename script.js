
document.getElementById("openModalBtn").addEventListener("click", function() {
    const url = "https://drive.google.com/drive/folders/1rKwWbXewsDwUV3_4q--JEZ3zSN1yFPaW?usp=sharing";
    window.open(url, "_blank"); // Відкриває посилання в новій вкладці
});

function toggleHeaderContent() {
        document.querySelector("header").classList.toggle("show-content");
        document.querySelector("main").classList.toggle("show-overlay");
      }

      function toggleTabs() {
        document.querySelector("nav").classList.toggle("show-content");
      }

      document.querySelectorAll(".tab-link").forEach(function (tab) {
        tab.addEventListener("click", function () {
          var tabID = this.getAttribute("data-tab");

          document.querySelectorAll(".tab-link").forEach(function (link) {
            link.classList.remove("active");
          });

          document.querySelectorAll(".tab-content").forEach(function (content) {
            content.classList.remove("active");
          });

          this.classList.add("active");
          document.getElementById(tabID).classList.add("active");

          // Перевіряємо, чи активна вкладка є однією з tab-1, tab-2, tab-3
          if (tabID === "tab-1" || tabID === "tab-2" || tabID === "tab-3") {
            document.querySelector("nav").classList.add("show-shared-content");
          } else {
            document
              .querySelector("nav")
              .classList.remove("show-shared-content");
          }
        });
      });
      // ----------------
      function sortTable(columnIndex) {
        var table = document.getElementById("editableTable");
        var rows = table.rows;
        var switching = true;
        var shouldSwitch;
        var i;
        var x, y;
        var direction = "ascending";
        var switchCount = 0;

        // Remove existing sort indicators
        var indicators = table.querySelectorAll(".sort-indicator");
        indicators.forEach(function (indicator) {
          indicator.textContent = "";
        });

        while (switching) {
          switching = false;
          var rowsArray = Array.from(rows).slice(1);

          for (i = 0; i < rowsArray.length - 1; i++) {
            shouldSwitch = false;
            x = rowsArray[i].getElementsByTagName("TD")[columnIndex];
            y = rowsArray[i + 1].getElementsByTagName("TD")[columnIndex];

            if (direction == "ascending") {
              if (
                parseFloat(x.innerHTML.replace(",", ".")) >
                parseFloat(y.innerHTML.replace(",", "."))
              ) {
                shouldSwitch = true;
                break;
              }
            } else if (direction == "descending") {
              if (
                parseFloat(x.innerHTML.replace(",", ".")) <
                parseFloat(y.innerHTML.replace(",", "."))
              ) {
                shouldSwitch = true;
                break;
              }
            }
          }

          if (shouldSwitch) {
            rowsArray[i].parentNode.insertBefore(
              rowsArray[i + 1],
              rowsArray[i]
            );
            switching = true;
            switchCount++;
          } else {
            if (switchCount == 0 && direction == "ascending") {
              direction = "descending";
              switching = true;
            }
          }
        }

        // Add sort indicator
        var header = table.getElementsByTagName("TH")[columnIndex];
        var indicator = header.querySelector(".sort-indicator");
        if (direction == "ascending") {
          indicator.textContent = "↑";
        } else {
          indicator.textContent = "↓";
        }
        drawEllipses();
      }

      function analyzeCentralStrip() {
        const radius = parseFloat(document.getElementById("Radius").value) / 8;
        const centerX =
          parseFloat(document.getElementById("centerX").value) / 8 + 250 + 65;
        const centerY =
          parseFloat(document.getElementById("centerY").value) / -8 + 250 + 10;
        const numCentralStrips = parseFloat(
          document.getElementById("numCentralStrips").value
        );
        const excludeCenter =
          document.getElementById("excludeStripCenter").checked;
        //const showLine = document.getElementById("showStripLine").checked;
        const stripWidth = (2 * radius) / numCentralStrips;

        const svg = document.getElementById("mySVG");
        svg.innerHTML = "";
        drawLinesAndText();

        const stripResults = document.getElementById("centralStripResults");
        stripResults.innerHTML = "";
        const stripResults2 = document.getElementById("centralStripResults2");
        stripResults2.innerHTML = "";

        // Draw main circle
        const circle = document.createElementNS(
          "http://www.w3.org/2000/svg",
          "circle"
        );
        circle.setAttribute("cx", centerX);
        circle.setAttribute("cy", centerY);
        circle.setAttribute("r", radius);
        circle.setAttribute("stroke", "rgba(0,0,0, 0.1)");
        circle.setAttribute("stroke-width", "1");
        circle.setAttribute("fill", "none");
        svg.appendChild(circle);

        // Draw central strip
        const centralStripY = centerY - radius;
        const rect = document.createElementNS(
          "http://www.w3.org/2000/svg",
          "rect"
        );
        rect.setAttribute("x", centerX - stripWidth / 2);
        rect.setAttribute("y", centralStripY);
        rect.setAttribute("width", stripWidth);
        rect.setAttribute("height", radius);
        rect.setAttribute("stroke", "rgba(0,0,0, 0.1)");
        rect.setAttribute("fill", `none`);
        svg.appendChild(rect);

        // Draw inner dashed circle if excludeCenter is checked
        if (excludeCenter) {
          const innerCircle = document.createElementNS(
            "http://www.w3.org/2000/svg",
            "circle"
          );
          innerCircle.setAttribute("cx", centerX);
          innerCircle.setAttribute("cy", centerY);
          innerCircle.setAttribute("r", stripWidth / 2);
          innerCircle.setAttribute("stroke", "rgba(0,0,0, 0.1)");
          innerCircle.setAttribute("stroke-width", "1");
          innerCircle.setAttribute("fill", "none");
          innerCircle.setAttribute("stroke-dasharray", "2, 2");
          svg.appendChild(innerCircle);
        }

        // Analyze data points
        const data = getDataFromTable(); // Assuming you have a function to get data points
        const totalGalaxies = data.length;
        const angleCounts = Array(380).fill(0);
        var stringResult = "";
        for (let angle = 0; angle < 380; angle++) {
          let pointCount = 0;
          data.forEach((point, index) => {
            const rotatedPoint = rotatePoint(
              point.i,
              point.x,
              point.y,
              centerX,
              centerY,
              angle
            );
            const distToCenter = Math.sqrt(
              (rotatedPoint.x - centerX) ** 2 + (rotatedPoint.y - centerY) ** 2
            );
            const isInsideCenter =
              excludeCenter && distToCenter < stripWidth / 2;
            const isInCentralStrip =
              rotatedPoint.y < centerY &&
              Math.abs(rotatedPoint.x - centerX) <= stripWidth / 2;
            const isInOuterCircle = distToCenter <= radius;

            if (isInCentralStrip && isInOuterCircle && !isInsideCenter) {
              pointCount++;
            }

            if (angle === 0) {
              const color =
                isInCentralStrip && isInOuterCircle && !isInsideCenter
                  ? "blue"
                  : "red";
              const fillColor =
                isInCentralStrip && isInOuterCircle && !isInsideCenter
                  ? "lightblue"
                  : "lightcoral";

              const ellipse = createCircleViewe(
                rotatedPoint.i,
                rotatedPoint.x,
                rotatedPoint.y,
                3,
                0,
                point.PA,
                color,
                fillColor,
                point.BG
              );
              svg.appendChild(ellipse);
            }
          });
          angleCounts[angle] = pointCount;
        }

        // Apply Smoothing
        const smoothingType = document.querySelector('input[name="smoothingType"]:checked').value;
        let processedCounts = [...angleCounts];

        if (smoothingType === "3pt") {
          for (let i = 0; i < angleCounts.length; i++) {
            const prev = i > 0 ? angleCounts[i - 1] : angleCounts[angleCounts.length - 1];
            const next = i < angleCounts.length - 1 ? angleCounts[i + 1] : angleCounts[0];
            processedCounts[i] = (prev + angleCounts[i] + next) / 3;
          }
        } else if (smoothingType === "5pt") {
          for (let i = 0; i < angleCounts.length; i++) {
            const prev1 = i > 0 ? angleCounts[i - 1] : angleCounts[angleCounts.length - 1];
            const prev2 = i > 1 ? angleCounts[i - 2] : angleCounts[angleCounts.length - (i <= 1 ? 2 - i : 0)]; 
            // Simplified circular logic for 5pt
            const getVal = (idx) => angleCounts[(idx + angleCounts.length) % angleCounts.length];
            processedCounts[i] = (getVal(i-2) + getVal(i-1) + angleCounts[i] + getVal(i+1) + getVal(i+2)) / 5;
          }
        }

        // Display results table based on processed counts
        var stringResult = "";
        processedCounts.forEach((count, angle) => {
          stringResult += `<br><div><b>α:</b>&emsp;&emsp;${angle}&emsp;&emsp;<b>Count:</b>&emsp;&emsp;${count.toFixed(2)}&emsp;&emsp;<b>f':</b>&emsp;&emsp;${(
            count / totalGalaxies
          ).toFixed(4)}</div>`;
        });
        stripResults.innerHTML = stringResult;

        // Calculate standard deviation based on processed counts
        const meanCount =
          processedCounts.reduce((sum, count) => sum + count/totalGalaxies, 0) /
          processedCounts.length;
        const variance =
          processedCounts.reduce(
            (sum, count) => sum + (count/totalGalaxies - meanCount) ** 2,
            0
          ) /
          (processedCounts.length - 1);
        const standardDeviation = Math.sqrt(variance);

        // Display standard deviation
        stripResults2.innerHTML += `<br>
              <b>The mean value: </b>&emsp;${meanCount.toFixed(4)}<br>
              <b>Variance:</b>&emsp;${variance.toFixed(4)}<br>
      <b>Standard Deviation (S):</b>&emsp;${standardDeviation.toFixed(4)}`;

        const selectedChart = document.querySelector('input[name="chartType"]:checked').value;

        if (selectedChart === "histogram") {
            drawAngleHistogram(processedCounts, 380);
        } else if (selectedChart === "polar") {
            drawPolarDensityChart(processedCounts, 360);
        }
      }

      function drawAngleHistogram(angleCounts, numBins) {
        const svg = document.getElementById("histogramSVG");
        svg.innerHTML = "";

        const width = 575;
        const height = 545;
        const margin = 55;

        // Calculate densities
        //const totalPoints = angleCounts.reduce((sum, count) => sum + count, 0);
        const data = getDataFromTable(); // Assuming you have a function to get data points
        const totalGalaxies = data.length;
        //console.log(totalPoints, totalGalaxies);
        const densities = angleCounts.map((count) => count / totalGalaxies);

        // Normalize bin values
        const maxDensity = 0.4; //Math.max(...densities);
        const barWidth = (width - margin * 2) / numBins;

        // Create X and Y axes
        const xAxis = document.createElementNS(
          "http://www.w3.org/2000/svg",
          "line"
        );
        xAxis.setAttribute("x1", margin);
        xAxis.setAttribute("y1", height - margin);
        xAxis.setAttribute("x2", width - margin);
        xAxis.setAttribute("y2", height - margin);
        xAxis.setAttribute("stroke-width", "2");
        xAxis.setAttribute("stroke", "black");
        svg.appendChild(xAxis);

        const yAxis = document.createElementNS(
          "http://www.w3.org/2000/svg",
          "line"
        );
        yAxis.setAttribute("x1", margin);
        yAxis.setAttribute("y1", margin);
        yAxis.setAttribute("x2", margin);
        yAxis.setAttribute("y2", height - margin);
        yAxis.setAttribute("stroke-width", "2");
        yAxis.setAttribute("stroke", "black");
        svg.appendChild(yAxis);

        const numBinsLabel = 8;
        // Create X axis labels and ticks
        for (let i = 0; i <= numBins; i += 45) {
          const x = margin + i * barWidth;

          // Labels
          const text = document.createElementNS(
            "http://www.w3.org/2000/svg",
            "text"
          );
          text.setAttribute("x", x);
          text.setAttribute("y", height - margin + 25);
          text.setAttribute("text-anchor", "middle");
          text.setAttribute("font-size", "18");
          text.setAttribute("font-family", "Arial");
          text.textContent = i.toFixed(1); //* 2) / numBinsLabel - 1).toFixed(2);
          svg.appendChild(text);

          // Ticks
          const tick = document.createElementNS(
            "http://www.w3.org/2000/svg",
            "line"
          );
          tick.setAttribute("x1", x);
          tick.setAttribute("y1", height - margin);
          tick.setAttribute("x2", x);
          tick.setAttribute("y2", height - margin + 5);
          tick.setAttribute("stroke", "black");
          svg.appendChild(tick);
        }

        // Create Y axis labels, ticks, and grid lines
        const yAxisSteps = 10;
        for (let i = 0; i <= yAxisSteps; i++) {
          const y = height - margin - ((height - margin * 2) / yAxisSteps) * i;
          const densityValue = ((maxDensity * i) / yAxisSteps).toFixed(2);

          // Labels
          const text = document.createElementNS(
            "http://www.w3.org/2000/svg",
            "text"
          );
          text.setAttribute("x", margin - 10);
          text.setAttribute("y", y + 3);
          text.setAttribute("text-anchor", "end");
          text.setAttribute("font-size", "18");
          text.setAttribute("font-family", "Arial");
          if (i % 2 == 0)
            text.textContent = i === yAxisSteps ? "" : densityValue; // Hide the text for the last value
          svg.appendChild(text);

          // Ticks
          const tick = document.createElementNS(
            "http://www.w3.org/2000/svg",
            "line"
          );
          tick.setAttribute("x1", margin - 5);
          tick.setAttribute("y1", y);
          tick.setAttribute("x2", margin);
          tick.setAttribute("y2", y);
          tick.setAttribute("stroke", "black");
          svg.appendChild(tick);

          // Grid lines
          const gridLine = document.createElementNS(
            "http://www.w3.org/2000/svg",
            "line"
          );
          gridLine.setAttribute("x1", margin);
          gridLine.setAttribute("y1", y);
          gridLine.setAttribute("x2", width - margin);
          gridLine.setAttribute("y2", y);
          gridLine.setAttribute("stroke", "lightgray");
          gridLine.setAttribute("stroke-dasharray", "2,2");
          svg.appendChild(gridLine);
        }

        // Create bars with borders
        densities.forEach((density, index) => {
          const barHeight = (density / maxDensity) * (height - margin * 2);
          const rect = document.createElementNS(
            "http://www.w3.org/2000/svg",
            "rect"
          );
          rect.setAttribute("x", margin + index * barWidth);
          rect.setAttribute("y", height - margin - barHeight);
          rect.setAttribute("width", barWidth);
          rect.setAttribute("height", barHeight);
          rect.setAttribute("fill", "gray");
          rect.setAttribute("stroke", "black");
          rect.setAttribute("stroke-width", "0.3");

          // Tooltip (title attribute)
          rect.setAttribute("title", `α: ${index}. f': ${density.toFixed(4)}`);

          // Mouseover event listener for tooltip
          rect.addEventListener("mouseover", (event) => {
            const tooltip = document.getElementById("tooltip");
            tooltip.textContent = `α: ${index}. f': ${density.toFixed(4)}`;
            tooltip.style.display = "block";
            tooltip.style.top = `${event.clientY}px`;
            tooltip.style.left = `${event.clientX}px`;
            rect.setAttribute("fill", "rgb(211, 211, 211)");
          });

          // Mouseout event listener to hide tooltip
          rect.addEventListener("mouseout", () => {
            const tooltip = document.getElementById("tooltip");
            tooltip.style.display = "none";
            rect.setAttribute("fill", "gray");
          });

          svg.appendChild(rect);
        });



        // Add axis labels
        const xAxisLabel = document.createElementNS(
          "http://www.w3.org/2000/svg",
          "text"
        );
        xAxisLabel.setAttribute("x", width / 2 - margin / 2 + 15);
        xAxisLabel.setAttribute("y", height - margin / 2 + 20);
        xAxisLabel.setAttribute("text-anchor", "center");
        xAxisLabel.setAttribute("font-size", "22");
        xAxisLabel.setAttribute("font-family", "Arial");
        xAxisLabel.setAttribute(
          "style",
          "font-weight: bold; font-style: italic;"
        );
        xAxisLabel.textContent = "α";
        svg.appendChild(xAxisLabel);

        const yAxisLabel = document.createElementNS(
          "http://www.w3.org/2000/svg",
          "text"
        );
        yAxisLabel.setAttribute("x", margin - 25);
        yAxisLabel.setAttribute("y", margin + 30);
        yAxisLabel.setAttribute("text-anchor", "middle");
        yAxisLabel.setAttribute("font-size", "22");
        yAxisLabel.setAttribute("font-family", "Arial");
        yAxisLabel.setAttribute(
          "style",
          "font-weight: bold; font-style: italic;"
        );
        yAxisLabel.textContent = "f'";
        svg.appendChild(yAxisLabel);
      }

function drawPolarDensityChart(angleCounts, numBins) {
    const svg = document.getElementById("histogramSVG");
    svg.innerHTML = "";

        const width = 600;
        const height = 540;

    const centerX = width / 2;
    const centerY = height / 2;
    const radius = 250; // Максимальний радіус ліній

    // Отримати дані з таблиці та підрахувати загальну кількість
    const data = getDataFromTable(); // Функція для отримання даних з таблиці
    const totalGalaxies = data.length;
    const densities = angleCounts.map((count) => count / totalGalaxies);
    const maxDensity = Math.max(...densities);

    // Кількість градусів між лініями
    const angleStep = 360 / numBins;

    densities.forEach((density, index) => {
        const angle = index * angleStep; // Кут у градусах
        const lineLength = (density / maxDensity) * radius; // Довжина лінії

        // Обчислення кінцевих точок лінії в полярних координатах
        const xEnd = centerX + lineLength * Math.cos(((angle - 90) * Math.PI) / 180);
        const yEnd = centerY + lineLength * Math.sin(((angle - 90) * Math.PI) / 180);

/*
   const adjustedAngle = rotationAngle - 90; // Коригування кута для того, щоб 0 градусів був зверху
          const angleInRadians = (adjustedAngle * Math.PI) / -180;
          //const angleInRadians = ((rotationAngle * Math.PI) / -180);
          //console.log(angleInRadians);
          const startX = centerX - lineLength * Math.cos(angleInRadians);
          const startY = centerY + lineLength * Math.sin(angleInRadians);
          const endX = centerX + lineLength * Math.cos(angleInRadians);
          const endY = centerY - lineLength * Math.sin(angleInRadians);

*/


        // Створення лінії
        const line = document.createElementNS("http://www.w3.org/2000/svg", "line");
        line.setAttribute("x1", centerX);
        line.setAttribute("y1", centerY);
        line.setAttribute("x2", xEnd);
        line.setAttribute("y2", yEnd);
        line.setAttribute("stroke", "gray");
        line.setAttribute("stroke-width", "2");

        // Подія для відображення підказки з кутом і щільністю
        line.addEventListener("mouseover", (event) => {
            const tooltip = document.getElementById("tooltip");
            tooltip.textContent = `α: ${angle.toFixed(1)}°, f': ${density.toFixed(4)}`;
            tooltip.style.display = "block";
            tooltip.style.top = `${event.clientY}px`;
            tooltip.style.left = `${event.clientX}px`;
            line.setAttribute("stroke", "black");
        });

        line.addEventListener("mouseout", () => {
            const tooltip = document.getElementById("tooltip");
            tooltip.style.display = "none";
            line.setAttribute("stroke", "gray");
        });

        svg.appendChild(line);
    });

    // Створення кругових осей для щільності
    const axisSteps = 5;
    for (let i = 1; i <= axisSteps; i++) {
        const r = (i / axisSteps) * radius;
        const circle = document.createElementNS("http://www.w3.org/2000/svg", "circle");
        circle.setAttribute("cx", centerX);
        circle.setAttribute("cy", centerY);
        circle.setAttribute("r", r);
        circle.setAttribute("stroke", "lightgray");
        circle.setAttribute("fill", "none");
        circle.setAttribute("stroke-dasharray", "4,4");
        svg.appendChild(circle);

        // Додаємо значення щільності біля кожної осі
        const text = document.createElementNS("http://www.w3.org/2000/svg", "text");
        text.setAttribute("x", centerX);
        text.setAttribute("y", centerY - r - 5);
        text.setAttribute("text-anchor", "middle");
        text.setAttribute("font-size", "12");
        text.setAttribute("font-family", "Arial");
        text.textContent = (maxDensity * (i / axisSteps)).toFixed(2);
        svg.appendChild(text);
    }

    // Додаємо підписи осей
    const xAxisLabel = document.createElementNS("http://www.w3.org/2000/svg", "text");
    xAxisLabel.setAttribute("x", centerX);
    xAxisLabel.setAttribute("y", centerY + radius + 20);
    xAxisLabel.setAttribute("text-anchor", "middle");
    xAxisLabel.setAttribute("font-size", "16");
    xAxisLabel.setAttribute("font-family", "Arial");
    xAxisLabel.textContent = "α (degrees)";
    svg.appendChild(xAxisLabel);

    const yAxisLabel = document.createElementNS("http://www.w3.org/2000/svg", "text");
    yAxisLabel.setAttribute("x", centerX - radius - 30);
    yAxisLabel.setAttribute("y", centerY);
    yAxisLabel.setAttribute("text-anchor", "middle");
    yAxisLabel.setAttribute("font-size", "16");
    yAxisLabel.setAttribute("font-family", "Arial");
    yAxisLabel.setAttribute("transform", `rotate(-90, ${centerX - radius - 30}, ${centerY})`);
    yAxisLabel.textContent = "f'";
    svg.appendChild(yAxisLabel);


}


      function drawDensityHistogram(data, numBins) {
        const svg = document.getElementById("histogramSVG");
        svg.innerHTML = "";

        const width = 575;
        const height = 545;
        const margin = 55;

        // Extract counts and ringFractions
        const counts = data.map((d) => d.count);
        const ringFractions = data.map((d) => d.ringFraction);

        // Calculate densities
        const totalGalaxies = counts.reduce((sum, count) => sum + count, 0);
        const densities = counts.map(
          (count, index) => count / totalGalaxies / ringFractions[index]
        );

        // Normalize bin values
        const maxDensity = 0.5; //Math.max(...densities);
        const barWidth = (width - margin * 2) / numBins;
        const barWidthLabel = (width - margin * 2) / 20;
        // Create X and Y axes
        const xAxis = document.createElementNS(
          "http://www.w3.org/2000/svg",
          "line"
        );
        xAxis.setAttribute("x1", margin);
        xAxis.setAttribute("y1", height - margin);
        xAxis.setAttribute("x2", width - margin);
        xAxis.setAttribute("y2", height - margin);
        xAxis.setAttribute("stroke-width", "2");
        xAxis.setAttribute("stroke", "black");
        svg.appendChild(xAxis);

        const yAxis = document.createElementNS(
          "http://www.w3.org/2000/svg",
          "line"
        );
        yAxis.setAttribute("x1", margin);
        yAxis.setAttribute("y1", margin);
        yAxis.setAttribute("x2", margin);
        yAxis.setAttribute("y2", height - margin);
        yAxis.setAttribute("stroke-width", "2");
        yAxis.setAttribute("stroke", "black");
        svg.appendChild(yAxis);

        // Create X axis labels and ticks
        for (let i = 0; i <= 20; i++) {
          const x = margin + i * barWidthLabel;

          // Labels
          const text = document.createElementNS(
            "http://www.w3.org/2000/svg",
            "text"
          );
          text.setAttribute("x", x);
          text.setAttribute("y", height - margin + 25);
          text.setAttribute("text-anchor", "middle");
          text.setAttribute("font-size", "18");
          text.setAttribute("font-family", "Arial");
          if (i % 2 == 0) text.textContent = ((i * 2) / 20 - 1).toFixed(1);
          svg.appendChild(text);

          // Ticks
          const tick = document.createElementNS(
            "http://www.w3.org/2000/svg",
            "line"
          );
          tick.setAttribute("x1", x);
          tick.setAttribute("y1", height - margin);
          tick.setAttribute("x2", x);
          tick.setAttribute("y2", height - margin + 5);
          tick.setAttribute("stroke", "black");
          svg.appendChild(tick);
        }

        // Create Y axis labels, ticks, and grid lines
        const yAxisSteps = 5;
        for (let i = 0; i <= yAxisSteps; i++) {
          const y = height - margin - ((height - margin * 2) / yAxisSteps) * i;
          const densityValue = ((maxDensity * i) / yAxisSteps).toFixed(2);

          // Labels
          const text = document.createElementNS(
            "http://www.w3.org/2000/svg",
            "text"
          );
          text.setAttribute("x", margin - 10);
          text.setAttribute("y", y + 3);
          text.setAttribute("text-anchor", "end");
          text.setAttribute("font-size", "18");
          text.setAttribute("font-family", "Arial");
          text.textContent = i === yAxisSteps ? "" : densityValue; // Hide the text for the last value
          svg.appendChild(text);

          // Ticks
          const tick = document.createElementNS(
            "http://www.w3.org/2000/svg",
            "line"
          );
          tick.setAttribute("x1", margin - 5);
          tick.setAttribute("y1", y);
          tick.setAttribute("x2", margin);
          tick.setAttribute("y2", y);
          tick.setAttribute("stroke", "black");
          svg.appendChild(tick);

          // Grid lines
          const gridLine = document.createElementNS(
            "http://www.w3.org/2000/svg",
            "line"
          );
          gridLine.setAttribute("x1", margin);
          gridLine.setAttribute("y1", y);
          gridLine.setAttribute("x2", width - margin);
          gridLine.setAttribute("y2", y);
          gridLine.setAttribute("stroke", "lightgray");
          gridLine.setAttribute("stroke-dasharray", "2,2");
          svg.appendChild(gridLine);
        }

        // Create bars with borders
        densities.forEach((density, index) => {
          const barHeight = (density / maxDensity) * (height - margin * 2);
          const rect = document.createElementNS(
            "http://www.w3.org/2000/svg",
            "rect"
          );
          rect.setAttribute("x", margin + index * barWidth);
          rect.setAttribute("y", height - margin - barHeight);
          rect.setAttribute("width", barWidth);
          rect.setAttribute("height", barHeight);
          rect.setAttribute("fill", "rgb(211, 211, 211)");
          rect.setAttribute("stroke", "black");
          rect.setAttribute("stroke-width", "1");

          // Tooltip (title attribute)
          rect.setAttribute("title", `f': ${density.toFixed(4)}`);

          // Mouseover event listener for tooltip
          rect.addEventListener("mouseover", (event) => {
            const tooltip = document.getElementById("tooltip");
            tooltip.textContent = `f': ${density.toFixed(4)}`;
            tooltip.style.display = "block";
            tooltip.style.top = `${event.clientY}px`;
            tooltip.style.left = `${event.clientX}px`;
            rect.setAttribute("fill", "gray");
          });

          // Mouseout event listener to hide tooltip
          rect.addEventListener("mouseout", () => {
            const tooltip = document.getElementById("tooltip");
            tooltip.style.display = "none";
            rect.setAttribute("fill", "rgb(211, 211, 211)");
          });

          svg.appendChild(rect);
        });



        // Add axis labels
        const xAxisLabel = document.createElementNS(
          "http://www.w3.org/2000/svg",
          "text"
        );
        xAxisLabel.setAttribute("x", width / 2 - margin / 2 + 15);
        xAxisLabel.setAttribute("y", height - margin / 2 + 20);
        xAxisLabel.setAttribute("text-anchor", "center");
        xAxisLabel.setAttribute("font-size", "22");
        xAxisLabel.setAttribute("font-family", "Arial");
        xAxisLabel.setAttribute(
          "style",
          "font-weight: bold; font-style: italic;"
        );
        xAxisLabel.textContent = "D";
        svg.appendChild(xAxisLabel);

        const yAxisLabel = document.createElementNS(
          "http://www.w3.org/2000/svg",
          "text"
        );
        yAxisLabel.setAttribute("x", margin - 25);
        yAxisLabel.setAttribute("y", margin + 30);
        yAxisLabel.setAttribute("text-anchor", "middle");
        yAxisLabel.setAttribute("font-size", "22");
        yAxisLabel.setAttribute("font-family", "Arial");
        yAxisLabel.setAttribute(
          "style",
          "font-weight: bold; font-style: italic;"
        );
        yAxisLabel.textContent = "f'";
        svg.appendChild(yAxisLabel);
      }

      // Modified analyzeByStrips function
      function analyzeByStrips() {
        const radius = parseFloat(document.getElementById("Radius").value) / 8;
        const centerX =
          parseFloat(document.getElementById("centerX").value) / 8 + 250 + 65;
        const centerY =
          parseFloat(document.getElementById("centerY").value) / -8 + 250 + 10;
        const numStrips = parseInt(document.getElementById("numStrips").value);
        const excludeCenter = document.getElementById("excludeCenter").checked;
        const rotationAngle =
          parseFloat(document.getElementById("rotationAngle").value) || 0;
        const showLine = document.getElementById("showLine").checked;

        const svg = document.getElementById("mySVG");
        svg.innerHTML = "";
        drawLinesAndText();

        const stripResults = document.getElementById("stripResults");
        stripResults.innerHTML = "";

        // Draw main circle
        const circle = document.createElementNS(
          "http://www.w3.org/2000/svg",
          "circle"
        );
        circle.setAttribute("cx", centerX);
        circle.setAttribute("cy", centerY);
        circle.setAttribute("r", radius);
        circle.setAttribute("stroke", "rgba(0,0,0, 0.1)");
        circle.setAttribute("stroke-width", "1");
        circle.setAttribute("fill", "none");
        svg.appendChild(circle);

        // Draw strips
        const stripWidth = (2 * radius) / numStrips;
        const stripCounts = Array(numStrips).fill(0);

        for (let i = 0; i < numStrips; i++) {
          const stripX = centerX - radius + i * stripWidth;

          const rect = document.createElementNS(
            "http://www.w3.org/2000/svg",
            "rect"
          );
          rect.setAttribute("x", stripX);
          rect.setAttribute("y", centerY - radius);
          rect.setAttribute("width", stripWidth);
          rect.setAttribute("height", 2 * radius);
          rect.setAttribute("stroke", "rgba(0,0,0, 0.1)");
          rect.setAttribute("fill", `none`);
          svg.appendChild(rect);
        }

        // Draw inner dashed circle if excludeCenter is checked
        if (excludeCenter) {
          const innerCircle = document.createElementNS(
            "http://www.w3.org/2000/svg",
            "circle"
          );
          innerCircle.setAttribute("cx", centerX);
          innerCircle.setAttribute("cy", centerY);
          innerCircle.setAttribute("r", stripWidth / 2);
          innerCircle.setAttribute("stroke", "rgba(0,0,0, 0.1)");
          innerCircle.setAttribute("stroke-width", "1");
          innerCircle.setAttribute("fill", "none");
          innerCircle.setAttribute("stroke-dasharray", "2, 2");
          svg.appendChild(innerCircle);
        }

        // Analyze data points
        const data = getDataFromTable(); // Assuming you have a function to get data points

        let maxEntries = 0;
        let maxStripIndex = -1;

        data.forEach((point, index) => {
          const rotatedPoint = rotatePoint(
            point.i,
            point.x,
            point.y,
            centerX,
            centerY,
            rotationAngle
          );
          const distToCenter = Math.sqrt(
            (rotatedPoint.x - centerX) ** 2 + (rotatedPoint.y - centerY) ** 2
          );
          const isInsideCenter = excludeCenter && distToCenter < stripWidth / 2;
          const color =
            distToCenter <= radius && !isInsideCenter ? "blue" : "red";
          const fillColor =
            distToCenter <= radius && !isInsideCenter
              ? "lightblue"
              : "lightcoral";

          const ellipse = createCircleViewe(
            rotatedPoint.i,
            rotatedPoint.x,
            rotatedPoint.y,
            3,
            0,
            point.PA,
            color,
            fillColor,
            point.BG
          );
          svg.appendChild(ellipse);

          if (distToCenter <= radius && !isInsideCenter) {
            const stripIndex = Math.floor(
              (rotatedPoint.x - (centerX - radius)) / stripWidth
            );
            if (stripIndex >= 0 && stripIndex < numStrips) {
              stripCounts[stripIndex]++;
              if (stripCounts[stripIndex] > maxEntries) {
                maxEntries = stripCounts[stripIndex];
                maxStripIndex = stripIndex;
              }
            }
          }
        });

        // Calculate areas of strips inside the circle
        const totalCircleArea = Math.PI * radius * radius;
        const stripAreas = calculateStripAreas(
          radius,
          numStrips,
          stripWidth,
          excludeCenter
        );

        const centralStripIndex = Math.floor(numStrips / 2);
        // Display results
        const histogramData = [];
        stripCounts.forEach((count, index) => {
          const stripArea = stripAreas[index];
          const stripAreaFraction = stripArea / stripAreas[centralStripIndex];
          stripResults.innerHTML += `<br><div><b>Strip ${
            index + 1
          }:</b> <b>${count} occ.</b>, S: ${stripArea.toFixed(
            2
          )}, S': ${stripAreaFraction.toFixed(4)}, f': ${(
            count /
            data.length /
            stripAreaFraction
          ).toFixed(4)}</div>`;

          histogramData.push({ count, ringFraction: stripAreaFraction });
        });

        // Draw histogram
        drawDensityHistogram(histogramData, numStrips);

        // Highlight ellipses in the strip with the most entries
        if (maxStripIndex !== -1) {
          data.forEach((point, index) => {
            const rotatedPoint = rotatePoint(
              point.i,
              point.x,
              point.y,
              centerX,
              centerY,
              rotationAngle
            );
            const distToCenter = Math.sqrt(
              (rotatedPoint.x - centerX) ** 2 + (rotatedPoint.y - centerY) ** 2
            );
            const isInsideCenter =
              excludeCenter && distToCenter < stripWidth / 2;

            if (distToCenter <= radius && !isInsideCenter) {
              const stripIndex = Math.floor(
                (rotatedPoint.x - (centerX - radius)) / stripWidth
              );
              if (stripIndex === maxStripIndex) {
                const ellipse = createCircleViewe(
                  rotatedPoint.i,
                  rotatedPoint.x,
                  rotatedPoint.y,
                  3,
                  0,
                  point.PA,
                  "green",
                  "lightgreen",
                  point.BG
                );
                svg.appendChild(ellipse);
              }
            }
          });
        }

        // Draw rotation line if showLine is checked
        if (showLine) {
          const lineLength = radius + 20;
          const adjustedAngle = rotationAngle - 90; // Коригування кута для того, щоб 0 градусів був зверху
          const angleInRadians = (adjustedAngle * Math.PI) / -180;
          //const angleInRadians = ((rotationAngle * Math.PI) / -180);
          //console.log(angleInRadians);
          const startX = centerX - lineLength * Math.cos(angleInRadians);
          const startY = centerY + lineLength * Math.sin(angleInRadians);
          const endX = centerX + lineLength * Math.cos(angleInRadians);
          const endY = centerY - lineLength * Math.sin(angleInRadians);

          const line = document.createElementNS(
            "http://www.w3.org/2000/svg",
            "line"
          );
          line.setAttribute("x1", centerX);
          line.setAttribute("y1", centerY);
          line.setAttribute("x2", endX);
          line.setAttribute("y2", endY);
          line.setAttribute("stroke", "black");
          line.setAttribute("stroke-width", "1");
          line.setAttribute("stroke-dasharray", "5, 5");
          svg.appendChild(line);

          // Draw start circle for the line
          const startCircle = document.createElementNS(
            "http://www.w3.org/2000/svg",
            "circle"
          );
          startCircle.setAttribute("cx", centerX);
          startCircle.setAttribute("cy", centerY);
          startCircle.setAttribute("r", 2);
          startCircle.setAttribute("stroke", "black");
          startCircle.setAttribute("stroke-width", "1");
          startCircle.setAttribute("fill", "black");
          svg.appendChild(startCircle);
        }
      }

      function rotatePoint(i, x, y, centerX, centerY, angle) {
        const adjustedAngle = angle; // Коригування кута для того, щоб 0 градусів був зверху
        //const angleInRadians = (adjustedAngle * Math.PI) / -180;
        const radians = (adjustedAngle * Math.PI) / -180;
        const cos = Math.cos(radians);
        const sin = Math.sin(radians);
        const dx = x - centerX;
        const dy = y - centerY;

        const nx = cos * dx - sin * dy + centerX;
        const ny = sin * dx + cos * dy + centerY;
        return { i: i, x: nx, y: ny };
      }

      function calculateStripAreas(
        radius,
        numStrips,
        stripWidth,
        excludeCenter
      ) {
        const stripAreas = [];
        const innerRadius = excludeCenter ? stripWidth / 2 : 0;
        // Calculate the index of the central strip
        const centralStripIndex = Math.floor(numStrips / 2);

        for (let i = 0; i < numStrips; i++) {
          const stripX1 = -radius + i * stripWidth;
          const stripX2 = stripX1 + stripWidth;

          let area = 0;
          for (let x = stripX1; x <= stripX2; x += 0.01) {
            const h1 = Math.sqrt(Math.max(0, radius * radius - x * x));
            const h2 = Math.sqrt(
              Math.max(0, radius * radius - (x + 0.01) * x + 0.01)
            );
            area += (0.01 * (h1 + h2)) / 2;
          }
          //console.log(stripX1, stripX2);
          if (excludeCenter && i === centralStripIndex) {
            // console.log(stripX1, innerRadius, stripX2, -innerRadius);
            const innerCircleArea = Math.PI * innerRadius * innerRadius;

            area -= innerCircleArea;
          }

          stripAreas.push(area);
        }

        return stripAreas;
      }

      function calculateCircleSegmentArea(radius, x1, x2) {
        const segmentArea =
          radius ** 2 * (Math.acos(x1 / radius) - Math.acos(x2 / radius));
        return segmentArea;
      }

      function findMaxEntriesAngle() {
        const radius = parseFloat(document.getElementById("Radius").value) / 8;
        const centerX =
          parseFloat(document.getElementById("centerX").value) / 8 + 250 + 65;
        const centerY =
          parseFloat(document.getElementById("centerY").value) / -8 + 250 + 10;
        const numStrips = parseInt(document.getElementById("numStrips").value);
        const excludeCenter = document.getElementById("excludeCenter").checked;

        let maxEntries = 0;
        let bestAngle = 0;

        for (let angle = 0; angle < 360; angle++) {
          const stripWidth = (2 * radius) / numStrips;
          const stripCounts = Array(numStrips).fill(0);
          const data = getDataFromTable(); // Assuming you have a function to get data points

          data.forEach((point, index) => {
            const rotatedPoint = rotatePoint(
              point.i,
              point.x,
              point.y,
              centerX,
              centerY,
              angle
            );
            const distToCenter = Math.sqrt(
              (rotatedPoint.x - centerX) ** 2 + (rotatedPoint.y - centerY) ** 2
            );
            const isInsideCenter =
              excludeCenter && distToCenter < stripWidth / 2;

            if (distToCenter <= radius && !isInsideCenter) {
              const stripIndex = Math.floor(
                (rotatedPoint.x - (centerX - radius)) / stripWidth
              );
              if (stripIndex >= 0 && stripIndex < numStrips) {
                stripCounts[stripIndex]++;
              }
            }
          });

          const maxInCurrentAngle = Math.max(...stripCounts);
          if (maxInCurrentAngle > maxEntries) {
            maxEntries = maxInCurrentAngle;
            bestAngle = angle;
          }
        }

        const maxResults = document.getElementById("maxResults");
        maxResults.innerHTML = `<br>Maximum entry: <b>${maxEntries}</b> at an angle: <b>${bestAngle}</b> degrees`;
        document.getElementById("rotationAngle").value = bestAngle;
      }

      // Function to create an editable table
      function createEditableTable(rows, cols) {
        var tableBody = document.querySelector("#editableTable tbody");
        tableBody.innerHTML = ""; // Clear existing table

        for (var i = 0; i < rows; i++) {
          var row = tableBody.insertRow(i);

          // Add row number cell with grey background
          var numberCell = row.insertCell(0);
          numberCell.textContent = i + 1;
          numberCell.classList.add("number-cell");

          for (var j = 1; j < cols; j++) {
            var cell = row.insertCell(j);
            cell.contentEditable = true; // Set the cell to be editable
          }
        }
      }

      // Function to load data from a TXT file and populate the table
      function loadDataFromFile(file) {
        var table = document.getElementById("editableTable");
        var reader = new FileReader();

        reader.onload = function (e) {
          var dataArray = e.target.result.split("\n");

          // Create table with the number of rows equal to the number of lines in the file minus any empty lines at the end
          var nonEmptyLines = dataArray.filter((line) => line.trim() !== "");
          createEditableTable(nonEmptyLines.length, 8); // Assuming 7 columns based on header

          for (var i = 0; i < nonEmptyLines.length; i++) {
            var row = table.rows[i + 1]; // Adjust for header row
            // Split data using regular expression to handle both tabs and multiple spaces
            var rowData = nonEmptyLines[i].trim().split(/\s+/);

            for (var j = 0; j < rowData.length; j++) {
              var cell = row.cells[j + 1]; // Adjust for number cell
              cell.innerHTML = rowData[j];
            }
          }

          drawEllipses(); // Draw ellipses after loading data

          // Calculate and set values for Radius, ringDistance, and numRings
          var radius = calculateClusterRadius();
          var ringWidth = document.getElementById("ringWith").value;
          var ringDistance = radius * ringWidth;
          var numRings = (radius / ringDistance).toFixed(2);

          document.getElementById("Radius").value = radius;
          document.getElementById("ringDistance").value = ringDistance.toFixed(2);
          document.getElementById("numRings").value = numRings;
          document.getElementById("centerX").value = 0;
          document.getElementById("centerY").value = 0;
          var svg = document.getElementById("histogramSVG");
          var svg2 = document.getElementById("mySVG");
          svg.innerHTML = ""; // Clear the SVG
          //svg2.innerHTML = ""; // Clear the SVG
          // Переконатися, що елемент існує
if (svg2) {
    svg2.scrollIntoView({
        behavior: 'smooth', // Плавна прокрутка
        block: 'center',    // Вирівнювання по вертикалі (по центру)
        inline: 'nearest'   // Вирівнювання по горизонталі (найближче)
    });
}
        };

        reader.readAsText(file);
      }

      // Function to handle file upload
      function handleFile() {
        var fileInput = document.getElementById("fileInput");
        var file = fileInput.files[0];

        if (file) {
          loadDataFromFile(file);
        } else {
          alert("Please select a file.");
        }
      }

      function drawLinesAndText() {
        const svg = document.getElementById("mySVG");

        // Helper function to create an SVG line element with x1 and x2 adjusted by subtracting 420
        function createLine(x1, y1, x2, y2, stroke = "black", strokeWidth = 1) {
          const line = document.createElementNS(
            "http://www.w3.org/2000/svg",
            "line"
          );
          line.setAttribute("x1", x1);
          line.setAttribute("y1", y1);
          line.setAttribute("x2", x2);
          line.setAttribute("y2", y2);
          line.setAttribute("stroke", stroke);
          line.setAttribute("stroke-width", strokeWidth);
          return line;
        }

        // Helper function to create an SVG text element
        function createText(
          x,
          y,
          textContent,
          fontSize = 18,
          fontFamily = "Arial",
          anchor = "start"
        ) {
          const text = document.createElementNS(
            "http://www.w3.org/2000/svg",
            "text"
          );
          text.setAttribute("x", x); // Adjust x coordinate by subtracting 420
          text.setAttribute("y", y);
          text.setAttribute("font-size", fontSize);
          text.setAttribute("font-family", fontFamily);
          text.setAttribute("text-anchor", anchor); // Set text alignment
          text.textContent = textContent;
          return text;
        }

        // Add lines and text similar to the provided C++ code
        svg.appendChild(createLine(65, 10, 65, 510, "black", 2));
        svg.appendChild(createText(30, 35, "Y"));
        svg.appendChild(createLine(65, 510, 565, 510, "black", 2));
        svg.appendChild(createText(545, 538, "X"));

        let tempValue = -2000;
        let point = 1;

        // Draw X-axis markers and labels
        for (let x = 65; x <= 565; x += 31.2) {
          if (point % 2 === 0) {
            svg.appendChild(createLine(x, 510, x, 514, "black", 2));
          } else {
            svg.appendChild(createLine(x, 510, x, 518, "black", 2));
            if (tempValue !== 2000) {
              if (tempValue <= -1000 || tempValue >= 1000) {
                svg.appendChild(
                  createText(x + 20, 538, tempValue, 18, "Arial", "end")
                );
              } else if (tempValue !== 0) {
                svg.appendChild(
                  createText(x + 15, 538, tempValue, 18, "Arial", "end")
                );
              }
            }
            tempValue += 500;
          }
          point++;
        }

        svg.appendChild(createText(319, 538, 0, 18, "Arial", "end"));

        tempValue = -2000;
        point = 1;

        // Draw Y-axis markers and labels
        for (let y = 510; y >= 10; y -= 31.2) {
          if (point % 2 === 0) {
            svg.appendChild(createLine(61, y, 65, y, "black", 2));
          } else {
            svg.appendChild(createLine(58, y, 65, y, "black", 2));
            if (tempValue !== 2000) {
              svg.appendChild(
                createText(53, y + 6, tempValue, 18, "Arial", "end")
              );
            }
            tempValue += 500;
          }
          point++;
        }
      }

      /* function createCircle(cx, cy, r, stroke = "blue", strokeWidth = 2) {
                          const circle = document.createElementNS(
                            "http://www.w3.org/2000/svg",
                            "circle"
                          );
                          circle.setAttribute("cx", cx);
                          circle.setAttribute("cy", cy);
                          circle.setAttribute("r", r);
                          circle.setAttribute("stroke", stroke);
                          circle.setAttribute("stroke-width", strokeWidth);
                          circle.setAttribute("fill", "none");
                          circle.classList.add("ring");
                          return circle;
                        }
                  */

      function getDataFromTable() {
        const data = [];
        const rows = document.querySelectorAll("#editableTable tr");
        rows.forEach((row, index) => {
          if (index === 0) return; // Пропустити заголовок таблиці
          const cells = row.querySelectorAll("td");
            if (cells.length < 7) {
      console.warn(`Пропускаю рядок ${index}: очікувалося ≥7 клітинок, є ${cells.length}`, row);
      return;
    }
          const i = parseFloat(cells[0].textContent);
          if (isNaN(i)) return;
          const xStr = cells[1].textContent.trim();
          if (xStr === "") return;
          const x = parseFloat(cells[1].textContent) / 8 + 250 + 65;
          const y = parseFloat(cells[2].textContent) / -8 + 250 + 10;
          // Отримуємо значення з клітинки таблиці
          const m = parseFloat(cells[3].textContent.replace(",", "."));
          const E = parseFloat(cells[4].textContent.replace(",", "."));
          const PA = parseFloat(cells[5].textContent.replace(",", ".")); //correct PA
          const BG = parseFloat(cells[6].textContent.replace(",", "."));
          data.push({ i, x, y, m, E, PA, BG });
        });
console.log(data);
        return data;
      }


      function calculateClusterRadius() {
        const centerX =
         // parseFloat(document.getElementById("centerX").value) / 8 + 
          250 + 65;
        const centerY =
         // parseFloat(document.getElementById("centerY").value) / -8 + 
          250 + 10;

        const data = getDataFromTable();
        function distance(x1, y1, x2, y2) {
          return Math.sqrt((x2 - x1) ** 2 + (y2 - y1) ** 2);
        }
        let maxDistance = 0;
        data.forEach((point) => {
          const adjustedX = point.x;
          const adjustedY = point.y;
          const dist = distance(centerX, centerY, adjustedX, adjustedY);

          if (dist > maxDistance) {
            maxDistance = dist;
          }
        });
        return Math.ceil(maxDistance) * 8;
      }

      function analyzeConcentration() {
        document.getElementById("ringDistance").value =
          document.getElementById("Radius").value *
          document.getElementById("ringWith").value;
        document.getElementById("numRings").value = //Math.ceil(
          document.getElementById("Radius").value /
          document.getElementById("ringDistance").value;

        //);

        // drawEllipsesRings();

        let numRings = parseInt(document.getElementById("numRings").value);
        const ringDistance =
          parseFloat(document.getElementById("ringDistance").value) / 8;
        const centerX =
          parseFloat(document.getElementById("centerX").value) / 8 + 250 + 65;
        const centerY =
          parseFloat(document.getElementById("centerY").value) / -8 + 250 + 10;

        const data = getDataFromTable();

        function distance(x1, y1, x2, y2) {
          return Math.sqrt((x2 - x1) ** 2 + (y2 - y1) ** 2);
        }

        let rings = Array(numRings).fill(0);
        const svg = document.getElementById("mySVG");
        svg.innerHTML = "";
        drawLinesAndText();
        const previousRings = svg.querySelectorAll(".ring");
        previousRings.forEach((ring) => ring.remove());

        let maxDist = 0;
        const maxDistance = Math.max(
          ...data.map((point) => distance(250 + 65, 250 + 10, point.x, point.y))
        );
        const lastRingOuterRadius = numRings * ringDistance;

        if (maxDistance > lastRingOuterRadius) {
          rings.push(0); // Додаємо нове кільце
          numRings++;
        }
        data.forEach((point) => {
          const adjustedX = point.x;
          const adjustedY = point.y;
          const dist = distance(centerX, centerY, adjustedX, adjustedY);
          if (dist > maxDist) {
            maxDist = dist;
          }
          rings.forEach((_, index) => {
            const innerRadius = index * ringDistance;
            var outerRadius = (index + 1) * ringDistance;
            if (index == numRings - 1) outerRadius = maxDistance;
            if (dist > innerRadius && dist <= outerRadius) {
              rings[index]++;
              const ellipse = createCircleViewe(
                point.i,
                point.x,
                point.y,
                3,
                0,
                point.PA,
                "blue",
                "lightblue",
                point.BG
              );
              svg.appendChild(ellipse);
            }
            if (dist > outerRadius) {
              const ellipse = createCircleViewe(
                point.i,
                point.x,
                point.y,
                3,
                0,
                point.PA,
                "red",
                "lightcoral",
                point.BG
              );
              svg.appendChild(ellipse);
            }
          });
        });

        const totalArea = Math.PI * (1.0 * ringDistance) ** 2;
        const resultsDiv = document.getElementById("results");
const resultsDiv2 = document.getElementById("resultsCIO");

        resultsDiv.innerHTML = "";
        resultsDiv2.innerHTML = "";
        const totalGalaxies = data.length;
        rings.forEach((count, index) => {
          const innerRadius = index * ringDistance;

          var outerRadius = (index + 1) * ringDistance;
          if (index == numRings - 1) outerRadius = maxDistance;
          // console.log(index, numRings, innerRadius, outerRadius, maxDistance);
          const ringArea = calculateRingArea(innerRadius, outerRadius);
          const ringFraction = ringArea / totalArea;
        //  const totalGalaxies = data.length;

 




          resultsDiv.innerHTML += `<br><b>Ring ${
            index + 1
          }:</b> <b>${count} occ.</b>, S: ${ringArea.toFixed(
            2
          )}, S': ${ringFraction.toFixed(4)}, f': ${calculateDensity(
            count,
            totalGalaxies,
            ringFraction
          ).toFixed(4)}<br>`;
        });
// Calculate standard deviation
        const meanCount =
          rings.reduce((sum, count) => sum + count/totalGalaxies, 0) /
          rings.length;
        const variance =
          rings.reduce(
            (sum, count) => sum + (count/totalGalaxies - meanCount) ** 2,
            0
          ) /
          (rings.length - 1);
        const standardDeviation = Math.sqrt(variance);
        //console.log(meanCount, variance, standardDeviation);

        // Display standard deviation
        resultsDiv2.innerHTML += `<br>
              <b>The mean value: </b>&emsp;${meanCount.toFixed(4)}<br>
              <b>Variance:</b>&emsp;${variance.toFixed(4)}<br>
      <b>Standard Deviation (S):</b>&emsp;${standardDeviation.toFixed(4)}`;

        for (let i = 1; i <= numRings; i++) {
          if (i == numRings)
            var circle = createCircle(centerX, centerY, maxDistance);
          else circle = createCircle(centerX, centerY, i * ringDistance);
          svg.appendChild(circle);
        }
        //const totalGalaxies = data.length;
        const histogramData = rings.map((count, index) => {
          //   const ringArea = Math.PI * ((index + 1) ** 2 - index ** 2) * ringDistance ** 2;
          const innerRadius = index * ringDistance;

          var outerRadius = (index + 1) * ringDistance;
          if (index == numRings - 1) outerRadius = maxDistance;
          // console.log(index, numRings, innerRadius, outerRadius, maxDistance);
          const ringArea = calculateRingArea(innerRadius, outerRadius);
          const ringFraction = ringArea / totalArea;
          const density = calculateDensity(count, totalGalaxies, ringFraction);
          // console.log(ringFraction, density);
          return { density, ringFraction };
        });

        drawHistogram(histogramData, ringDistance, numRings);
      }

      function calculateDensity(count, totalGalaxies, ringFraction) {
        const method = document.querySelector(
          'input[name="densityCalculation"]:checked'
        ).value;
        if (method === "method1") {
          // Враховувати долю площі
          return count / totalGalaxies / ringFraction;
        } else {
          // Не враховувати долю площі
          return count / totalGalaxies;
        }
      }

      // Function to draw histogram with axes and borders
      function drawHistogram(data, ringDistance, numRings) {
        const svg = document.getElementById("histogramSVG");
        svg.innerHTML = "";

        const width = 575;
        const height = 545;
        const margin = 55;
        let numRings2 = parseInt(document.getElementById("numRings").value);
        var ringWidth = parseFloat(document.getElementById("ringWith").value);
        //console.log(numRings2, ringWidth, numRings2 * ringWidth);
        lastBar = numRings2 * ringWidth;
        const barWidth = (width - margin * 2) / data.length;

        const maxDensity = 0.4; //Math.max(...data.map((d) => d.density));

        // Create X and Y axes
        const xAxis = document.createElementNS(
          "http://www.w3.org/2000/svg",
          "line"
        );
        xAxis.setAttribute("x1", margin);
        xAxis.setAttribute("y1", height - margin);
        xAxis.setAttribute("x2", width - margin);
        xAxis.setAttribute("y2", height - margin);
        xAxis.setAttribute("stroke-width", "2");
        xAxis.setAttribute("stroke", "black");
        svg.appendChild(xAxis);

        const yAxis = document.createElementNS(
          "http://www.w3.org/2000/svg",
          "line"
        );
        yAxis.setAttribute("x1", margin);
        yAxis.setAttribute("y1", margin);
        yAxis.setAttribute("x2", margin);
        yAxis.setAttribute("y2", height - margin);
        yAxis.setAttribute("stroke-width", "2");
        yAxis.setAttribute("stroke", "black");
        svg.appendChild(yAxis);

        // Create X axis labels and ticks
        const xAxisSteps = data.length; // Number of ticks based on data length
        for (let i = 0; i <= xAxisSteps; i++) {
          var x = margin + i * barWidth;
          //if (i == xAxisSteps) x = margin + i * barWidth * lastBar;
          // Labels
          if (i < xAxisSteps) {
            // Avoid adding label for the last tick
            const text = document.createElementNS(
              "http://www.w3.org/2000/svg",
              "text"
            );
            text.setAttribute("x", x);
            text.setAttribute("y", height - margin + 25);
            text.setAttribute("text-anchor", "middle");
            text.setAttribute("font-size", "18");
            text.setAttribute("font-family", "Arial");
            text.textContent = (
              i * document.getElementById("ringWith").value
            ).toFixed(2); // Adjust label value
            svg.appendChild(text);
          }

          // Ticks
          const tick = document.createElementNS(
            "http://www.w3.org/2000/svg",
            "line"
          );
          tick.setAttribute("x1", x);
          tick.setAttribute("y1", height - margin);
          tick.setAttribute("x2", x);
          tick.setAttribute("y2", height - margin + 5);
          tick.setAttribute("stroke", "black");
          svg.appendChild(tick);
        }

        // Create Y axis labels, ticks, and grid lines
        const yAxisSteps = 5;
        for (let i = 0; i <= yAxisSteps; i++) {
          const y = height - margin - ((height - margin * 2) / yAxisSteps) * i;
          const densityValue = ((maxDensity * i) / yAxisSteps).toFixed(2);

          // Labels
          const text = document.createElementNS(
            "http://www.w3.org/2000/svg",
            "text"
          );
          text.setAttribute("x", margin - 10);
          text.setAttribute("y", y + 3);
          text.setAttribute("text-anchor", "end");
          text.setAttribute("font-size", "18");
          text.setAttribute("font-family", "Arial");
          text.textContent = i === yAxisSteps ? "" : densityValue; // Hide label for the last tick
          svg.appendChild(text);

          // Ticks
          const tick = document.createElementNS(
            "http://www.w3.org/2000/svg",
            "line"
          );
          tick.setAttribute("x1", margin - 5);
          tick.setAttribute("y1", y);
          tick.setAttribute("x2", margin);
          tick.setAttribute("y2", y);
          tick.setAttribute("stroke", "black");
          svg.appendChild(tick);

          // Grid lines
          const gridLine = document.createElementNS(
            "http://www.w3.org/2000/svg",
            "line"
          );
          gridLine.setAttribute("x1", margin);
          gridLine.setAttribute("y1", y);
          gridLine.setAttribute("x2", width - margin);
          gridLine.setAttribute("y2", y);
          gridLine.setAttribute("stroke", "lightgray");
          gridLine.setAttribute("stroke-dasharray", "2,2");
          svg.appendChild(gridLine);
        }

        // Create bars with borders
        data.forEach((d, index) => {
          const barHeight = (d.density / maxDensity) * (height - margin * 2);

          let adjustedBarWidth = barWidth;
          // if (index == numRings - 1) adjustedBarWidth = barWidth * lastBar;
          // var x = margin + i * barWidth;

          var x = margin + index * barWidth;
          // if (index == numRings - 1) x = margin + index * barWidth * lastBar;
          //  console.log(adjustedBarWidth, barWidth, index, numRings - 1, x);
          const rect = document.createElementNS(
            "http://www.w3.org/2000/svg",
            "rect"
          );
          // Adjust the width of the last bar if it doesn't fit

          if (
            index === data.length - 1 &&
            Math.floor(numRings2) * ringWidth != 1
          ) {
            // adjustedBarWidth = width - margin - x ;
            // adjustedBarWidth = barWidth * lastBar;
            adjustedBarWidth =
              ((1 - Math.floor(numRings2) * ringWidth) * barWidth) / ringWidth;
          }

          rect.setAttribute("x", x);
          rect.setAttribute("y", height - margin - barHeight);
          rect.setAttribute("width", adjustedBarWidth);
          rect.setAttribute("height", barHeight);
          rect.setAttribute("fill", "rgb(211, 211, 211)");
          rect.setAttribute("stroke", "black");
          rect.setAttribute("stroke-width", "1");
          svg.appendChild(rect);
        });

        // Add axis labels
        const xAxisLabel = document.createElementNS(
          "http://www.w3.org/2000/svg",
          "text"
        );
        xAxisLabel.setAttribute("x", width - margin - 5);
        xAxisLabel.setAttribute("y", height - margin + 25);
        xAxisLabel.setAttribute("text-anchor", "end");
        xAxisLabel.setAttribute("font-size", "22");
        xAxisLabel.setAttribute("font-family", "Arial");
        xAxisLabel.setAttribute(
          "style",
          "font-weight: bold; font-style: italic;"
        );
        xAxisLabel.textContent = "R";
        svg.appendChild(xAxisLabel);

        const yAxisLabel = document.createElementNS(
          "http://www.w3.org/2000/svg",
          "text"
        );
        yAxisLabel.setAttribute("x", margin - 25);
        yAxisLabel.setAttribute("y", margin + 30);
        yAxisLabel.setAttribute("text-anchor", "middle");
        yAxisLabel.setAttribute("font-size", "22");
        yAxisLabel.setAttribute("font-family", "Arial");
        yAxisLabel.setAttribute(
          "style",
          "font-weight: bold; font-style: italic;"
        );
        yAxisLabel.textContent = "f'";
        svg.appendChild(yAxisLabel);

        // Create bars with borders and tooltips
        data.forEach((d, index) => {
          const barHeight = (d.density / maxDensity) * (height - margin * 2);
          let adjustedBarWidth = barWidth;
          const x = margin + index * barWidth;

          // Adjust the width of the last bar if it doesn't fit
          if (
            index === data.length - 1 &&
            Math.floor(numRings2) * ringWidth != 1
          ) {
            // adjustedBarWidth = width - margin - x ;
            //adjustedBarWidth = barWidth * lastBar;
            adjustedBarWidth =
              ((1 - Math.floor(numRings2) * ringWidth) * barWidth) / ringWidth;
          }

          const rect = document.createElementNS(
            "http://www.w3.org/2000/svg",
            "rect"
          );
          rect.setAttribute("x", x);
          rect.setAttribute("y", height - margin - barHeight);
          rect.setAttribute("width", adjustedBarWidth);
          rect.setAttribute("height", barHeight);
          rect.setAttribute("fill", "rgb(211, 211, 211)");
          rect.setAttribute("stroke", "black");
          rect.setAttribute("stroke-width", "1");

          // Tooltip (title attribute)
          rect.setAttribute("title", `f': ${d.density}`);

          // Mouseover event listener for tooltip
          rect.addEventListener("mouseover", (event) => {
            const tooltip = document.getElementById("tooltip");
            tooltip.textContent = `f': ${d.density.toFixed(4)}`;
            tooltip.style.display = "block";
            tooltip.style.top = `${event.clientY}px`;
            tooltip.style.left = `${event.clientX}px`;
            rect.setAttribute("fill", "gray");
          });

          // Mouseout event listener to hide tooltip
          rect.addEventListener("mouseout", () => {
            const tooltip = document.getElementById("tooltip");
            tooltip.style.display = "none";
            rect.setAttribute("fill", "rgb(211, 211, 211)");
          });

          svg.appendChild(rect);
        });

        // Tooltip element
        const tooltip = document.createElement("div");
        tooltip.setAttribute("id", "tooltip");
        tooltip.style.position = "absolute";
        tooltip.style.display = "none";
        tooltip.style.background = "rgba(0, 0, 0, 0.7)";
        tooltip.style.color = "#fff";
        tooltip.style.padding = "5px";
        document.body.appendChild(tooltip);
      }

      function calculateRingArea(innerRadius, outerRadius) {
        const pi = Math.PI;
        const outerArea = pi * outerRadius ** 2;
        const innerArea = pi * innerRadius ** 2;
        return outerArea - innerArea;
      }

      function drawHistogramPA(data, numBins) {
        const svg = document.getElementById("histogramSVG");
        svg.innerHTML = "";

        const width = 575;
        const height = 545;
        const margin = 55;

        // Обчислення кутів PA
        const paValues = data.map((d) => d.PA);

        // Розподіл кутів на бін
        const binWidth = 180 / numBins; // Діапазон [0, 360] розділений на кількість бін
        const bins = new Array(numBins).fill(0);

        paValues.forEach((value) => {
          const binIndex = Math.floor(value / binWidth);
          if (binIndex >= 0 && binIndex < numBins) {
            bins[binIndex]++;
          }
        });

        // Масштабування значень бінів
        const totalGalaxies = data.length;
        const barWidth = (width - margin * 2) / numBins;
        const maxBinValue = 0.25;

        // Створення осей X і Y
        const xAxis = document.createElementNS(
          "http://www.w3.org/2000/svg",
          "line"
        );
        xAxis.setAttribute("x1", margin);
        xAxis.setAttribute("y1", height - margin);
        xAxis.setAttribute("x2", width - margin);
        xAxis.setAttribute("y2", height - margin);
        xAxis.setAttribute("stroke-width", "2");
        xAxis.setAttribute("stroke", "black");
        svg.appendChild(xAxis);

        const yAxis = document.createElementNS(
          "http://www.w3.org/2000/svg",
          "line"
        );
        yAxis.setAttribute("x1", margin);
        yAxis.setAttribute("y1", margin);
        yAxis.setAttribute("x2", margin);
        yAxis.setAttribute("y2", height - margin);
        yAxis.setAttribute("stroke-width", "2");
        yAxis.setAttribute("stroke", "black");
        svg.appendChild(yAxis);

        // Створення підписів осі X та тік
        for (let i = 0; i <= numBins; i++) {
          const x = margin + i * barWidth;

          // Підписи
          const text = document.createElementNS(
            "http://www.w3.org/2000/svg",
            "text"
          );
          text.setAttribute("x", x);
          text.setAttribute("y", height - margin + 25);
          text.setAttribute("text-anchor", "middle");
          text.setAttribute("font-size", "18");
          text.setAttribute("font-family", "Arial");
          if (i % 2 == 0) text.textContent = (i * binWidth).toFixed(0);
          svg.appendChild(text);

          // Тіки
          const tick = document.createElementNS(
            "http://www.w3.org/2000/svg",
            "line"
          );
          tick.setAttribute("x1", x);
          tick.setAttribute("y1", height - margin);
          tick.setAttribute("x2", x);
          tick.setAttribute("y2", height - margin + 5);
          tick.setAttribute("stroke", "black");
          svg.appendChild(tick);
        }

        // Створення підписів осі Y, тік та сітки
        const yAxisSteps = 5;
        for (let i = 0; i < yAxisSteps; i++) {
          const y = height - margin - ((height - margin * 2) / yAxisSteps) * i;
          const relativeFrequency = ((maxBinValue * i) / yAxisSteps).toFixed(2); //(i / yAxisSteps).toFixed(2);

          // Підписи
          const text = document.createElementNS(
            "http://www.w3.org/2000/svg",
            "text"
          );
          text.setAttribute("x", margin - 10);
          text.setAttribute("y", y + 3);
          text.setAttribute("text-anchor", "end");
          text.setAttribute("font-size", "18");
          text.setAttribute("font-family", "Arial");
          text.textContent = relativeFrequency;
          svg.appendChild(text);

          // Тіки
          const tick = document.createElementNS(
            "http://www.w3.org/2000/svg",
            "line"
          );
          tick.setAttribute("x1", margin - 5);
          tick.setAttribute("y1", y);
          tick.setAttribute("x2", margin);
          tick.setAttribute("y2", y);
          tick.setAttribute("stroke", "black");
          svg.appendChild(tick);

          // Сітка
          const gridLine = document.createElementNS(
            "http://www.w3.org/2000/svg",
            "line"
          );
          gridLine.setAttribute("x1", margin);
          gridLine.setAttribute("y1", y);
          gridLine.setAttribute("x2", width - margin);
          gridLine.setAttribute("y2", y);
          gridLine.setAttribute("stroke", "lightgray");
          gridLine.setAttribute("stroke-dasharray", "2,2");
          svg.appendChild(gridLine);
        }

        // Створення стовпчиків з бордюрами
        bins.forEach((binValue, index) => {
          // const barHeight = (binValue / totalGalaxies) * (height - margin * 2); // Зміна масштабування
          const barHeight =
            ((binValue / totalGalaxies) * (height - margin * 2)) / maxBinValue; // Зміна масштабування

          const rect = document.createElementNS(
            "http://www.w3.org/2000/svg",
            "rect"
          );
          rect.setAttribute("x", margin + index * barWidth);
          rect.setAttribute("y", height - margin - barHeight);
          rect.setAttribute("width", barWidth);
          rect.setAttribute("height", barHeight);
          rect.setAttribute("fill", "rgb(211, 211, 211)");
          rect.setAttribute("stroke", "black");
          rect.setAttribute("stroke-width", "1");

          // Tooltip (title attribute)
          rect.setAttribute(
            "title",
            `f': ${(binValue / totalGalaxies).toFixed(3)}`
          );

          // Mouseover event listener for tooltip
          rect.addEventListener("mouseover", (event) => {
            const tooltip = document.getElementById("tooltip");
            tooltip.textContent = `f': ${(binValue / totalGalaxies).toFixed(
              3
            )}`;
            tooltip.style.display = "block";
            tooltip.style.top = `${event.clientY}px`;
            tooltip.style.left = `${event.clientX}px`;
            rect.setAttribute("fill", "gray");
          });

          // Mouseout event listener to hide tooltip
          rect.addEventListener("mouseout", () => {
            const tooltip = document.getElementById("tooltip");
            tooltip.style.display = "none";
            rect.setAttribute("fill", "rgb(211, 211, 211)");
          });

          svg.appendChild(rect);
        });

        // Tooltip element
        const tooltip = document.createElement("div");
        tooltip.setAttribute("id", "tooltip");
        tooltip.style.position = "absolute";
        tooltip.style.display = "none";
        tooltip.style.background = "rgba(0, 0, 0, 0.7)";
        tooltip.style.color = "#fff";
        tooltip.style.padding = "5px";
        document.body.appendChild(tooltip);

        // Додавання підписів осей
        const xAxisLabel = document.createElementNS(
          "http://www.w3.org/2000/svg",
          "text"
        );
        xAxisLabel.setAttribute("x", width / 2);
        xAxisLabel.setAttribute("y", height - margin / 2 + 20);
        xAxisLabel.setAttribute("text-anchor", "middle");
        xAxisLabel.setAttribute("font-size", "22");
        xAxisLabel.setAttribute("font-family", "Arial");
        xAxisLabel.setAttribute(
          "style",
          "font-weight: bold; font-style: italic;"
        );
        xAxisLabel.textContent = "PA";
        svg.appendChild(xAxisLabel);

        const yAxisLabel = document.createElementNS(
          "http://www.w3.org/2000/svg",
          "text"
        );
        yAxisLabel.setAttribute("x", margin - 25);
        yAxisLabel.setAttribute("y", margin + 30);
        yAxisLabel.setAttribute("text-anchor", "middle");
        yAxisLabel.setAttribute("font-size", "22");
        yAxisLabel.setAttribute("font-family", "Arial");
        yAxisLabel.setAttribute(
          "style",
          "font-weight: bold; font-style: italic;"
        );
        yAxisLabel.textContent = "f'";
        svg.appendChild(yAxisLabel);
      }

      // Function to draw histogram for ellipticities
      function drawHistogramEllipticities(data, numBins) {
        const svg = document.getElementById("histogramSVG");
        svg.innerHTML = "";

        const width = 575;
        const height = 545;
        const margin = 55;



// Переконатися, що елемент існує
if (svg) {
    svg.scrollIntoView({
        behavior: 'smooth', // Плавна прокрутка
        block: 'center',    // Вирівнювання по вертикалі (по центру)
        inline: 'nearest'   // Вирівнювання по горизонталі (найближче)
    });
}


        // Extract ellipticities
        const ellipticityValues = data.map((d) => d.E);

        // Bin the ellipticity values
        const binWidth = 1 / numBins; // Range [0, 1] divided by number of bins
        const bins = new Array(numBins).fill(0);

        ellipticityValues.forEach((value) => {
          const binIndex = Math.floor(value / binWidth);
          if (binIndex >= 0 && binIndex < numBins) {
            bins[binIndex]++;
          }
        });

        // Normalize bin values
        const totalGalaxies = data.length;
        const maxBinValue = Math.max(...bins);
        console.log(maxBinValue);
        const barWidth = (width - margin * 2) / numBins;

        // Create X and Y axes
        const xAxis = document.createElementNS(
          "http://www.w3.org/2000/svg",
          "line"
        );
        xAxis.setAttribute("x1", margin);
        xAxis.setAttribute("y1", height - margin);
        xAxis.setAttribute("x2", width - margin);
        xAxis.setAttribute("y2", height - margin);
        xAxis.setAttribute("stroke-width", "2");
        xAxis.setAttribute("stroke", "black");
        svg.appendChild(xAxis);

        const yAxis = document.createElementNS(
          "http://www.w3.org/2000/svg",
          "line"
        );
        yAxis.setAttribute("x1", margin);
        yAxis.setAttribute("y1", margin);
        yAxis.setAttribute("x2", margin);
        yAxis.setAttribute("y2", height - margin);
        yAxis.setAttribute("stroke-width", "2");
        yAxis.setAttribute("stroke", "black");
        svg.appendChild(yAxis);

        // Create X axis labels and ticks
        for (let i = 0; i <= numBins; i++) {
          const x = margin + i * barWidth;

          // Labels
          const text = document.createElementNS(
            "http://www.w3.org/2000/svg",
            "text"
          );
          text.setAttribute("x", x);
          text.setAttribute("y", height - margin + 25);
          text.setAttribute("text-anchor", "middle");
          text.setAttribute("font-size", "18");
          text.setAttribute("font-family", "Arial");
          text.textContent = (i * binWidth).toFixed(2);
          svg.appendChild(text);

          // Ticks
          const tick = document.createElementNS(
            "http://www.w3.org/2000/svg",
            "line"
          );
          tick.setAttribute("x1", x);
          tick.setAttribute("y1", height - margin);
          tick.setAttribute("x2", x);
          tick.setAttribute("y2", height - margin + 5);
          tick.setAttribute("stroke", "black");
          svg.appendChild(tick);
        }

        // Create Y axis labels, ticks, and grid lines
        const yAxisSteps = 5;
        for (let i = 0; i <= yAxisSteps; i++) {
          const y = height - margin - ((height - margin * 2) / yAxisSteps) * i;
          const densityValue = (
            (maxBinValue * i) /
            yAxisSteps /
            totalGalaxies
          ).toFixed(2);

          // Labels
          const text = document.createElementNS(
            "http://www.w3.org/2000/svg",
            "text"
          );
          text.setAttribute("x", margin - 10);
          text.setAttribute("y", y + 3);
          text.setAttribute("text-anchor", "end");
          text.setAttribute("font-size", "18");
          text.setAttribute("font-family", "Arial");
          text.textContent = i === yAxisSteps ? "" : densityValue; // Hide the text for the last value
          svg.appendChild(text);

          // Ticks
          const tick = document.createElementNS(
            "http://www.w3.org/2000/svg",
            "line"
          );
          tick.setAttribute("x1", margin - 5);
          tick.setAttribute("y1", y);
          tick.setAttribute("x2", margin);
          tick.setAttribute("y2", y);
          tick.setAttribute("stroke", "black");
          svg.appendChild(tick);

          // Grid lines
          const gridLine = document.createElementNS(
            "http://www.w3.org/2000/svg",
            "line"
          );
          gridLine.setAttribute("x1", margin);
          gridLine.setAttribute("y1", y);
          gridLine.setAttribute("x2", width - margin);
          gridLine.setAttribute("y2", y);
          gridLine.setAttribute("stroke", "lightgray");
          gridLine.setAttribute("stroke-dasharray", "2,2");
          svg.appendChild(gridLine);
        }

        // Create bars with borders
        bins.forEach((binValue, index) => {
          const barHeight = (binValue / maxBinValue) * (height - margin * 2);
          const rect = document.createElementNS(
            "http://www.w3.org/2000/svg",
            "rect"
          );
          rect.setAttribute("x", margin + index * barWidth);
          rect.setAttribute("y", height - margin - barHeight);
          rect.setAttribute("width", barWidth);
          rect.setAttribute("height", barHeight);
          rect.setAttribute("fill", "rgb(211, 211, 211)");
          rect.setAttribute("stroke", "black");
          rect.setAttribute("stroke-width", "1");

          // Tooltip (title attribute)
          rect.setAttribute(
            "title",
            `f': ${(binValue / totalGalaxies).toFixed(4)}`
          );

          // Mouseover event listener for tooltip
          rect.addEventListener("mouseover", (event) => {
            const tooltip = document.getElementById("tooltip");
            tooltip.textContent = `f: ${(binValue / totalGalaxies).toFixed(4)}`;
            tooltip.style.display = "block";
            tooltip.style.top = `${event.clientY}px`;
            tooltip.style.left = `${event.clientX}px`;
            rect.setAttribute("fill", "gray");
          });

          // Mouseout event listener to hide tooltip
          rect.addEventListener("mouseout", () => {
            const tooltip = document.getElementById("tooltip");
            tooltip.style.display = "none";
            rect.setAttribute("fill", "rgb(211, 211, 211)");
          });

          svg.appendChild(rect);
        });

        // Tooltip element
        const tooltip = document.createElement("div");
        tooltip.setAttribute("id", "tooltip");
        tooltip.style.position = "absolute";
        tooltip.style.display = "none";
        tooltip.style.background = "rgba(0, 0, 0, 0.7)";
        tooltip.style.color = "#fff";
        tooltip.style.padding = "5px";
        document.body.appendChild(tooltip);

        // Add axis labels
        const xAxisLabel = document.createElementNS(
          "http://www.w3.org/2000/svg",
          "text"
        );
        xAxisLabel.setAttribute("x", width / 2 - margin / 2 + 15);
        xAxisLabel.setAttribute("y", height - margin / 2 + 20);
        xAxisLabel.setAttribute("text-anchor", "center");
        xAxisLabel.setAttribute("font-size", "22");
        xAxisLabel.setAttribute("font-family", "Arial");
        xAxisLabel.setAttribute(
          "style",
          "font-weight: bold; font-style: italic;"
        );
        xAxisLabel.textContent = "E";
        svg.appendChild(xAxisLabel);

        const yAxisLabel = document.createElementNS(
          "http://www.w3.org/2000/svg",
          "text"
        );
        yAxisLabel.setAttribute("x", margin - 25);
        yAxisLabel.setAttribute("y", margin + 30);
        yAxisLabel.setAttribute("text-anchor", "middle");
        yAxisLabel.setAttribute("font-size", "22");
        yAxisLabel.setAttribute("font-family", "Arial");
        yAxisLabel.setAttribute(
          "style",
          "font-weight: bold; font-style: italic;"
        );
        yAxisLabel.textContent = "f";
        svg.appendChild(yAxisLabel);
      }

      async function findHighestDensityCenter(
        centerX,
        centerY,
        ringDistance,
        searchRadius,
        data
      ) {
        const totalSteps = -(-searchRadius - searchRadius);

        let step = Math.round(totalSteps / 7);
        const progressPercentage =
          document.getElementById("progressPercentage");
        const resultsDiv = document.getElementById(
          "resultFindHighestDensityCenter"
        );
        resultsDiv.innerHTML = "";

        progressPercentage.style.display = "block"; // Показати прогрес-бар

        let maxDensity = 0;
        let bestCenter = { x: centerX, y: centerY };
        let i = 0;
        for (let dx = -searchRadius; dx <= searchRadius; dx++) {
          for (let dy = -searchRadius; dy <= searchRadius; dy++) {
            const currentCenterX = centerX + dx;
            const currentCenterY = centerY + dy;
            let count = 0;

            data.forEach((point) => {
              const dist = Math.sqrt(
                (currentCenterX - point.x) ** 2 +
                  (currentCenterY - point.y) ** 2
              );

              if (dist < ringDistance) {
                count++;
              }
            });

            if (count > maxDensity) {
              maxDensity = count;
              bestCenter = { x: currentCenterX, y: currentCenterY };
            }
          }
          if (i % step == 0) {
            const progress = Math.floor((i / totalSteps) * 100);

            progressPercentage.innerText = `${progress}%`;
            await new Promise((resolve) => setTimeout(resolve, 0)); // Allow DOM update
          }
          i++;
        }

        progressPercentage.innerText = `100%`;

        resultsDiv.innerHTML = `${maxDensity} occurrences`;
        //(x - 250 - 65) * 8}, y: ${   (y - 250 - 10) * -8
        // Draw the best center for visualization
        document.getElementById("centerX").value =
          (bestCenter.x - 250 - 65) * 8;
        document.getElementById("centerY").value =
          (bestCenter.y - 250 - 10) * -8;
        const svg = document.getElementById("mySVG");
        const bestCenterCircle = createCircle(
          bestCenter.x,
          bestCenter.y,
          5,
          "red"
        );
        svg.appendChild(bestCenterCircle);

        // Draw ellipses within the ring for the highest density center
        data.forEach((point) => {
          const dist = Math.sqrt(
            (bestCenter.x - point.x) ** 2 + (bestCenter.y - point.y) ** 2
          );

          if (dist < ringDistance) {
            const ellipse = createCircle(point.x, point.y, 3, "green", "black");
            svg.appendChild(ellipse);
          }
          progressPercentage.style.display = "none";
        });

        // Draw the ring for visualization
        const ring = createCircle(
          bestCenter.x,
          bestCenter.y,
          ringDistance,
          "red"
        );

        //----------------------------------
        ring.setAttribute("fill", "none");
        svg.appendChild(ring);
      }

      // Dummy function for creating circles (to be implemented)
      function createCircle(
        cx,
        cy,
        r,
        color = "rgba(0, 0, 0, 0.15)",
        fillColor = "none"
      ) {
        const circle = document.createElementNS(
          "http://www.w3.org/2000/svg",
          "circle"
        );
        circle.setAttribute("cx", cx);
        circle.setAttribute("cy", cy);
        circle.setAttribute("r", r);
        circle.setAttribute("stroke", color);
        circle.setAttribute("stroke-width", 1);
        circle.setAttribute("fill", fillColor);
        return circle;
      }

      function createCircleViewe(i, x, y, m, E, PA, color, fillColor, BG) {
        var table = document.getElementById("editableTable");
        var radius = m;
        var ellipticity = E;
        var angle = PA;
        var A =
          radius /
          Math.pow(1 - 2 * ellipticity + ellipticity * ellipticity, 1 / 4);
        var B = (radius * radius) / A;

        var ellipse = document.createElementNS(
          "http://www.w3.org/2000/svg",
          "ellipse"
        );
        ellipse.setAttribute("cx", x);
        ellipse.setAttribute("cy", y);
        ellipse.setAttribute("rx", A);
        ellipse.setAttribute("ry", B);
        ellipse.setAttribute("transform", `rotate(${angle + 90}, ${x}, ${y})`);
        ellipse.setAttribute("stroke", color); // color
        if(BG==0)
        ellipse.setAttribute("stroke-width", 1);
      else ellipse.setAttribute("stroke-width", 2);
        ellipse.setAttribute("fill", fillColor);
        ellipse.setAttribute("data-row-index", i);

        // Add event listener to display tooltip when mouse hovers over ellipse
        ellipse.addEventListener(
          "mouseover",
          (function (x, y, radius, ellipticity, angle) {
            return function (event) {
              // this.setAttribute("stroke", "red");
              //  this.setAttribute("stroke-width", "2");
              var tooltip = document.getElementById("tooltip");
              tooltip.style.display = "block";
              tooltip.style.left = event.pageX + "px";
              tooltip.style.top = event.pageY + "px";
              tooltip.innerHTML = `x: ${(x - 250 - 65) * 8}, y: ${
                (y - 250 - 10) * -8
              }, size: ${
                radius * 2
              }, ellipticity: ${ellipticity}, angle: ${angle}`;
            };
          })(x, y, radius, ellipticity, angle)
        );

        // Remove tooltip and highlighting when mouse leaves ellipse
        ellipse.addEventListener("mouseout", function () {
          //this.setAttribute("stroke", "black");
          //this.setAttribute("stroke-width", "1");
          var tooltip = document.getElementById("tooltip");
          tooltip.style.display = "none";
        });

        // Add event listener to highlight table row when ellipse is clicked
           // Remove highlight from any previously highlighted ellipse

ellipse.addEventListener("click", function () {
  
  // Remove highlight from any previously highlighted row
    var highlightedRow = document.querySelector(".highlight");
    if (highlightedRow) {
        highlightedRow.classList.remove("highlight");
    }

    // Remove highlight from any previously highlighted ellipse
    var highlightedEllipse = document.querySelector(".highlight-ellipse");
    if (highlightedEllipse) {
        highlightedEllipse.classList.remove("highlight-ellipse");
        highlightedEllipse.setAttribute("stroke", "black");
        highlightedEllipse.setAttribute("stroke-width", "1");
    }

    // Highlight the corresponding row in the table
    var rowIndex = this.getAttribute("data-row-index");
    var selectedRow = table.rows[rowIndex];
 
    if (selectedRow) {
        selectedRow.classList.add("highlight");
    }
       var highlightedRow = document.querySelector('.highlight');
     // Scroll the table to the highlighted row
     //console.log(highlightedRow);
                highlightedRow.scrollIntoView({
            behavior: "smooth",
            block: "center",
            inline: "nearest"
        });

    // Highlight the corresponding ellipse
    this.classList.add("highlight-ellipse");
    this.setAttribute("stroke", "red");
    this.setAttribute("stroke-width", "2");
});


        return ellipse;
      }
      
      function toggleRings() {
        const showRings = document.getElementById("showRings").checked;
        const rings = document.querySelectorAll(".ring");
        rings.forEach((ring) => {
          ring.style.display = showRings ? "block" : "none";
        });
      }

      // Function to draw ellipses on the SVG based on table data
      function drawEllipsesRings() {
        var svg = document.getElementById("mySVG");
        var table = document.getElementById("editableTable");

        svg.innerHTML = ""; // Clear the SVG
        drawLinesAndText();
        for (var i = 1; i < table.rows.length; i++) {
          var x =
            parseFloat(table.rows[i].cells[1].innerHTML.replace(",", ".")) / 8 +
            250 +
            65;
          var y =
            -parseFloat(table.rows[i].cells[2].innerHTML.replace(",", ".")) /
              8 +
            250 +
            10; // --------------------------
          var radius = 3;
          var ellipticity = 0;
          var angle = parseFloat(
            table.rows[i].cells[5].innerHTML.replace(",", ".")
          );
          var A =
            radius /
            Math.pow(1 - 2 * ellipticity + ellipticity * ellipticity, 1 / 4);
          var B = (radius * radius) / A;

          var ellipse = document.createElementNS(
            "http://www.w3.org/2000/svg",
            "ellipse"
          );
          ellipse.setAttribute("cx", x);
          ellipse.setAttribute("cy", y);
          ellipse.setAttribute("rx", A);
          ellipse.setAttribute("ry", B);
          ellipse.setAttribute("fill", "rgba(255,0,0,0.8)");
          ellipse.setAttribute("stroke", "black");
          ellipse.setAttribute(
            "transform",
            `rotate(${angle + 90}, ${x}, ${y})`
          );
          ellipse.setAttribute("data-row-index", i);

          // Add event listener to display tooltip when mouse hovers over ellipse
          ellipse.addEventListener(
            "mouseover",
            (function (x, y, radius, ellipticity, angle) {
              return function (event) {
                this.setAttribute("stroke", "black");
                this.setAttribute("stroke-width", "3");
                var tooltip = document.getElementById("tooltip");
                tooltip.style.display = "block";
                tooltip.style.left = event.pageX + "px";
                tooltip.style.top = event.pageY + "px";
                tooltip.innerHTML = `x: ${(x - 250 - 65) * 8}, y: ${
                  (y - 250 - 10) * -8
                }, size: ${radius}, ellipticity: ${ellipticity}, angle: ${angle}`;
              };
            })(x, y, radius, ellipticity, angle)
          );

          // Remove tooltip and highlighting when mouse leaves ellipse
          ellipse.addEventListener("mouseout", function () {
            this.setAttribute("stroke", "black");
            this.setAttribute("stroke-width", "1");
            var tooltip = document.getElementById("tooltip");
            tooltip.style.display = "none";
          });

          // Add event listener to highlight table row when ellipse is clicked
          ellipse.addEventListener("click", function () {
            // Remove highlight from any previously highlighted row
            var highlightedRow = document.querySelector(".highlight");
            if (highlightedRow) {
              highlightedRow.classList.remove("highlight");
            }

            // Remove highlight from any previously highlighted ellipse
            var highlightedEllipse =
              document.querySelector(".highlight-ellipse");
            if (highlightedEllipse) {
              highlightedEllipse.classList.remove("highlight-ellipse");
              highlightedEllipse.setAttribute("stroke", "black");
              highlightedEllipse.setAttribute("stroke-width", "1");
            }

            // Highlight the corresponding row in the table
            var rowIndex = this.getAttribute("data-row-index");
            table.rows[rowIndex].classList.add("highlight");
            // Highlight the corresponding ellipse
            this.classList.add("highlight-ellipse");
            this.setAttribute("stroke", "red");
            this.setAttribute("stroke-width", "2");
          });

          svg.appendChild(ellipse);
        }
        /*
                    // Add event listener to highlight ellipse when table row is clicked
                    Array.from(table.rows).forEach((row, index) => {
                      row.addEventListener("click", function () {
                        // Remove highlight from any previously highlighted ellipse
                        var highlightedEllipse =
                          document.querySelector(".highlight-ellipse");
                        if (highlightedEllipse) {
                          highlightedEllipse.classList.remove("highlight-ellipse");
                          highlightedEllipse.setAttribute("stroke", "black");
                          highlightedEllipse.setAttribute("stroke-width", "1");
                        }

                        // Remove highlight from any previously highlighted row
                        var highlightedRow = document.querySelector(".highlight");
                        if (highlightedRow) {
                          highlightedRow.classList.remove("highlight");
                        }

                        // Highlight the corresponding ellipse
                        var ellipse = svg.querySelector(
                          `ellipse[data-row-index="${index}"]`
                        );
                        if (ellipse) {
                          ellipse.classList.add("highlight-ellipse");
                          ellipse.setAttribute("stroke", "red");
                          ellipse.setAttribute("stroke-width", "2");
                        }

                        // Highlight the clicked row
                        this.classList.add("highlight");
                      });
                    });*/
      }

      document.addEventListener("DOMContentLoaded", function () {
        drawLinesAndText();

        // Налаштування вкладок
        const tabLinks = document.querySelectorAll(".tab-link");
        const tabContents = document.querySelectorAll(".tab-content");

        tabLinks.forEach((link) => {
          link.addEventListener("click", function () {
            tabLinks.forEach((item) => item.classList.remove("active"));
            tabContents.forEach((item) => item.classList.remove("active"));

            link.classList.add("active");
            const tabId = link.getAttribute("data-tab");
            document.getElementById(tabId).classList.add("active");
          });
        });

        tabLinks[0].classList.add("active");
        tabContents[0].classList.add("active");
      });

      function findNearbyGalaxiesWithSimilarOrientation(data) {
        var svg = document.getElementById("mySVG");
        svg.innerHTML = ""; // Clear the SVG
        drawLinesAndText();

        const resultsDiv = document.getElementById("resultsPA");
        resultsDiv.innerHTML = "";

        const Difference = parseFloat(
          document.getElementById("AngelDifference").value
        );
        const cosTolerance = Math.cos((Difference * Math.PI) / 180); // Compute cos of angle tolerance
        const ResizeM = parseFloat(document.getElementById("ResizeM").value);
        const eLimit = parseFloat(document.getElementById("eLimit").value);
        const mLimit = parseFloat(document.getElementById("mLimit").value);
        const showOutOfFilterGalaxies = document.getElementById(
          "showOutOfFilterGalaxies"
        ).checked;

        // Функція для розрахунку відстані між двома точками
        function distance(x1, y1, x2, y2) {
          return Math.sqrt((x2 - x1) ** 2 + (y2 - y1) ** 2);
        }

        const processedPairs = new Set();

        // Фільтруємо дані
        const filteredData = data.filter(
          (point) => point.E > eLimit && point.m > mLimit
        );
        const outOfFilterData = data.filter(
          (point) => !(point.E > eLimit && point.m > mLimit)
        );

        // Проходимо по кожній точці
        filteredData.forEach((point, index) => {
          let minDistance = Infinity;
          let closestPoint = null;

          // Знаходимо найближчу точку до поточної
          for (let i = 0; i < filteredData.length; i++) {
            if (i !== index) {
              const dist = distance(
                point.x,
                point.y,
                filteredData[i].x,
                filteredData[i].y
              );
              if (dist < minDistance) {
                minDistance = dist;
                closestPoint = filteredData[i];
              }
            }
          }

          if (closestPoint) {
            // Унікальний ключ для пари точок
            const pairKey = `${Math.min(point.i, closestPoint.i)}-${Math.max(
              point.i,
              closestPoint.i
            )}`;

            if (!processedPairs.has(pairKey)) {
              // Обчислюємо кути
              const angle1 = (point.PA * Math.PI) / 180; // Орієнтація першої точки в радіанах
              const angle2 = (closestPoint.PA * Math.PI) / 180; // Орієнтація найближчої точки в радіанах

              // Визначаємо косинус відхилення кута
              const cosAngleDifference = Math.cos(angle1 - angle2);

              // Перевіряємо чи косинус відхилення менше або рівне заданому значенню
              if (cosAngleDifference >= cosTolerance) {
                resultsDiv.innerHTML += `<br><b>Galaxy  # (${point.i})</b>: (${point.x}, ${point.y}), <br>
            The nearest galaxy to it (<b># ${closestPoint.i})</b>: (${closestPoint.x}, ${closestPoint.y}), <br>
            Orientation of the galaxy: ${point.PA}, <br>
            Orientation of the nearest galaxy: ${closestPoint.PA} <br>
            The cosine of the angle deviation: ${cosAngleDifference} <br>`;

                const ellipse = createCircleViewe(
                  point.i,
                  point.x,
                  point.y,
                  point.m / 2 + ResizeM,
                  point.E,
                  point.PA,
                  "black",
                  "rgba(255,0,0, 0.5)",
                  point.BG
                );
                const ellipse2 = createCircleViewe(
                  closestPoint.i,
                  closestPoint.x,
                  closestPoint.y,
                  closestPoint.m / 2 + ResizeM,
                  closestPoint.E,
                  closestPoint.PA,
                  "black",
                  "rgba(255,0,0, 0.5)",
                  point.BG
                );

                const distantLine =
                  document.getElementById("distantLine").checked;
                if (distantLine) {
                  const line = document.createElementNS(
                    "http://www.w3.org/2000/svg",
                    "line"
                  );
                  line.setAttribute("x1", point.x);
                  line.setAttribute("y1", point.y);
                  line.setAttribute("x2", closestPoint.x);
                  line.setAttribute("y2", closestPoint.y);
                  line.setAttribute("stroke", "blue");
                  line.setAttribute("stroke-width", "2");
                  svg.appendChild(line);
                }

                const directionLine =
                  document.getElementById("directionLine").checked;
                if (directionLine) {
                  const directionLine = document.createElementNS(
                    "http://www.w3.org/2000/svg",
                    "line"
                  );
                  const lineLength = 15 + point.m / 2; // Length of the direction line
                  const startX =
                    point.x -
                    lineLength * Math.cos(((point.PA + 90) * Math.PI) / 180);
                  const startY =
                    point.y -
                    lineLength * Math.sin(((point.PA + 90) * Math.PI) / 180);
                  const endX =
                    point.x +
                    lineLength * Math.cos(((point.PA + 90) * Math.PI) / 180);
                  const endY =
                    point.y +
                    lineLength * Math.sin(((point.PA + 90) * Math.PI) / 180);
                  directionLine.setAttribute("x1", startX);
                  directionLine.setAttribute("y1", startY);
                  directionLine.setAttribute("x2", endX);
                  directionLine.setAttribute("y2", endY);
                  directionLine.setAttribute("stroke", "rgba(0,0,0,0.9)");
                  directionLine.setAttribute("stroke-width", "2");
                  directionLine.setAttribute("stroke-dasharray", "1,5");
                  directionLine.setAttribute("stroke-linecap", "round");
                  svg.appendChild(directionLine);

                  const directionLine2 = document.createElementNS(
                    "http://www.w3.org/2000/svg",
                    "line"
                  );
                  const startX2 =
                    closestPoint.x -
                    lineLength *
                      Math.cos(((closestPoint.PA + 90) * Math.PI) / 180);
                  const startY2 =
                    closestPoint.y -
                    lineLength *
                      Math.sin(((closestPoint.PA + 90) * Math.PI) / 180);
                  const endX2 =
                    closestPoint.x +
                    lineLength *
                      Math.cos(((closestPoint.PA + 90) * Math.PI) / 180);
                  const endY2 =
                    closestPoint.y +
                    lineLength *
                      Math.sin(((closestPoint.PA + 90) * Math.PI) / 180);
                  directionLine2.setAttribute("x1", startX2);
                  directionLine2.setAttribute("y1", startY2);
                  directionLine2.setAttribute("x2", endX2);
                  directionLine2.setAttribute("y2", endY2);
                  directionLine2.setAttribute("stroke", "rgba(0,0,0,0.9)");
                  directionLine2.setAttribute("stroke-width", "2");
                  directionLine2.setAttribute("stroke-dasharray", "1,5");
                  directionLine2.setAttribute("stroke-linecap", "round");
                  svg.appendChild(directionLine2);
                }

                svg.appendChild(ellipse);
                svg.appendChild(ellipse2);

                // Додаємо оброблену пару точок до набору
                processedPairs.add(pairKey);
              }
            }
          }
        });

        const ShowAllGalaxies =
          document.getElementById("ShowAllGalaxies").checked;
        if (ShowAllGalaxies) {
          filteredData.forEach((point) => {
            const ellipse = createCircleViewe(
              point.i,
              point.x,
              point.y,
              point.m / 2 + ResizeM,
              point.E,
              point.PA,
              "black",
              "rgba(0,0,0, 0.1)",
              point.BG
            );
            svg.appendChild(ellipse);
          });
        }

        if (showOutOfFilterGalaxies) {
          outOfFilterData.forEach((point) => {
            const ellipse = createCircleViewe(
              point.i,
              point.x,
              point.y,
              point.m / 2 + ResizeM,
              point.E,
              point.PA,
              "black",
              "rgba(0,0,0, 0.1)",
              point.BG
            );
            svg.appendChild(ellipse);
          });
        }

        drawHistogramPA(getDataFromTable(), 12);
      }

      // Function to save SVG as BMP
      function saveBMP() {
        var svgElement = document.getElementById("mySVG");

        const fileInput = document.getElementById("fileInput");
        // Отримати вибраний файл
        const file = fileInput.files[0];

        // Отримати ім'я файлу без розширення
        const fileName = file.name.replace(/\.[^/.]+$/, ""); // Видаляємо останнє збігання крапки і тексту за нею до кінця рядка

        const text = document.createElementNS(
          "http://www.w3.org/2000/svg",
          "text"
        );
        text.setAttribute("x", 440); // Adjust x coordinate by subtracting 420
        text.setAttribute("y", 60);
        text.setAttribute("font-size", 18);
        text.setAttribute("font-family", "Arial");
        text.setAttribute("text-anchor", "start"); // Set text alignment
        text.textContent = fileName;

        svgElement.appendChild(text);
        var svgString = new XMLSerializer().serializeToString(svgElement);

        // Create a canvas element and set its dimensions to match the SVG
        var canvas = document.createElement("canvas");
        canvas.width = svgElement.clientWidth;
        canvas.height = svgElement.clientHeight;
        var ctx = canvas.getContext("2d");

        var DOMURL = window.URL || window.webkitURL || window;
        var img = new Image();
        var svgBlob = new Blob([svgString], {
          type: "image/svg+xml;charset=utf-8",
        });
        var url = DOMURL.createObjectURL(svgBlob);

        img.onload = function () {
          ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
          DOMURL.revokeObjectURL(url);

          var imgURI = canvas
            .toDataURL("image/bmp")
            .replace("image/bmp", "image/octet-stream");

          var evt = new MouseEvent("click", {
            view: window,
            bubbles: false,
            cancelable: true,
          });

          var a = document.createElement("a");
          a.setAttribute("download", fileName + ".bmp");
          a.setAttribute("href", imgURI);
          a.setAttribute("target", "_blank");

          a.dispatchEvent(evt);
        };

        img.src = url;
      }

      // Function to save SVG as BMP
      function histogramSVGsaveBMP() {
        var svgElement = document.getElementById("histogramSVG");

        const fileInput = document.getElementById("fileInput");
        // Отримати вибраний файл
        const file = fileInput.files[0];

        // Отримати ім'я файлу без розширення
        const fileName = file.name.replace(/\.[^/.]+$/, ""); // Видаляємо останнє збігання крапки і тексту за нею до кінця рядка

        const text = document.createElementNS(
          "http://www.w3.org/2000/svg",
          "text"
        );
        text.setAttribute("x", 440); // Adjust x coordinate by subtracting 420
        text.setAttribute("y", 60);
        text.setAttribute("font-size", 18);
        text.setAttribute("font-family", "Arial");
        text.setAttribute("text-anchor", "start"); // Set text alignment
        text.textContent = fileName;

        svgElement.appendChild(text);

        var svgString = new XMLSerializer().serializeToString(svgElement);

        // Create a canvas element and set its dimensions to match the SVG
        var canvas = document.createElement("canvas");
        canvas.width = svgElement.clientWidth;
        canvas.height = svgElement.clientHeight;
        var ctx = canvas.getContext("2d");

        var DOMURL = window.URL || window.webkitURL || window;
        var img = new Image();
        var svgBlob = new Blob([svgString], {
          type: "image/svg+xml;charset=utf-8",
        });
        var url = DOMURL.createObjectURL(svgBlob);

        img.onload = function () {
          ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
          DOMURL.revokeObjectURL(url);

          var imgURI = canvas
            .toDataURL("image/bmp")
            .replace("image/bmp", "image/octet-stream");

          var evt = new MouseEvent("click", {
            view: window,
            bubbles: false,
            cancelable: true,
          });
          const fileInput = document.getElementById("fileInput");
          // Отримати вибраний файл
          const file = fileInput.files[0];

          // Отримати ім'я файлу без розширення
          const fileName = file.name.replace(/\.[^/.]+$/, ""); // Видаляємо останнє збігання крапки і тексту за нею до кінця рядка

          //console.log("Назва файлу без розширення:", fileName);

          var a = document.createElement("a");
          a.setAttribute("download", "D.H. - " + fileName + ".bmp");
          a.setAttribute("href", imgURI);
          a.setAttribute("target", "_blank");

          a.dispatchEvent(evt);
        };

        img.src = url;
      }

      function drawEllipses() {
        var svg = document.getElementById("mySVG");
        var table = document.getElementById("editableTable");

        svg.innerHTML = ""; // Clear the SVG
        drawLinesAndText();
        const data = getDataFromTable();
        data.forEach((point, index) => {
          const ellipse = createCircleViewe(
            point.i,
            point.x,
            point.y,
            point.m / 2,
            point.E,
            point.PA,
            `rgba(${point.BG * 25 + 0},${point.BG * 25 + 0},${point.BG * 25 + 0}, ${point.BG * 1 + 0.4})`,
            `rgba(${point.BG * 25 + 0},${point.BG * 25 + 0},${point.BG * 25 + 0}, ${point.BG * 1 + 0.4})`,
            point.BG
          );
          svg.appendChild(ellipse);
        });

/*
        for (var i = 1; i < table.rows.length; i++) {
          var x =
            parseFloat(table.rows[i].cells[1].innerHTML.replace(",", ".")) / 8 +
            250 +
            65;
          var y =
            -parseFloat(table.rows[i].cells[2].innerHTML.replace(",", ".")) /
              8 +
            250 +
            10; // --------------------------
          var radius = Number(
            parseFloat(table.rows[i].cells[3].innerHTML.replace(",", "."))
          );
          //var m = 0.6 * (18.5 - radius);
          //radius = 3 * Math.pow(2, m) + 6;
          radius /= 2;
          var ellipticity = Number(
            parseFloat(table.rows[i].cells[4].innerHTML.replace(",", "."))
          );
          var angle = parseFloat(
            table.rows[i].cells[5].innerHTML.replace(",", ".")
          );
          var A =
            radius /
            Math.pow(1 - 2 * ellipticity + ellipticity * ellipticity, 1 / 4);
          var B = (radius * radius) / A;

          var ellipse = document.createElementNS(
            "http://www.w3.org/2000/svg",
            "ellipse"
          );
          ellipse.setAttribute("cx", x);
          ellipse.setAttribute("cy", y);
          ellipse.setAttribute("rx", A);
          ellipse.setAttribute("ry", B);
          ellipse.setAttribute("fill", "rgba(0,0,0,0.4)");
          ellipse.setAttribute("stroke", "black");
          ellipse.setAttribute(
            "transform",
            `rotate(${angle + 90}, ${x}, ${y})`
          );
          ellipse.setAttribute("data-row-index", i);

          // Add event listener to display tooltip when mouse hovers over ellipse
          ellipse.addEventListener(
            "mouseover",
            (function (x, y, radius, ellipticity, angle) {
              return function (event) {
                this.setAttribute("stroke", "red");
                this.setAttribute("stroke-width", "2");
                var tooltip = document.getElementById("tooltip");
                tooltip.style.display = "block";
                tooltip.style.left = event.pageX + "px";
                tooltip.style.top = event.pageY + "px";
                tooltip.innerHTML = `x: ${(x - 250 - 65) * 8}, y: ${
                  (y - 250 - 10) * -8
                }, size: ${
                  radius * 2
                }, ellipticity: ${ellipticity}, angle: ${angle}`;
              };
            })(x, y, radius, ellipticity, angle)
          );

          // Remove tooltip and highlighting when mouse leaves ellipse
          ellipse.addEventListener("mouseout", function () {
            this.setAttribute("stroke", "black");
            this.setAttribute("stroke-width", "1");
            var tooltip = document.getElementById("tooltip");
            tooltip.style.display = "none";
          });

          // Add event listener to highlight table row when ellipse is clicked
          ellipse.addEventListener("click", function () {
            // Remove highlight from any previously highlighted row
            var highlightedRow = document.querySelector(".highlight");
            if (highlightedRow) {
              highlightedRow.classList.remove("highlight");
            }

            // Remove highlight from any previously highlighted ellipse
            var highlightedEllipse =
              document.querySelector(".highlight-ellipse");
            if (highlightedEllipse) {
              highlightedEllipse.classList.remove("highlight-ellipse");
              highlightedEllipse.setAttribute("stroke", "black");
              highlightedEllipse.setAttribute("stroke-width", "1");
            }

            // Highlight the corresponding row in the table
            var rowIndex = this.getAttribute("data-row-index");
            table.rows[rowIndex].classList.add("highlight");

    // Highlight the corresponding row in the table
    var rowIndex = this.getAttribute("data-row-index");
    var selectedRow = table.rows[rowIndex];
 
    if (selectedRow) {
        selectedRow.classList.add("highlight");
    }
       var highlightedRow = document.querySelector('.highlight');
     // Scroll the table to the highlighted row
     //console.log(highlightedRow);
                highlightedRow.scrollIntoView({
            behavior: "smooth",
            block: "center",
            inline: "nearest"
        });




            // Highlight the corresponding ellipse
            this.classList.add("highlight-ellipse");
            this.setAttribute("stroke", "red");
            this.setAttribute("stroke-width", "2");
          });

          svg.appendChild(ellipse);
        }
*/
        // Add event listener to highlight ellipse when table row is clicked
        Array.from(table.rows).forEach((row, index) => {
          row.addEventListener("click", function () {
            // Remove highlight from any previously highlighted ellipse
            var highlightedEllipse =
              document.querySelector(".highlight-ellipse");
            if (highlightedEllipse) {
              highlightedEllipse.classList.remove("highlight-ellipse");
              highlightedEllipse.setAttribute("stroke", "black");
              highlightedEllipse.setAttribute("stroke-width", "1");
            }

            // Remove highlight from any previously highlighted row
            var highlightedRow = document.querySelector(".highlight");
            if (highlightedRow) {
              highlightedRow.classList.remove("highlight");
            }

            // Highlight the corresponding ellipse
            var ellipse = svg.querySelector(
              `ellipse[data-row-index="${index}"]`
            );
            if (ellipse) {
              ellipse.classList.add("highlight-ellipse");
              ellipse.setAttribute("stroke", "red");
              ellipse.setAttribute("stroke-width", "2");
            }

            // Highlight the clicked row
            this.classList.add("highlight");


            
          });
        });
        
      }

      function analyzeBinggeliEffect(data) {
        var svg = document.getElementById("mySVG");
        svg.innerHTML = ""; // Очистити SVG
        drawLinesAndText(); // Функція для відображення сітки та тексту

        const resultsDiv = document.getElementById("resultsBinggeli");
        resultsDiv.innerHTML = "";

        const ResizeM = parseFloat(
          document.getElementById("BinggeliResizeM").value
        );
        const eLimit = parseFloat(
          document.getElementById("BinggelieLimit").value
        );
        const mLimit = parseFloat(
          document.getElementById("BinggelimLimit").value
        );
        const angleTolerance =
          parseFloat(document.getElementById("AngleTolerance").value) || 10; // Додана змінна для допустимого відхилення кута
        const showOutOfFilterGalaxies = document.getElementById(
          "BinggelishowOutOfFilterGalaxies"
        ).checked;
const countBins = parseFloat(
          document.getElementById("BinggeCountBins").value
        );
        // Функція для розрахунку відстані між двома точками
        function distance(x1, y1, x2, y2) {
          return Math.sqrt((x2 - x1) ** 2 + (y2 - y1) ** 2);
        }

        const processedPairs = new Set();

         const cosTetaValues = [];

        // Фільтруємо дані
        const filteredData = data.filter(
          (point) => point.E > eLimit && point.m > mLimit
        );
        const outOfFilterData = data.filter(
          (point) => !(point.E > eLimit && point.m > mLimit)
        );

        // Проходимо по кожній точці
        filteredData.forEach((point, index) => {
          let minDistance = Infinity;
          let closestPoint = null;

          // Знаходимо найближчу точку до поточної
          for (let i = 0; i < filteredData.length; i++) {
            if (i !== index) {
              const dist = distance(
                point.x,
                point.y,
                filteredData[i].x,
                filteredData[i].y
              );
              if (dist < minDistance) {
                minDistance = dist;
                closestPoint = filteredData[i];
              }
            }
          }

          if (closestPoint) {
            // Унікальний ключ для пари точок
            const pairKey = `${Math.min(point.i, closestPoint.i)}-${Math.max(
              point.i,
              closestPoint.i
            )}`;

            if (!processedPairs.has(pairKey)) {
              // Обчислюємо напрямок на сусіда
              const deltaX =
                (closestPoint.x - 250 - 65) * 8 - (point.x - 250 - 65) * 8;
              const deltaY =
                (closestPoint.y - 250 - 10) * -8 - (point.y - 250 - 10) * -8;
              const directionAngle = Math.sqrt(
                Math.pow(deltaX, 2) + Math.pow(deltaY, 2)
              ); //Math.atan2(deltaY, deltaX); // * (180 / Math.PI); // Кут напряму на сусіда в градусах
              const directionRad = Math.acos(deltaY / directionAngle);
              const pointPARad = (point.PA * Math.PI) / 180;
              const cosTeta = Math.abs(
                Math.cos(pointPARad) * Math.cos(directionRad) +
                  Math.sin(pointPARad) * Math.sin(directionRad)
              );

              // Обчислюємо різницю між орієнтацією галактики і напрямком на сусіда
              const angleDifference = Math.abs(
                point.PA - directionRad * (180 / Math.PI)
              );
              const adjustedAngleDifference =
                Math.acos(cosTeta) * (180 / Math.PI);
 
              // Перевіряємо, чи різниця кута менша за допустиме відхилення
              if (adjustedAngleDifference <= angleTolerance) {
                 cosTetaValues.push(cosTeta);
                resultsDiv.innerHTML += `<br><b>Galaxy  # (${point.i})</b>: (${
                  (point.x - 250 - 65) * 8
                }, ${(point.y - 250 - 10) * -8}), <br>
                          The nearest galaxy to it (<b># ${
                            closestPoint.i
                          }</b>): (${(closestPoint.x - 250 - 65) * 8}, ${
                  (closestPoint.y - 250 - 10) * -8
                }), <br>
                          Direction angle: ${(
                            directionRad *
                            (180 / Math.PI)
                          ).toFixed(2)}°, <br>
                          Orientation of the galaxy: ${point.PA}°, <br>
                          Orientation of the nearest galaxy: ${
                            closestPoint.PA
                          }°, <br>
                          Cos(θ): ${cosTeta.toFixed(2)} rad,  <br>
                          Angle Difference (θ): ${adjustedAngleDifference.toFixed(
                            2
                          )}° <br>`;

                // Візуалізуємо еліпси
                const ellipse = createCircleViewe(
                  point.i,
                  point.x,
                  point.y,
                  point.m / 2 + ResizeM,
                  point.E,
                  point.PA,
                  "black",
                  `rgba(${0},${255},${0}, ${ 0.5})`,
                  point.BG
                );//`rgba(${point.BG*25 + 0},${point.BG*25 + 0},${point.BG*25 + 0}, ${point.BG*1 + 0.4})`
                const ellipse2 = createCircleViewe(
                  closestPoint.i,
                  closestPoint.x,
                  closestPoint.y,
                  closestPoint.m / 2 + ResizeM,
                  closestPoint.E,
                  closestPoint.PA,
                  "black",
                  `rgba(${0},${255},${0}, ${ 0.5})`,
                  point.BG
                );

                svg.appendChild(ellipse);
                svg.appendChild(ellipse2);
                // Візуалізуємо лінію, що вказує напрямок
                const line = document.createElementNS(
                  "http://www.w3.org/2000/svg",
                  "line"
                );
                line.setAttribute("x1", point.x);
                line.setAttribute("y1", point.y);
                line.setAttribute("x2", closestPoint.x);
                line.setAttribute("y2", closestPoint.y);
                line.setAttribute("stroke", "red");
                line.setAttribute("stroke-width", "2");
                svg.appendChild(line);
              }

              // Додаємо оброблену пару точок до набору
              processedPairs.add(pairKey);
            }
          }
        });

        const ShowAllGalaxies = document.getElementById(
          "BinggeShowAllGalaxies"
        ).checked;
        if (ShowAllGalaxies) {
          filteredData.forEach((point) => {
            const ellipse = createCircleViewe(
              point.i,
              point.x,
              point.y,
              point.m / 2 + ResizeM,
              point.E,
              point.PA,
              "black",
`rgba(${0},${0},${0}, ${0.1})`,
point.BG
            );
            svg.appendChild(ellipse);
          });
        }

        if (showOutOfFilterGalaxies) {
          outOfFilterData.forEach((point) => {
            const ellipse = createCircleViewe(
              point.i,
              point.x,
              point.y,
              point.m / 2 + ResizeM,
              point.E,
              point.PA,
              "black",
              `rgba(${0},${0},${0}, ${0.1})`,
              point.BG
            );
            svg.appendChild(ellipse);
          });
        }
        drawHistogramBinggeli(cosTetaValues, countBins);
      }

      function drawHistogramBinggeli(cosTetaValues, numBins) {
    const svg = document.getElementById("histogramSVG");
    svg.innerHTML = "";

    const width = 575;
    const height = 545;
    const margin = 55;

    // Розподіл значень cosTeta на біни
    const binWidth = 1 / numBins; // Діапазон [0, 1] розділений на кількість бін
    const bins = new Array(numBins).fill(0);

    cosTetaValues.forEach((value) => {
        const binIndex = Math.floor(value / binWidth);
        if (binIndex >= 0 && binIndex < numBins) {
            bins[binIndex]++;
        }
    });

    // Масштабування значень бінів
    const totalGalaxies = cosTetaValues.length;
    const barWidth = (width - margin * 2) / numBins;
    const maxBinValue = 0.5;

    // Створення осей X і Y
    const xAxis = document.createElementNS("http://www.w3.org/2000/svg", "line");
    xAxis.setAttribute("x1", margin);
    xAxis.setAttribute("y1", height - margin);
    xAxis.setAttribute("x2", width - margin);
    xAxis.setAttribute("y2", height - margin);
    xAxis.setAttribute("stroke-width", "2");
    xAxis.setAttribute("stroke", "black");
    svg.appendChild(xAxis);

    const yAxis = document.createElementNS("http://www.w3.org/2000/svg", "line");
    yAxis.setAttribute("x1", margin);
    yAxis.setAttribute("y1", margin);
    yAxis.setAttribute("x2", margin);
    yAxis.setAttribute("y2", height - margin);
    yAxis.setAttribute("stroke-width", "2");
    yAxis.setAttribute("stroke", "black");
    svg.appendChild(yAxis);

    const yScale = maxBinValue > 0 ? (height - 2 * margin) / maxBinValue : 0;


// Додавання підписів осі Y, тік та сітки
    const yAxisSteps = 5;
    for (let i = 0; i < yAxisSteps; i++) {
        const y = height - margin - ((height - margin * 2) / yAxisSteps) * i;
        const relativeFrequency = (i * 0.1).toFixed(2);

        // Підписи
        const text = document.createElementNS("http://www.w3.org/2000/svg", "text");
        text.setAttribute("x", margin - 10);
        text.setAttribute("y", y + 3);
        text.setAttribute("text-anchor", "end");
        text.setAttribute("font-size", "18");
        text.setAttribute("font-family", "Arial");
        text.textContent = relativeFrequency;
        svg.appendChild(text);

        // Тіки
        const tick = document.createElementNS("http://www.w3.org/2000/svg", "line");
        tick.setAttribute("x1", margin - 5);
        tick.setAttribute("y1", y);
        tick.setAttribute("x2", margin);
        tick.setAttribute("y2", y);
        tick.setAttribute("stroke", "black");
        svg.appendChild(tick);

        // Сітка
        const gridLine = document.createElementNS("http://www.w3.org/2000/svg", "line");
        gridLine.setAttribute("x1", margin);
        gridLine.setAttribute("y1", y);
        gridLine.setAttribute("x2", width - margin);
        gridLine.setAttribute("y2", y);
        gridLine.setAttribute("stroke", "lightgray");
        gridLine.setAttribute("stroke-dasharray", "2,2");
        svg.appendChild(gridLine);
    }


    // Додавання стовпців гістограми
    bins.forEach((binValue, index) => {
        const rectHeight = (binValue / totalGalaxies) * yScale;

        const rect = document.createElementNS("http://www.w3.org/2000/svg", "rect");
        rect.setAttribute("x", margin + index * barWidth);
        rect.setAttribute("y", height - margin - rectHeight);
        rect.setAttribute("width", barWidth); // Ширина стовпців з проміжком
        rect.setAttribute("height", rectHeight);
        rect.setAttribute("fill", "#ccc");
        rect.setAttribute("stroke", "#000");

        // Tooltip (title attribute)
        rect.setAttribute("title", `f: ${(binValue / totalGalaxies).toFixed(3)}`);

        // Mouseover event listener for tooltip
        rect.addEventListener("mouseover", (event) => {
            const tooltip = document.getElementById("tooltip");
            tooltip.textContent = `f: ${(binValue / totalGalaxies).toFixed(3)}`;
            tooltip.style.display = "block";
            tooltip.style.top = `${event.clientY}px`;
            tooltip.style.left = `${event.clientX}px`;
            rect.setAttribute("fill", "gray");
        });

        // Mouseout event listener to hide tooltip
        rect.addEventListener("mouseout", () => {
            const tooltip = document.getElementById("tooltip");
            tooltip.style.display = "none";
            rect.setAttribute("fill", "#ccc");
        });

        svg.appendChild(rect);
    });

    // Додавання підписів осі X та тік
    for (let i = 0; i <= numBins; i++) {
        const x = margin + i * barWidth;

        // Підписи
        const text = document.createElementNS("http://www.w3.org/2000/svg", "text");
        text.setAttribute("x", x);
        text.setAttribute("y", height - margin + 25);
        text.setAttribute("text-anchor", "middle");
        text.setAttribute("font-size", "18");
        text.setAttribute("font-family", "Arial");
        //if (i % 2 == 0) 
        if(numBins<10)
        text.textContent = (i * binWidth).toFixed(2);
      else if(numBins==10) text.textContent = (i * binWidth).toFixed(1);  else if (i % 2 == 0) text.textContent = (i * binWidth).toFixed(3);
        svg.appendChild(text);

        // Тіки
        const tick = document.createElementNS("http://www.w3.org/2000/svg", "line");
        tick.setAttribute("x1", x);
        tick.setAttribute("y1", height - margin);
        tick.setAttribute("x2", x);
        tick.setAttribute("y2", height - margin + 5);
        tick.setAttribute("stroke", "black");
        svg.appendChild(tick);
    }

    

    // Додавання підписів осей
    const xAxisLabel = document.createElementNS("http://www.w3.org/2000/svg", "text");
    xAxisLabel.setAttribute("x", width / 2);
    xAxisLabel.setAttribute("y", height - margin / 2 + 20);
    xAxisLabel.setAttribute("text-anchor", "middle");
    xAxisLabel.setAttribute("font-size", "22");
    xAxisLabel.setAttribute("font-family", "Arial");
    xAxisLabel.setAttribute("style", "font-weight: bold; font-style: italic;");
    xAxisLabel.textContent = "cos(θ)";
    svg.appendChild(xAxisLabel);

    const yAxisLabel = document.createElementNS("http://www.w3.org/2000/svg", "text");
    yAxisLabel.setAttribute("x", margin - 25);
    yAxisLabel.setAttribute("y", margin + 30);
    yAxisLabel.setAttribute("text-anchor", "middle");
    yAxisLabel.setAttribute("font-size", "22");
    yAxisLabel.setAttribute("font-family", "Arial");
    yAxisLabel.setAttribute("style", "font-weight: bold; font-style: italic;");
    yAxisLabel.textContent = "f";
    svg.appendChild(yAxisLabel);

    // Tooltip element
    const tooltip = document.createElement("div");
    tooltip.setAttribute("id", "tooltip");
    tooltip.style.position = "absolute";
    tooltip.style.display = "none";
    tooltip.style.background = "rgba(0, 0, 0, 0.7)";
    tooltip.style.color = "#fff";
    tooltip.style.padding = "5px";
    document.body.appendChild(tooltip);
}

document.getElementById('help').addEventListener('click', function() {
  const modal = document.getElementById('myModal');
  if (modal) {
    modal.classList.remove("hidden");
    modal.classList.add("flex");
  }
});

document.querySelector('#myModal .close').addEventListener('click', function() {
  const modal = document.getElementById('myModal');
  if (modal) {
    modal.classList.add("hidden");
    modal.classList.remove("flex");
  }
});

document.getElementById('myModal').addEventListener('click', function(event) {
  if (event.target.classList.contains('modal-backdrop') || event.target.id === 'myModal') {
    this.classList.add("hidden");
    this.classList.remove("flex");
  }
});


  // === 3D Конфігурація ===
      let currentGalaxies = [];
      let neighborCount = 10;
      const neighborInput = document.getElementById("neighborCount");
      if (neighborInput) {
        neighborCount = parseInt(neighborInput.value, 10) || 10;
        neighborInput.addEventListener("change", (e) => {
          neighborCount = Math.max(1, parseInt(e.target.value, 10) || 10);
        });
      }

      document.getElementById("refreshBtn").addEventListener("click", () => {
        const galaxies = buildGalaxiesFromTable();
        currentGalaxies = galaxies;
        update3DPlot(galaxies);
        document.getElementById("info").style.display = "none";
      });


            // ==== Функція побудови масиву галактик з таблиці ====
      function getDataFromTable3d() {
        const data = [];
        const rows = document.querySelectorAll("#editableTable tr");
        rows.forEach((row, index) => {
          if (index === 0) return; // Пропустити заголовок
          const cells = row.querySelectorAll("td");
          if (cells.length < 7) return; // захист
          const i = parseFloat(cells[0].textContent) || null;
          if (i === null) return;
          const xStr = cells[1].textContent.trim();
          if (xStr === "") return;
          const x_raw = parseFloat(cells[1].textContent) || 0;
          const y_raw = parseFloat(cells[2].textContent) || 0;

          const x = x_raw ;
          const y = y_raw ;

          // Z: якщо є (наприклад у майбутньому додаси), спробуй взяти, інакше випадкове
          let z;
          if (cells[7]) {
            const zVal = parseFloat(cells[7].textContent);
            if (!isNaN(zVal)) z = zVal;
          }
          if (z === undefined) {
            // Генеруємо випадкове у тому ж масштабі, що і x,y
            //z = (Math.random() - 0.5) * 4000;
            z = 0 + randNormal(0, 500);

cells[7].textContent = Math.round(z);

          }

          const m = parseFloat(cells[3].textContent.replace(",", ".")) || 0;
          const E = parseFloat(cells[4].textContent.replace(",", ".")) || 0;
          const PA = parseFloat(cells[5].textContent.replace(",", ".")) || 0;
          const BG = parseFloat(cells[6].textContent.replace(",", ".")) || 0;

          data.push({ i, x, y, z, m, E, PA, BG });
        });
        return data;
      }


      function buildGalaxiesFromTable() {
        const raw = getDataFromTable3d();
        // Приводимо до формату, який використовує візуалізація
        return raw.map((g, idx) => ({
          id: g.i != null ? `G${g.i}` : `G_auto_${idx}`,
          name: `Galaxy ${g.i != null ? g.i : idx}`,
          x: g.x,
          y: g.y,
          z: g.z,
          // someProperty: наприклад, можна брати відстань від центру або еліптичність
          someProperty: Math.sqrt(g.x * g.x + g.y * g.y + g.z * g.z),
          // зберегти додаткові метрики для потенційного розширення
          raw: { m: g.m, E: g.E, PA: g.PA, BG: g.BG },
        }));
      }

      // ==== Візуалізація ====
      function init3DPlot(galaxies) {
        currentGalaxies = galaxies;
        createOrUpdatePlot(galaxies, true);
      }

      function update3DPlot(galaxies) {
        createOrUpdatePlot(galaxies, false);
      }

      function createOrUpdatePlot(galaxies, initial) {
        const trace = {
          x: galaxies.map((g) => g.x),
          y: galaxies.map((g) => g.y),
          z: galaxies.map((g) => g.z),
          mode: "markers",
          type: "scatter3d",
          text: galaxies.map((g) => g.name),
          hovertemplate:
            "<b>%{text}</b><br>" +
            "X: %{x:.2f}<br>Y: %{y:.2f}<br>Z: %{z:.2f}<extra></extra>",
          marker: {
            size: 4,
            opacity: 0.8,
            color: galaxies.map((g) => g.someProperty),
            colorscale: "Viridis",
            showscale: true,
            colorbar: { title: "Distance" },
          },
          customdata: galaxies.map((g) => g.id),
        };

        // const layout = {
        //   scene: {
        //     xaxis: { title: "X", range: [-2000, 2000] },
        //     yaxis: { title: "Y", range: [-2000, 2000] },
        //     zaxis: { title: "Z", range: [-2000, 2000] },
        //   },
        //   margin: { l: 0, r: 0, b: 0, t: 0 },
        //   hovermode: "closest",
        // };
        const isDark = document.documentElement.classList.contains('dark');
        const layout = {
          paper_bgcolor: isDark ? 'rgba(0,0,0,0)' : 'rgba(255,255,255,1)',
          plot_bgcolor: isDark ? 'rgba(0,0,0,0)' : 'rgba(255,255,255,1)',
          scene: {
            xaxis: { 
              title: { text: "X", font: { color: isDark ? '#fff' : '#444' } }, 
              range: [-2000, 2000],
              gridcolor: isDark ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.1)',
              tickfont: { color: isDark ? '#fff' : '#444' }
            },
            yaxis: { 
              title: { text: "Y", font: { color: isDark ? '#fff' : '#444' } }, 
              range: [-2000, 2000],
              gridcolor: isDark ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.1)',
              tickfont: { color: isDark ? '#fff' : '#444' }
            },
            zaxis: { 
              title: { text: "Z", font: { color: isDark ? '#fff' : '#444' } }, 
              range: [-2000, 2000],
              gridcolor: isDark ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.1)',
              tickfont: { color: isDark ? '#fff' : '#444' }
            },
            aspectmode: 'cube',
            camera: {
              eye: { x: 0, y: 0, z: 2 },
              center: { x: 0, y: 0, z: 0 },
              up: { x: 0, y: 1, z: 0 }
            }
          },
          margin: { l: 0, r: 0, b: 0, t: 0 },
          hovermode: 'closest',
        };

        const plot = document.getElementById("plot3d");
        if (initial) {
          Plotly.newPlot(plot, [trace], layout, { responsive: true });
        } else {
          Plotly.react(plot, [trace], layout);
        }

        attachInteraction(plot, galaxies);
      }

      function attachInteraction(plot, galaxies) {
        // Очікується, що подія уже підписана тільки один раз; скидаємо старі, щоб уникнути дублювання
        plot.removeAllListeners?.("plotly_click");
        plot.removeAllListeners?.("plotly_clickoutside");

        // plot.on("plotly_click", (eventData) => {
        //   if (!eventData.points || !eventData.points.length) return;
        //   const point = eventData.points[0];
        //   const clickedId = point.customdata;
        //   const clickedGalaxy = galaxies.find((g) => g.id === clickedId);
        //   if (!clickedGalaxy) return;

        //   const neighbors = findNearestNeighbors(
        //     clickedGalaxy,
        //     galaxies,
        //     neighborCount
        //   );

        //   const colors = galaxies.map((g) => {
        //     if (g.id === clickedId) return "red";
        //     if (neighbors.some((n) => n.id === g.id)) return "orange";
        //     return "rgba(100,100,200,0.5)";
        //   });
        //   const sizes = galaxies.map((g) =>
        //     g.id === clickedId
        //       ? 8
        //       : neighbors.some((n) => n.id === g.id)
        //       ? 6
        //       : 4
        //   );

        //   Plotly.restyle(plot, {
        //     "marker.color": [colors],
        //     "marker.size": [sizes],
        //   });

        //   const infoDiv = document.getElementById("info");
        //   infoDiv.style.display = "block";
        //   infoDiv.innerHTML = `
        //   <strong>Обрана галактика:</strong> ${clickedGalaxy.name} <br>
        //   X=${clickedGalaxy.x.toFixed(2)}, Y=${clickedGalaxy.y.toFixed(
        //     2
        //   )}, Z=${clickedGalaxy.z.toFixed(2)}<br>
        //   <strong>Найближчі ${neighbors.length} сусідів:</strong><br>
        //   ${neighbors
        //     .map(
        //       (n) => `${n.name} (д/п=${distance(clickedGalaxy, n).toFixed(2)})`
        //     )
        //     .join("<br>")}
        // `;
        // });

        plot.on("plotly_clickoutside", () => {
          Plotly.restyle(plot, {
            "marker.color": [galaxies.map((g) => g.someProperty)],
            "marker.size": [galaxies.map((_) => 4)],
          });
          document.getElementById("info").style.display = "none";
        });
      }

      // ==== Утиліти ====
      function distance(a, b) {
        return Math.sqrt(
          (a.x - b.x) ** 2 + (a.y - b.y) ** 2 + (a.z - b.z) ** 2
        );
      }

      function findNearestNeighbors(target, all, N) {
        return all
          .filter((g) => g.id !== target.id)
          .map((g) => ({ ...g, d: distance(target, g) }))
          .sort((a, b) => a.d - b.d)
          .slice(0, N);
      }

  const trigger = document.getElementById('btn_generateCluster');
  const modal = document.getElementById('clusterModal');
  
  if (trigger && modal) {
    const closeBtn = modal.querySelector('.close-btn');
    
    trigger.addEventListener('click', () => {
      modal.classList.remove('hidden');
      modal.classList.add('flex');
      modal.setAttribute('aria-hidden', 'false');
      const input = document.getElementById('clusterCount');
      if (input) input.focus();
    });

    if (closeBtn) closeBtn.addEventListener('click', hideModal);
    
    modal.addEventListener('click', (e) => {
      if (e.target.classList.contains('modal-backdrop')) hideModal();
    });
  }

  function hideModal() {
    const modal = document.getElementById('clusterModal');
    if (modal) {
      modal.classList.add('hidden');
      modal.classList.remove('flex');
      modal.setAttribute('aria-hidden', 'true');
    }
  }

  // Повторюємо генерацію (можеш підставити свою реалізацію)
  function randNormal(mean = 0, sigma = 1) {
    let u = 0, v = 0;
    while (u === 0) u = Math.random();
    while (v === 0) v = Math.random();
    return mean + Math.sqrt(-2.0 * Math.log(u)) * Math.cos(2.0 * Math.PI * v) * sigma;
  }

  function ensureTableHeader() {
    const table = document.getElementById('editableTable');
    if (!table) return;
    if (table.querySelector('thead')) return;
    const thead = document.createElement('thead');
    const tr = document.createElement('tr');
    ['i','X','Y','Z','m','E','PA','BG'].forEach(h => {
      const th = document.createElement('th');
      th.textContent = h;
      tr.appendChild(th);
    });
    thead.appendChild(tr);
    table.prepend(thead);
  }

  function addGalaxyRow(index, x, y, z) {
    const table = document.getElementById('editableTable');
    if (!table) return;
    let tbody = table.querySelector('tbody');
    if (!tbody) {
      tbody = document.createElement('tbody');
      table.appendChild(tbody);
    }
    const tr = document.createElement('tr');
    const makeCell = (text) => {
      const td = document.createElement('td');
      td.contentEditable = 'true';
      td.textContent = text;
      return td;
    };
    tr.appendChild(makeCell(index)); // i
    tr.appendChild(makeCell(x.toFixed(2)));
    tr.appendChild(makeCell(y.toFixed(2)));
   
    // порожні m,E,PA,BG
    tr.appendChild(makeCell(7));
    tr.appendChild(makeCell(0));
    tr.appendChild(makeCell(0));
    tr.appendChild(makeCell(0));
     tr.appendChild(makeCell(z.toFixed(2)));
    tbody.appendChild(tr);
  }

  function generateCluster() {
    ensureTableHeader();
    const n = parseInt(document.getElementById('clusterCount').value,10);
    const sigma = parseFloat(document.getElementById('sigma').value);
    if (isNaN(n) || n < 1) { alert('Невірна кількість'); return; }
    if (isNaN(sigma) || sigma <= 0) { alert('Невірний σ'); return; }

    // Очистити попереднє
    const table = document.getElementById('editableTable');
    let tbody = table.querySelector('tbody');
    if (tbody) tbody.remove();
    tbody = document.createElement('tbody');
    table.appendChild(tbody);

    for (let i = 0; i < n; i++) {
      const x = randNormal(0, sigma);
      const y = randNormal(0, sigma);
      const z = randNormal(0, sigma);
      addGalaxyRow(i+1, x, y, z);
    }
    hideModal();
    // тут можна викликати оновлення візуалізації: drawEllipses() або іншу
    if (typeof drawEllipses === 'function') {
      drawEllipses();
  
    }
        document.getElementById('refreshBtn').click();
  }

  const genBtn = document.getElementById('generateClusterBtn');
  if (genBtn) {
    genBtn.addEventListener('click', generateCluster);
  }


  function exportTableToTxt(filename = 'galaxies.txt') {
  const table = document.getElementById('editableTable');
  if (!table) {
    alert('Таблиця не знайдена');
    return;
  }

  const lines = [];

  // Беремо усі рядки <tr>, ігноруємо перший (заголовок)
  const allRows = Array.from(table.querySelectorAll('tr'));
  if (allRows.length <= 1) {
    alert('Немає даних для експорту');
    return;
  }

  // Проходимо по рядках, починаючи з другого
  allRows.slice(1).forEach(row => {
    const cells = Array.from(row.querySelectorAll('td'));
    if (cells.length <= 1) return; // нема чого писати після відсікання першого стовпця
    // Пропускаємо перший стовпець (cells[0])
    const values = cells.slice(1).map(c => c.textContent.trim());
    lines.push(values.join('\t'));
  });

  const blob = new Blob([lines.join('\n')], { type: 'text/plain;charset=utf-8' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  a.remove();
  URL.revokeObjectURL(url);
}

document.getElementById('saveTxtBtn').addEventListener('click', () => {
  exportTableToTxt('cluster_cartography.txt');
});


// Relocate coordinate data from 3d to 2d


      function normalize(v) {
        const length = Math.sqrt(v.x * v.x + v.y * v.y + v.z * v.z);
        return { x: v.x / length, y: v.y / length, z: v.z / length };
      }

      function cross(a, b) {
        return {
          x: a.y * b.z - a.z * b.y,
          y: a.z * b.x - a.x * b.z,
          z: a.x * b.y - a.y * b.x,
        };
      }

      function dot(a, b) {
        return a.x * b.x + a.y * b.y + a.z * b.z;
      }

      function subtract(a, b) {
        return { x: a.x - b.x, y: a.y - b.y, z: a.z - b.z };
      }

      function projectPointToCamera(point, camera) {
        const eye = camera.eye;
        const center = camera.center;
        const upVec = camera.up;

        // 1. Forward = center - eye
        const forward = normalize(subtract(center, eye));

        // 2. Right = forward × up
        const right = normalize(cross(forward, upVec));

        // 3. Recomputed up = right × forward
        const up = normalize(cross(right, forward));

        // 4. Vector from eye to point
        const p = subtract(point, eye);

        // 5. Project to camera axes
        const x = dot(p, right);
        const y = dot(p, up);
        const z = dot(p, forward); // Depth

        return { x, y, z };
      }

      function getAllProjectedPoints(gd) {
        const sceneKey = Object.keys(gd._fullLayout).find((k) =>
          k.startsWith("scene")
        );
        const camera = gd._fullLayout[sceneKey].camera;

        const projected = [];

        gd.data.forEach((trace, tIndex) => {
          if (trace.type !== "scatter3d") return;

          for (let i = 0; i < trace.x.length; i++) {
            const point = {
              x: trace.x[i],
              y: trace.y[i],
              z: trace.z[i],
            };

            const proj = projectPointToCamera(point, camera);

            projected.push({
              index: i,
              trace: tIndex,
              data: point,
              screen: proj, // x, y — координати у площині камери
            });
          }
        });

        return projected;
      }
      function log2D() {
        const gd = document.getElementById("plot3d");
        const projected = getAllProjectedPoints(gd);

        console.log("Projected points onto camera plane:");
        var kol=0;
        console.table(
          projected.map((p) => ({
            i: p.index,
            x: p.screen.x.toFixed(2),
            y: p.screen.y.toFixed(2),
            z: p.screen.z.toFixed(2),
          }
          ))
        );
       // export2DToTxt();
        var tableBody = document.querySelector("#editableTable tbody");
        tableBody.innerHTML = ""; // Clear existing table

projected.forEach(p => {
  const i = p.index;
  const x = parseFloat(p.screen.x.toFixed(2));
  const y = parseFloat(p.screen.y.toFixed(2));
  const z = parseFloat(p.screen.z.toFixed(2));

  addGalaxyRow(i+1, x, y, z);
});
     drawEllipses();   
      }
  

// Resizable Panels Logic for Desktop
(function initResizablePanels() {
  const leftResizer = document.getElementById('resizerLeft');
  const rightResizer = document.getElementById('resizerRight');
  const leftPanel = document.getElementById('leftPanel');
  const rightPanel = document.getElementById('rightPanel');
  const centerPanel = document.getElementById('centerPanel');
  const mainContainer = document.getElementById('mainContainer');

  if (!leftResizer || !rightResizer) return;

  let activeResizer = null;

  function onMouseDown(e) {
    activeResizer = e.currentTarget.id;
    document.body.style.cursor = 'col-resize';
    document.body.classList.add('resizing');
    document.addEventListener('mousemove', onMouseMove);
    document.addEventListener('mouseup', onMouseUp);
    
    // Prevent interaction with 3D plot during resize for performance
    if (centerPanel) centerPanel.style.pointerEvents = 'none';
  }

  function onMouseMove(e) {
    if (!activeResizer) return;

    const containerRect = mainContainer.getBoundingClientRect();
    const mouseX = e.clientX - containerRect.left;
    const containerWidth = containerRect.width;

    if (activeResizer === 'resizerLeft') {
      let newLeftWidth = (mouseX / containerWidth) * 100;
      // Constraints: 10% - 70%
      if (newLeftWidth < 10) newLeftWidth = 10;
      if (newLeftWidth > 70) newLeftWidth = 70;
      
      leftPanel.style.flexBasis = newLeftWidth + '%';
    } else if (activeResizer === 'resizerRight') {
      let newRightWidth = ((containerWidth - mouseX) / containerWidth) * 100;
      // Constraints: 10% - 70%
      if (newRightWidth < 10) newRightWidth = 10;
      if (newRightWidth > 70) newRightWidth = 70;
      
      rightPanel.style.flexBasis = newRightWidth + '%';
    }
    
    // Debounced Plotly resize
    if (window.Plotly && document.getElementById('plot3d')) {
       Plotly.Plots.resize(document.getElementById('plot3d'));
    }
  }

  function onMouseUp() {
    activeResizer = null;
    document.body.style.cursor = '';
    document.body.classList.remove('resizing');
    document.removeEventListener('mousemove', onMouseMove);
    document.removeEventListener('mouseup', onMouseUp);
    if (centerPanel) centerPanel.style.pointerEvents = '';
  }

  leftResizer.addEventListener('mousedown', onMouseDown);
  rightResizer.addEventListener('mousedown', onMouseDown);
})();
