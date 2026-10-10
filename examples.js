(() => {
  const labels = {deaf: '🙉 Deaf', mute: '🙊 Mute', blind: '🙈 Blind'};
  function element(tag, cls, text) {
    const node = document.createElement(tag);
    if (cls) node.className = cls;
    if (text !== undefined) node.textContent = text;
    return node;
  }
  function initialize(root, data) {
    const panel = root.querySelector('.episode-shell');
    const transcript = root.querySelector('.episode-transcript');
    const episodes = root.dataset.episodeIds.split(',').map(id => data.find(e => e.id === id));
    if (episodes.some(e => !e)) throw new Error('Missing episode');
    let selected = 0;
    const controls = root.querySelector('.episode-controls');
    controls.replaceChildren(element('span', 'episode-perspectives-label', 'Three perspectives'));
    const opener = element('button', 'episode-expand', 'Full screen ↗');
    opener.type = 'button';
    opener.setAttribute('aria-haspopup', 'dialog');
    controls.append(opener);
    transcript.removeAttribute('tabindex');
    transcript.setAttribute('aria-label', 'Three role-specific conversation previews');
    const dialog = element('dialog', 'episode-dialog');
    dialog.setAttribute('aria-label', 'Three perspectives: full conversation');
    const toolbar = element('div', 'episode-dialog-toolbar');
    toolbar.append(element('h2', '', 'Three perspectives'));
    const closer = element('button', 'episode-close', 'Close ✕');
    closer.type = 'button';
    toolbar.append(closer);
    dialog.append(toolbar);
    root.append(dialog);
    function render() {
      const episode = episodes[selected];
      root.querySelectorAll('[data-example]').forEach((button, i) => {
        button.setAttribute('aria-selected', String(i === selected));
        button.tabIndex = i === selected ? 0 : -1;
      });
      const selectedTab = root.querySelector('[data-example="' + selected + '"]');
      if (selectedTab) panel.setAttribute('aria-labelledby', selectedTab.id);
      root.querySelector('[data-episode-model]').textContent = episode.model + ' · Thinking ' + episode.thinking;
      root.querySelector('[data-episode-task]').textContent = episode.task + ' · ' + episode.repeat + ' · ' + episode.rounds + ' rounds';
      const outcome = root.querySelector('[data-episode-outcome]');
      outcome.textContent = episode.success ? 'Defused' : episode.reason === 'round limit reached' ? 'Timed out' : 'Failed';
      outcome.className = episode.success ? 'episode-outcome won' : 'episode-outcome lost';
      root.querySelector('[data-episode-note]').textContent = dialog.open
        ? 'Each column shows what that agent received and sent.'
        : 'Click a conversation to scroll inside. Click outside to return to the page.';
      transcript.replaceChildren();
      for (const role of ['deaf', 'mute', 'blind']) {
        const column = element('section', 'perspective-column ' + role);
        column.append(element('h4', 'perspective-heading', labels[role]));
        const history = element('div', 'perspective-history');
        history.setAttribute('role', 'region');
        history.setAttribute('aria-label', labels[role] + ' conversation');
        history.tabIndex = 0;
        history.addEventListener('pointerdown', () => {
          history.focus({preventScroll: true});
          history.classList.add('scroll-active');
        });
        history.addEventListener('focusin', () => history.classList.add('scroll-active'));
        history.addEventListener('focusout', event => {
          if (!history.contains(event.relatedTarget)) history.classList.remove('scroll-active');
        });
        history.addEventListener('keydown', event => {
          if (event.key === 'Escape' && !dialog.open) {
            history.classList.remove('scroll-active');
            history.blur();
          }
        });
        for (const turn of episode.turns.filter(t => t.role === role)) {
          const card = element('article', 'perspective-turn');
          card.append(element('h5', 'episode-round', 'Round ' + turn.round));
          const [state, received = ''] = turn.observation.split(/VIEWABLE CONTEXT \(new arrivals\):\s*/);
          const observation = element('details', 'episode-observation');
          observation.append(element('summary', '', 'Private view'), element('pre', '', state.replace(/^TURN \d+\s*/, '').trim()));
          card.append(observation);
          if (received.trim() && received.trim() !== '(empty)') {
            const bubble = element('div', 'chat-bubble incoming');
            bubble.append(element('span', 'episode-channel', 'Received'), element('p', '', received.trim()));
            card.append(bubble);
          }
          for (const call of turn.calls) {
            const bubble = element('div', 'chat-bubble outgoing ' + role);
            const recipient = call.to ? labels[call.to] || call.to : 'Everyone';
            let title, text;
            if (call.type === 'speak') { title = labels[role] + ' → ' + recipient; text = call.text; }
            else if (call.type === 'gesture') { title = labels[role] + ' · Gesture → ' + recipient; text = Array.isArray(call.symbols) ? call.symbols.join(' ') : String(call.symbols); bubble.classList.add('gesture-message'); }
            else if (call.type === 'act') { title = labels[role] + ' · Action'; text = Object.entries(call).filter(([key]) => key !== 'type').map(([key, value]) => key + '=' + JSON.stringify(value)).join(', '); }
            else if (call.type === 'wait') { title = labels[role] + ' · Wait'; text = ''; }
            else { title = labels[role] + ' · Recorded call'; text = call.text || JSON.stringify(call); }
            bubble.append(element('span', 'episode-channel', title));
            if (text) bubble.append(element('p', '', text));
            card.append(bubble);
          }
          history.append(card);
        }
        history.append(element('p', 'episode-end', episode.success ? 'Bomb defused.' : 'Episode ended: ' + episode.reason + '.'));
        column.append(history);
        transcript.append(column);
      }
    }
    root.querySelectorAll('[data-example]').forEach((button, index) => {
      button.addEventListener('click', () => { selected = index; render(); });
      button.addEventListener('keydown', event => {
        const buttons = [...root.querySelectorAll('[data-example]')];
        let target;
        if (event.key === 'ArrowRight') target = (index + 1) % buttons.length;
        if (event.key === 'ArrowLeft') target = (index + buttons.length - 1) % buttons.length;
        if (event.key === 'Home') target = 0;
        if (event.key === 'End') target = buttons.length - 1;
        if (target === undefined) return;
        event.preventDefault(); selected = target; render(); buttons[target].focus();
      });
    });
    const tabs = root.querySelector('.episode-tabs');
    const tabsPlace = document.createComment('episode tabs');
    const panelPlace = document.createComment('episode panel');
    let previousOverflow = '';
    opener.addEventListener('click', () => {
      if (tabs) { tabs.before(tabsPlace); dialog.append(tabs); }
      panel.before(panelPlace); dialog.append(panel);
      previousOverflow = document.body.style.overflow;
      document.body.style.overflow = 'hidden';
      dialog.showModal(); render(); closer.focus();
    });
    closer.addEventListener('click', () => dialog.close());
    dialog.addEventListener('close', () => {
      if (tabs) tabsPlace.replaceWith(tabs);
      panelPlace.replaceWith(panel);
      document.body.style.overflow = previousOverflow;
      render(); opener.focus({preventScroll: true});
    });
    document.addEventListener('pointerdown', event => {
      root.querySelectorAll('.perspective-history.scroll-active').forEach(history => {
        if (!history.contains(event.target)) {
          history.classList.remove('scroll-active');
          if (history.contains(document.activeElement)) document.activeElement.blur();
        }
      });
    });
    render(); panel.removeAttribute('aria-busy');
  }
  fetch('assets/examples.json').then(response => {
    if (!response.ok) throw new Error('Trace data unavailable');
    return response.json();
  }).then(data => document.querySelectorAll('[data-episode-ids]').forEach(root => initialize(root, data)))
    .catch(() => document.querySelectorAll('[data-episode-ids]').forEach(root => {
      root.querySelector('.episode-transcript').textContent = 'The conversation could not load. Please refresh.';
      root.querySelector('.episode-shell').removeAttribute('aria-busy');
    }));
})();
