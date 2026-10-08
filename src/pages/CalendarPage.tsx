import { useTasks } from '../features/calendar/hooks/use-tasks';
import { useT } from '../lib/i18n/use-t';
import { formatDate } from '../lib/zagreb-time';
import { QueryState } from '../components/shared/QueryState';
export function CalendarPage({userId}:{userId:string}) {
  const {t,language}=useT();
  const query=useTasks(userId);
  return <section className="content-page"><h1>{t.calendar}</h1><QueryState loading={query.isPending} error={query.isError} retry={()=>void query.refetch()}/>
    {query.data?.length===0 && <div className="empty-state"><span className="empty-orb"/><h2>{t.noTasks}</h2><p>{t.noTasksBody}</p></div>}
    <div className="task-list">{query.data?.map(task=><article className="task-card" key={task.id}><span className="task-dot"/><div><h2>{task.title}</h2><p>{(task.due_date||task.start_at) && formatDate((task.due_date||task.start_at)!,language)}</p></div><small>{t[task.status as 'open'|'done'|'missed']}</small></article>)}</div>
  </section>;
}
