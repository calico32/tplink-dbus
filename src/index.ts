import chalk from 'chalk';
import { sessionBus } from 'dbus-next';
import { Client } from 'tplink-smarthome-api';
import yargs from 'yargs';
import { DeviceInterface } from './DeviceInterface';

const sliceAmount = process.argv[0] === 'node' || process.argv[0] === 'nodejs' ? 2 : 1;

const cli = yargs(process.argv.slice(sliceAmount))
  .env('TPLINK_DBUS')
  .epilogue(
    'The environment variables TPLINK_DBUS_DEVICE, TPLINK_DBUS_INTERFACE, TPLINK_DBUS_NAME, and TPLINK_DBUS_EXPORT_PATH ' +
      'can be used to set the device host, interface name, bus name, and export path, respectively.'
  )
  .usage(
    '$0 --device <device IP address> [--interface com.example.interface] [--name com.example.name] [--export-path /device]'
  )
  .options({
    device: {
      alias: 'd',
      type: 'string',
      description: 'IP address of the device to control.',
    },
    interface: {
      alias: 'i',
      type: 'string',
      description: 'DBus interface name',
      default: 'com.tplink.device',
    },
    name: {
      alias: 'n',
      type: 'string',
      description: 'DBus bus name',
      default: 'com.tplink',
    },
    'export-path': {
      alias: 'e',
      type: 'string',
      description: 'Where to export the interface on the destination.',
      default: '/device',
    },
    quiet: {
      alias: 'q',
      type: 'boolean',
      description: 'Disable output',
      default: false,
    },
  })
  .demandOption('device')
  .strict();

const { argv } = cli;

if (!/^[A-Za-z_]\w*(?:\.[A-Za-z_]\w*)+$/.test(argv.interface)) {
  console.error(chalk`{red Invalid interface name: {bold ${argv.interface}}}`);
  process.exit(1);
}

if (!/^[A-Za-z_-][\w-]*(?:\.[A-Za-z_-][\w-]*)+$/.test(argv.name)) {
  console.error(chalk`{red Invalid bus name: {bold ${argv.name}}}`);
  process.exit(1);
}

if (!argv['export-path'].startsWith('/')) {
  console.error(chalk`{red Invalid export path: {bold ${argv['export-path']}}}`);
  process.exit(1);
}

const log = (msg: string) => void (argv.quiet || console.log(msg));

(async () => {
  const client = new Client();
  const bus = sessionBus();

  log(chalk`{blue Contacting device...}`);
  const device = await client.getDevice({ host: argv.device });
  log(
    chalk`{green Connected to {bold ${device.alias} (${device.model.replace(
      /^(.+)(\(.+\))$/,
      '$1'
    )})} at {bold ${device.host}}}`
  );
  const iface = new DeviceInterface(argv.interface, { device });
  log(chalk`{blue Acquiring bus name...}`);
  await bus.requestName(argv.name, 0);
  log(chalk`{green Connected to session bus as {bold ${argv.name}}}`);
  bus.export(argv['export-path'], iface);
  log(chalk`{green Interface {bold ${argv.interface}} exported at {bold ${argv['export-path']}}}`);
})().catch(err => {
  if (err.code === 'ENOTFOUND') {
    console.error(chalk`{red Device not found: ${argv.device}}`);
    process.exit(1);
  } else console.error(err);
});
