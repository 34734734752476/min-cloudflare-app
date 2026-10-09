(function(){
  const isoToday = () => { const d=new Date(); return `${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,'0')}-${String(d.getDate()).padStart(2,'0')}`; };
  const fmt = d => d ? new Intl.DateTimeFormat('nn-NO',{dateStyle:'medium'}).format(new Date(`${d}T12:00:00`)) : '–';
  const daysUntil = d => Math.round((new Date(`${d}T12:00:00`) - new Date(`${isoToday()}T12:00:00`))/86400000);
  const escLocal = s => String(s??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));

  function smartSummary(){
    const today = isoToday();
    const openTasks = (data.tasks||[]).filter(x=>!x.completed);
    const overdue = openTasks.filter(x=>x.due && x.due < today).length;
    const dueToday = openTasks.filter(x=>x.due === today).length;
    const upcomingMatings = (data.matings||[]).filter(x=>x.due && x.due >= today).sort((a,b)=>String(a.due).localeCompare(String(b.due)));
    const nextDue = upcomingMatings[0] || null;
    const withdrawalSoon = (data.health||[]).filter(x=>x.withdrawal_end && x.withdrawal_end >= today && daysUntil(x.withdrawal_end) <= 14).length;
    const grazing = (data.pastures||[]).filter(x=>x.status==='Beita no').length;
    const available = (data.pastures||[]).filter(x=>x.status==='Tilgjengeleg').length;
    return {openTasks,overdue,dueToday,nextDue,withdrawalSoon,grazing,available};
  }

  function ensureSmartPanel(){
    const dashboard = $('dashboard');
    if(!dashboard || $('smartPanel')) return;
    const hero = dashboard.querySelector('.home-welcome') || dashboard.querySelector('.hero');
    const panel = document.createElement('div');
    panel.id='smartPanel';
    panel.className='smart-panel';
    if(hero) hero.insertAdjacentElement('afterend',panel);
    else dashboard.prepend(panel);
  }

  function renderSmartPanel(){
    ensureSmartPanel();
    const s = smartSummary();
    const nextText = s.nextDue ? `${escLocal(s.nextDue.ewe || 'Søye')} · ${fmt(s.nextDue.due)}` : 'Ingen termin i oversikta';
    const dueTone = s.nextDue && daysUntil(s.nextDue.due) <= 14 ? 'warn' : 'good';
    const taskTone = s.overdue ? 'alert' : (s.dueToday ? 'warn' : 'good');
    const healthTone = s.withdrawalSoon ? 'warn' : 'good';
    const pastureTone = s.grazing && s.available ? 'good' : (s.grazing ? 'warn' : 'good');
    const insight = s.overdue
      ? `Du har ${s.overdue} forfalne gjeremål. Få unna det viktigaste først.`
      : s.nextDue && daysUntil(s.nextDue.due) <= 14
        ? `Neste forventa lamming er snart. Sjekk fjøs, lammeutstyr og søya.`
        : s.withdrawalSoon
          ? `Nokre helseoppføringar nærmar seg slutten på tilbakehaldstida.`
          : `Garden ser roleg ut. Hald rutinane gåande og registrer observasjonar fortløpande.`;

    const panel = $('smartPanel');
    if(!panel) return;
    panel.innerHTML = `
      <div class="smart-strip">
        <div class="smart-card ${dueTone}"><div class="smart-kicker">NESTE LAMMING</div><div class="smart-title">${nextText}</div><div class="smart-value">${s.nextDue ? `${Math.max(0,daysUntil(s.nextDue.due))} dagar` : '—'}</div></div>
        <div class="smart-card ${taskTone}"><div class="smart-kicker">ARBEID NO</div><div class="smart-title">${s.overdue ? 'Forfalne gjeremål' : s.dueToday ? 'Gjeremål i dag' : 'God arbeidsflyt'}</div><div class="smart-value">${s.overdue || s.dueToday || s.openTasks.length}</div></div>
        <div class="smart-card ${healthTone}"><div class="smart-kicker">HELSEVAKT</div><div class="smart-title">Tilbakehaldstid</div><div class="smart-value">${s.withdrawalSoon}</div><div class="muted">nærmaste 14 dagar</div></div>
        <div class="smart-card ${pastureTone}"><div class="smart-kicker">BEITEROTASJON</div><div class="smart-title">Beita / ledig</div><div class="smart-value">${s.grazing} / ${s.available}</div><div class="muted">jordlappar</div></div>
      </div>
      <div class="card" style="margin-top:0">
        <div class="smart-insight"><div class="smart-insight-icon">✨</div><div><strong>Smarte forslag</strong><div class="muted" style="margin-top:3px">${escLocal(insight)}</div></div></div>
        <div class="smart-actions">
          ${s.overdue ? '<button onclick="openPage(\'tasks\')">✓ Sjå forfalne</button>' : ''}
          ${s.nextDue ? '<button onclick="openPage(\'mating\')">🐏 Sjå paringar</button>' : ''}
          ${s.withdrawalSoon ? '<button onclick="openPage(\'health\')">💚 Sjå helse</button>' : ''}
          ${!s.grazing && (data.pastures||[]).length ? '<button onclick="openPage(\'pasture\')">🌱 Planlegg beite</button>' : ''}
          <button onclick="openPage('new-animal')">＋ Nytt dyr</button>
        </div>
      </div>`;
  }

  // Den globale søkeknappen i v3.js er den einaste søkeknappen.
  // Den gamle ekstra "⌕ Søk"-knappen er fjerna for å unngå duplikat på PC og mobil.
  function ensureSearch(){ return; }

  const baseRenderAll = window.renderAll;
  window.renderAll = function(){
    baseRenderAll();
    renderSmartPanel();
  };

  document.addEventListener('keydown', e=>{
    if((e.ctrlKey||e.metaKey) && e.key.toLowerCase()==='k'){e.preventDefault();openGlobalSearch();}
  });

  setTimeout(()=>{ensureSmartPanel();renderSmartPanel();},0);
})();
