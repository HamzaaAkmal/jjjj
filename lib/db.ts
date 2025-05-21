import mysql from "mysql2/promise"

// Database connection configuration for cPanel
const dbConfig = {
  host: process.env.DB_HOST || "localhost",
  user: process.env.DB_USER || "cpanelusername_dbuser",
  password: process.env.DB_PASSWORD || "your-database-password",
  database: process.env.DB_NAME || "cpanelusername_apartmentpro",
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0,
}

// Create a connection pool
const pool = mysql.createPool(dbConfig)

// Helper function to execute SQL queries
export async function query(sql: string, params: any[] = []) {
  try {
    const [results] = await pool.execute(sql, params)
    return results
  } catch (error) {
    console.error("Database query error:", error)
    throw error
  }
}

// Test database connection
export async function testConnection() {
  try {
    const connection = await pool.getConnection()
    console.log("Database connection successful")
    connection.release()
    return true
  } catch (error) {
    console.error("Database connection failed:", error)
    return false
  }
}

// User authentication queries
export async function getUserByEmail(email: string) {
  const users = await query("SELECT * FROM users WHERE email = ?", [email])
  return users[0]
}

// ./db.ts (example structure)
// ... your database connection setup (e.g., Prisma, Drizzle, etc.)

export interface UserFromDB {
  id: number; // or string
  email: string;
  name: string;
  role: "admin" | "manager" | "staff" | "client";
  password_hash: string;
  // ... other fields
}

export async function getUserByEmail(email: string): Promise<UserFromDB | null> {
  // Your database query logic here
  // Example with Prisma:
  // return prisma.user.findUnique({ where: { email } });
  return null; // Placeholder
}
export async function createUser(user: {
  name: string
  email: string
  password: string
  role: string
  status: string
}) {
  const result = await query(
    "INSERT INTO users (name, email, password_hash, role, status, created_at, updated_at) VALUES (?, ?, ?, ?, ?, NOW(), NOW())",
    [user.name, user.email, user.password, user.role, user.status],
  )
  return result
}

// Client queries
export async function getAllClients() {
  return await query("SELECT * FROM clients ORDER BY created_at DESC")
}

export async function getClientById(id: string) {
  const clients = await query("SELECT * FROM clients WHERE id = ?", [id])
  return clients[0]
}

export async function createClient(client: any) {
  const result = await query(
    "INSERT INTO clients (name, email, phone, type, status, apartment_id, created_at, updated_at) VALUES (?, ?, ?, ?, ?, ?, NOW(), NOW())",
    [client.name, client.email, client.phone, client.type, client.status, client.apartmentId || null],
  )
  return result
}

export async function updateClient(id: string, client: any) {
  const result = await query(
    "UPDATE clients SET name = ?, email = ?, phone = ?, type = ?, status = ?, apartment_id = ?, updated_at = NOW() WHERE id = ?",
    [client.name, client.email, client.phone, client.type, client.status, client.apartmentId || null, id],
  )
  return result
}

export async function deleteClient(id: string) {
  const result = await query("DELETE FROM clients WHERE id = ?", [id])
  return result
}

// Apartment queries
export async function getAllApartments() {
  return await query("SELECT * FROM apartments ORDER BY building_id, number")
}

export async function getApartmentById(id: string) {
  const apartments = await query("SELECT * FROM apartments WHERE id = ?", [id])
  return apartments[0]
}

export async function createApartment(apartment: any) {
  const result = await query(
    "INSERT INTO apartments (building_id, number, floor, type, size, price, status, created_at, updated_at) VALUES (?, ?, ?, ?, ?, ?, ?, NOW(), NOW())",
    [
      apartment.buildingId,
      apartment.number,
      apartment.floor,
      apartment.type,
      apartment.size,
      apartment.price,
      apartment.status,
    ],
  )
  return result
}

export async function updateApartment(id: string, apartment: any) {
  const result = await query(
    "UPDATE apartments SET building_id = ?, number = ?, floor = ?, type = ?, size = ?, price = ?, status = ?, updated_at = NOW() WHERE id = ?",
    [
      apartment.buildingId,
      apartment.number,
      apartment.floor,
      apartment.type,
      apartment.size,
      apartment.price,
      apartment.status,
      id,
    ],
  )
  return result
}

export async function deleteApartment(id: string) {
  const result = await query("DELETE FROM apartments WHERE id = ?", [id])
  return result
}

// Building queries
export async function getAllBuildings() {
  return await query("SELECT * FROM buildings ORDER BY name")
}

// Payment queries
export async function getAllPayments() {
  return await query("SELECT * FROM payments ORDER BY due_date DESC")
}

export async function createPayment(payment: any) {
  const result = await query(
    "INSERT INTO payments (client_id, apartment_id, amount, currency, status, method, due_date, paid_date, created_at, updated_at) VALUES (?, ?, ?, ?, ?, ?, ?, ?, NOW(), NOW())",
    [
      payment.clientId,
      payment.apartmentId,
      payment.amount,
      payment.currency,
      payment.status,
      payment.method,
      payment.dueDate,
      payment.paidDate || null,
    ],
  )
  return result
}

export async function updatePayment(id: string, payment: any) {
  const result = await query("UPDATE payments SET status = ?, paid_date = ?, updated_at = NOW() WHERE id = ?", [
    payment.status,
    payment.paidDate || null,
    id,
  ])
  return result
}

// Account transactions
export async function getAllTransactions() {
  return await query("SELECT * FROM transactions ORDER BY created_at DESC")
}

export async function createTransaction(transaction: any) {
  const result = await query(
    "INSERT INTO transactions (account_type, amount, currency, type, category, description, created_at) VALUES (?, ?, ?, ?, ?, ?, NOW())",
    [
      transaction.accountType,
      transaction.amount,
      transaction.currency,
      transaction.type,
      transaction.category,
      transaction.description,
    ],
  )
  return result
}

// Get account balances
export async function getAccountBalances() {
  const constructionIncome = await query(
    'SELECT SUM(amount) as total FROM transactions WHERE account_type = "construction" AND type = "income"',
  )

  const constructionExpense = await query(
    'SELECT SUM(amount) as total FROM transactions WHERE account_type = "construction" AND type = "expense"',
  )

  const financeIncome = await query(
    'SELECT SUM(amount) as total FROM transactions WHERE account_type = "finance" AND type = "income"',
  )

  const financeExpense = await query(
    'SELECT SUM(amount) as total FROM transactions WHERE account_type = "finance" AND type = "expense"',
  )

  return {
    construction: {
      income: constructionIncome[0].total || 0,
      expense: constructionExpense[0].total || 0,
      balance: (constructionIncome[0].total || 0) - (constructionExpense[0].total || 0),
    },
    finance: {
      income: financeIncome[0].total || 0,
      expense: financeExpense[0].total || 0,
      balance: (financeIncome[0].total || 0) - (financeExpense[0].total || 0),
    },
  }
}
