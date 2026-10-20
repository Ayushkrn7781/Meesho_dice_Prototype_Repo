import { activeSteps, type Attrs } from '../catalog';
import { L, useStore } from '../store';

// One question at a time: the next dropdown appears once the previous is answered.
export function ProductForm({ attrs, onChange }: { attrs: Attrs; onChange: (a: Attrs) => void }) {
  const s = useStore();
  const steps = activeSteps(attrs);
  const firstOpen = steps.findIndex(st => !attrs[st.key]);
  const shown = firstOpen === -1 ? steps : steps.slice(0, firstOpen + 1);
  return (
    <div className="qform">
      {shown.map((st, i) => {
        const done = !!attrs[st.key];
        return (
          <label key={st.key} className={'q' + (done ? ' done' : ' open')}>
            <span className="qn">{done ? '✓' : i + 1}</span>
            <span className="ql">{st.label[s.lang]}</span>
            <select value={attrs[st.key] ?? ''} onChange={e => {
              const next: Attrs = {};
              // keep earlier answers, clear later ones (their options may change)
              for (const x of steps) { if (x.key === st.key) break; if (attrs[x.key]) next[x.key] = attrs[x.key]; }
              next[st.key] = e.target.value;
              onChange(next);
            }}>
              <option value="" disabled>{L(s, 'Choose…', 'चुनें…')}</option>
              {st.options(attrs).map(o => <option key={o.id} value={o.id}>{o[s.lang]}</option>)}
            </select>
          </label>
        );
      })}
      <p className="hint">{L(s, `${shown.filter(x => attrs[x.key]).length} of ${steps.length} answered`, `${steps.length} में से ${shown.filter(x => attrs[x.key]).length} जवाब`)}</p>
    </div>
  );
}
