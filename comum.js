// Funções compartilhadas pelas páginas (orçamento, portal do cliente e painel)
window.G = (() => {
  const so = v => String(v || '').replace(/\D/g, '');

  const brl = v => v == null ? '—' : Number(v).toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });
  const data = d => d ? new Date(String(d).length === 10 ? d + 'T12:00:00' : d).toLocaleDateString('pt-BR') : '—';
  const dataHora = d => d ? new Date(d).toLocaleString('pt-BR', { dateStyle: 'short', timeStyle: 'short' }) : '—';
  const esc = s => String(s ?? '').replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));

  function mascaraDoc(el) {
    el.addEventListener('input', e => {
      const d = so(e.target.value).slice(0, 14);
      e.target.value = d.length <= 11
        ? d.replace(/(\d{3})(\d)/, '$1.$2').replace(/(\d{3})(\d)/, '$1.$2').replace(/(\d{3})(\d{1,2})$/, '$1-$2')
        : d.replace(/^(\d{2})(\d)/, '$1.$2').replace(/^(\d{2})\.(\d{3})(\d)/, '$1.$2.$3')
           .replace(/\.(\d{3})(\d)/, '.$1/$2').replace(/(\d{4})(\d{1,2})$/, '$1-$2');
    });
  }

  function mascaraTel(el) {
    el.addEventListener('input', e => {
      const d = so(e.target.value).slice(0, 11);
      e.target.value = d.length > 10 ? d.replace(/^(\d{2})(\d{5})(\d{0,4})/, '($1) $2-$3')
        : d.length > 6 ? d.replace(/^(\d{2})(\d{4})(\d{0,4})/, '($1) $2-$3')
        : d.length > 2 ? d.replace(/^(\d{2})(\d*)/, '($1) $2') : d;
    });
  }

  // CPF/CNPJ com dígito verificador (mesma regra da API)
  function docValido(v) {
    const d = so(v);
    if (/^(\d)\1+$/.test(d)) return false;
    if (d.length === 11) {
      for (let t = 9; t < 11; t++) {
        let s = 0; for (let i = 0; i < t; i++) s += d[i] * (t + 1 - i);
        if (((s * 10) % 11) % 10 != d[t]) return false;
      }
      return true;
    }
    if (d.length === 14) {
      const dv = p => { let s = 0; p.forEach((w, i) => s += d[i] * w); const r = s % 11; return r < 2 ? 0 : 11 - r; };
      return dv([5,4,3,2,9,8,7,6,5,4,3,2]) == d[12] && dv([6,5,4,3,2,9,8,7,6,5,4,3,2]) == d[13];
    }
    return false;
  }

  /** Link do WhatsApp da Genova com a mensagem pronta (ou Instagram, se o número não estiver configurado). */
  function linkWhats(texto, numero) {
    const n = so(numero || window.GENOVA_WHATSAPP);
    return n ? `https://wa.me/${n}?text=${encodeURIComponent(texto)}` : (window.GENOVA_INSTAGRAM || 'https://instagram.com/genova_forge');
  }

  async function post(caminho, corpo) {
    const r = await fetch(window.GENOVA_API + caminho, {
      method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(corpo)
    });
    const c = await r.json().catch(() => ({}));
    if (!r.ok) { const e = new Error(c.mensagem || 'Não foi possível concluir agora.'); e.campos = c.campos; e.status = r.status; throw e; }
    return c;
  }

  const ERRO_REDE = 'Não conseguimos conectar agora. Tente de novo em instantes.';

  return { so, brl, data, dataHora, esc, mascaraDoc, mascaraTel, docValido, linkWhats, post, ERRO_REDE };
})();
