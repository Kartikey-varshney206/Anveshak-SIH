import json
from openai import OpenAI
try:
    client = OpenAI(
      base_url="https://integrate.api.nvidia.com/v1",
      api_key="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"
    )
    models = client.models.list()
    for m in models.data:
        if "llama" in m.id:
            print(m.id)
except Exception as e:
    print("ERROR", str(e))
