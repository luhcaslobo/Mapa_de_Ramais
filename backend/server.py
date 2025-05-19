# server.py  — versão enxuta servindo JSON pré-gerado
from fastapi import FastAPI, Response
from fastapi.staticfiles import StaticFiles
from apscheduler.schedulers.background import BackgroundScheduler
from pydantic import BaseModel
import update_subscriber_json
import asyncio, listout_report, json
from pathlib import Path

app = FastAPI()

# arquivos JSON do PABX
app.mount("/pabx", StaticFiles(directory="static/pabx"), name="pabx")

# JSONs de coordenadas pré-gerados por build_coords.py
app.mount("/coords", StaticFiles(directory="static/coords"), name="coords")

# ---------------------------------------------------------------------- #
#  agendadores                                                            #
sched = BackgroundScheduler()

@app.on_event("startup")
def _start_scheduler():
    sched.add_job(update_subscriber_json.main, "interval",
                  minutes=1, id="update_json", replace_existing=True)
    sched.start()

@app.on_event("shutdown")
def _stop_scheduler():
    sched.shutdown()

_telnet_task: asyncio.Task | None = None

@app.on_event("startup")
async def _start_telnet_cycle():
    global _telnet_task
    _telnet_task = asyncio.create_task(listout_report.main())

@app.on_event("shutdown")
async def _stop_telnet_cycle():
    if _telnet_task:
        _telnet_task.cancel()
        try:
            await _telnet_task
        except asyncio.CancelledError:
            pass

# ---------------------------------------------------------------------- #
#  anotações                                                             #
ANNOTATIONS_FILE = Path("annotations.json")

class Annotation(BaseModel):
    directoryNumber: str
    text: str

@app.get("/api/annotations")
def get_annotations():
    try:
        return json.loads(ANNOTATIONS_FILE.read_text("utf-8"))
    except Exception:
        return {}

@app.post("/api/annotations")
def add_annotation(item: Annotation):
    try:
        data = json.loads(ANNOTATIONS_FILE.read_text("utf-8"))
    except Exception:
        data = {}
    data[item.directoryNumber] = item.text
    ANNOTATIONS_FILE.write_text(json.dumps(data, ensure_ascii=False, indent=2),
                                encoding="utf-8")
    return {"ok": True}

# Novo endpoint para histórico de ramais
@app.get("/api/historico/{ramal}")
def get_historico(ramal: str):
    try:
        # Use absolute path resolution
        historico_path = Path(__file__).parent / "static" / "pabx" / "historico_ramais.json"
        if not historico_path.exists():
            print(f"Arquivo não encontrado: {historico_path}")
            return Response(
                content=json.dumps({"historico": []}),
                media_type="application/json"
            )
            
        historico = json.loads(historico_path.read_text(encoding="utf-8"))
        dados = historico.get(ramal, [])
        print(f"Histórico para ramal {ramal}:", dados)
        return Response(
            content=json.dumps({"historico": dados}),
            media_type="application/json"
        )
    except Exception as e:
        print(f"Erro ao buscar histórico: {str(e)}")
        return Response(
            content=json.dumps({"historico": [], "error": str(e)}),
            media_type="application/json"
        )

# ---------------------------------------------------------------------- #
#  frontend build                                                        #
app.mount("/", StaticFiles(directory="static/front/dist", html=True),
          name="frontend")
