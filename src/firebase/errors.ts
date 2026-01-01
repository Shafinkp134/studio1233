export type SecurityRuleContext = {
    path: string;
    operation: 'get' | 'list' | 'create' | 'update' | 'delete';
    requestResourceData?: any;
};

export class FirestorePermissionError extends Error {
  constructor(public context: SecurityRuleContext) {
    const { path, operation, requestResourceData } = context;
    const message = `FirestoreError: Missing or insufficient permissions: 
    The following request was denied by Firestore Security Rules:
    {
      "auth": "...",
      "method": "${operation}",
      "path": "${path}"
      ${requestResourceData ? `,"requestData": ${JSON.stringify(requestResourceData, null, 2)}` : ''}
    }`;
    super(message);
    this.name = 'FirestorePermissionError';
  }
}
