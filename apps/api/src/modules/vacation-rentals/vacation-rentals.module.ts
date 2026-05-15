import { Module } from "@nestjs/common";
import { AuditModule } from "../../shared/audit/audit.module";
import { VacationRentalsController } from "./vacation-rentals.controller";
import { VacationRentalsService } from "./vacation-rentals.service";

@Module({
  imports: [AuditModule],
  controllers: [VacationRentalsController],
  providers: [VacationRentalsService],
})
export class VacationRentalsModule {}
