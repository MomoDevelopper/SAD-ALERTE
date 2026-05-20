export function Card(props: { title?: string; children: React.ReactNode }) {
  return (
    <div className="w-full rounded-2xl bg-white p-6 shadow-sm ring-1 ring-slate-200">
      {props.title ? <h2 className="text-lg font-semibold">{props.title}</h2> : null}
      <div className={props.title ? "mt-4" : ""}>{props.children}</div>
    </div>
  );
}

