import { log } from "./utils.js";

export class SerialCommunication {
  constructor() {
    this.port = null;
    this.reader = null;
    this.writer = null;
    this.isConnected = false;
    this.autoConnect = JSON.parse(
      localStorage.getItem("autoConnect") || "false"
    );
  }

  async connect(manualConnect = true) {
    try {
      // If this is a manual connection request, store the info
      if (manualConnect) {
        localStorage.setItem("autoConnect", "true");
        this.autoConnect = true;
      }

      if (!this.isConnected) {
        // Request a port or use one from a previous session
        this.port = manualConnect
          ? await navigator.serial.requestPort()
          : (await navigator.serial.getPorts())[0];

        if (!this.port) {
          if (!manualConnect) {
            log("No previously connected port found", "info");
            return false;
          } else {
            throw new Error("Failed to get port");
          }
        }

        await this.port.open({ baudRate: 115200 });

        const textDecoder = new TextDecoderStream();
        this.port.readable.pipeTo(textDecoder.writable);
        this.reader = textDecoder.readable.getReader();
        this.writer = this.port.writable.getWriter();

        const res = await this.read();
        log(res, "success");
        this.isConnected = true;
        return true;
      }
      return true;
    } catch (error) {
      log(`Error connecting: ${error}`, "error");
      if (manualConnect) {
        // Reset state if manual connection fails
        localStorage.removeItem("autoConnect");
        this.autoConnect = false;
      }
      this.isConnected = false;
      return false;
    }
  }

  async read() {
    let receivedBuffer = "";
    try {
      while (true) {
        const { value, done } = await this.reader.read();
        if (done) {
          return null;
        }
        if (value) {
          receivedBuffer += value;
          const lines = receivedBuffer.split("\n");
          while (lines.length > 1) {
            const line = lines.shift().trim();
            if (line) {
              return line;
            }
          }
          receivedBuffer = lines[0];
        }
      }
    } catch (error) {
      log(`Read error: ${error}`, "error");
      this.isConnected = false;
    }
  }

  async sendCommand(command) {
    if (!this.writer) {
      await this.connect(false);
      if (!this.writer) {
        log("No connection available", "error");
        return;
      }
    }

    const commandWithNewline = command.trim() + "\n";
    const encoder = new TextEncoder();
    const data = encoder.encode(commandWithNewline);
    await this.writer.write(data);
    return command;
  }

  async disconnect() {
    if (this.reader) {
      this.reader.releaseLock();
      this.reader = null;
    }
    if (this.writer) {
      this.writer.releaseLock();
      this.writer = null;
    }
    if (this.port) {
      await this.port.close();
      this.port = null;
    }
    this.isConnected = false;
    localStorage.removeItem("autoConnect");
    this.autoConnect = false;
  }
}
