import { Module } from "@nestjs/common";
import { AdminKycController } from "./admin-kyc.controller";
import { AdminKycService } from "./admin-kyc.service";

@Module({
  controllers: [AdminKycController],
  providers: [AdminKycService],
  exports: [AdminKycService],
})
export class AdminModule {}
