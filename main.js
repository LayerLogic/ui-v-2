import { log, saveGateToTxt, saveTimeToTxt, sleep } from "./utils.js";
import { gateChartConfig, timeChartConfig } from "./chartsConfig.js";
import { SerialCommunication } from "./SerialCommunication.js";
import { GateAnalysis } from "./GateAnalysis.js";
import { TimeAnalysis } from "./TimeAnalysis.js";

document.addEventListener("DOMContentLoaded", () => {
  const vg = parseFloat(document.getElementById("gateV").value);
  const delay = parseFloat(document.getElementById("delay").value);
  const vgStep = parseFloat(document.getElementById("stepSize").value);
  const vgMin = parseFloat(document.getElementById("vgMin").value);
  const vgMax = parseFloat(document.getElementById("vgMax").value);

  const ctx = document.getElementById("myChart").getContext("2d");
  const ctx2 = document.getElementById("myChart2").getContext("2d");

  const gateChart = new Chart(ctx, gateChartConfig());
  const timeChart = new Chart(ctx2, timeChartConfig());

  document.getElementById("myChart").style.display = "none";
  document.getElementById("myChart2").style.display = "none";

  const serialComm = new SerialCommunication();
  const gateAnalysis = new GateAnalysis(
    serialComm,
    gateChart,
    vgStep,
    vgMin,
    vgMax
  );
  const timeAnalysis = new TimeAnalysis(serialComm, timeChart, vg, delay);

  // Event Listeners
  document
    .getElementById("connectButton")
    .addEventListener("click", () => serialComm.connect());

  document.getElementById("resetZoomButton").addEventListener("click", () => {
    if (gateAnalysis.isRunning) {
      gateChart.resetZoom();
    } else if (timeAnalysis.isRunning) {
      timeChart.resetZoom();
    }
  });

  document.getElementById("stopButton").addEventListener("click", () => {
    if (gateAnalysis.isRunning) {
      gateAnalysis.stop();
      document.getElementById("startTimeAnalysisButton").disabled = false;
    } else if (timeAnalysis.isRunning) {
      timeAnalysis.stop();
      document.getElementById("startGateAnalysisButton").disabled = false;
    }
  });

  document
    .getElementById("startGateAnalysisButton")
    .addEventListener("click", () => {
      document.getElementById("myChart").style.display = "block";
      document.getElementById("myChart2").style.display = "none";
      gateAnalysis.start();
      document.getElementById("startTimeAnalysisButton").disabled = true;
    });

  document
    .getElementById("startTimeAnalysisButton")
    .addEventListener("click", () => {
      document.getElementById("myChart").style.display = "none";
      document.getElementById("myChart2").style.display = "block";
      document.getElementById("myChart2").style.display = "100%";
      timeAnalysis.start();
      document.getElementById("startGateAnalysisButton").disabled = true;
    });

  document
    .getElementById("sendCommandsButton")
    .addEventListener("click", async () => {
      const commands = document
        .getElementById("commandsTextArea")
        .value.trim()
        .split("\n");
      for (const command of commands) {
        const req = await serialComm.sendCommand(command);
        log(req, "info");
        const res = await serialComm.read();
        log(res, "info");
        await new Promise((resolve) => setTimeout(resolve, 500));
      }
    });

  // Input handlers
  document.getElementById("stepSize").addEventListener("input", async (e) => {
    const vgStep = Math.abs(parseFloat(e.target.value)) || 0.03;
    await sleep(500);
    gateAnalysis.vg_step = vgStep;
  });

  document.getElementById("vgMin").addEventListener("input", async (e) => {
    let vgMin;
    log(e.target.value);
    if (e.target.value === "") {
      vgMin = -0.5;
    } else {
      vgMin = parseFloat(e.target.value);
    }
    await sleep(500);
    gateAnalysis.vg_min = vgMin;
  });

  document.getElementById("vgMax").addEventListener("input", async (e) => {
    let vgMax;
    if (e.target.value === "") {
      vgMax = 0.5;
    } else {
      vgMax = parseFloat(e.target.value);
    }
    await sleep(500);
    gateAnalysis.vg_max = vgMax;
  });

  document.getElementById("gateV").addEventListener("input", async (e) => {
    let vg;
    if (e.target.value === "") {
      vg = 1;
    } else {
      vg = parseFloat(e.target.value);
    }
    await sleep(500);
    timeAnalysis.vg = vg;
  });

  document.getElementById("delay").addEventListener("input", async (e) => {
    const delay = parseFloat(e.target.value);
    await sleep(500);
    timeAnalysis.delay = delay;
  });

  function save() {
    const gateSummary = gateAnalysis.get_summary();
    const timeSummary = timeAnalysis.get_summary();
    if (gateSummary.length > 0) {
      saveGateToTxt(gateSummary, "Gate_analysis");
    } else if (timeSummary.length > 0) {
      saveTimeToTxt(timeSummary, "Time_analysis");
    }
  }

  function open_reuirements_file() {
    window.open("requirements.txt", "_blank");
  }

  document.getElementById("saveDataButton").addEventListener("click", save);
  document
    .getElementById("infoCommandsButton")
    .addEventListener("click", open_reuirements_file);
  window.addEventListener("beforeunload", () => serialComm.disconnect());
});
