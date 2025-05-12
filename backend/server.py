from fastapi import FastAPI, UploadFile, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles
from apscheduler.schedulers.background import BackgroundScheduler
from pydantic import BaseModel
import fitz  # PyMuPDF
import update_subscriber_json       # ← deve ter def main()
import asyncio
import listout_report
import json
from pathlib import Path

app = FastAPI()
app.mount("/pabx", StaticFiles(directory="static/pabx"), name="pabx")

# ––– CORS para o Vite ––––––––––––––––––––––––––––––––––
app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:5173",
        "http://10.65.225.104:5173",
        "http://10.65.225.104",
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# ––– agendador em background ––––––––––––––––––––––––––
sched = BackgroundScheduler()

@app.on_event("startup")
def _start_scheduler() -> None:
    # executa imediatamente e depois a cada 60 s
    sched.add_job(
        update_subscriber_json.main,
        "interval",
        minutes=1,
        id="update_json",
        replace_existing=True
    )
    sched.start()

@app.on_event("shutdown")
def _stop_scheduler() -> None:
    sched.shutdown()

# ---------- tarefa Telnet listout_report ---------------------------------
_telnet_task: asyncio.Task | None = None   # guarda a task para cancelar

@app.on_event("startup")
async def _start_telnet_cycle() -> None:
    global _telnet_task
    loop = asyncio.get_running_loop()
    _telnet_task = loop.create_task(listout_report.main())  # roda para sempre

@app.on_event("shutdown")
async def _stop_telnet_cycle() -> None:
    if _telnet_task:
        _telnet_task.cancel()
        try:
            await _telnet_task
        except asyncio.CancelledError:
            pass

# ––– persistência de anotações –––
ANNOTATIONS_FILE = Path("annotations.json")

class Annotation(BaseModel):
    directoryNumber: str
    text: str

@app.get("/api/annotations")
def get_annotations():
    if ANNOTATIONS_FILE.exists():
        try:
            data = json.loads(ANNOTATIONS_FILE.read_text(encoding="utf-8"))
        except json.JSONDecodeError:
            data = {}
    else:
        data = {}
    return data

@app.post("/api/annotations")
def add_annotation(item: Annotation):
    # validação
    dn = item.directoryNumber
    text = item.text
    # carrega existente
    if ANNOTATIONS_FILE.exists():
        try:
            annotations = json.loads(ANNOTATIONS_FILE.read_text(encoding="utf-8"))
        except json.JSONDecodeError:
            annotations = {}
    else:
        annotations = {}
    # atualiza
    annotations[str(dn)] = text
    # salva no arquivo
    ANNOTATIONS_FILE.write_text(json.dumps(annotations, ensure_ascii=False, indent=2), encoding="utf-8")
    return {"ok": True}

# ––– lógica original /coords ––––––––––––––––––––––––––
LAYER_CANDIDATAS = ["ARQ-NUM", "ARK-NUM"]

@app.post("/coords")
async def coords(pdf: UploadFile):
    if pdf.content_type != "application/pdf":
        raise HTTPException(400, "Arquivo precisa ser PDF")

    data = await pdf.read()
    doc = fitz.open(stream=data, filetype="pdf")

    ocgs = doc.get_ocgs()
    layer_xref = next(
        (x for nome in LAYER_CANDIDATAS
           for x, v in ocgs.items() if v["name"] == nome),
        None,
    )
    if not layer_xref:
        doc.close()
        raise HTTPException(404, "Nenhuma das layers ARQ‑NUM / ARK‑NUM encontrada")

    off = [x for x in ocgs if x != layer_xref]
    doc.set_layer(-1, on=[layer_xref], off=off)

    rows = []
    for pg in range(doc.page_count):
        for x0, y0, x1, y1, texto, bloco, linha, ordem in doc[pg].get_text("words"):
            rows.append({
                "page":  pg + 1,
                "x0": x0, "y0": y0, "x1": x1, "y1": y1,
                "texto": texto.strip(),
                "bloco": int(bloco), "linha": int(linha), "ordem": int(ordem),
            })

    doc.close()
    return rows
