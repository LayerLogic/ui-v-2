import { log, parseResponse } from "./utils.js";

export class TimeAnalysis {
  constructor(serialComm, sample, chart, vg, delay) {
    this.serialComm = serialComm;
    this.sample = sample;
    this.chart = chart;
    this.timestamp = Date.now();

    this.vg = vg;
    this.delay = delay;
    this.summary = [];
  }

  async setup() {
    try {
      const command = await this.serialComm.sendCommand(
        `Vg, ${this.vg.toFixed(2)}`
      );
      log(command, "Sent");
      const res = await this.serialComm.read();
      log(res, "Received");
      const command2 = await this.serialComm.sendCommand(`dt, ${this.delay}`);
      log(command2, "Sent");
      const res2 = await this.serialComm.read();
      log(res2, "Received");
    } catch (error) {
      log(`Time Analysis setup error: ${error}`, "error");
    }
  }

  async run() {
    try {
      const command = await this.serialComm.sendCommand(
        `ACgn, ${this.vg.toFixed(2)}`
      );
      log(command, "sent");
      const res = await this.serialComm.read();
      const elapsedTime = (Date.now() - this.timestamp) / 1000;
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
        t: elapsedTime,
        X: x_gain,
        Y: y_gain,
        I: current_AC,
        F: frequency,
      });
      this.updateChart(
        elapsedTime.toFixed(2),
        resistance_left,
        resistance_right
      );
    } catch (error) {
      log(`Time Analysis error: ${error}`, "error");
    }
  }

  updateChart(timestamp, res_left, res_right) {
    this.chart.data.labels.push(timestamp);
    this.chart.data.datasets[0].data.push(res_left);
    this.chart.data.datasets[1].data.push(res_right);
    this.chart.update();
  }
}
