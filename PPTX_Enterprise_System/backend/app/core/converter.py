import subprocess
from pathlib import Path


def convert_ppt_to_pptx(file_path: str) -> str:
    input_path = Path(file_path)
    output_dir = input_path.parent
    command = [
        "soffice",
        "--headless",
        "--convert-to",
        "pptx",
        str(input_path),
        "--outdir",
        str(output_dir),
    ]
    subprocess.run(command, check=True)
    converted_path = output_dir / f"{input_path.stem}.pptx"
    return str(converted_path)
