import { SQLDatabase } from "encore.dev/storage/sqldb";

export const db = new SQLDatabase("fish_saas", {
  migrations: "./migrations",
});
