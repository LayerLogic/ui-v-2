import { log, parseResponse } from "./utils.js";
import { VG } from "./constants.js";

export class GateAnalysis {
  constructor(serialComm, chart, vg_step, vg_min, vg_max) {
    this.serialComm = serialComm;
    this.chart = chart;

    this.isRunning = false;

    this.vg = VG;
    this.vg_step = vg_step;
    this.vg_min = vg_min;
    this.vg_max = vg_max;

    this.summary = [];
  }

  async start() {
    if (this.isRunning) {
      log("Gate analysis is already running!", "error");
      return;
    }

    this.isRunning = true;
    let isIncreasing = true;

    try {
      while (this.isRunning) {
        const command = await this.serialComm.sendCommand(
          `ACgn, ${this.vg.toFixed(2)}`
        );
        log(command, "Sent");
        const res = await this.serialComm.read();
        log(res, "Received");
        const {
          resistance_left,
          resistance_right,
          x_gain,
          y_gain,
          current_AC,
          frequency,
        } = parseResponse(res);
        this.summary.push({
          Vg: this.vg,
          X: x_gain,
          Y: y_gain,
          I: current_AC,
          F: frequency,
        });
        this.updateChart(this.vg, resistance_left, resistance_right);
        if (isIncreasing) {
          this.vg += this.vg_step;
          if (this.vg >= this.vg_max) {
            isIncreasing = false;
            this.vg = this.vg_max;
          }
        } else {
          this.vg -= this.vg_step;
          if (this.vg <= this.vg_min) {
            isIncreasing = true;
            this.vg = this.vg_min;
          }
        }
      }
    } catch (error) {
      log(`Gate Analysis error: ${error}`, "error");
    } finally {
      this.isRunning = false;
    }
  }

  stop() {
    if (this.isRunning) {
      this.isRunning = false;
      log("Gate Analysis Stopped", "info");
    }
  }

  updateChart(vg, res_left, res_right) {
    this.chart.data.labels.push(vg);
    this.chart.data.datasets[0].data.push(res_left);
    this.chart.data.datasets[1].data.push(res_right);
    this.chart.update();
  }

  get_summary() {
    return this.summary;
  }
}
