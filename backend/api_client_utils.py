import requests
import urllib3
from dotenv import load_dotenv
import os
urllib3.disable_warnings(urllib3.exceptions.InsecureRequestWarning)

load_dotenv(dotenv_path="../.env")

BASIC_AUTH = os.getenv("BASIC_AUTH")

def get_login_token() -> str:
    url = "https://172.16.153.10/api/mgt/1.0/login"

    headers = {
        "Host": "172.16.153.10",
        "sec-ch-ua-platform": "\"Windows\"",
        "Authorization": "Basic bXRjbDpWU1RlbCEyMDIzQCE=",
        "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/131.0.0.0 Safari/537.36",
        "Accept": "application/json",
        "sec-ch-ua": "\"Google Chrome\";v=\"131\", \"Chromium\";v=\"131\", \"Not_A Brand\";v=\"24\"",
        "sec-ch-ua-mobile": "?0",
        "Sec-Fetch-Site": "same-origin",
        "Sec-Fetch-Mode": "cors",
        "Sec-Fetch-Dest": "empty",
        "Referer": "https://172.16.153.10/",
        "Accept-Language": "pt-BR,pt;q=0.9,en-US;q=0.8,en;q=0.7",
    }

    try:
        response = requests.get(url, headers=headers, verify=False)
        response.raise_for_status()  # Verifica se há erros HTTP
        
        return response.json()['token']  # Retorna o JSON da resposta
    except requests.exceptions.RequestException as e:
        print(f"Erro na requisição: {e}")
        return None
    
BASE = "https://172.16.153.10"
ATTRS = (
    "Annu_Name,Annu_First_Name,UTF8_Comment3"
)
# ?attributes={ATTRS}


def get_subscribers(auth_token):
    url = f"{BASE}/api/mgt/1.0/Node/1/Subscriber?attributes={ATTRS}"
    headers = {
        "Host": "172.16.153.10",
        "sec-ch-ua-platform": "\"Windows\"",
        "Authorization": f"Bearer {auth_token}",
        "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/131.0.0.0 Safari/537.36",
        "Accept": "application/json, text/plain, */*",
        
        
        "sec-ch-ua": "\"Google Chrome\";v=\"131\", \"Chromium\";v=\"131\", \"Not_A Brand\";v=\"24\"",
        "content-type": "text/plain",
        "sec-ch-ua-mobile": "?0",
        "Sec-Fetch-Site": "same-origin",
        "Sec-Fetch-Mode": "cors",
        "Sec-Fetch-Dest": "empty",
        "Referer": "https://172.16.153.10/",
        "Accept-Language": "pt-BR,pt;q=0.9,en-US;q=0.8,en;q=0.7"
    }
    
    try:
        response = requests.get(url, headers=headers, verify=False)
        response.raise_for_status()
        return response.json()
    except requests.exceptions.RequestException as e:
        print(f"Erro na requisição: {e}")
        return None

