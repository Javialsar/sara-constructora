import json

def extract(subagent_id, component_name):
    path = f"C:\\Users\\elkin\\.gemini\\antigravity\\brain\\{subagent_id}\\.system_generated\\logs\\transcript_full.jsonl"
    try:
        with open(path, 'r', encoding='utf-8') as f:
            for line in f:
                data = json.loads(line)
                if 'tool_calls' in data:
                    for tc in data['tool_calls']:
                        if tc['name'] == 'write_to_file' and component_name in tc['args']['TargetFile']:
                            code = tc['args']['CodeContent']
                            with open(f"src/components/admin/fletes/{component_name}.tsx", 'w', encoding='utf-8') as out:
                                out.write(code)
                            print(f"Extracted {component_name} successfully.")
                            return
    except Exception as e:
        print(f"Error extracting {component_name}: {e}")

extract('576b65e4-ff5b-4a39-8872-4afdd275377f', 'AnalyticsDashboard')
extract('e01b931c-6879-4e8f-88ff-444bb44ca255', 'GlobalMap')
extract('f4f34fc4-4294-4128-9db4-fcc32183b4fc', 'PlanManager')
