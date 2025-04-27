import importlib.resources
import pathlib
import html
from anywidget import AnyWidget
from traitlets import Unicode
from IPython.display import HTML


def read_file(path):
    return pathlib.Path(path).read_text()


class BtVisualizerWidget(AnyWidget):
    _esm = importlib.resources.files("bt_visualizer").joinpath("bt-visualizer.js")
    _css = importlib.resources.files("bt_visualizer").joinpath("bt-visualizer.css")
    equity = Unicode().tag(sync=True)
    stats = Unicode().tag(sync=True)
    ohlc = Unicode().tag(sync=True)
    trades = Unicode().tag(sync=True)

    def _repr_html_(self):
        return f"""
        <bt-visualizer
            equity="{self.equity}"
            stats="{self.stats}"
            ohlc="{self.ohlc}"
            trades="{self.trades}"
        ></bt-visualizer>
        """

def show_bt_visualization(equity_file, stats_file, ohlc_file, trades_file):
    """
    Displays the backtest visualization widget.

    Args:
        equity_file (str): Path to equity curve CSV file.
        stats_file (str): Path to stats CSV file.
        ohlc_file (str): Path to OHLC (candlestick) CSV file.
        trades_file (str): Path to trades CSV file.
    """
    widget = BtVisualizerWidget(
        equity=html.escape(read_file(equity_file)),
        stats=html.escape(read_file(stats_file)),
        ohlc=html.escape(read_file(ohlc_file)),
        trades=html.escape(read_file(trades_file)),
    )
    return HTML(widget._repr_html_())
