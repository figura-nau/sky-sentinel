import {
  WebSocketGateway,
  SubscribeMessage,
  MessageBody,
  WebSocketServer,
  OnGatewayConnection,
  OnGatewayDisconnect,
} from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';
import type {
  UAVdataPacket,
  ValidatorService,
} from '../validator/validator.service';
import { FailuresService } from '../failures/failures.service';

@WebSocketGateway(3003, {
  cors: {
    origin: ['*'],
  },
})
export class TelemetryParserGateway
  implements OnGatewayConnection, OnGatewayDisconnect
{
  constructor(
    private readonly validationService: ValidatorService,
    private readonly failuresService: FailuresService,
  ) {}
  @WebSocketServer() server: Server;

  handleConnection(client: Socket) {
    console.log(`UAV/Client Connected: ${client.id}`);
  }

  handleDisconnect(client: Socket) {
    console.log(`UAV/Client Disconnected: ${client.id}`);
  }

  @SubscribeMessage('telemetry')
  async handleUAVdata(@MessageBody() packet: UAVdataPacket) {
    try {
      const isValid = this.validationService.validate(packet);
      if (!isValid) {
        return;
      }
      const { data } = packet;

      await Promise.all([
        this.failuresService.checkFlightDynamics(
          data.verticalSpeed,
          data.altitude,
          data.airspeed,
          data.pitch,
          data.roll,
          data.id,
        ),
        this.failuresService.checkHardwareStatus(
          data.gear_status,
          data.altitude,
          data.battery_level,
          data.temperature,
          data.id,
        ),
        this.failuresService.checkConnection(
          data.rssi,
          data.latency,
          Date.now(),
          data.id,
        ),
      ]);
    } catch (err: unknown) {
      console.error('error', err);
    }
  }
}
