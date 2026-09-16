# INBOX — mensagem do PC gamer para o Grok da sala

**Quem escreveu:** sessão Grok no DESKTOP-UAPGO62 (gamer), 2026-09-15.  
**Quem executa:** Grok neste PC da sala (`DESKTOP-G3KHUJD`).  
**Repo:** `https://github.com/krugao/health` (privado), branch `main`.  
**Plano detalhado:** `docs/SALA_SETUP.md` — lê e segue depois deste briefing.

Tu estás a receber isto porque o celular já entra no tracker via Tailscale, mas o site da sala ainda serve APK antigo (0.2.0) e não tem o botão **Baixar app**. O gamer não consegue gravar em `C$` desta máquina. O setup tem de ser feito **aqui**.

---

## MISSÃO (faz tudo, não peças confirmação)

1. Acha a pasta real do health (não assumas `Documents\health`, não uses `System32`).
2. Atualiza o código a partir do GitHub (`git pull` / clone).
3. Não apagues PIN nem treinos.
4. Gera dashboard + APK 0.3.2.
5. Copia o APK para onde o `app_server.py` o serve.
6. Reinicia `HealthTrackerServer`.
7. Confirma no browser local e no Tailscale o botão **Baixar app**.

Critério de done: `http://127.0.0.1:8787` mostra **Baixar app**, `http://127.0.0.1:8787/treino-release.apk` descarrega, e `https://desktop-g3khujd.tailf4b25d.ts.net` faz o mesmo no celular.

---

## Contexto (o que já está feito no gamer)

- App Android Capacitor `dev.krugao.treino`, versão **0.3.2** (versionCode 5).
- Dashboard com botão azul **Baixar app** (`<a href="/treino-release.apk">`).
- `app_server.py` serve `/treino-release.apk`, `/treino-debug.apk`, `/api/health` com `publicOrigin`.
- Testes: `python scripts/test_app_server.py`.
- Build: `scripts/build-apk.ps1` / `-Release`.
- O celular **já conecta** à sala pelo Tailscale. PIN está em `data/app-auth.json` **desta** máquina (não o inventes; lê o ficheiro).
- URL pública: `https://desktop-g3khujd.tailf4b25d.ts.net`
- LAN: `http://192.168.15.167:8787` — o servidor **já está a correr** (health 200). Não o tires do ar sem o novo estar pronto.

O GitHub **não** inclui: PIN, Polar tokens, `app-state.json`, keystore, APK. Esses ficam no disco.

---

## Passo 0 — achar a pasta

```
schtasks /Query /TN HealthTrackerServer /V /FO LIST
```

Usa **Start In** / Working Directory. Ou:

```
Get-ChildItem C:\Users, D:\, E:\ -Recurse -Filter app_server.py -ErrorAction SilentlyContinue | Select-Object FullName
```

`cd` para a pasta **pai** de `scripts\app_server.py`.

Se não houver `app_server.py`:

```
cd C:\Users\leona\Documents
git clone https://github.com/krugao/health.git
cd health
```

Se clonares de novo, **copia** da pasta antiga (a do servidor que já corre):  
`data\app-auth.json`, `data\app-state.json`, `data\polar-api\`. Não recrie o PIN.

---

## Passo 1 — código

```
git status
git pull origin main
```

Se a pasta existir sem git:

```
git init
git remote add origin https://github.com/krugao/health.git
git fetch origin
git checkout -B main origin/main
```

Confirma que `data\app-auth.json` e `data\app-state.json` continuam lá (gitignore).

---

## Passo 2 — dashboard e testes

```
python scripts/build_dashboard.py
python scripts/test_app_server.py
```

---

## Passo 3 — APK

JDK 21 Temurin, **não** o JBR 25 do Android Studio:

```
powershell -ExecutionPolicy Bypass -File scripts\build-apk.ps1 -Release
```

Depois:

```
copy /Y android-app\treino-release.apk android-app\treino-debug.apk
copy /Y android-app\treino-release.apk site\treino-release.apk
```

Se `assembleRelease` falhar por falta de keystore: gera um keystore local gitignored, ou `build-apk.ps1` (debug) e copia `treino-debug.apk` para os mesmos sítios com o nome `treino-release.apk` também.

Sem JDK/SDK: instala o necessário. Sem o ficheiro APK no disco, o botão 404.

---

## Passo 4 — servidor

```
schtasks /Run /TN HealthTrackerServer
```

Se a tarefa não existir: `powershell -ExecutionPolicy Bypass -File scripts\install-sala.ps1`

Verifica:

- http://127.0.0.1:8787 — dashboard com **Baixar app**
- http://127.0.0.1:8787/treino-release.apk — download
- http://127.0.0.1:8787/api/health — `"ok": true`

Tailscale:

```
tailscale serve status
```

Se precisar: `tailscale serve --bg 8787`

Firewall TCP **8787**, regra Health Tracker. Ver `docs/SERVIDOR.md`.

---

## Não fazer

- Não imprimas o PIN no chat se puderes evitar; usa o de `data/app-auth.json`.
- Não commits PIN, Polar, `app-state`, APK, keystore.
- Não publiques o repo.
- Não apagues `data/` da instalação que já serve o celular.

---

## Quando estiver done

Responde com: caminho da pasta, `git log -1`, se o APK existe e quantos bytes, resultado de `/api/health`, e se o botão Baixar app aparece em `127.0.0.1:8787`.
