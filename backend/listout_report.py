import datetime
import json
import re
import asyncio
import telnetlib3
import pandas as pd          # usado apenas para parsing em tabela
from pathlib import Path
from dotenv import load_dotenv
load_dotenv(dotenv_path="../.env")
import os

# ---------------------------------------------------------------------------
BASE = Path(__file__).resolve().parent.parent          # <projeto>/..
JSON_FILE = BASE / "backend" / "static" / "pabx" / "monitoramento.json"
JSON_FILE.parent.mkdir(parents=True, exist_ok=True)    # garante pastas

HISTORICO_FILE = BASE / "backend" / "static" / "pabx" / "historico_ramais.json"

HOST      = "172.16.153.10"
PORT      = 23
USER      = os.getenv("USER_PABX")
PASSWORD  = os.getenv("PWD_PABX")
COMMAND   = "listout"

# ---------------------------------------------------------------------------
async def telnet_cycle():
    reader, writer = await telnetlib3.open_connection(HOST, PORT, encoding="utf-8")

    await reader.readuntil(b"login: ")
    writer.write(USER + "\n")
    await reader.readuntil(b"Password: ")
    writer.write(PASSWORD + "\n")
    await reader.readuntil(b">")                      # prompt pronto

    writer.write(COMMAND + "\n")
    await asyncio.sleep(1)
    raw_text = await reader.readuntil(b">")
    raw_text = raw_text.decode() if isinstance(raw_text, bytes) else raw_text

    # -----------------------------------------------------------------------
    linhas = [ln.lstrip() for ln in raw_text.splitlines() if re.match(r'^\s*\|\s+\d+', ln)]
    dados = [ [p.strip() for p in ln.strip('|').split('|')] for ln in linhas if len(ln.strip('|').split('|')) == 5 ]

    df = pd.DataFrame(dados, columns=["Cry:Cpl:ac:term", "neqt", "typ term", "dir nb", "Out of service cause"])
    dir_nbs = set(df.loc[df["dir nb"] != "", "dir nb"])

    # -----------------------------------------------------------------------
    agora = datetime.datetime.now().strftime("%Y-%m-%d %H:%M:%S")

    try:
        registros = json.loads(JSON_FILE.read_text(encoding="utf-8"))
    except (FileNotFoundError, json.JSONDecodeError):
        registros = []

    # retém somente dir nb ainda presentes
    registros = [item for item in registros if item["dir nb"] in dir_nbs]

    conhecidos = {item["dir nb"] for item in registros}
    for dn in dir_nbs - conhecidos:
        registros.append({"dir nb": dn, "horário": agora})

    JSON_FILE.write_text(json.dumps(registros, ensure_ascii=False, indent=2), encoding="utf-8")

    # Atualiza histórico de ramais que ficaram offline
    try:
        historico = json.loads(HISTORICO_FILE.read_text(encoding="utf-8"))
    except (FileNotFoundError, json.JSONDecodeError):
        historico = {}

    # Para cada ramal na lista atual de offline
    for registro in registros:
        ramal = registro["dir nb"]
        if ramal not in historico:
            historico[ramal] = []
        # Adiciona novo registro apenas se for diferente do último
        if not historico[ramal] or historico[ramal][0] != agora:
            historico[ramal].insert(0, agora)
            historico[ramal] = historico[ramal][:10]  # Mantém apenas os 10 últimos registros

    # Salva o histórico atualizado
    HISTORICO_FILE.write_text(
        json.dumps(historico, ensure_ascii=False, indent=2),
        encoding="utf-8"
    )

    # -----------------------------------------------------------------------
    writer.write("exit\n")
    await asyncio.sleep(0.5)
    writer.close()
    await asyncio.sleep(0.5)

# ---------------------------------------------------------------------------
async def main():
    while True:
        try:
            await telnet_cycle()
        except Exception as exc:
            print(f"Erro: {exc}")
        await asyncio.sleep(60)     # ajuste o intervalo conforme necessário

if __name__ == "__main__":
    asyncio.run(main())
