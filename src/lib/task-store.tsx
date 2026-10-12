import { createContext, useContext, useState, type ReactNode } from "react";
import { TODAY } from "./config";
import { firmForArea, getFirm, INITIAL_TASKS, type Msg, type Party, type Task } from "./tasks";

interface Store {
  tasks: Task[];
  getTask: (id: string) => Task | undefined;
  start: (id: string) => void;
  deliver: (id: string, note: string) => void;
  accept: (id: string, who: string) => void;
  requestChanges: (id: string, who: string, note: string) => void;
  say: (id: string, from: string, party: Party, text: string) => void;
  addRequest: (id: string, text: string) => void;
  resolveRequest: (id: string, reqId: string) => void;
  proposeMeeting: (id: string, at: string) => void;
  confirmMeeting: (id: string, at?: string) => void;
  reassign: (id: string, firmId: string) => void;
  setDue: (id: string, due: string) => void;
}

const Ctx = createContext<Store | null>(null);
const hist = (es: string, en: string, note?: string) => ({ at: TODAY, es, en, ...(note ? { note } : {}) });

export function TaskProvider({ children }: { children: ReactNode }) {
  const [tasks, setTasks] = useState<Task[]>(INITIAL_TASKS);
  const up = (id: string, f: (t: Task) => Task) => setTasks((ts) => ts.map((t) => (t.id === id ? f(t) : t)));
  const msg = (from: string, party: Party, text: string): Msg => ({ from, party, at: TODAY, text });

  const store: Store = {
    tasks,
    getTask: (id) => tasks.find((t) => t.id === id),
    start: (id) => up(id, (t) => ({ ...t, status: "progress", step: Math.max(t.step, 1), history: [...t.history, hist("En proceso", "In progress")] })),
    deliver: (id, note) => up(id, (t) => {
      const re = t.status === "changes";
      const file = `${t.code}_v${t.attachments.length + 1}.pdf`;
      return { ...t, status: re ? "redelivered" : "delivered", step: 3, ...(note || t.deliveryNote ? { deliveryNote: note || t.deliveryNote || "" } : {}), attachments: [...t.attachments, file],
        history: [...t.history, re ? hist("Reentregada", "Redelivered", note) : hist("Entregada", "Delivered", note)],
        thread: note ? [...t.thread, msg(t.responsible, "firm", note)] : t.thread };
    }),
    accept: (id, who) => up(id, (t) => ({ ...t, status: "accepted", step: 4, history: [...t.history, hist(`Aceptada por ${who}`, `Accepted by ${who}`)] })),
    requestChanges: (id, who, note) => up(id, (t) => ({ ...t, status: "changes", step: 2, changesNote: note,
      history: [...t.history, hist("Cambios pedidos", "Changes requested", note)], thread: [...t.thread, msg(who, "owner", note)] })),
    say: (id, from, party, text) => up(id, (t) => ({ ...t, thread: [...t.thread, msg(from, party, text)] })),
    addRequest: (id, text) => up(id, (t) => ({ ...t, requests: [...t.requests, { id: `rq-${Date.now()}`, text, at: TODAY, resolved: false }] })),
    resolveRequest: (id, reqId) => setTasks((ts) => ts.map((t) => (t.id === id ? { ...t, requests: t.requests.map((r) => (r.id === reqId ? { ...r, resolved: true } : r)) } : t))),
    proposeMeeting: (id, at) => up(id, (t) => ({ ...t, meeting: { at, status: "proposed" } })),
    confirmMeeting: (id, at) => up(id, (t) => (t.meeting ? { ...t, meeting: { at: at ?? t.meeting.at, status: "confirmed" } } : t)),
    reassign: (id, firmId) => up(id, (t) => {
      const f = getFirm(firmId) ?? firmForArea(t.area);
      return { ...t, firm: f.id, responsible: f.contact, history: [...t.history, hist(`Reasignada a ${f.name}`, `Reassigned to ${f.name}`)] };
    }),
    setDue: (id, due) => up(id, (t) => ({ ...t, due, history: [...t.history, hist(`Fecha límite cambiada a ${due}`, `Due date changed to ${due}`)] })),
  };
  return <Ctx.Provider value={store}>{children}</Ctx.Provider>;
}

export function useTasks() {
  const c = useContext(Ctx);
  if (!c) throw new Error("useTasks outside provider");
  return c;
}
