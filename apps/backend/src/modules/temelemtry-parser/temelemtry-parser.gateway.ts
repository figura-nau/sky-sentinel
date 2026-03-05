import {
  WebSocketGateway,
  SubscribeMessage,
  MessageBody,
  WebSocketServer,
  OnGatewayConnection,
  OnGatewayDisconnect,
  ConnectedSocket,
} from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';
import type { UAVdataPacket } from '../validator/validator.service';
import { FailuresService } from '../failures/failures.service';
import { ValidatorService } from '../validator/validator.service';
import { PrismaService } from 'src/database/prisma/prisma.service';

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
    private readonly prismaService: PrismaService,
  ) {
    console.log('TelemetryParserGateway initialized on port 3003');
  }
  @WebSocketServer() server: Server;

  handleConnection(client: Socket) {
    console.log(`UAV/Client Connected: ${client.id}`);
  }

  handleDisconnect(client: Socket) {
    console.log(`UAV/Client Disconnected: ${client.id}`);
  }

  @SubscribeMessage('telemetry')
  async handleUAVdata(
    @ConnectedSocket() client: Socket,
    @MessageBody() packet: UAVdataPacket,
  ) {
    try {
      const isValid = this.validationService.validate(packet);
      if (!isValid) {
        console.log(`UAV/Client packet isn't valid: ${packet.data.id}`);
        return;
      }
      const { data } = packet;
      const savedPacket = await this.prismaService.uAVdata.create({
        data: {
          ...data,
          id: undefined,
        },
      });
      await Promise.all([
        this.failuresService.checkFlightDynamics(
          savedPacket.verticalSpeed,
          savedPacket.altitude,
          savedPacket.airspeed,
          savedPacket.pitch,
          savedPacket.roll,
          savedPacket.id,
        ),
        this.failuresService.checkHardwareStatus(
          savedPacket.gear_status,
          savedPacket.altitude,
          savedPacket.battery_level,
          savedPacket.temperature,
          savedPacket.id,
        ),
        this.failuresService.checkConnection(
          savedPacket.rssi,
          savedPacket.latency,
          Date.now(),
          savedPacket.id,
        ),
      ]);
      console.log('Send data to the frontend!', data);
      this.server.emit('receive_ui_data', data);

      console.log(
        `Обробка пакету даних від ${client.id} - id пакету: ${data.id}`,
      );
    } catch (err: unknown) {
      console.error('error', err);
    }
  }
}
