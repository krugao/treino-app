# INBOX â€” mensagem do PC gamer para o Grok da sala

**Quem escreveu:** sessÃ£o Grok no DESKTOP-UAPGO62 (gamer), 2026-09-15.  
**Quem executa:** Grok neste PC da sala (`DESKTOP-G3KHUJD`).  
**Repo:** `https://github.com/krugao/health` (privado), branch `main`.  
**Plano detalhado:** `docs/SALA_SETUP.md` â€” lÃª e segue depois deste briefing.

Tu estÃ¡s a receber isto porque o celular jÃ¡ entra no tracker via Tailscale, mas o site da sala ainda serve APK antigo (0.2.0) e nÃ£o tem o botÃ£o **Baixar app**. O gamer nÃ£o consegue gravar em `C$` desta mÃ¡quina. O setup tem de ser feito **aqui**.

---

## MISSÃƒO (faz tudo, nÃ£o peÃ§as confirmaÃ§Ã£o)

1. Acha a pasta real do health (nÃ£o assumas `Documents\health`, nÃ£o uses `System32`).
2. Atualiza o cÃ³digo a partir do GitHub (`git pull` / clone).
3. NÃ£o apagues PIN nem treinos.
4. Gera dashboard + APK 0.3.2.
5. Copia o APK para onde o `app_server.py` o serve.
6. Reinicia `HealthTrackerServer`.
7. Confirma no browser local e no Tailscale o botÃ£o **Baixar app**.

CritÃ©rio de done: `http://127.0.0.1:8787` mostra **Baixar app**, `http://127.0.0.1:8787/treino-release.apk` descarrega, e `https://desktop-g3khujd.tailf4b25d.ts.net` faz o mesmo no celular.

---

## Contexto (o que jÃ¡ estÃ¡ feito no gamer)

- App Android Capacitor `dev.krugao.treino`, versÃ£o **0.3.2** (versionCode 5).
- Dashboard com botÃ£o azul **Baixar app** (`<a href="/treino-release.apk">`).
- `app_server.py` serve `/treino-release.apk`, `/treino-debug.apk`, `/api/health` com `publicOrigin`.
- Testes: `python scripts/test_app_server.py`.
- Build: `scripts/build-apk.ps1` / `-Release`.
- O celular **jÃ¡ conecta** Ã  sala pelo Tailscale. PIN estÃ¡ em `data/app-auth.json` **desta** mÃ¡quina (nÃ£o o inventes; lÃª o ficheiro).
- URL pÃºblica: `https://desktop-g3khujd.tailf4b25d.ts.net`
- LAN: `http://192.168.15.167:8787` â€” o servidor **jÃ¡ estÃ¡ a correr** (health 200). NÃ£o o tires do ar sem o novo estar pronto.

O GitHub **nÃ£o** inclui: PIN, Polar tokens, `app-state.json`, keystore, APK. Esses ficam no disco.

---

## Passo 0 â€” achar a pasta

```
schtasks /Query /TN HealthTrackerServer /V /FO LIST
```

Usa **Start In** / Working Directory. Ou:

```
Get-ChildItem C:\Users, D:\, E:\ -Recurse -Filter app_server.py -ErrorAction SilentlyContinue | Select-Object FullName
```

`cd` para a pasta **pai** de `scripts\app_server.py`.

Se nÃ£o houver `app_server.py`:

```
cd C:\Users\leona\Documents
git clone https://github.com/krugao/health.git
cd health
```

Se clonares de novo, **copia** da pasta antiga (a do servidor que jÃ¡ corre):  
`data\app-auth.json`, `data\app-state.json`, `data\polar-api\`. NÃ£o recrie o PIN.

---

## Passo 1 â€” cÃ³digo

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

Confirma que `data\app-auth.json` e `data\app-state.json` continuam lÃ¡ (gitignore).

---

## Passo 2 â€” dashboard e testes

```
python scripts/build_dashboard.py
python scripts/test_app_server.py
```

---

## Passo 3 â€” APK

JDK 21 Temurin, **nÃ£o** o JBR 25 do Android Studio:

```
powershell -ExecutionPolicy Bypass -File scripts\build-apk.ps1 -Release
```

Depois:

```
copy /Y android-app\treino-release.apk android-app\treino-debug.apk
copy /Y android-app\treino-release.apk site\treino-release.apk
```

Se `assembleRelease` falhar por falta de keystore: gera um keystore local gitignored, ou `build-apk.ps1` (debug) e copia `treino-debug.apk` para os mesmos sÃ­tios com o nome `treino-release.apk` tambÃ©m.

Sem JDK/SDK: instala o necessÃ¡rio. Sem o ficheiro APK no disco, o botÃ£o 404.

---

## Passo 4 â€” servidor

```
schtasks /Run /TN HealthTrackerServer
```

Se a tarefa nÃ£o existir: `powershell -ExecutionPolicy Bypass -File scripts\install-sala.ps1`

Verifica:

- http://127.0.0.1:8787 â€” dashboard com **Baixar app**
- http://127.0.0.1:8787/treino-release.apk â€” download
- http://127.0.0.1:8787/api/health â€” `"ok": true`

Tailscale:

```
tailscale serve status
```

Se precisar: `tailscale serve --bg 8787`

Firewall TCP **8787**, regra Health Tracker. Ver `docs/SERVIDOR.md`.

---

## NÃ£o fazer

- NÃ£o imprimas o PIN no chat se puderes evitar; usa o de `data/app-auth.json`.
- NÃ£o commits PIN, Polar, `app-state`, APK, keystore.
- NÃ£o publiques o repo.
- NÃ£o apagues `data/` da instalaÃ§Ã£o que jÃ¡ serve o celular.

---

## Quando estiver done

Responde com: caminho da pasta, `git log -1`, se o APK existe e quantos bytes, resultado de `/api/health`, e se o botÃ£o Baixar app aparece em `127.0.0.1:8787`.

---

## ONDE ESTA O CODIGO NESTE PC (sala)

No gamer o Z: e \\192.168.15.167\Media. AQUI o Media e local.

Procura, por esta ordem:

  C:\Media\health-from-gamer
  C:\Media\GROK-SALA.txt
  Get-SmbShare
  Get-ChildItem C:\Media, D:\, E:\ -Recurse -Depth 3 -Filter GROK-SALA.txt -ErrorAction SilentlyContinue
  Get-ChildItem C:\Media, D:\, E:\ -Recurse -Depth 3 -Directory -Filter health-from-gamer -ErrorAction SilentlyContinue

A pasta tem scripts\, android-app\, docs\, README.md. Copia por cima do tracker SEM apagar data\app-auth.json e data\app-state.json.
