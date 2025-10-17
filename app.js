// Configure backend URL:
// Priority: ?backend= query param -> window.BACKEND -> auto-detect page origin (if served over http/https)
// Examples:
//  - /?backend=http://localhost:3000
//  - in console: window.BACKEND = 'http://localhost:3000'
// If the UI is served by the Express server, the client will default to the page origin.
const $ = sel => document.querySelector(sel);
const paramBackend = new URLSearchParams(location.search).get('backend');
const BACKEND = paramBackend || window.BACKEND || ((location.protocol === 'http:' || location.protocol === 'https:') ? location.origin : '');

async function fetchJson(url, opts) {
  const res = await fetch(url, opts);
  const text = await res.text();
  try { return { ok: res.ok, data: JSON.parse(text), status: res.status }; }
  catch (e) { return { ok: res.ok, data: text, status: res.status }; }
}

async function listItems() {
  const res = await fetchJson(BACKEND + '/list');
  const data = res.data;
  const tbody = $('tbody');
  tbody.innerHTML = '';
  (data && data.items || []).forEach(it => {
    const tr = document.createElement('tr');
    tr.innerHTML = `<td>${it.Key}</td><td>${it.Size}</td><td>${it.LastModified || ''}</td><td></td>`;
    // Configure backend URL:
    // Priority: ?backend= query param -> window.BACKEND -> auto-detect page origin (if served over http/https)
    // Examples:
    //  - /?backend=http://localhost:3000
    //  - in console: window.BACKEND = 'http://localhost:3000'
    // If the UI is served by the Express server, the client will default to the page origin.
    const $ = sel => document.querySelector(sel);
    const paramBackend = new URLSearchParams(location.search).get('backend');
    const BACKEND = paramBackend || window.BACKEND || ((location.protocol === 'http:' || location.protocol === 'https:') ? location.origin : '');

    async function fetchJson(url, opts) {
      const res = await fetch(url, opts);
      const text = await res.text();
      try { return { ok: res.ok, data: JSON.parse(text), status: res.status }; }
      catch (e) { return { ok: res.ok, data: text, status: res.status }; }
    }

    async function listItems() {
      const res = await fetchJson(BACKEND + '/list');
      const data = res.data;
      const tbody = $('tbody');
      tbody.innerHTML = '';
      (data && data.items || []).forEach(it => {
        const tr = document.createElement('tr');
        tr.innerHTML = `<td>${it.Key}</td><td>${it.Size}</td><td>${it.LastModified || ''}</td><td></td>`;
        const actions = tr.querySelector('td:last-child');
        const dl = document.createElement('button');
        dl.textContent = 'Download';
        dl.addEventListener('click', () => downloadKey(it.Key));
        actions.appendChild(dl);
        tbody.appendChild(tr);
      });
    }

    async function downloadKey(key) {
      const res = await fetchJson(BACKEND + '/presign-download', { method: 'POST', headers: { 'content-type': 'application/json' }, body: JSON.stringify({ key }) });
      if (!res.ok) return alert('Server error (' + res.status + '): ' + (res.data && typeof res.data === 'string' ? res.data : JSON.stringify(res.data)));
      const data = res.data;
      if (data.error) return alert(data.error);
      // open the signed url
      window.open(data.url, '_blank');
    }

    async function uploadFiles() {
      const files = $('#fileInput').files;
      const prefix = $('#prefix').value || '';
      if (!files.length) return alert('Pick at least one file');

      for (let file of files) {
        const key = prefix + file.name;
        const pres = await fetchJson(BACKEND + '/presign-upload', { method: 'POST', headers: { 'content-type': 'application/json' }, body: JSON.stringify({ key, contentType: file.type }) });
        if (!pres.ok) { alert('Presign failed (' + pres.status + '): ' + (pres.data && typeof pres.data === 'string' ? pres.data : JSON.stringify(pres.data))); continue; }
        const data = pres.data;
        if (data.error) { alert('Error: ' + data.error); continue; }

        const putRes = await fetch(data.url, { method: 'PUT', headers: { 'content-type': file.type || 'application/octet-stream' }, body: file });
        if (!putRes.ok) { alert('Upload failed for ' + file.name + ' status=' + putRes.status); continue; }
      }
      alert('Uploads complete');
      listItems();
    }

    $('#uploadBtn').addEventListener('click', uploadFiles);
    $('#refreshBtn').addEventListener('click', listItems);

    listItems();
    // Priority: ?backend= query param -> window.BACKEND -> auto-detect page origin (if served over http/https)
    // Examples:
    //  - /?backend=http://localhost:3000
    //  - in console: window.BACKEND = 'http://localhost:3000'
    // If the UI is served by the Express server, the client will default to the page origin.
    const $ = sel => document.querySelector(sel);
    const paramBackend = new URLSearchParams(location.search).get('backend');
    const BACKEND = paramBackend || window.BACKEND || ((location.protocol === 'http:' || location.protocol === 'https:') ? location.origin : '');

    async function fetchJson(url, opts) {
      const res = await fetch(url, opts);
      const text = await res.text();
      try { return { ok: res.ok, data: JSON.parse(text), status: res.status }; }
      catch (e) { return { ok: res.ok, data: text, status: res.status }; }
    }

    async function listItems() {
      const res = await fetchJson(BACKEND + '/list');
      const data = res.data;
      const tbody = $('tbody');
      tbody.innerHTML = '';
      (data && data.items || []).forEach(it => {
        const tr = document.createElement('tr');
        tr.innerHTML = `<td>${it.Key}</td><td>${it.Size}</td><td>${it.LastModified || ''}</td><td></td>`;
        const actions = tr.querySelector('td:last-child');
        const dl = document.createElement('button');
        dl.textContent = 'Download';
        dl.addEventListener('click', () => downloadKey(it.Key));
        actions.appendChild(dl);
        tbody.appendChild(tr);
      });
    }

    async function downloadKey(key) {
      const res = await fetchJson(BACKEND + '/presign-download', { method: 'POST', headers: { 'content-type': 'application/json' }, body: JSON.stringify({ key }) });
      if (!res.ok) return alert('Server error (' + res.status + '): ' + (res.data && typeof res.data === 'string' ? res.data : JSON.stringify(res.data)));
      const data = res.data;
      if (data.error) return alert(data.error);
      // open the signed url
      window.open(data.url, '_blank');
    }

    async function uploadFiles() {
      const files = $('#fileInput').files;
      const prefix = $('#prefix').value || '';
      if (!files.length) return alert('Pick at least one file');

      for (let file of files) {
        const key = prefix + file.name;
        const pres = await fetchJson(BACKEND + '/presign-upload', { method: 'POST', headers: { 'content-type': 'application/json' }, body: JSON.stringify({ key, contentType: file.type }) });
        if (!pres.ok) { alert('Presign failed (' + pres.status + '): ' + (pres.data && typeof pres.data === 'string' ? pres.data : JSON.stringify(pres.data))); continue; }
        const data = pres.data;
        if (data.error) { alert('Error: ' + data.error); continue; }

        const putRes = await fetch(data.url, { method: 'PUT', headers: { 'content-type': file.type || 'application/octet-stream' }, body: file });
        if (!putRes.ok) { alert('Upload failed for ' + file.name + ' status=' + putRes.status); continue; }
      }
      alert('Uploads complete');
      listItems();
    }

    $('#uploadBtn').addEventListener('click', uploadFiles);
    $('#refreshBtn').addEventListener('click', listItems);

    listItems();
    const actions = tr.querySelector('td:last-child');
