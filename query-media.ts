import { getPool } from "./src/lib/mysqlService.ts";

async function main() {
  try {
    const pool = getPool();
    const [rows]: any = await pool.query("SELECT id, title, folder, category, status FROM media_items");
    console.log(JSON.stringify(rows, null, 2));
  } catch (err: any) {
    console.error(err);
  }
  process.exit(0);
}
main();
