# server/src/pricewindow/model.py
import pandas as pd
from pathlib import Path

DATA_PATH = Path(__file__).parent / "data" / "high_price_season_model.csv"

class PriceWindowModel:
    def __init__(self):
        self.df = pd.read_csv(DATA_PATH)

    def get_week_row(self, location: str, week: int):
        row = self.df[
            (self.df["Location"] == location) &
            (self.df["WeekNum"] == week)
        ]
        return None if row.empty else row.iloc[0]
