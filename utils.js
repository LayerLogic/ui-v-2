export const log = (message, type = "info") => {
  const logEntry = document.createElement("div");
  logEntry.textContent = `[${type}] ${message}`;
  logEntry.style.color = color(type);

  const consoleElement = document.getElementById("console");
  consoleElement.appendChild(logEntry);
  consoleElement.scrollTop = consoleElement.scrollHeight;
};

function color(type) {
  switch (type) {
    case "error":
      return "red";
    case "success":
      return "green";
    default:
      return "black";
  }
}

export const saveGateToTxt = (data, file_name) => {
  if (data.length === 0) {
    log("No data to save!", "error");
    return;
  }

  // Create text content with consistent spacing
  let textContent = "Vg (V)\t\tX (mV)\t\tY (mV)\t\tI (uA)\t\tf (Hz)\n"; // Headers with tab separation
  // textContent += "-".repeat(40) + "\n"; // Separator line

  // Add data rows with proper formatting
  for (let i = 0; i < data.length; i++) {
    textContent += `${data[i]["Vg"].toFixed(2)}\t\t${data[i]["X"].toFixed(
      6
    )}\t\t${data[i]["Y"].toFixed(6)}\t\t${data[i]["I"].toFixed(6)}\t\t${data[i][
      "F"
    ].toFixed(6)}\n`;
  }

  // Add summary statistics
  // textContent += "\nSummary Statistics:\n";
  // textContent += "-".repeat(40) + "\n";
  // textContent += `Total Points: ${chartData.vgValues.length}\n`;
  // textContent += `Vg Range: ${Math.min(
  //   ...chartData.vgValues
  // )} to ${Math.max(...chartData.vgValues)}\n`;
  // textContent += `R1 Range: ${Math.min(...chartData.r1Values).toFixed(
  //   6
  // )} to ${Math.max(...chartData.r1Values).toFixed(6)} kΩ\n`;
  // textContent += `R2 Range: ${Math.min(...chartData.r2Values).toFixed(
  //   6
  // )} to ${Math.max(...chartData.r2Values).toFixed(6)} kΩ\n`;

  // Create blob and download link
  const blob = new Blob([textContent], {
    type: "text/plain;charset=utf-8",
  });
  const link = document.createElement("a");

  // Create filename with timestamp
  const timestamp = new Date().toISOString().replace(/[:.]/g, "-");
  const filename = `${file_name}_${timestamp}.txt`;

  // Trigger download
  if (window.navigator.msSaveOrOpenBlob) {
    // For IE
    window.navigator.msSaveBlob(blob, filename);
  } else {
    // For other browsers
    const url = window.URL.createObjectURL(blob);
    link.href = url;
    link.style.display = "none";
    link.setAttribute("download", filename);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    window.URL.revokeObjectURL(url);
  }

  log(`Data saved as ${filename}`, "success");
};

export const saveTimeToTxt = (data, file_name) => {
  if (data.length === 0) {
    log("No data to save!", "error");
    return;
  }

  // Create text content with consistent spacing
  let textContent = "Time (s)\t\tX (mV)\t\tY (mV)\t\tI (uA)\t\tf (Hz)\n";

  // Add data rows with proper formatting
  for (let i = 0; i < data.length; i++) {
    textContent += `${data[i]["t"].toFixed(2)}\t\t${data[i]["X"].toFixed(
      6
    )}\t\t${data[i]["Y"].toFixed(6)}\t\t${data[i]["I"].toFixed(6)}\t\t${data[i][
      "F"
    ].toFixed(6)}\n`;
  }

  // Add summary statistics
  // textContent += "\nSummary Statistics:\n";
  // textContent += "-".repeat(40) + "\n";
  // textContent += `Total Points: ${chartData.vgValues.length}\n`;
  // textContent += `Vg Range: ${Math.min(
  //   ...chartData.vgValues
  // )} to ${Math.max(...chartData.vgValues)}\n`;
  // textContent += `R1 Range: ${Math.min(...chartData.r1Values).toFixed(
  //   6
  // )} to ${Math.max(...chartData.r1Values).toFixed(6)} kΩ\n`;
  // textContent += `R2 Range: ${Math.min(...chartData.r2Values).toFixed(
  //   6
  // )} to ${Math.max(...chartData.r2Values).toFixed(6)} kΩ\n`;

  // Create blob and download link
  const blob = new Blob([textContent], {
    type: "text/plain;charset=utf-8",
  });
  const link = document.createElement("a");

  // Create filename with timestamp
  const timestamp = new Date().toISOString().replace(/[:.]/g, "-");
  const filename = `${file_name}_${timestamp}.txt`;

  // Trigger download
  if (window.navigator.msSaveOrOpenBlob) {
    // For IE
    window.navigator.msSaveBlob(blob, filename);
  } else {
    // For other browsers
    const url = window.URL.createObjectURL(blob);
    link.href = url;
    link.style.display = "none";
    link.setAttribute("download", filename);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    window.URL.revokeObjectURL(url);
  }

  log(`Data saved as ${filename}`, "success");
};

export const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms));
