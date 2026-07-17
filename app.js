name: Quality checks

on:
  push:
  pull_request:

permissions:
  contents: read

jobs:
  static-site:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-python@v5
        with:
          python-version: "3.12"
      - uses: actions/setup-node@v4
        with:
          node-version: "22"
      - name: Check site structure and links
        run: python scripts/check_site.py
      - name: Check JavaScript syntax
        run: |
          node --check assets/js/app.js
          node --check assets/js/visualizations.js
