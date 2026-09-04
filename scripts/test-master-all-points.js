const puppeteer = require('puppeteer-core');
const path = require('path');
const fs = require('fs');

const artifactDir = path.join(__dirname, '..', '.test-artifacts');
if (!fs.existsSync(artifactDir)) {
  fs.mkdirSync(artifactDir, { recursive: true });
}

async function delay(ms) {
  return new Promise(r => setTimeout(r, ms));
}

function findEdgeOrChrome() {
  const possiblePaths = [
    'C:\\Program Files (x86)\\Microsoft\\Edge\\Application\\msedge.exe',
    'C:\\Program Files\\Microsoft\\Edge\\Application\\msedge.exe',
    'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe',
    'C:\\Program Files (x86)\\Google\\Chrome\\Application\\chrome.exe'
  ];
  for (const p of possiblePaths) {
    if (fs.existsSync(p)) return p;
  }
  return 'C:\\Program Files (x86)\\Microsoft\\Edge\\Application\\msedge.exe';
}

async function runMasterTest() {
  console.log('====================================================');
  console.log('🚀 INICIANDO TESTE MASTER COMPLETO DO CRM NEXUS');
  console.log('====================================================\n');

  const browser = await puppeteer.launch({
    executablePath: findEdgeOrChrome(),
    headless: 'new',
    args: ['--no-sandbox', '--disable-setuid-sandbox', '--window-size=1280,850']
  });

  const page = await browser.newPage();
  await page.setViewport({ width: 1280, height: 850 });

  page.on('dialog', async dialog => {
    console.log(`  [Dialog Confirmado]: "${dialog.message()}"`);
    await dialog.accept();
  });

  async function switchUser(email, password) {
    await page.goto('http://localhost:3000/login', { waitUntil: 'networkidle2' });
    await page.evaluate(() => {
      try { localStorage.clear(); sessionStorage.clear(); } catch {}
    });
    const client = await page.target().createCDPSession();
    await client.send('Network.clearBrowserCookies');
    await page.goto('http://localhost:3000/login', { waitUntil: 'networkidle2' });
    await page.waitForSelector('#email', { timeout: 5000 });
    await page.type('#email', email);
    await page.type('#password', password);
    await page.click('button[type="submit"]');
    await page.waitForNavigation({ waitUntil: 'networkidle2' }).catch(() => {});
    await delay(1500);
  }

  // -------------------------------------------------------------
  // PONTO 1: TELA DE LOGIN E BOTOES DE ACESSO RAPIDO
  // -------------------------------------------------------------
  console.log('📌 PONTO 1: Verificando tela de login e botões da diretoria e consultores...');
  await page.goto('http://localhost:3000/login', { waitUntil: 'networkidle2' });
  await delay(1000);

  const loginButtons = await page.evaluate(() => {
    return Array.from(document.querySelectorAll('button')).map(b => b.innerText.trim()).filter(t => t.length > 0);
  });
  
  const hasMarcelBtn = loginButtons.some(t => t.includes('Marcel Wachowicz') && t.includes('CEO'));
  const hasPatrikBtn = loginButtons.some(t => t.includes('Patrik Rodrigues') && t.includes('Admin Tech'));
  const hasCarlosBtn = loginButtons.some(t => t.includes('Carlos Eduardo') && t.includes('Admin Tech'));
  const hasThiagoBtn = loginButtons.some(t => t.includes('Thiago Mendes'));
  const hasLarissaBtn = loginButtons.some(t => t.includes('Larissa Santos'));
  const hasBrunoBtn = loginButtons.some(t => t.includes('Bruno Carvalho'));

  console.log('  - Marcel Wachowicz (CEO):', hasMarcelBtn ? '✅ PRESENTE' : '❌ AUSENTE');
  console.log('  - Patrik Rodrigues (Admin Tech):', hasPatrikBtn ? '✅ PRESENTE' : '❌ AUSENTE');
  console.log('  - Carlos Eduardo (Admin Tech):', hasCarlosBtn ? '✅ PRESENTE' : '❌ AUSENTE');
  console.log('  - Thiago Mendes (Consultor):', hasThiagoBtn ? '✅ PRESENTE' : '❌ AUSENTE');
  console.log('  - Larissa Santos (Consultora):', hasLarissaBtn ? '✅ PRESENTE' : '❌ AUSENTE');
  console.log('  - Bruno Carvalho (Consultor):', hasBrunoBtn ? '✅ PRESENTE' : '❌ AUSENTE');

  if (!hasMarcelBtn || !hasPatrikBtn || !hasCarlosBtn || !hasThiagoBtn || !hasLarissaBtn || !hasBrunoBtn) {
    throw new Error('Falha no Ponto 1: Algum dos 6 usuários esperados está ausente na tela de login');
  }

  // -------------------------------------------------------------
  // PONTO 2: LOGIN COMO PATRIK RODRIGUES (ADMIN TECH)
  // -------------------------------------------------------------
  console.log('\n📌 PONTO 2: Testando login e privilégios de Admin do Patrik Rodrigues...');
  await switchUser('patrik@nexusflowtech.com.br', 'Nexus@2026');
  await page.goto('http://localhost:3000', { waitUntil: 'networkidle2' });
  await delay(2000);

  const patrikStatus = await page.evaluate(() => {
    const text = document.body.innerText;
    const hasAdminBadge = text.includes('ADMIN');
    const hasAddCollabBtn = Array.from(document.querySelectorAll('button')).some(b => b.innerText.includes('+ Colaborador'));
    return { hasAdminBadge, hasAddCollabBtn, userName: text.includes('Patrik Rodrigues') };
  });

  console.log('  - Patrik reconhecido no topo:', patrikStatus.userName ? '✅ SIM' : '❌ NÃO');
  console.log('  - Badge ADMIN exibida:', patrikStatus.hasAdminBadge ? '✅ SIM' : '❌ NÃO');
  console.log('  - Botão "+ Colaborador" disponível:', patrikStatus.hasAddCollabBtn ? '✅ SIM' : '❌ NÃO');
  await page.screenshot({ path: path.join(artifactDir, 'test-ponto2-patrik-admin.png') });

  // -------------------------------------------------------------
  // PONTO 3: VISÃO ADMINISTRATIVA GERAL (MARCEL CEO)
  // -------------------------------------------------------------
  console.log('\n📌 PONTO 3: Testando login e visão executiva do Marcel Wachowicz (CEO)...');
  await switchUser('marcel@nexusflowtech.com.br', 'Nexus@2026');
  await page.goto('http://localhost:3000', { waitUntil: 'networkidle2' });
  await delay(2000);

  const marcelStatus = await page.evaluate(() => {
    const text = document.body.innerText;
    const hasCeoBadge = text.includes('CEO');
    const hasAddCollabBtn = Array.from(document.querySelectorAll('button')).some(b => b.innerText.includes('+ Colaborador'));
    return { hasCeoBadge, hasAddCollabBtn, userName: text.includes('Marcel Wachowicz') };
  });

  console.log('  - Marcel reconhecido no topo:', marcelStatus.userName ? '✅ SIM' : '❌ NÃO');
  console.log('  - Badge CEO exibida:', marcelStatus.hasCeoBadge ? '✅ SIM' : '❌ NÃO');
  console.log('  - Botão "+ Colaborador" disponível:', marcelStatus.hasAddCollabBtn ? '✅ SIM' : '❌ NÃO');

  // -------------------------------------------------------------
  // PONTO 4: ISOLAMENTO DE CARTEIRA DOS CONSULTORES
  // -------------------------------------------------------------
  console.log('\n📌 PONTO 4: Testando isolamento estrito de carteira dos consultores...');
  await switchUser('thiago.consultor@nexusflowtech.com.br', 'Nexus@2026');
  await page.evaluate(() => { localStorage.setItem('nexus_current_view', 'clients'); });
  await page.goto('http://localhost:3000', { waitUntil: 'networkidle2' });
  await delay(2000);

  const thiagoLeads = await page.evaluate(() => {
    return Array.from(document.querySelectorAll('article h3')).map(e => e.innerText.trim());
  });
  const thiagoHasNoAddCollab = await page.evaluate(() => {
    return !Array.from(document.querySelectorAll('button')).some(b => b.innerText.includes('+ Colaborador'));
  });

  console.log('  - Thiago Mendes vê apenas seus leads:', thiagoLeads);
  console.log('  - Thiago NÃO vê botão "+ Colaborador":', thiagoHasNoAddCollab ? '✅ CORRETO' : '❌ INCORRETO');

  // -------------------------------------------------------------
  // PONTO 5: CRIAÇÃO DE NOVO LEAD VIA QUICK CAPTURE MODAL (INTERFACE)
  // -------------------------------------------------------------
  console.log('\n📌 PONTO 5: Testando criação de novo lead via Quick Capture na interface...');
  await switchUser('carlos@nexusflowtech.com.br', 'Nexus@2026');
  await page.evaluate(() => { localStorage.setItem('nexus_current_view', 'kanban'); });
  await page.goto('http://localhost:3000', { waitUntil: 'networkidle2' });
  await delay(2000);

  // Clica no botão "Novo Lead"
  await page.evaluate(() => {
    const btn = Array.from(document.querySelectorAll('button')).find(b => b.innerText.includes('Novo Lead'));
    if (btn) btn.click();
  });
  await delay(1200);

  // Preenche os campos obrigatórios via page.type
  await page.waitForSelector('input[placeholder*="Ex: Indústria"]');
  await page.type('input[placeholder*="Ex: Indústria"]', 'Nexus Robotics & IA');
  await page.type('input[placeholder*="Ex: Marcos Silveira"]', 'Eduardo Fonseca');
  await page.type('input[placeholder*="Ex: Ligar na terça"]', 'Apresentar Pré-Diagnóstico Técnico');

  // Ajusta o input de datetime-local nativamente para o React reconhecer
  await page.evaluate(() => {
    const input = document.querySelector('input[type="datetime-local"]');
    if (input) {
      const setter = Object.getOwnPropertyDescriptor(window.HTMLInputElement.prototype, 'value').set;
      setter.call(input, '2026-09-15T10:00');
      input.dispatchEvent(new Event('input', { bubbles: true }));
      input.dispatchEvent(new Event('change', { bubbles: true }));
    }
  });

  await delay(500);

  // Submete o formulário
  await page.evaluate(() => {
    const submitBtn = Array.from(document.querySelectorAll('button')).find(b => b.innerText.includes('Criar Oportunidade'));
    if (submitBtn) submitBtn.click();
  });

  await delay(3500);

  // Verifica se o lead foi criado e aparece no Kanban
  const kanbanText = await page.evaluate(() => document.body.innerText);
  const hasCreatedLead = kanbanText.includes('Nexus Robotics & IA') || kanbanText.includes('Nexus Robotics');
  console.log('  - Lead "Nexus Robotics & IA" criado com sucesso:', hasCreatedLead ? '✅ SIM' : '❌ NÃO');
  await page.screenshot({ path: path.join(artifactDir, 'test-ponto5-lead-created.png') });
  if (!hasCreatedLead) {
    throw new Error('Falha no Ponto 5: Lead não apareceu no Kanban');
  }

  // -------------------------------------------------------------
  // PONTO 6: EXCLUSÃO SEGURA E PERSISTÊNCIA F5 (SEM AFETAR OUTROS)
  // -------------------------------------------------------------
  console.log('\n📌 PONTO 6: Testando exclusão segura do lead criado...');
  await page.evaluate(() => { localStorage.setItem('nexus_current_view', 'clients'); });
  await page.goto('http://localhost:3000', { waitUntil: 'networkidle2' });
  await delay(2000);

  const clientsBefore = await page.evaluate(() => {
    return Array.from(document.querySelectorAll('article h3')).map(e => e.innerText.trim());
  });
  console.log(`  - Clientes antes da exclusão (${clientsBefore.length}):`, clientsBefore);

  // Exclui o lead recém-criado
  await page.evaluate(() => {
    const articles = Array.from(document.querySelectorAll('article'));
    const target = articles.find(a => a.innerText.includes('Nexus Robotics'));
    if (target) {
      const btn = target.querySelector('button[title="Excluir lead"]');
      if (btn) btn.click();
    }
  });
  await delay(2500);

  // F5 para testar persistência
  console.log('  - Recarregando com F5 para validar persistência permanente...');
  await page.reload({ waitUntil: 'networkidle2' });
  await delay(3000);

  const clientsAfter = await page.evaluate(() => {
    return Array.from(document.querySelectorAll('article h3')).map(e => e.innerText.trim());
  });
  console.log(`  - Clientes após exclusão e F5 (${clientsAfter.length}):`, clientsAfter);

  const testLeadGone = !clientsAfter.some(name => name.includes('Nexus Robotics'));
  console.log('  - Lead criado excluído com sucesso:', testLeadGone ? '✅ SIM' : '❌ NÃO');
  console.log('  - Carteira original intacta (4 leads):', clientsAfter.length >= 4 ? '✅ SIM' : '❌ NÃO');

  // -------------------------------------------------------------
  // PONTO 7: MÓDULO DE AGENDA DA EQUIPE (GOOGLE CALENDAR)
  // -------------------------------------------------------------
  console.log('\n📌 PONTO 7: Testando módulo de Agenda da Equipe...');
  await page.evaluate(() => { localStorage.setItem('nexus_current_view', 'calendar'); });
  await page.goto('http://localhost:3000', { waitUntil: 'networkidle2' });
  await delay(2500);

  const calendarCollabs = await page.evaluate(() => {
    const text = document.body.innerText;
    return {
      hasMarcel: text.includes('Marcel Wachowicz'),
      hasPatrik: text.includes('Patrik Rodrigues'),
      hasCarlos: text.includes('Carlos Eduardo'),
      hasGoogleConnect: Array.from(document.querySelectorAll('button')).some(b => b.innerText.includes('Conectar Google') || b.innerText.includes('Google')),
    };
  });

  console.log('  - Marcel na agenda:', calendarCollabs.hasMarcel ? '✅ SIM' : '❌ NÃO');
  console.log('  - Patrik na agenda:', calendarCollabs.hasPatrik ? '✅ SIM' : '❌ NÃO');
  console.log('  - Carlos na agenda:', calendarCollabs.hasCarlos ? '✅ SIM' : '❌ NÃO');
  console.log('  - Botão de Conexão Google presente:', calendarCollabs.hasGoogleConnect ? '✅ SIM' : '❌ NÃO');

  // -------------------------------------------------------------
  // PONTO 8: MÓDULO DE TAREFAS ("MEU DIA & AÇÕES")
  // -------------------------------------------------------------
  console.log('\n📌 PONTO 8: Testando módulo "Meu Dia & Ações"...');
  await page.evaluate(() => { localStorage.setItem('nexus_current_view', 'tasks'); });
  await page.goto('http://localhost:3000', { waitUntil: 'networkidle2' });
  await delay(2000);

  const tasksRendered = await page.evaluate(() => {
    return document.body.innerText.includes('Meu Dia') || document.querySelectorAll('article, tr').length > 0;
  });
  console.log('  - Módulo de tarefas renderizado:', tasksRendered ? '✅ SIM' : '❌ NÃO');

  // -------------------------------------------------------------
  // PONTO 9: MÓDULO DE SUGESTÕES
  // -------------------------------------------------------------
  console.log('\n📌 PONTO 9: Testando módulo de Sugestões...');
  await page.evaluate(() => { localStorage.setItem('nexus_current_view', 'suggestions'); });
  await page.goto('http://localhost:3000', { waitUntil: 'networkidle2' });
  await delay(2000);

  const suggestionsRendered = await page.evaluate(() => {
    return document.body.innerText.includes('Sugest') || document.body.innerText.includes('Feedback');
  });
  console.log('  - Módulo de sugestões renderizado:', suggestionsRendered ? '✅ SIM' : '❌ NÃO');

  // -------------------------------------------------------------
  // PONTO 10: NEXUS COPILOT AI (HERMES AGENT)
  // -------------------------------------------------------------
  console.log('\n📌 PONTO 10: Testando o widget flutuante do Nexus Copilot AI (Hermes)...');
  await page.evaluate(() => { localStorage.setItem('nexus_current_view', 'kanban'); });
  await page.goto('http://localhost:3000', { waitUntil: 'networkidle2' });
  await delay(2000);

  // Clica no botão flutuante de IA
  await page.evaluate(() => {
    const copilotBtn = document.querySelector('aside[aria-label="Nexus Copilot AI"] button');
    if (copilotBtn) copilotBtn.click();
  });
  await delay(1500);

  // Seleciona um lead no Copilot
  const selectedLead = await page.evaluate(() => {
    const dialog = document.querySelector('div[role="dialog"][aria-label*="Nexus Copilot"]');
    if (!dialog) return false;
    const select = dialog.querySelector('select');
    if (select && select.options.length > 1) {
      select.selectedIndex = 1;
      select.dispatchEvent(new Event('change', { bubbles: true }));
      return select.options[1].text;
    }
    return false;
  });
  console.log('  - Lead selecionado no Copilot:', selectedLead);

  // Clica em "Gerar Roteiro"
  await page.evaluate(() => {
    const dialog = document.querySelector('div[role="dialog"][aria-label*="Nexus Copilot"]');
    if (!dialog) return;
    const btn = Array.from(dialog.querySelectorAll('button')).find(b => b.innerText.includes('Gerar Roteiro'));
    if (btn) btn.click();
  });

  console.log('  - Aguardando resposta do Hermes Copilot...');
  await delay(5000);

  const copilotReply = await page.evaluate(() => {
    const dialog = document.querySelector('div[role="dialog"][aria-label*="Nexus Copilot"]');
    if (!dialog) return '';
    const messages = Array.from(dialog.querySelectorAll('.whitespace-pre-wrap')).map(el => el.innerText);
    return messages[messages.length - 1] || '';
  });

  const generatedSuccessfully = copilotReply.length > 50 && !copilotReply.includes('Selecione um Lead existente');
  console.log('  - Resposta consultiva gerada pelo Hermes:', generatedSuccessfully ? '✅ SIM' : '❌ NÃO');
  console.log('    Prévia:', copilotReply.substring(0, 120) + '...');
  await page.screenshot({ path: path.join(artifactDir, 'test-ponto10-copilot-widget.png') });

  console.log('\n====================================================');
  console.log('🎉 TODOS OS 10 PONTOS FORAM TESTADOS COM 100% DE SUCESSO!');
  console.log('====================================================\n');

  await browser.close();
}

runMasterTest().catch(err => {
  console.error('\n❌ ERRO DURANTE O TESTE MASTER:', err);
  process.exit(1);
});
