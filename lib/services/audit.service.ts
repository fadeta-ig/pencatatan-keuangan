// Audit Log Service
// Handles all audit log operations

import { Timestamp } from 'firebase/firestore';
import {
  createDocument,
  getDocument,
  queryUserDocuments,
  queryDocuments,
  toTimestamp,
} from '../firestore-helpers';
import {
  COLLECTIONS,
  FirestoreAuditLog,
  FirestoreAuditLogInput,
  AuditAction,
} from '@/types/firestore';

// Create audit log
export async function createAuditLog(
  data: FirestoreAuditLogInput
): Promise<string> {
  const logData = {
    ...data,
    timestamp: Timestamp.now(),
  };

  return createDocument(COLLECTIONS.AUDIT_LOGS, logData);
}

// Get audit log by ID
export async function getAuditLogById(
  logId: string
): Promise<(FirestoreAuditLog & { id: string }) | null> {
  return getDocument<FirestoreAuditLog>(COLLECTIONS.AUDIT_LOGS, logId);
}

// Get all audit logs for a user
export async function getUserAuditLogs(
  userId: string,
  options?: {
    action?: AuditAction;
    entity?: string;
    entityId?: string;
    startDate?: Date;
    endDate?: Date;
    limit?: number;
  }
): Promise<Array<FirestoreAuditLog & { id: string }>> {
  const whereConditions: Array<{
    field: string;
    operator: any;
    value: any;
  }> = [];

  if (options?.action) {
    whereConditions.push({ field: 'action', operator: '==', value: options.action });
  }

  if (options?.entity) {
    whereConditions.push({ field: 'entity', operator: '==', value: options.entity });
  }

  if (options?.entityId) {
    whereConditions.push({
      field: 'entityId',
      operator: '==',
      value: options.entityId,
    });
  }

  if (options?.startDate) {
    whereConditions.push({
      field: 'timestamp',
      operator: '>=',
      value: toTimestamp(options.startDate),
    });
  }

  if (options?.endDate) {
    whereConditions.push({
      field: 'timestamp',
      operator: '<=',
      value: toTimestamp(options.endDate),
    });
  }

  return queryUserDocuments<FirestoreAuditLog>(COLLECTIONS.AUDIT_LOGS, userId, {
    where: whereConditions,
    orderBy: [{ field: 'timestamp', direction: 'desc' }],
    limit: options?.limit || 100,
  });
}

// Get audit logs for a specific entity
export async function getEntityAuditLogs(
  entity: string,
  entityId: string,
  limit?: number
): Promise<Array<FirestoreAuditLog & { id: string }>> {
  return queryDocuments<FirestoreAuditLog>(COLLECTIONS.AUDIT_LOGS, {
    where: [
      { field: 'entity', operator: '==', value: entity },
      { field: 'entityId', operator: '==', value: entityId },
    ],
    orderBy: [{ field: 'timestamp', direction: 'desc' }],
    limit: limit || 50,
  });
}

// Helper function to log entity changes
export async function logEntityChange(
  userId: string,
  action: AuditAction,
  entity: string,
  entityId: string,
  oldData?: Record<string, any>,
  newData?: Record<string, any>,
  metadata?: {
    ipAddress?: string;
    userAgent?: string;
  }
): Promise<string> {
  return createAuditLog({
    userId,
    action,
    entity,
    entityId,
    oldData,
    newData,
    ipAddress: metadata?.ipAddress,
    userAgent: metadata?.userAgent,
  });
}
