import {
  WebSocketGateway,
  SubscribeMessage,
  MessageBody,
  WebSocketServer,
  OnGatewayConnection,
  OnGatewayDisconnect,
} from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';
import type { UAVdataPacket } from '../validator/validator.service';
import { FailuresService } from '../failures/failures.service';
import { ValidatorService } from '../validator/validator.service';
import { PrismaService } from 'src/database/prisma.service';
import { UAVdata } from '@prisma/client';

@WebSocketGateway(3003, {
  cors: {
    origin: ['*'],
  },
})
export class TelemetryParserGateway
  implements OnGatewayConnection, OnGatewayDisconnect
{
  private prevPacket: UAVdata | undefined = undefined;
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
    // @ConnectedSocket() client: Socket,
    @MessageBody() packet: UAVdataPacket,
  ) {
    try {
      const isValid = this.validationService.validate(packet);
      if (!isValid) {
        console.log(`UAV/Client packet isn't valid: ${packet.data.id}`);
        return;
      }
      const { data } = packet;
      const savedPacket: UAVdata = await this.prismaService.uAVdata.create({
        data: {
          ...data,
          id: undefined,
        },
      });
      await Promise.all([
        this.failuresService.runAllChecks(
          {
            lat: data.latitude,
            lon: data.longitude,
            alt_rel: data.altitude,
            airspeed: data.airspeed,
            groundspeed: data.groundspeed,
            fix_type: data.fix_type,
            pitch: data.pitch,
            roll: data.roll,
            throttle: data.throttle,
            batt_rem: data.batt_rem,
            servo_current: data.servo_current,
            vibration: data.vibration,
            rssi: data.rssi,
            signal_quality: data.signal_quality,
          },
          {
            uavDataId: savedPacket.id,
            altRelPrev: this.prevPacket
              ? this.prevPacket?.altitude
              : savedPacket.altitude,
            pitchPrev: this.prevPacket
              ? this.prevPacket?.pitch
              : savedPacket.pitch,
            rollPrev: this.prevPacket
              ? this.prevPacket?.roll
              : savedPacket.roll,
            lastSeenMs: this.prevPacket
              ? this.prevPacket.timestamp.getMilliseconds()
              : new Date().getMilliseconds(),
            deltaT: this.prevPacket
              ? new Date().getMilliseconds() -
                this.prevPacket.timestamp.getMilliseconds()
              : 0,
          },
        ),
      ]);
      this.prevPacket = savedPacket;
      // console.log('Send data to the frontend!', data);
      this.server.emit('receive_ui_data', data);
    } catch (err: unknown) {
      console.error('error', err);
    }
  }
}
