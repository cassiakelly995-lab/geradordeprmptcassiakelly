
const $=id=>document.getElementById(id);
const F=['tarefa','material','formato','papel','publico','exemplo','tom','extra','cores','estilo','textoarte','evitar'];
const TOM='Português do Brasil, objetivo';
const R=[
["Só a fonte","Baseie-se somente no material acima.","Use apenas o que está neste prompt."],
["Admitir lacuna",'Se a informação não constar, responda "Não consta no material." e diga o que falta.','Se não souber, responda "Não sei" e diga o que falta.'],
["Não inventar","Não invente fatos, números, fontes nem citações.","Não invente fatos, números, fontes nem citações."],
["Marcar inferência","Marque como [inferência] qualquer dedução sua.","Marque como [inferência] qualquer dedução sua."],
["Citar trecho","Cite o trecho do material que sustenta cada afirmação.",null],
["Neutro","Seja neutro: sem opinião nem juízo de valor.","Seja neutro: sem opinião nem juízo de valor."]];
const CR=["Use o briefing como base e execute já, sem perguntar o que ele já diz.","Se faltar algo essencial, faça no máximo 1 pergunta curta; senão, decida e execute.","Não invente dados, estatísticas, nomes nem logotipos oficiais.","Marque como [suposição] o que você decidir sozinho.",null,"Seja neutro: sem opinião nem juízo de valor."];
const CC=["execute já","1 pergunta curta se faltar algo essencial","não invente dados","marque [suposição]",null,"seja neutro"];
const C=["use só a fonte","admita lacunas","não invente","marque [inferência]","cite o trecho","seja neutro"];
const TEC={
pensar:"Analise com cuidado antes de responder e entregue só o resultado final.",
verificar:"Antes de responder, confira cada afirmação com o material e remova o que não tiver base.",
estrito:"Siga exatamente o formato de saída, sem texto antes ou depois."};
const TIT={briefing:'BRIEFING',material:'MATERIAL',exemplo:'EXEMPLO',tarefa:'TAREFA',saida:'SAÍDA',regras:'REGRAS'};
$('rules').innerHTML=R.map((r,i)=>`<label><input type="checkbox" data-r="${i}" checked><span>${r[0]}</span></label>`).join('');
const TPL={
"Resumir":{tarefa:"Resuma o material em até 5 tópicos.",formato:"Lista numerada, até 100 palavras"},
"Extrair dados":{tarefa:"Extraia do material: nomes, datas e valores. Não deduza o que estiver ausente.",formato:"Tabela em Markdown",tecnica:"estrito"},
"Redigir":{papel:"redator profissional",tarefa:"Redija um texto usando apenas o material.",formato:"Parágrafos curtos",tecnica:"verificar"},
"Revisar":{papel:"revisor de textos",tarefa:"Corrija ortografia e clareza sem mudar o sentido nem acrescentar informação.",formato:"Texto corrigido + lista das mudanças"},
"Criar imagem":{tarefa:"Gere agora uma imagem com base no briefing.",formato:"Imagem 1080x1080, estilo limpo",modo:"imagem"},
"Comparar":{papel:"analista neutro",tarefa:"Compare as opções do material por critérios objetivos. Não recomende.",formato:"Tabela em Markdown",tecnica:"verificar"}};
const ls={get(k,d){try{const v=localStorage.getItem(k);return v?JSON.parse(v):d}catch(e){return d}},set(k,v){try{localStorage.setItem(k,JSON.stringify(v))}catch(e){}}};
const all=()=>Object.assign({},TPL,ls.get('sp_modelos',{}));
const fillTpl=()=>{const s=$('tpl');s.length=1;Object.keys(all()).forEach(k=>s.add(new Option(k,k)))};
function toast(t){const e=$('toast');e.textContent=t;e.classList.add('on');clearTimeout(toast.t);toast.t=setTimeout(()=>e.classList.remove('on'),1600)}
const getState=()=>{const o={};F.forEach(f=>o[f]=$(f).value);o.tecnica=$('tecnica').value;o.alvo=$('alvo').value;o.tam=$('tam').value;o.modo=$('modo').value;o.rg=[...document.querySelectorAll('[data-r]:checked')].map(c=>+c.dataset.r);return o};
function setState(o){F.forEach(f=>{if(typeof o[f]==='string')$(f).value=o[f]});
 if(o.tecnica&&[...$('tecnica').options].some(x=>x.value===o.tecnica))$('tecnica').value=o.tecnica;
 if(o.alvo&&[...$('alvo').options].some(x=>x.value===o.alvo))$('alvo').value=o.alvo;
 if(o.tam&&[...$('tam').options].some(x=>x.value===o.tam))$('tam').value=o.tam;
 if(o.modo&&[...$('modo').options].some(x=>x.value===o.modo))$('modo').value=o.modo;
 if(Array.isArray(o.rg))document.querySelectorAll('[data-r]').forEach(c=>c.checked=o.rg.includes(+c.dataset.r))}
let TXT='';const VARS={};const VRE=/\{\{\s*([^{}\n]{1,30}?)\s*\}\}/g;
const sub=t=>t.replace(VRE,(m,n)=>VARS[n.trim()]||m);
function varsUI(raw){const names=[...new Set([...raw.matchAll(VRE)].map(m=>m[1].trim()))],box=$('vars'),k=names.join('|');if(box.dataset.k===k)return;box.dataset.k=k;box.textContent='';
 names.forEach(n=>{const i=document.createElement('input');i.placeholder='{{'+n+'}}';i.setAttribute('aria-label','Variável '+n);i.value=VARS[n]||'';i.oninput=()=>{VARS[n]=i.value;build()};box.append(i)});box.hidden=!names.length}
function build(){
 const s=getState(),v={},raw=F.map(f=>s[f]).join('\n');F.forEach(f=>v[f]=sub(s[f].trim()));varsUI(raw);
 const CRE=/^\s*(crie|criar|gere|gerar|desenhe|fa[çc]a|escreva|redija|elabore|monte|produza|imagine|projete)\b/i,au=s.modo==='auto',isImg=s.modo==='imagem'||(au&&CRE.test(v.tarefa)&&/\b(imagem|arte|banner|cartaz|post|logo|ilustra[çc][ãa]o|capa|flyer|foto)\b/i.test(v.tarefa)),cr=isImg||s.modo==='criar'||(au&&CRE.test(v.tarefa)),MK=cr?'briefing':'material',imgL=isImg?[v.cores&&'Cores: '+v.cores,v.estilo&&'Estilo: '+v.estilo,v.textoarte&&'Texto na arte: "'+v.textoarte+'"',v.evitar&&'Evitar: '+v.evitar].filter(Boolean):[],body=[...imgL,v.material&&(imgL.length?'Detalhes: '+v.material:v.material)].filter(Boolean).join('\n'),hasM=!!body,sec=[];$('imgf').hidden=!isImg;$('mlbl').textContent=cr?'briefing: requisitos e detalhes':'a fonte que a IA deve usar';
 if(hasM)sec.push([MK,body]);
 if(v.exemplo)sec.push(['exemplo',v.exemplo]);
 sec.push(['tarefa',v.tarefa||'[preencha a tarefa]']);
 const o=[v.formato,v.publico&&'Público: '+v.publico,v.tom].filter(Boolean);
 if(o.length)sec.push(['saida',o.join('. ')]);
 let r=s.rg.map(i=>cr?CR[i]:hasM?R[i][1]:R[i][2]).filter(Boolean);
 if(s.tam==='compacto'&&s.rg.length>1)r=['Regras: '+s.rg.filter(i=>i!==4||hasM).map(i=>(cr?CC:C)[i]).filter(Boolean).join('; ')+'.'];
 if(TEC[s.tecnica])r.push(TEC[s.tecnica]);
 r.push(cr?'Entregue o resultado agora, sem introdução nem explicações.':'Responda só o pedido, sem introdução.');
 if(isImg&&v.textoarte)r.push('Escreva o texto da arte exatamente como indicado, sem erros de ortografia.');
 if(v.extra)r.push(v.extra);
 sec.push(['regras',r.map(x=>'- '+x).join('\n')]);
 const pre=v.papel?'Atue como '+v.papel+'.':'',md=s.alvo==='md';
 TXT=(pre?pre+'\n\n':'')+sec.map(x=>md?'## '+TIT[x[0]]+'\n'+x[1]:'<'+x[0]+'>\n'+x[1]+'\n</'+x[0]+'>').join('\n\n');
 const out=$('out');out.textContent='';
 if(pre){const p=document.createElement('span');p.className='pre';p.textContent=pre;out.append(p)}
 sec.forEach(x=>{const a=document.createElement('span');a.className='k';a.textContent=md?'## '+TIT[x[0]]+'\n':'<'+x[0]+'>\n';
  if(md)out.append(a,x[1]+'\n\n');else{const b=document.createElement('span');b.className='k';b.textContent='</'+x[0]+'>\n\n';out.append(a,x[1]+'\n',b)}});
 $('pill').textContent=TXT.length+' car. · ~'+Math.ceil(TXT.length/3.6)+' tokens';
 const w=v.tarefa.split(/\s+/).filter(Boolean).length,tips=[];let sc=0;
 if(!w)tips.push('Escreva a tarefa.');else if(w<4)tips.push('Tarefa vaga: diga o quê, para quem e quanto.');else sc+=30;
 if(w&&/\be (depois|também)\b|\balém disso\b|;/i.test(v.tarefa))tips.push('Uma tarefa por prompt gera menos erro.');else if(w>=4)sc+=10;
 if(v.formato)sc+=20;else tips.push('Defina o formato da resposta.');
 const vg=v.tarefa.match(/\b(etc|bom|boa|ótimo|melhor|algo|coisas?|qualquer|talvez|vários)\b/i);if(vg)tips.push('Troque "'+vg[1].toLowerCase()+'" por algo mensurável.');
 if(isImg&&!v.textoarte)tips.push('Informe o texto exato que deve aparecer na arte.');if(isImg&&!v.cores)tips.push('Informe as cores (nome ou código hex).');
 if(hasM)sc+=20;else tips.push(cr?'Sem briefing: liste formato, cores e texto que devem aparecer.':'Sem material, a IA usa só a memória dela. Cole a fonte.');
 if(s.rg.length>=4)sc+=10;else tips.push('Ative mais regras de rigor.');
 if(v.exemplo||s.tecnica!=='direto')sc+=10;else tips.push('Um exemplo de saída ou uma técnica aumenta a precisão.');
 $('bar').style.width=sc+'%';$('bar').style.background=sc<50?'var(--er)':sc<80?'var(--wa)':'var(--ok)';
 $('bar').parentNode.setAttribute('aria-valuenow',sc);
 $('hint').textContent='Qualidade: '+(sc<50?'fraca':sc<80?'boa':'excelente')+' · '+(isImg?'imagem':cr?'criar':'analisar');$('sc').textContent=sc+'/100';
 $('tips').innerHTML=tips.length?tips.slice(0,3).map(t=>'<li>'+t+'</li>').join(''):'<li class="ok">Sem pendências</li>';
}
let at;const draft=()=>{clearTimeout(at);at=setTimeout(()=>ls.set('sp_rascunho',getState()),400)};
const on=()=>{build();draft()};
document.querySelectorAll('main input:not([type=file]),main textarea,main select').forEach(e=>e.addEventListener('input',on));
$('tpl').onchange=e=>{const t=all()[e.target.value];if(!t)return;setState(t);on()};
$('clear').onclick=()=>{setState(Object.assign({tom:TOM,tecnica:'direto',alvo:'tags',tam:'completo',modo:'auto',rg:[0,1,2,3,4,5]},Object.fromEntries(F.filter(f=>f!=='tom').map(f=>[f,'']))));$('tpl').value='';on()};
$('save').onclick=()=>{const n=(prompt('Nome do modelo:')||'').trim().slice(0,60);if(!n)return;const m=ls.get('sp_modelos',{});m[n]=getState();ls.set('sp_modelos',m);fillTpl();$('tpl').value=n;toast('Modelo salvo')};
function hist(){const h=ls.get('sp_hist',[]).filter(x=>x.t!==TXT);h.unshift({d:Date.now(),t:TXT,s:getState()});ls.set('sp_hist',h.slice(0,8));renderH()}
function renderH(){const h=ls.get('sp_hist',[]),u=$('hist');u.textContent='';
 if(!h.length){const p=document.createElement('p');p.className='empty';p.textContent='Os prompts que você copiar ou baixar aparecem aqui.';u.append(p);return}
 h.forEach(x=>{const li=document.createElement('li'),b=document.createElement('button'),m=document.createElement('small');
  b.textContent=(x.s.tarefa||'Sem título').slice(0,60);m.textContent=new Date(x.d).toLocaleString('pt-BR',{day:'2-digit',month:'2-digit',hour:'2-digit',minute:'2-digit'});
  b.append(m);b.onclick=()=>{setState(x.s);on();toast('Restaurado')};li.append(b);u.append(li)})}
$('hclr').onclick=()=>{ls.set('sp_hist',[]);renderH()};
async function copy(t){try{await navigator.clipboard.writeText(t)}catch(e){const a=document.createElement('textarea');a.value=t;document.body.appendChild(a);a.select();document.execCommand('copy');a.remove()}}
const doCopy=async()=>{if(!getState().tarefa.trim()){toast('Escreva a tarefa primeiro');return}await copy(TXT);hist();toast('Prompt copiado')};
$('copy').onclick=doCopy;
const openIn=base=>{if(!getState().tarefa.trim()){toast('Escreva a tarefa primeiro');return}hist();const u=base+encodeURIComponent(TXT);if(u.length>7500){copy(TXT);toast('Prompt longo: copiado. Cole na IA.');window.open(base.split('?')[0],'_blank','noopener');return}window.open(u,'_blank','noopener')};
$('oc').onclick=()=>openIn('https://claude.ai/new?q=');
$('og').onclick=()=>openIn('https://chatgpt.com/?q=');
addEventListener('keydown',e=>{if((e.ctrlKey||e.metaKey)&&e.key==='Enter'){e.preventDefault();doCopy()}});
$('dl').onclick=()=>{if(!getState().tarefa.trim()){toast('Escreva a tarefa primeiro');return}hist();const a=document.createElement('a');a.href=URL.createObjectURL(new Blob([TXT],{type:'text/plain;charset=utf-8'}));a.download='superprompt.txt';a.click();URL.revokeObjectURL(a.href)};
$('exp').onclick=()=>{const a=document.createElement('a');a.href=URL.createObjectURL(new Blob([JSON.stringify(ls.get('sp_modelos',{}),null,2)],{type:'application/json'}));a.download='superprompt-modelos.json';a.click();URL.revokeObjectURL(a.href)};
$('imp').onclick=()=>$('file').click();
$('file').onchange=async e=>{const f=e.target.files[0];if(!f)return;try{const j=JSON.parse(await f.text()),m=ls.get('sp_modelos',{});let n=0;
 for(const [k,v] of Object.entries(j)){if(typeof v!=='object'||!v||k.length>60)continue;const c={};
  [...F,'tecnica','alvo','tam','modo'].forEach(x=>{if(typeof v[x]==='string')c[x]=v[x].slice(0,20000)});if(Array.isArray(v.rg))c.rg=v.rg.filter(Number.isInteger);m[k]=c;n++}
 ls.set('sp_modelos',m);fillTpl();toast(n+' modelo(s) importado(s)')}catch(err){toast('Arquivo inválido')}e.target.value=''};
const link=()=>{const s=getState();s.material='';return location.href.split('#')[0]+'#s='+btoa(unescape(encodeURIComponent(JSON.stringify(s))))};
$('share').onclick=async()=>{const u=link();try{if(navigator.share)await navigator.share({title:'Superprompt',text:'Gerador de prompts curtos e sem alucinação',url:u});else{await copy(u);toast('Link copiado (sem o material)')}}catch(e){}};
$('theme').onclick=()=>{const d=document.documentElement,l=d.dataset.theme==='light';d.dataset.theme=l?'dark':'light';$('theme').textContent=l?'☀️ Modo claro':'🌙 Modo escuro';ls.set('sp_tema',d.dataset.theme)};
if(ls.get('sp_tema')==='light'){document.documentElement.dataset.theme='light';$('theme').textContent='🌙 Modo escuro'}
let dp;addEventListener('beforeinstallprompt',e=>{e.preventDefault();dp=e;$('install').hidden=false});
$('install').onclick=async()=>{if(!dp)return;dp.prompt();await dp.userChoice;dp=null;$('install').hidden=true};
if('serviceWorker'in navigator)addEventListener('load',()=>navigator.serviceWorker.register('sw.js').catch(()=>{}));
fillTpl();
try{const m=location.hash.match(/^#s=(.+)$/);if(m)setState(JSON.parse(decodeURIComponent(escape(atob(m[1])))));else{const d=ls.get('sp_rascunho');if(d)setState(d)}}catch(e){}
build();renderH();
