import { useMessages } from '../features/assistant/hooks/use-messages';
import { useT } from '../lib/i18n/use-t';
import { QueryState } from '../components/shared/QueryState';
import { Avatar } from '../components/shared/Avatar';
import type { Json } from '../lib/database.types';
export function AssistantPage({userId,avatar}:{userId:string;avatar:Json}) {
  const {t}=useT();
  const query=useMessages(userId);
  return <section className="content-page"><h1>{t.assistant}</h1><QueryState loading={query.isPending} error={query.isError} retry={()=>void query.refetch()}/>
    {query.data?.length===0 && <div className="empty-state"><div className="assistant-portrait"><Avatar config={avatar}/></div><h2>{t.noMessages}</h2><p>{t.noMessagesBody}</p></div>}
    <div className="chat-history">{query.data?.map(message=><p className={`chat-message ${message.role}`} key={message.id}>{message.content}</p>)}</div>
  </section>;
}
