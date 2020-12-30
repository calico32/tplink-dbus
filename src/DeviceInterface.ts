import dbus, { DBusError } from 'dbus-next';
import { AnyDevice } from 'tplink-smarthome-api/lib/client';

const { Interface, method, property, signal } = dbus.interface;

export { Interface };
export class DeviceInterface extends Interface {
  name: string;
  device: AnyDevice;

  private state!: boolean;

  constructor(name: string, opts: { device: AnyDevice }) {
    super(name);
    this.name = name;
    this.device = opts.device;
    this.init();
  }

  private async update(newState: boolean) {
    // console.log(`${Date.now()} power-update ${newState}`);
    if (newState !== this.state) {
      this.state = newState;
      // console.log('Firing StateChange');
      this.StateChange(newState);
    }
  }

  async init(): Promise<void> {
    this.state = await this.device.getPowerState();

    // keep power updated
    setInterval(async () => this.update(await this.device.getPowerState()), 5000);
    this.device.on('power-update', this.update.bind(this));
  }

  @property({ signature: 'b' })
  get State(): boolean {
    return this.state;
  }

  @signal({ signature: 'b' })
  StateChange(newState: boolean): boolean {
    return newState;
  }

  @method({ outSignature: 'b' })
  Toggle(): Promise<boolean> {
    try {
      return this.device.togglePowerState();
    } catch (err) {
      throw new DBusError(`${this.name}.Error`, err);
    }
  }

  @method({ outSignature: 'b' })
  On(): Promise<boolean> {
    try {
      return this.device.setPowerState(true);
    } catch (err) {
      throw new DBusError(`${this.name}.Error`, err);
    }
  }

  @method({ outSignature: 'b' })
  Off(): Promise<boolean> {
    try {
      return this.device.setPowerState(false);
    } catch (err) {
      throw new DBusError(`${this.name}.Error`, err);
    }
  }
}
