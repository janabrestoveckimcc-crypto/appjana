import { useQuery } from '@tanstack/react-query';
import { readDocuments,documentUrl } from '../services/documents.service';
export function useDocuments(userId:string) {
  return useQuery({queryKey:['documents',userId],queryFn:readDocuments,retry:false});
}
export function useDocumentUrl(path:string|null) {
  return useQuery({queryKey:['document-url',path],queryFn:()=>documentUrl(path!),enabled:Boolean(path),staleTime:0,gcTime:0,retry:false});
}
