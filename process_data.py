import json

def process_idioms(content):
    # Fix the malformed JSON by wrapping it in a list
    json_content = f"[{content}]"
    data = json.loads(json_content)
    processed_data = []
    for item in data:
        if item.get("phrase") and item.get("meaning"):
            processed_data.append({
                "type": "idiom",
                "language": item.get("language", "English"),
                "front": item["phrase"],
                "back": item["meaning"],
                "example": "",
                "tags": item.get("tags", [])
            })
    return processed_data

def process_grammar(content):
    # Fix the malformed JSON by wrapping it in a list, and removing the last part that is not json
    lines = content.splitlines()
    json_lines = []
    in_json = False
    for line in lines:
        if line.strip().startswith('{'):
            in_json = True
        if in_json:
            json_lines.append(line)
        if line.strip().endswith('}'):
            in_json = False

    json_content = "".join(json_lines)
    # It is not a list of objects, but a sequence of objects. Let's fix it
    json_content = json_content.replace("},", "}@#@#@").replace("}\n{", "}@#@#@").replace("}{", "}@#@#@")
    json_content = json_content.split("@#@#@")

    processed_data = []
    for obj_str in json_content:
        try:
            item = json.loads(obj_str)
            if item.get("title") and item.get("description"):
                processed_data.append({
                    "type": "grammar",
                    "language": "English",
                    "front": item["title"],
                    "back": item["description"],
                    "example": item.get("examples", [""])[0],
                    "tags": item.get("tags", [])
                })
        except json.JSONDecodeError:
            continue # Ignore malformed objects
    return processed_data

def process_words(content):
    processed_data = []
    lines = content.splitlines()
    for line in lines:
        if "=" in line:
            parts = line.split("=", 1)
            front = parts[0].strip()
            back = parts[1].strip()
            if front and back:
                processed_data.append({
                    "type": "vocabulary",
                    "language": "Mixed",
                    "front": front,
                    "back": back,
                    "example": "",
                    "tags": []
                })
    return processed_data

def process_data(content):
    data = json.loads(content)
    processed_data = []
    for item in data:
        for spanish_word, details in item.items():
            if "english" in details and "meaning" in details["english"]:
                 processed_data.append({
                    "type": "vocabulary",
                    "language": "Spanish-English",
                    "front": spanish_word,
                    "back": details["english"]["meaning"],
                    "example": details["english"].get("example", ""),
                    "tags": []
                })
    return processed_data


def main():
    with open("idioms.json", "r") as f:
        idioms_content = f.read()
    with open("grammar.json", "r") as f:
        grammar_content = f.read()
    with open("words.txt", "r") as f:
        words_content = f.read()
    with open("data.json", "r") as f:
        data_content = f.read()

    all_data = []
    all_data.extend(process_idioms(idioms_content))
    all_data.extend(process_grammar(grammar_content))
    all_data.extend(process_words(words_content))
    all_data.extend(process_data(data_content))

    for i, item in enumerate(all_data):
        item["id"] = i

    with open("unified_data.json", "w") as f:
        json.dump(all_data, f, indent=2)

if __name__ == "__main__":
    main()
