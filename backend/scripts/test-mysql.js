require('../load-env')

const mysql = require('mysql2/promise')

const main = async () => {
  const connection = await mysql.createConnection({
    charset: 'utf8mb4',
    database: process.env.MYSQL_DATABASE,
    host: process.env.MYSQL_HOST,
    password: process.env.MYSQL_PASSWORD || '',
    port: Number(process.env.MYSQL_PORT || 3306),
    user: process.env.MYSQL_USER,
  })

  try {
    const tableName = process.env.MYSQL_STORE_TABLE || 'app_store'
    const [rows] = await connection.query(`SELECT COUNT(*) AS total FROM \`${tableName}\``)
    console.log(
      JSON.stringify(
        {
          ok: true,
          table: tableName,
          total: Array.isArray(rows) && rows[0] ? Number(rows[0].total) : 0,
        },
        null,
        2,
      ),
    )
  } finally {
    await connection.end()
  }
}

main().catch((error) => {
  console.error(error)
  process.exit(1)
})
