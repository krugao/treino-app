# Setup completo — PC da sala (Grok)

Este ficheiro é o plano para a sessão Grok **neste PC** (`DESKTOP-G3KHUJD`, `192.168.15.167`).
O clone no GitHub **não** traz PIN, Polar tokens, `app-state.json` nem APK.

Se a sessão Grok abriu em `C:\WINDOWS\System32` ou “não achou a pasta”: começa no **Passo 0**. Não inventes `Documents\health`.

Repo: `https://github.com/krugao/health` (privado). Branch `main`.

## Objetivo

1. `git pull` do código novo (app Android 0.3.2, botão **Baixar app**, API `publicOrigin`).
2. Gerar o dashboard e o APK **nesta máquina**.
3. O site Tailscale passa a servir o APK: o celular instala sem cabo USB.
4. Reiniciar o servidor `HealthTrackerServer` sem apagar PIN nem treinos.

## Não fazer

- Não commitar nem imprimir PIN, `data/app-auth.json`, `data/polar-api/token.json`, `data/app-state.json`.
- Não sobrescrever `data/app-auth.json` nem `data/app-state.json` com ficheiros vazios.
- Não `git push` com APK, keystore ou Polar ZIP.
- Não publicar isto em repo público.

## Arquitetura (resumo)

```
Celular (app Treino / Chrome)
    LAN http://192.168.15.167:8787
    Tailscale https://desktop-g3khujd.tailf4b25d.ts.net
        → scripts/app_server.py
            GET  /                 dashboard.html
            GET  /treino-release.apk
            GET  /api/health       (+ publicOrigin Tailscale)
            GET/PUT /api/state     PIN
            POST /api/polar-sync   corre polar_sync.py aqui
```

App id: `dev.krugao.treino`. Capacitor 7 em `android-app/`. Fonte da verdade: `data/app-state.json`.

## Passo 0 — achar a pasta (não assumir Documents)

Neste PC a pasta **não** é obrigatoriamente `C:\Users\leona\Documents\health`. O Grok da sala muitas vezes arranca em `System32`. Não uses isso.

Acha o diretório real:

```
schtasks /Query /TN HealthTrackerServer /V /FO LIST
```

Olha **Start In** / **Working Directory**. Ou:

```
Get-ChildItem C:\Users, D:\, E:\ -Recurse -Filter app_server.py -ErrorAction SilentlyContinue | Select-Object FullName
```

`cd` para a pasta **pai** de `scripts\app_server.py` (é o root do projeto). Só então continua.

Se **não existir nenhum** `app_server.py`:

```
cd C:\Users\leona\Documents
git clone https://github.com/krugao/health.git
cd health
```

Se o clone for novo e o servidor antigo tiver `data\`, **copia** `data\app-auth.json`, `data\app-state.json` e `data\polar-api\` da pasta antiga. Não recrie o PIN.

## Passo 1 — código

Já dentro da pasta certa:

```
git status
git pull origin main
```

Se a pasta existir mas **não** for um clone git:

```
git init
git remote add origin https://github.com/krugao/health.git
git fetch origin
git checkout -B main origin/main
```

Isto não deve apagar `data/app-auth.json` nem `data/app-state.json` (estão no `.gitignore`). Confirma que esses ficheiros ainda estão lá depois do pull.

## Passo 2 — dashboard

Python 3.12+ com pandas/numpy:

```
python scripts/build_dashboard.py
python scripts/test_app_server.py
```

Isto escreve `dashboard.html` e `site/` (gitignored; ficam só neste disco).

## Passo 3 — APK

O GitHub **não** traz o `.apk`. Gera aqui.

JDK 21 Temurin (não o JBR 25 do Android Studio), se existir:

```
powershell -ExecutionPolicy Bypass -File scripts\build-apk.ps1 -Release
```

Saída: `android-app/treino-release.apk`.

Copia também para o sítio que o servidor procura:

```
copy /Y android-app\treino-release.apk android-app\treino-debug.apk
copy /Y android-app\treino-release.apk site\treino-release.apk
```

Se não houver JDK/SDK neste PC: instala Android Studio + JDK 21, ou gera o APK no outro PC e **só** copia o `treino-release.apk` para `android-app\` e `site\` nesta máquina. Sem o ficheiro, o botão Baixar app dá 404.

Keystore de release: `android-app/keystore/` + `keystore.properties` (gitignored). Se não existirem, o `assembleRelease` falha — gera um keystore local (não o commits) ou usa só `assembleDebug` e copia `treino-debug.apk` para os mesmos sítios.

## Passo 4 — servidor

Confirma que o PIN antigo continua em `data/app-auth.json` (não recrie).

Reinicia a tarefa:

```
schtasks /Run /TN HealthTrackerServer
```

Se a tarefa não existir:

```
powershell -ExecutionPolicy Bypass -File scripts\install-sala.ps1
```

Teste **neste PC**:

```
http://127.0.0.1:8787
http://127.0.0.1:8787/treino-release.apk
http://127.0.0.1:8787/api/health
```

`/api/health` deve ter `"ok": true` e, depois de um hit via Tailscale, `publicOrigin` `https://….ts.net`.

No celular (Tailscale ligado):

```
https://desktop-g3khujd.tailf4b25d.ts.net
```

Botão azul **Baixar app** no topo → instala o APK. PIN é o de `data/app-auth.json` (não o inventes; lê o ficheiro).

## Passo 5 — Tailscale

Se o site `ts.net` não abrir:

```
tailscale serve status
tailscale serve --bg 8787
```

Firewall: porta **8787**, regra Health Tracker. Ver `docs/SERVIDOR.md`.

## Checklist de conclusão

- [ ] `git pull` feito nesta pasta
- [ ] `build_dashboard.py` ok
- [ ] `test_app_server.py` passa
- [ ] `treino-release.apk` em `android-app/` e `site/`
- [ ] `HealthTrackerServer` a correr
- [ ] `http://127.0.0.1:8787` abre o dashboard com **Baixar app**
- [ ] `http://127.0.0.1:8787/treino-release.apk` descarrega
- [ ] no celular, URL Tailscale → Baixar app → instala
- [ ] PIN e `app-state.json` intactos

## Docs relacionados

- [APK.md](APK.md) — Capacitor, Gradle, testes
- [SERVIDOR.md](SERVIDOR.md) — porta 8787, tarefas, Tailscale
- [LOCAL_LLM.md](LOCAL_LLM.md) — Grok + qwen3.8:27b neste PC
