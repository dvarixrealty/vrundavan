import { 
  setDoc as realSetDoc, 
  deleteDoc as realDeleteDoc, 
  updateDoc as realUpdateDoc,
  DocumentReference
} from 'firebase/firestore';
import { mysqlClientService } from './mysqlClientService';

// Extract collection path and doc ID from a DocumentReference
function parseDocRef(docRef: DocumentReference<any>) {
  const path = docRef.path;
  const parts = path.split('/');
  return {
    collection: parts[0],
    id: parts[1]
  };
}

export async function setDoc(docRef: DocumentReference<any>, data: any, options?: any) {
  // 1. Run the real Firestore write first (Firestore is active production)
  const result = await realSetDoc(docRef, data, options);

  // 2. Extract metadata for parallel MySQL dual-write
  const { collection, id } = parseDocRef(docRef);
  console.log(`[Proxy setDoc] Collection: ${collection}, ID: ${id}`);

  // 3. Parallel non-blocking write to Hostinger MySQL
  try {
    switch (collection) {
      case 'chatbot_knowledge':
        await mysqlClientService.saveChatbotKnowledge({ id, ...data });
        break;
      case 'chatbot_documents':
        await mysqlClientService.saveChatbotDocument({ id, ...data });
        break;
      case 'chatbot_websites':
        await mysqlClientService.saveChatbotWebsite({ id, ...data });
        break;
      case 'chatbot_snippets':
        await mysqlClientService.saveChatbotSnippet({ id, ...data });
        break;
      case 'chatbot_flows':
        await mysqlClientService.saveChatbotFlow({ id, ...data });
        break;
      case 'customer_requirements':
        await mysqlClientService.saveCustomerRequirement({ id, ...data });
        break;
      case 'qualification_rules':
        await mysqlClientService.saveQualificationRule({ id, ...data });
        break;
      case 'chatbot_audit_logs':
        await mysqlClientService.saveChatbotAuditLog({ id, ...data });
        break;
      case 'requirements':
        await mysqlClientService.saveRequirement({ id, ...data });
        break;
      default:
        console.log(`[Proxy setDoc] No MySQL table mapping for collection: ${collection}`);
    }
  } catch (err) {
    console.warn(`[Proxy setDoc] Failed to sync ${collection} to MySQL parallel database:`, err);
  }

  return result;
}

export async function deleteDoc(docRef: DocumentReference<any>) {
  // 1. Run the real Firestore delete
  const result = await realDeleteDoc(docRef);

  // 2. Extract metadata
  const { collection, id } = parseDocRef(docRef);
  console.log(`[Proxy deleteDoc] Collection: ${collection}, ID: ${id}`);

  // 3. Parallel non-blocking delete
  try {
    switch (collection) {
      case 'chatbot_knowledge':
        await mysqlClientService.deleteChatbotKnowledge(id);
        break;
      case 'chatbot_documents':
        await mysqlClientService.deleteChatbotDocument(id);
        break;
      case 'chatbot_websites':
        await mysqlClientService.deleteChatbotWebsite(id);
        break;
      case 'chatbot_snippets':
        await mysqlClientService.deleteChatbotSnippet(id);
        break;
      case 'chatbot_flows':
        await mysqlClientService.deleteChatbotFlow(id);
        break;
      case 'customer_requirements':
        await mysqlClientService.deleteCustomerRequirement(id);
        break;
      case 'qualification_rules':
        await mysqlClientService.deleteQualificationRule(id);
        break;
      case 'requirements':
        await mysqlClientService.deleteRequirement(id);
        break;
      default:
        console.log(`[Proxy deleteDoc] No MySQL mapping for delete collection: ${collection}`);
    }
  } catch (err) {
    console.warn(`[Proxy deleteDoc] Failed to sync delete on ${collection} to MySQL parallel database:`, err);
  }

  return result;
}

export async function updateDoc(docRef: DocumentReference<any>, data: any) {
  // 1. Run the real Firestore update
  const result = await realUpdateDoc(docRef, data);

  // 2. Extract metadata
  const { collection, id } = parseDocRef(docRef);
  console.log(`[Proxy updateDoc] Collection: ${collection}, ID: ${id}`);

  // 3. Parallel write
  try {
    switch (collection) {
      case 'chatbot_knowledge':
        await mysqlClientService.saveChatbotKnowledge({ id, ...data });
        break;
      case 'chatbot_documents':
        await mysqlClientService.saveChatbotDocument({ id, ...data });
        break;
      case 'customer_requirements':
        await mysqlClientService.saveCustomerRequirement({ id, ...data });
        break;
      case 'qualification_rules':
        await mysqlClientService.saveQualificationRule({ id, ...data });
        break;
      default:
        console.log(`[Proxy updateDoc] No MySQL update mapping for collection: ${collection}`);
    }
  } catch (err) {
    console.warn(`[Proxy updateDoc] Failed to sync update on ${collection} to MySQL parallel database:`, err);
  }

  return result;
}
