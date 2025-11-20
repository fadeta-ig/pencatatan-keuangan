# Transfer API Documentation

API untuk mengelola transfer uang antar rekening.

## Endpoints

### 1. Create Transfer

**POST** `/api/transfer`

Membuat transfer baru antara dua rekening.

#### Request Headers
```
Authorization: Bearer <firebase-id-token>
Content-Type: application/json
```

#### Request Body
```json
{
  "fromAccountId": "string (required)",
  "toAccountId": "string (required)",
  "amount": "number (required, > 0)",
  "date": "string (ISO 8601, required)",
  "notes": "string (optional)",
  "exchangeRate": "number (required for multi-currency, > 0)"
}
```

#### Validations
- `fromAccountId` dan `toAccountId` harus berbeda
- User harus memiliki kedua account
- Saldo rekening asal harus mencukupi
- `exchangeRate` wajib untuk transfer multi-currency
- Auto-calculate `convertedAmount` untuk multi-currency

#### Response Success (201)
```json
{
  "success": true,
  "data": {
    "id": "transfer123",
    "userId": "user123",
    "fromAccountId": "account1",
    "toAccountId": "account2",
    "amount": 1000000,
    "currency": "IDR",
    "date": "Timestamp",
    "notes": "Transfer untuk keperluan X",
    "exchangeRate": 1.5,
    "convertedAmount": 1500000
  }
}
```

#### Response Error (400)
```json
{
  "error": "Source account ID is required"
}
```

```json
{
  "error": "Cannot transfer to the same account"
}
```

```json
{
  "error": "Insufficient balance in source account"
}
```

```json
{
  "error": "Exchange rate is required for multi-currency transfers"
}
```

#### Side Effects
- ✅ **Automatic Balance Adjustment:**
  - Saldo rekening asal dikurangi `amount`
  - Saldo rekening tujuan ditambah `convertedAmount` (atau `amount` jika same currency)

---

### 2. List Transfers

**GET** `/api/transfer`

Mendapatkan daftar transfer dengan filter opsional.

#### Request Headers
```
Authorization: Bearer <firebase-id-token>
```

#### Query Parameters
| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `accountId` | string | No | Filter transfer dari/ke account tertentu |
| `startDate` | string (ISO 8601) | No | Filter dari tanggal |
| `endDate` | string (ISO 8601) | No | Filter sampai tanggal |
| `limit` | number | No | Limit jumlah hasil |

#### Example Request
```
GET /api/transfer?accountId=account123&startDate=2025-01-01&limit=50
```

#### Response Success (200)
```json
{
  "success": true,
  "data": [
    {
      "id": "transfer1",
      "userId": "user123",
      "fromAccountId": "account1",
      "toAccountId": "account2",
      "amount": 500000,
      "currency": "IDR",
      "date": "Timestamp",
      "notes": "Transfer bulanan",
      "exchangeRate": null,
      "convertedAmount": null,
      "createdAt": "Timestamp",
      "updatedAt": "Timestamp"
    }
  ],
  "count": 1
}
```

---

### 3. Get Transfer by ID

**GET** `/api/transfer/:id`

Mendapatkan detail transfer tertentu.

#### Request Headers
```
Authorization: Bearer <firebase-id-token>
```

#### Response Success (200)
```json
{
  "success": true,
  "data": {
    "id": "transfer123",
    "userId": "user123",
    "fromAccountId": "account1",
    "toAccountId": "account2",
    "amount": 1000000,
    "currency": "IDR",
    "date": "Timestamp",
    "notes": "Transfer untuk X",
    "exchangeRate": 0.000067,
    "convertedAmount": 67,
    "createdAt": "Timestamp",
    "updatedAt": "Timestamp"
  }
}
```

#### Response Error (404)
```json
{
  "error": "Transfer not found"
}
```

#### Response Error (403)
```json
{
  "error": "Forbidden: You do not own this transfer"
}
```

---

### 4. Delete Transfer

**DELETE** `/api/transfer/:id`

Menghapus transfer dan mengembalikan saldo ke kondisi sebelumnya.

#### Request Headers
```
Authorization: Bearer <firebase-id-token>
```

#### Response Success (200)
```json
{
  "success": true,
  "message": "Transfer deleted successfully"
}
```

#### Response Error (404)
```json
{
  "error": "Transfer not found"
}
```

#### Side Effects
- ✅ **Automatic Balance Reversion:**
  - Saldo rekening asal ditambah kembali `amount`
  - Saldo rekening tujuan dikurangi `convertedAmount` (atau `amount` jika same currency)

---

## Fitur Khusus

### Multi-Currency Transfer

Transfer dapat dilakukan antar rekening dengan mata uang berbeda.

**Contoh:**
```json
{
  "fromAccountId": "usd-account",  // USD
  "toAccountId": "idr-account",    // IDR
  "amount": 100,                   // 100 USD
  "exchangeRate": 15000,           // 1 USD = 15,000 IDR
  "date": "2025-11-20"
}
```

**Hasil:**
- Rekening USD: -100 USD
- Rekening IDR: +1,500,000 IDR
- `convertedAmount`: 1500000

### Same Currency Transfer

Jika kedua rekening memiliki mata uang sama:
- `exchangeRate` tidak diperlukan (akan diabaikan)
- `convertedAmount` akan sama dengan `amount`

---

## Error Codes

| Code | Description |
|------|-------------|
| 400 | Bad Request - Validasi gagal |
| 401 | Unauthorized - Token tidak valid |
| 403 | Forbidden - Bukan pemilik account/transfer |
| 404 | Not Found - Account/Transfer tidak ditemukan |
| 500 | Internal Server Error |

---

## Business Logic

### Balance Calculation

**Create Transfer:**
```typescript
fromAccount.currentBalance -= amount
toAccount.currentBalance += (convertedAmount || amount)
```

**Delete Transfer:**
```typescript
fromAccount.currentBalance += amount
toAccount.currentBalance -= (convertedAmount || amount)
```

### Validation Rules

1. **Sufficient Balance Check:**
   ```typescript
   if (fromAccount.currentBalance < amount) {
     throw Error('Insufficient balance')
   }
   ```

2. **Same Account Check:**
   ```typescript
   if (fromAccountId === toAccountId) {
     throw Error('Cannot transfer to same account')
   }
   ```

3. **Ownership Verification:**
   ```typescript
   if (fromAccount.userId !== user.uid || toAccount.userId !== user.uid) {
     throw Error('Forbidden')
   }
   ```

4. **Multi-Currency Rate Check:**
   ```typescript
   if (fromAccount.currency !== toAccount.currency && !exchangeRate) {
     throw Error('Exchange rate required')
   }
   ```

---

## Usage Examples

### Example 1: Same Currency Transfer

**Request:**
```bash
POST /api/transfer
Authorization: Bearer eyJhbGc...

{
  "fromAccountId": "bank-bca",
  "toAccountId": "bank-mandiri",
  "amount": 5000000,
  "date": "2025-11-20T10:00:00Z",
  "notes": "Transfer untuk tabungan"
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "id": "transfer_abc123",
    "fromAccountId": "bank-bca",
    "toAccountId": "bank-mandiri",
    "amount": 5000000,
    "currency": "IDR",
    "convertedAmount": null
  }
}
```

**Result:**
- BCA: -5,000,000 IDR
- Mandiri: +5,000,000 IDR

---

### Example 2: Multi-Currency Transfer

**Request:**
```bash
POST /api/transfer
Authorization: Bearer eyJhbGc...

{
  "fromAccountId": "paypal-usd",
  "toAccountId": "gopay-idr",
  "amount": 100,
  "exchangeRate": 15750,
  "date": "2025-11-20T10:00:00Z",
  "notes": "Withdrawal from PayPal"
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "id": "transfer_xyz789",
    "fromAccountId": "paypal-usd",
    "toAccountId": "gopay-idr",
    "amount": 100,
    "currency": "USD",
    "exchangeRate": 15750,
    "convertedAmount": 1575000
  }
}
```

**Result:**
- PayPal: -100 USD
- GoPay: +1,575,000 IDR

---

### Example 3: List Transfers for Account

**Request:**
```bash
GET /api/transfer?accountId=bank-bca&limit=10
Authorization: Bearer eyJhbGc...
```

**Response:**
```json
{
  "success": true,
  "data": [
    {
      "id": "transfer1",
      "fromAccountId": "bank-bca",
      "toAccountId": "gopay",
      "amount": 500000,
      "currency": "IDR"
    },
    {
      "id": "transfer2",
      "fromAccountId": "dana",
      "toAccountId": "bank-bca",
      "amount": 1000000,
      "currency": "IDR"
    }
  ],
  "count": 2
}
```

---

## Integration Notes

### Client-Side Usage

```typescript
// Create transfer
const response = await fetch('/api/transfer', {
  method: 'POST',
  headers: {
    'Authorization': `Bearer ${idToken}`,
    'Content-Type': 'application/json'
  },
  body: JSON.stringify({
    fromAccountId: 'account1',
    toAccountId: 'account2',
    amount: 1000000,
    date: new Date().toISOString()
  })
});

// Delete transfer
await fetch(`/api/transfer/${transferId}`, {
  method: 'DELETE',
  headers: {
    'Authorization': `Bearer ${idToken}`
  }
});
```

### Service Layer Usage

```typescript
import { createTransfer, deleteTransfer } from '@/lib/services/transfer.service';

// Create
const transferId = await createTransfer({
  userId: 'user123',
  fromAccountId: 'account1',
  toAccountId: 'account2',
  amount: 1000000,
  currency: 'IDR',
  date: toTimestamp(new Date())
});

// Delete (auto-reverts balance)
await deleteTransfer(transferId);
```

---

## Testing Checklist

- [ ] Create same-currency transfer
- [ ] Create multi-currency transfer dengan exchange rate
- [ ] Verify saldo berkurang dari source account
- [ ] Verify saldo bertambah di destination account
- [ ] Test insufficient balance error
- [ ] Test same account error
- [ ] Test multi-currency tanpa exchange rate error
- [ ] List transfers dengan filter
- [ ] Delete transfer dan verify balance reversion
- [ ] Test ownership validation

---

**Last Updated:** Phase 8 - November 2025
