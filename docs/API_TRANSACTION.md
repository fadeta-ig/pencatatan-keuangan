# Transaction API Documentation

API endpoints for managing financial transactions (income and expenses) in the application.

## Authentication

All transaction endpoints require authentication via Firebase ID token.

**Authorization Header:**
```
Authorization: Bearer <firebase-id-token>
```

## Endpoints

### 1. Create Transaction

Create a new transaction and automatically update the associated account balance.

**Endpoint:** `POST /api/transaction`

**Request Body:**
```json
{
  "accountId": "account123",
  "categoryId": "category456",
  "type": "EXPENSE",
  "amount": 50000,
  "currency": "IDR",
  "date": "2025-11-20T10:30:00Z",
  "notes": "Lunch at restaurant",
  "tags": ["tag123", "tag456"]
}
```

**Required Fields:**
- `accountId` (string): ID of the account for this transaction
- `categoryId` (string): ID of the category for this transaction
- `type` (string): Either "INCOME" or "EXPENSE"
- `amount` (number): Transaction amount (must be positive)
- `currency` (string): Currency code (e.g., "IDR", "USD")
- `date` (string): ISO 8601 date string

**Optional Fields:**
- `notes` (string): Transaction notes or description
- `tags` (array): Array of tag IDs
- `attachmentUrl` (string): URL to attached file
- `attachmentMeta` (object): Metadata about attachment

**Response (201 Created):**
```json
{
  "success": true,
  "data": {
    "id": "transaction789",
    "userId": "user123",
    "accountId": "account123",
    "categoryId": "category456",
    "type": "EXPENSE",
    "amount": 50000,
    "currency": "IDR",
    "date": "2025-11-20T10:30:00Z",
    "notes": "Lunch at restaurant",
    "tags": ["tag123", "tag456"]
  }
}
```

**Note:** Creating a transaction will automatically update the account balance:
- INCOME: adds to account balance
- EXPENSE: subtracts from account balance

**Error Responses:**
- `400 Bad Request`: Invalid input data
- `401 Unauthorized`: Missing or invalid authentication token
- `500 Internal Server Error`: Server error

---

### 2. List Transactions

Get transactions for the authenticated user with optional filtering.

**Endpoint:** `GET /api/transaction`

**Query Parameters:**
- `type` (optional): Filter by type ("INCOME" or "EXPENSE")
- `accountId` (optional): Filter by account ID
- `categoryId` (optional): Filter by category ID
- `startDate` (optional): Filter transactions from this date (ISO 8601)
- `endDate` (optional): Filter transactions until this date (ISO 8601)
- `limit` (optional): Maximum number of results
- `summary` (optional): Set to "true" to get summary instead of transactions

**Examples:**
- `/api/transaction` - Get all transactions
- `/api/transaction?type=EXPENSE` - Get all expense transactions
- `/api/transaction?accountId=account123` - Get transactions for specific account
- `/api/transaction?startDate=2025-11-01&endDate=2025-11-30` - Get November transactions
- `/api/transaction?summary=true` - Get income/expense summary
- `/api/transaction?categoryId=cat123&limit=10` - Get 10 latest transactions for category

**Response (200 OK) - Transaction List:**
```json
{
  "success": true,
  "data": [
    {
      "id": "transaction789",
      "userId": "user123",
      "accountId": "account123",
      "categoryId": "category456",
      "type": "EXPENSE",
      "amount": 50000,
      "currency": "IDR",
      "date": "2025-11-20T10:30:00Z",
      "notes": "Lunch at restaurant",
      "tags": ["tag123"]
    }
  ],
  "count": 1
}
```

**Response (200 OK) - Summary:**
```json
{
  "success": true,
  "data": {
    "income": 5000000,
    "expense": 2500000,
    "balance": 2500000
  }
}
```

**Error Responses:**
- `400 Bad Request`: Invalid query parameters
- `401 Unauthorized`: Missing or invalid authentication token
- `500 Internal Server Error`: Server error

---

### 3. Get Transaction by ID

Get a specific transaction by its ID.

**Endpoint:** `GET /api/transaction/:id`

**URL Parameters:**
- `id` (required): Transaction ID

**Response (200 OK):**
```json
{
  "success": true,
  "data": {
    "id": "transaction789",
    "userId": "user123",
    "accountId": "account123",
    "categoryId": "category456",
    "type": "EXPENSE",
    "amount": 50000,
    "currency": "IDR",
    "date": "2025-11-20T10:30:00Z",
    "notes": "Lunch at restaurant",
    "tags": ["tag123", "tag456"]
  }
}
```

**Error Responses:**
- `401 Unauthorized`: Missing or invalid authentication token
- `403 Forbidden`: User does not own this transaction
- `404 Not Found`: Transaction not found
- `500 Internal Server Error`: Server error

---

### 4. Update Transaction

Update an existing transaction. Account balances are automatically adjusted.

**Endpoint:** `PATCH /api/transaction/:id`

**URL Parameters:**
- `id` (required): Transaction ID

**Request Body:**
```json
{
  "amount": 75000,
  "notes": "Updated lunch expense",
  "tags": ["tag123", "tag789"]
}
```

**Note:** All fields are optional. Only include fields you want to update.

**Available Fields:**
- `accountId` (string): Change account
- `categoryId` (string): Change category
- `type` (string): Change type (INCOME/EXPENSE)
- `amount` (number): Change amount
- `currency` (string): Change currency
- `date` (string): Change date
- `notes` (string): Change notes
- `tags` (array): Replace tags
- `attachmentUrl` (string): Change attachment URL
- `attachmentMeta` (object): Change attachment metadata

**Response (200 OK):**
```json
{
  "success": true,
  "data": {
    "id": "transaction789",
    "userId": "user123",
    "accountId": "account123",
    "categoryId": "category456",
    "type": "EXPENSE",
    "amount": 75000,
    "currency": "IDR",
    "date": "2025-11-20T10:30:00Z",
    "notes": "Updated lunch expense",
    "tags": ["tag123", "tag789"]
  }
}
```

**Note:** Updating a transaction will:
1. Revert the old balance change from the old account
2. Apply the new balance change to the new account (which could be the same)
This ensures account balances are always accurate.

**Error Responses:**
- `400 Bad Request`: Invalid input data or no fields to update
- `401 Unauthorized`: Missing or invalid authentication token
- `403 Forbidden`: User does not own this transaction
- `404 Not Found`: Transaction not found
- `500 Internal Server Error`: Server error

---

### 5. Delete Transaction

Delete a transaction and automatically revert the account balance change.

**Endpoint:** `DELETE /api/transaction/:id`

**URL Parameters:**
- `id` (required): Transaction ID

**Response (200 OK):**
```json
{
  "success": true,
  "message": "Transaction deleted successfully"
}
```

**Note:** Deleting a transaction will automatically revert the balance change in the associated account.

**Error Responses:**
- `401 Unauthorized`: Missing or invalid authentication token
- `403 Forbidden`: User does not own this transaction
- `404 Not Found`: Transaction not found
- `500 Internal Server Error`: Server error

---

### 6. Add Tag to Transaction

Add a tag to an existing transaction.

**Endpoint:** `POST /api/transaction/:id/tags`

**URL Parameters:**
- `id` (required): Transaction ID

**Request Body:**
```json
{
  "tagId": "tag789"
}
```

**Response (200 OK):**
```json
{
  "success": true,
  "data": {
    "id": "transaction789",
    "userId": "user123",
    "accountId": "account123",
    "categoryId": "category456",
    "type": "EXPENSE",
    "amount": 50000,
    "currency": "IDR",
    "date": "2025-11-20T10:30:00Z",
    "notes": "Lunch at restaurant",
    "tags": ["tag123", "tag789"]
  }
}
```

**Error Responses:**
- `400 Bad Request`: Invalid tagId
- `401 Unauthorized`: Missing or invalid authentication token
- `403 Forbidden`: User does not own this transaction
- `404 Not Found`: Transaction not found
- `500 Internal Server Error`: Server error

---

### 7. Remove Tag from Transaction

Remove a tag from a transaction.

**Endpoint:** `DELETE /api/transaction/:id/tags/:tagId`

**URL Parameters:**
- `id` (required): Transaction ID
- `tagId` (required): Tag ID to remove

**Response (200 OK):**
```json
{
  "success": true,
  "data": {
    "id": "transaction789",
    "userId": "user123",
    "accountId": "account123",
    "categoryId": "category456",
    "type": "EXPENSE",
    "amount": 50000,
    "currency": "IDR",
    "date": "2025-11-20T10:30:00Z",
    "notes": "Lunch at restaurant",
    "tags": ["tag123"]
  }
}
```

**Error Responses:**
- `401 Unauthorized`: Missing or invalid authentication token
- `403 Forbidden`: User does not own this transaction
- `404 Not Found`: Transaction not found
- `500 Internal Server Error`: Server error

---

## Error Response Format

All error responses follow this format:

```json
{
  "error": "Error message describing what went wrong"
}
```

## Usage Examples

### JavaScript/TypeScript (with fetch)

```typescript
// Get Firebase ID token
const user = auth.currentUser;
const token = await user.getIdToken();

// Create transaction
const response = await fetch('/api/transaction', {
  method: 'POST',
  headers: {
    'Authorization': `Bearer ${token}`,
    'Content-Type': 'application/json',
  },
  body: JSON.stringify({
    accountId: 'account123',
    categoryId: 'category456',
    type: 'EXPENSE',
    amount: 50000,
    currency: 'IDR',
    date: new Date().toISOString(),
    notes: 'Lunch',
  }),
});

const data = await response.json();
console.log(data);

// List transactions with filters
const listResponse = await fetch(
  '/api/transaction?type=EXPENSE&startDate=2025-11-01&limit=20',
  {
    headers: {
      'Authorization': `Bearer ${token}`,
    },
  }
);

const transactions = await listResponse.json();
console.log(transactions.data);

// Get summary
const summaryResponse = await fetch('/api/transaction?summary=true', {
  headers: {
    'Authorization': `Bearer ${token}`,
  },
});

const summary = await summaryResponse.json();
console.log(summary.data); // { income, expense, balance }

// Update transaction
const updateResponse = await fetch('/api/transaction/transaction789', {
  method: 'PATCH',
  headers: {
    'Authorization': `Bearer ${token}`,
    'Content-Type': 'application/json',
  },
  body: JSON.stringify({
    amount: 75000,
    notes: 'Updated expense',
  }),
});

// Add tag to transaction
const addTagResponse = await fetch('/api/transaction/transaction789/tags', {
  method: 'POST',
  headers: {
    'Authorization': `Bearer ${token}`,
    'Content-Type': 'application/json',
  },
  body: JSON.stringify({
    tagId: 'tag789',
  }),
});

// Remove tag from transaction
const removeTagResponse = await fetch('/api/transaction/transaction789/tags/tag789', {
  method: 'DELETE',
  headers: {
    'Authorization': `Bearer ${token}`,
  },
});

// Delete transaction
const deleteResponse = await fetch('/api/transaction/transaction789', {
  method: 'DELETE',
  headers: {
    'Authorization': `Bearer ${token}`,
  },
});
```

## Important Notes

### Account Balance Management

The transaction API automatically manages account balances:

1. **Creating a transaction:**
   - INCOME: Adds amount to account balance
   - EXPENSE: Subtracts amount from account balance

2. **Updating a transaction:**
   - Reverts the old balance change from the old account
   - Applies the new balance change to the new account
   - This works correctly even when changing accounts, types, or amounts

3. **Deleting a transaction:**
   - Reverts the balance change from the account
   - INCOME deletion: subtracts the amount
   - EXPENSE deletion: adds the amount back

### Date Handling

- All dates should be provided in ISO 8601 format
- The server converts dates to Firestore Timestamps automatically
- When filtering by date range, both startDate and endDate are inclusive

### Tags

- Tags are stored as an array of tag IDs
- Use the dedicated tag endpoints (`POST /tags` and `DELETE /tags/:tagId`) for adding/removing individual tags
- Or update the entire tags array using `PATCH /transaction/:id`

### Transactions are ordered by date (newest first) by default
