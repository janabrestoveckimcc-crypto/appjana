import { useState } from 'react';
import { useDocuments,useDocumentUrl } from '../features/documents/hooks/use-documents';
import type { DocumentRow } from '../features/documents/services/documents.service';
import { useT } from '../lib/i18n/use-t';
import { QueryState } from '../components/shared/QueryState';
export function DocumentsPage({userId}:{userId:string}) {
  const {t}=useT();
  const query=useDocuments(userId);
  const [selected,setSelected]=useState<DocumentRow|null>(null);
  const url=useDocumentUrl(selected?.storage_path??null);
  const categories=Object.fromEntries(t.categories.split('|').map(entry=>entry.split(':')));
  return <section className="content-page"><h1>{t.documents}</h1><QueryState loading={query.isPending} error={query.isError} retry={()=>void query.refetch()}/>
    {query.data?.length===0 && <div className="empty-state"><span className="empty-orb"/><h2>{t.noDocuments}</h2><p>{t.noDocumentsBody}</p></div>}
    <div className="document-grid">{query.data?.map((doc,index)=><button className="document-bubble" key={doc.id} style={{animationDelay:`${index*.08}s`}} onClick={()=>setSelected(doc)}><small>{categories[doc.category]??categories.ostalo}</small><strong>{doc.title}</strong></button>)}</div>
    {selected && <div className="file-view" role="dialog" aria-modal="true" aria-label={t.openDocument}><button autoFocus onClick={()=>setSelected(null)}>{t.close}</button><h2>{selected.title}</h2><QueryState loading={url.isPending} error={url.isError} retry={()=>void url.refetch()}/>{url.data && (selected.mime_type==='application/pdf'?<iframe title={selected.title} src={url.data}/>:<img alt={selected.title} src={url.data}/>)}</div>}
  </section>;
}
