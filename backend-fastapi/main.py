from app.main import app
import logging
import sys

logging.basicConfig(
    stream=sys.stdout, 
    level=logging.INFO,
    format="%(levelname)s - %(name)s - %(message)s"
)
