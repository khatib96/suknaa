export interface PasswordBreachChecker {
  assertPasswordIsSafe(password: string): Promise<void>;
}

export const PASSWORD_BREACH_CHECKER = Symbol("PASSWORD_BREACH_CHECKER");
