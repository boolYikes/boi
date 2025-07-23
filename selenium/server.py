from flask import Flask, render_template_string
from flask_cors import CORS
from dotenv import load_dotenv
import os, html
from utils import scrape, load_from_cache, save_to_cache

load_dotenv()

bootstrap = os.getenv("BOOTSTRAP")
timeout   = os.getenv("TIMEOUT")
url       = os.getenv("TARGET_URL01")

app = Flask(__name__)
CORS(app)

@app.get("/e1")
def e1():
    snippets = load_from_cache(url)
    if snippets is None:
        snippets = scrape(url)
        save_to_cache(url, snippets)

    template = """
    <!doctype html>
    <html lang="en"><head>
        <meta charset="utf-8">
        <link href="{{ css }}" rel="stylesheet">
        <title>Pinned posts</title>
    </head><body class="container py-4">
        <h1 class="mb-4">Pinned posts from {{ url }}</h1>
        {% if snippets %}
          <div class="vstack gap-3">
            {% for html_snippet in snippets %}
              <div class="p-3 border rounded-3 shadow-sm">{{ html_snippet|safe }}</div>
            {% endfor %}
          </div>
        {% else %}
          <p class="text-muted">No matching posts found.</p>
        {% endif %}
    </body></html>
    """

    return render_template_string(template, css=bootstrap, url=html.escape(url), snippets=snippets)
    
if __name__ == "__main__":
    app.run(host="0.0.0.0", port=os.getenv("PORT"), debug=True)