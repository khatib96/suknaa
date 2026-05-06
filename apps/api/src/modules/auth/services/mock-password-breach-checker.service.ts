import { Injectable } from "@nestjs/common";
import type { PasswordBreachChecker } from "./password-breach-checker.interface";

@Injectable()
export class MockPasswordBreachCheckerService implements PasswordBreachChecker {
  async assertPasswordIsSafe(_password: string): Promise<void> {
    return;
  }
}
