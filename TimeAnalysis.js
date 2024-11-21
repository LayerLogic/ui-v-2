import { log } from "./utils.js";

export class TimeAnalysis {
  constructor(serialComm, chart, vg, delay) {
    this.serialComm = serialComm;
    this.chart = chart;
    this.isRunning = false;
    this.timestamp = 0;

    this.vg = vg;
    this.delay = delay;
  }

  parseResponse(response) {
    const values = response.split(",").map((v) => parseFloat(v.trim()));
    const [x_gain, y_gain, current_AC, _] = values;

    const resistance_left = x_gain / current_AC;
    const resistance_right = y_gain / current_AC;

    return {
      resistance_left,
      resistance_right,
      x_gain,
      y_gain,
      current_AC,
      _,
    };
  }

  updateChart(timestamp, res_left, res_right) {
    this.chart.data.labels.push(timestamp);
    this.chart.data.datasets[0].data.push(res_left);
    this.chart.data.datasets[1].data.push(res_right);
    this.chart.update();
  }

  async start() {
    if (this.isRunning) {
      log("Time analysis is already running!", "error");
      return;
    }

    // Get initial reading at t=0
    const initialCommand = await this.serialComm.sendCommand(
      `ACgn, ${this.vg.toFixed(2)}`
    );
    log(initialCommand, "sent");
    const initialRes = await this.serialComm.read();
    log(initialRes, "Received");
    const { resistance_left, resistance_right } =
      this.parseResponse(initialRes);

    // Plot the initial point at t=0
    this.updateChart("0.00", resistance_left, resistance_right);

    // this.reset();
    this.isRunning = true;
    this.timestamp = Date.now();

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

      while (this.isRunning) {
        const command = await this.serialComm.sendCommand(
          `ACgn, ${this.vg.toFixed(2)}`
        );
        log(command, "sent");
        const res = await this.serialComm.read();
        const elapsedTime = (Date.now() - this.timestamp) / 1000;
        log(res, "Received");
        const { resistance_left, resistance_right } = this.parseResponse(res);
        this.updateChart(
          elapsedTime.toFixed(2),
          resistance_left,
          resistance_right
        );
      }
    } catch (error) {
      log(`Time Analysis error: ${error}`, "error");
    }
  }

  reset() {
    this.chart.data.labels = [];
    this.chart.data.datasets[0].data = [];
    this.chart.data.datasets[1].data = [];
    this.chart.update();
  }

  stop() {
    if (this.isRunning) {
      this.isRunning = false;
      log("Time Analysis Stopped", "info");
    }
  }
}
