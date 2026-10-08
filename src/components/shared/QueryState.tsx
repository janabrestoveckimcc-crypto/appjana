import { useT } from '../../lib/i18n/use-t';
export function QueryState({loading,error,retry}:{loading:boolean;error:boolean;retry:()=>void}) {
  const {t}=useT();
  if (loading) return <p role="status" className="view-state">{t.loading}</p>;
  if (error) return <div className="view-state" role="alert"><p>{t.loadError}</p><button onClick={retry}>{t.retry}</button></div>;
  return null;
}
