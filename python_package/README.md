#  📈 Backtest Visualization Tool — bt-visualizer

A lightweight, interactive charting tool to visualize your backtest results inside **JupyterLab**, with trade annotations, zoom support, tooltips, and more.


https://github.com/user-attachments/assets/df64633e-7e28-4a82-b4da-9640e7d01b62

---

## ✨ Features

- 🕵️ Hover to see trade information
- 🖱️ Click to zoom into a specific trade
- 🔍 Zoom / pan support
- 🖱️ Double click to zoom out
- 🔄 Reset chart and load new backtest results dynamically

---

## 📦 Installation

You can install the Python package via pip:

```bash
pip install bt-visualizer
```
Make sure you have JupyterLab installed as well.


## 🛠️ Usage Example
Inside your JupyterLab notebook:

```python
from bt_visualizer import show_bt_visualization

# Ensure the following files are present in the project directory
show_bt_visualization(
    equity="equity_curve.csv",
    stats="stats.csv",
    ohlc="ohlc.csv",
    trades="trades.csv"
)
```

## 📂 Input Data Format
The visualization expects CSV input following the structure from [backtesting.py](https://github.com/kernc/backtesting.py) outputs.

You can find [sample input files here](https://github.com/Finance-Insight-Lab/bt-visualizer/tree/main/public) to see the expected format.

Files expected:

* equity_curve.csv

* stats.csv

* ohlc.csv

* trades.csv

## 🌐 Online Demo
You can also try the standalone version of the app, deployed here:

👉 [Deployed App](https://finance-insight-lab.github.io/bt-visualizer/)

## 💻 Developer Setup (Optional)
If you want to run or modify the TypeScript frontend locally:
```bash
git clone https://github.com/Finance-Insight-Lab/bt-visualizer.git
cd bt-visualizer

npm install
npm run dev
```
This will start the development server.


## 📝 License
MIT License.

Created by [Ali Gheshlaghi](https://github.com/aligheshlaghi97).
